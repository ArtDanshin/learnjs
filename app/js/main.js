var authButton      = document.getElementsByClassName('save__button')[0],
    closeButton     = document.getElementsByClassName('close-app')[0],
    searchInputMain = document.getElementsByClassName('search-panel__input')[0],
    searchInputFinal= document.getElementsByClassName('search-panel__input')[1],
    list2           = document.getElementsByClassName('list__items')[1];

var friends      = [],
    friendsFinal = [];

document.addEventListener('DOMContentLoaded',initializeFriend)

authButton.addEventListener('click', function() {
  localStorage.setItem("friends", JSON.stringify(friendsFinal));
})

closeButton.addEventListener('click', function() {
  VK.Auth.logout(function() {
    console.log('LogOut')
  })
  localStorage.removeItem('friends');
})

list2.addEventListener('dragover', function(e) {
  e.preventDefault();
})

list2.addEventListener('drop', function(e) {
  var data = JSON.parse(e.dataTransfer.getData('text'));
  e.stopPropagation();
  e.preventDefault();
  list2.insertAdjacentHTML('beforeend', data.html)
  addDataList(data.first_name,data.last_name,data.photo_50,data.uid,friendsFinal);
})

var VkOperations = new Promise(function(resolve, reject) {
  console.log('Auth');
  VK.init({
    apiId: 5395665
  });
  // Авторизация
  VK.Auth.login(function(response){
    // Проверяем состояие авторизации
    if(response.session) {
      resolve(response)
    } else {
      reject(new Error('Авторизация не удалась'))
    }
  }, 2+4+8)
}).then(function(){
  return new Promise(function(resolve, reject) {
    VK.api('users.get', {'name_case' : 'gen', 'fields': 'photo_200,bdate,city'}, function(response) {
      console.log(response);
    })
    // Получаем список друзей
    VK.api('friends.get', {'order' : 'random', 'fields' : 'photo_50'}, function(response) {
      var list = document.getElementsByClassName('list__items')[0];
          friends = response.response;
      for (var i = 0; i < friends.length; i++) {
        var el = friends[i];
        list.appendChild(viewItemList(el.first_name,el.last_name,el.photo_50,el.uid))
      }
      searchInputMain.addEventListener('input', function() {
        findFriends(searchInputMain,friends,list,viewItemList)
      })
    })
  })
})


// Функция - шаблон. Вывод друга в список
function viewItemList(firstName, lastName, photo, uid) {
  var fullName = firstName + ' ' + lastName;

  var list__item = document.createElement('div');
      list__item.className = 'list__item';
      list__item.setAttribute('draggable', true);
  var list__avatar = document.createElement('img');
      list__avatar.className = 'list__avatar';
      list__avatar.setAttribute('src', photo);
  var list__name = document.createElement('div');
      list__name.className = 'list__name';
      list__name.innerHTML = fullName;
  var list__plus = document.createElement('div');
      list__plus.className = 'list__plus';

  list__item.appendChild(list__avatar);
  list__item.appendChild(list__name);
  list__item.appendChild(list__plus);

  list__plus.addEventListener('click', function() {
    moveItem(firstName,lastName,photo,uid);
    addDataList(firstName,lastName,photo,uid,friendsFinal);
  });

  list__item.addEventListener('dragstart', function(e) {
    var data = { 
      first_name : firstName,
      last_name  : lastName,
      photo_50   : photo,
      uid        : uid,
      html       : list__item.outerHTML
    }
    e.dataTransfer.setData('text', JSON.stringify(data));
  });

  return list__item;
}

// Функция вывода во второй список
function moveItem(firstName,lastName,photo,uid) {
  var fullName = firstName + ' ' + lastName,  
      list__items2 = document.getElementsByClassName('list__items')[1];

  var list__item = document.createElement('div');
      list__item.className = 'list__item';
  var list__avatar = document.createElement('img');
      list__avatar.className = 'list__avatar';
      list__avatar.setAttribute('src', photo);
  var list__name = document.createElement('div');
      list__name.className = 'list__name';
      list__name.innerHTML = fullName;
  var list__cross = document.createElement('div');
      list__cross.className = 'list__cross'; 

  list__item.appendChild(list__avatar);
  list__item.appendChild(list__name);
  list__item.appendChild(list__cross);

  list__items2.appendChild(list__item);

  list__cross.addEventListener('click', function() {
    list__items2.removeChild(list__item);
    friendsFinal = removeDataList(uid,friendsFinal);
  });
}

function findFriends(input,peoples,list,viewList) {
  list.innerHTML = '';
  for (var i = 0; i < peoples.length; i++) {
    var fullName = peoples[i].first_name + ' ' + peoples[i].last_name,
        inputText = input.value;
      
    if ( fullName.indexOf(inputText) >= 0 ) {
      list.appendChild(viewList(peoples[i].first_name,peoples[i].last_name,peoples[i].photo_50))
    };
  }
}

function addDataList(firstName, lastName, photo, uid, friendsList) {
  var data = { 
      first_name : firstName,
      last_name  : lastName,
      photo_50   : photo,
      uid        : uid
    }

  friendsList[friendsList.length] = data;
}

function removeDataList(uid, friendsList) {
  return friendsList.filter(function(friend) {
    if (friend.uid !== uid) return true
  })
}

function initializeFriend() {
  if ( localStorage.getItem('friends')) {
    friendsFinal = JSON.parse(localStorage.getItem('friends'));
    for (var i = 0; i < friendsFinal.length; i++) {
      var el = friendsFinal[i];
      moveItem(el.first_name,el.last_name,el.photo_50,el.uid)
    }
  }
}