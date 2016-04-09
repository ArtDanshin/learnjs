var saveButton      = document.getElementsByClassName('save__button')[0],
    closeButton     = document.getElementsByClassName('close-app')[0],
    searchInputMain = document.getElementsByClassName('search-panel__input')[0],
    searchInputFinal= document.getElementsByClassName('search-panel__input')[1],
    list1           = document.getElementsByClassName('list__items')[0];
    list2           = document.getElementsByClassName('list__items')[1];

var friends      = [],
    friendsFinal = [];

document.addEventListener('DOMContentLoaded',initializeFriend)

saveButton.addEventListener('click', function() {
  localStorage.setItem("friends", JSON.stringify(friendsFinal));
  alert('Список друзей сохранен');
})

closeButton.addEventListener('click', function() {
  VK.Auth.logout(function() {
    console.log('LogOut')
  })
  localStorage.removeItem('friends');
  list1.innerHTML = '';
  list2.innerHTML = '';
  alert('Ваши данные удалены из приложения');
})

// Активируем в первом поле поиска по людям вк
searchInputMain.addEventListener('input', function() {
  findFriends(searchInputMain,friends,list1,'add')
})

// Активируем в втором поле поиска по local людям
searchInputFinal.addEventListener('input', function() {
  findFriends(searchInputFinal,friendsFinal,list2,'delete');
})

list1.addEventListener('dragover', function(e) {
  e.preventDefault();
})

list1.addEventListener('drop', dragdrop)

list2.addEventListener('dragover', function(e) {
  e.preventDefault();
})

list2.addEventListener('drop', dragdrop);

function dragdrop(e) {
  var viewData = JSON.parse(e.dataTransfer.getData('text'));
  e.stopPropagation();
  e.preventDefault();

  if ((viewData.type === 'add') && (validation(viewData.uid,friendsFinal))) {
    addMode(viewData.uid)
  }
  if ((viewData.type === 'delete') && (validation(viewData.uid,friends))) {
    deleteMode(viewData.uid)
  }
};

var VkOperations = new Promise(function(resolve, reject) {
  VK.init({
    apiId: 5395665
  });
  // Если список с друзьями уже есть, то не авторизуемся
  if (localStorage.getItem("friends") !== null) {
    resolve()
  } else {
    // В противном случае - авторизуемся
    VK.Auth.login(function(response){
      // Проверяем состояие авторизации
      if(response.session) {
        resolve(response)
      } else {
        reject(new Error('Авторизация не удалась'))
      }
    }, 2+4+8);
    localStorage.setItem("friends", '');
  }  
}).then(function(){
  return new Promise(function(resolve, reject) {
    // Получаем список друзей в случайном порядке с фоткой 50x50
    VK.api('friends.get', {'order' : 'random', 'fields' : 'photo_50'}, function(response) {
      var friendsVk = response.response;
      // Выводим полученные данные в лист
      friendsVk.forEach(function(el) {
        var data = new formData(el.first_name,el.last_name,el.photo_50,el.uid);
        addDataList(data,friends);
        list1.appendChild(viewItemList(data,'add'));
      })
    })
  })
})


// Функция - шаблон. Вывод друга в список
function viewItemList(data,type) {
  var fullName = data.first_name + ' ' + data.last_name;

  // Создаем все блоки с данными
  var list__item = document.createElement('div');
      list__item.className = 'list__item';
      list__item.setAttribute('draggable', true);
      list__item.dataset.uid = data.uid;
  var list__avatar = document.createElement('img');
      list__avatar.className = 'list__avatar';
      list__avatar.setAttribute('draggable', false);
      list__avatar.setAttribute('src', data.photo_50);
  var list__name = document.createElement('div');
      list__name.className = 'list__name';
      list__name.innerHTML = fullName;
  var list__control = document.createElement('div');

  if (type === 'add') {
    list__control.className = 'list__plus';
    list__control.addEventListener('click', function() {
      addMode(data.uid);
    });
  } else if (type === 'delete'){
    list__control.className = 'list__cross';
    list__control.addEventListener('click', function() {
      deleteMode(data.uid);
    });
  }

  list__item.appendChild(list__avatar);
  list__item.appendChild(list__name);
  list__item.appendChild(list__control);

  list__item.addEventListener('dragstart', function(e) {
    var viewData = {
      uid  : data.uid,
      type : type
    }
    e.dataTransfer.setData('text', JSON.stringify(viewData));
  });

  return list__item;
}

function removeViewItem(uid,list) {
  var el = list.querySelector('[data-uid="' +  uid + '"]');
  list.removeChild(el);
}

function addMode(uid) {
  var data = searchDataList(uid,friends);
  addDataList(data[0],friendsFinal);
  list2.appendChild(viewItemList(data[0],'delete'));
  friends = removeDataList(uid,friends);
  removeViewItem(uid,list1);
}

function deleteMode(uid) {
  var data = searchDataList(uid,friendsFinal);
  addDataList(data[0],friends);
  list1.appendChild(viewItemList(data[0],'add'));
  friendsFinal = removeDataList(uid,friendsFinal);
  removeViewItem(uid,list2);
}


// Функция поиска в массиве peoples и вывод в нужный list
function findFriends(input,friends,list,type) {
  list.innerHTML = '';
  friends.forEach(function(el,i) {
    var fullName = el.first_name + ' ' + el.last_name,
        inputText = input.value;
      
    if ( fullName.indexOf(inputText) >= 0 ) {
      list.appendChild(viewItemList(el,type))
    };
  })
}

// Формирование объекта с параметрами друга
function formData(firstName, lastName, photo, uid) {
  this.first_name = firstName;
  this.last_name  = lastName;
  this.photo_50   = photo;
  this.uid        = uid;
}

// Добавление друга в массив друзей
function addDataList(data,friendsList) {
  friendsList[friendsList.length] = data;
}

// Удаление друга из массива друзей
function removeDataList(uid, friendsList) {
  return friendsList.filter(function(friend) {
    if (friend.uid !== uid) return true
  })
}

// Поиск друга в массиве друзей
function searchDataList(uid, friendsList) {
  return friendsList.filter(function(friend) {
    if (friend.uid == uid) return true
  })
}

// Загрузка друзей из locacStorage в список
function initializeFriend() {
  if ( localStorage.getItem('friends')) {
    friendsFinal = JSON.parse(localStorage.getItem('friends'));
    friendsFinal.forEach(function(el) {
      list2.appendChild(viewItemList(el,'delete'));
    });
  }
}

function validation(uid, friends) {
  friends.forEach(function(el) {
    if (el.uid === uid) return false
  })
  return true
}