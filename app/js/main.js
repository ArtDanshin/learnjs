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
  list2.appendChild(viewMovedItem(data,list2,list1));
  addDataList(data,friendsFinal);
})

var VkOperations = new Promise(function(resolve, reject) {
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
    // Получаем список друзей в случайном порядке с фоткой 50x50
    VK.api('friends.get', {'order' : 'random', 'fields' : 'photo_50'}, function(response) {
      var friendsVk = response.response;
      // Выводим полученные данные в лист
      for (var i = 0; i < friendsVk.length; i++) {
        var el   = friendsVk[i],
            data = new formData(el.first_name,el.last_name,el.photo_50,el.uid);
        addDataList(data,friends);
        list1.appendChild(viewItemList(data,list1,list2));
      }
      // Активируем поиск
      searchInputMain.addEventListener('input', function() {
        findFriends(searchInputMain,friends,list1,viewItemList)
      })
    })
  })
})


// Функция - шаблон. Вывод друга в список
function viewItemList(data,listOut,listTo) {
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
  var list__plus = document.createElement('div');
      list__plus.className = 'list__plus';

  list__item.appendChild(list__avatar);
  list__item.appendChild(list__name);
  list__item.appendChild(list__plus);

  // Обработка добавления в финальный список по нажатию на кнопку
  list__plus.addEventListener('click', function() {
    listTo.appendChild(viewMovedItem(data,listTo,listOut));
    addDataList(data,friendsFinal);
    listOut.removeChild(list__item);
    friends = removeDataList(data.uid,friends);
  });

  // Обработка добавления в финальный список перетаскиванием
  list__item.addEventListener('dragstart', function(e) {
    e.dataTransfer.setData('text', JSON.stringify(data));
  });

  return list__item;
}

// Функция вывода во второй список
function viewMovedItem(data,listOut,listTo) {
  var fullName = data.first_name + ' ' + data.last_name;

  // Создаем все блоки с данными
  var list__item = document.createElement('div');
      list__item.className = 'list__item';
  var list__avatar = document.createElement('img');
      list__avatar.className = 'list__avatar';
      list__avatar.setAttribute('src', data.photo_50);
  var list__name = document.createElement('div');
      list__name.className = 'list__name';
      list__name.innerHTML = fullName;
  var list__cross = document.createElement('div');
      list__cross.className = 'list__cross'; 

  list__item.appendChild(list__avatar);
  list__item.appendChild(list__name);
  list__item.appendChild(list__cross);

  // Обработка удаления по клику по крестику
  list__cross.addEventListener('click', function() {
    listOut.removeChild(list__item);
    friendsFinal = removeDataList(data.uid,friendsFinal);
    listTo.appendChild(viewMovedItem(data,listTo,listOut));
    addDataList(data,friends);
  });

  return list__item;
}

// Функция поиска в массиве peoples и вывод в нужный list
function findFriends(input,peoples,list,viewList) {
  list.innerHTML = '';
  for (var i = 0; i < peoples.length; i++) {
    var fullName = peoples[i].first_name + ' ' + peoples[i].last_name,
        inputText = input.value;
      
    if ( fullName.indexOf(inputText) >= 0 ) {
      list.appendChild(viewList(peoples[i]))
    };
  }
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
    for (var i = 0; i < friendsFinal.length; i++) {
      var el = friendsFinal[i];
      list2.appendChild(viewMovedItem(friendsFinal[i],list2,list1));
    }
  }
  // Включаем поиск по людям во втором поле
  searchInputFinal.addEventListener('input', function() {
    findFriends(searchInputFinal,friendsFinal,list2,viewMovedItem);
  })
}