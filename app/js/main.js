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

list2.addEventListener('dragover', function(e) {
  e.preventDefault();
})

list2.addEventListener('drop', function(e) {
  var data = JSON.parse(e.dataTransfer.getData('text'));
  e.stopPropagation();
  e.preventDefault();
  list2.appendChild(viewItemList(data,list2,list1,friendsFinal,friends,'delete'));
  addDataList(data,friendsFinal);
})

// Активируем в первом поле поиска по людям вк
searchInputMain.addEventListener('input', function() {
  findFriends(searchInputMain,friends,friendsFinal,list1,list2,viewItemList,'add')
})

// Активируем в втором поле поиска по local людям
searchInputFinal.addEventListener('input', function() {
  findFriends(searchInputFinal,friendsFinal,friends,list2,list1,viewItemList,'delete');
})

var VkOperations = new Promise(function(resolve, reject) {
  VK.init({
    apiId: 5395665
  });
  // Авторизация
  if (localStorage.getItem("friends") !== null) {
    resolve()
  } else {
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
        list1.appendChild(viewItemList(data,list1,list2,friends,friendsFinal,'add'));
      })
    })
  })
})


// Функция - шаблон. Вывод друга в список
function viewItemList(data,listOut,listTo,friendsOut,friendsTo,type) {
  var fullName = data.first_name + ' ' + data.last_name;

  // Создаем все блоки с данными
  var list__item = document.createElement('div');
      list__item.className = 'list__item';
      list__item.setAttribute('draggable', true);
  var list__avatar = document.createElement('img');
      list__avatar.className = 'list__avatar';
      list__avatar.setAttribute('src', data.photo_50);
  var list__name = document.createElement('div');
      list__name.className = 'list__name';
      list__name.innerHTML = fullName;
  var list__control = document.createElement('div');

  if (type === 'add') {
    type = 'delete';
    list__control.className = 'list__plus';

    list__item.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text', JSON.stringify(data));
    });
  } else if (type === 'delete'){
    type = 'add';
    list__control.className = 'list__cross';

    list__item.addEventListener('dragend', function(e) {
      listTo.appendChild(viewItemList(data,listTo,listOut,friendsTo,friendsOut,type));
      addDataList(data,friendsTo);
      listOut.removeChild(list__item);
      friendsOut = removeDataList(data.uid,friendsOut);
    });
  }

  list__item.appendChild(list__avatar);
  list__item.appendChild(list__name);
  list__item.appendChild(list__control);

  // Обработка добавления в финальный список по нажатию на кнопку
  list__control.addEventListener('click', function() {
    listTo.appendChild(viewItemList(data,listTo,listOut,friendsTo,friendsOut,type));
    addDataList(data,friendsTo);
    listOut.removeChild(list__item);
    friendsOut = removeDataList(data.uid,friendsOut);
  });

  return list__item;
}

// Функция поиска в массиве peoples и вывод в нужный list
function findFriends(input,friendsOut,friendsTo,listOut,listTo,viewList,type) {
  listOut.innerHTML = '';
  friendsOut.forEach(function(el,i) {
    var fullName = el.first_name + ' ' + el.last_name,
        inputText = input.value;
      
    if ( fullName.indexOf(inputText) >= 0 ) {
      listOut.appendChild(viewList(el,listOut,listTo,friendsOut,friendsTo,type))
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

// Загрузка друзей из locacStorage в список
function initializeFriend() {
  if ( localStorage.getItem('friends')) {
    friendsFinal = JSON.parse(localStorage.getItem('friends'));
    friendsFinal.forEach(function(el) {
      list2.appendChild(viewItemList(el,list2,list1,friendsFinal,friends,'delete'));
    });
  }
}