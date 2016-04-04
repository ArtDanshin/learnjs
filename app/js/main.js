var authButton = document.getElementsByClassName('save__button')[0],
    closeButton= document.getElementsByClassName('close-app')[0];



authButton.addEventListener('click', VkOperations)

closeButton.addEventListener('click', function() {
  VK.Auth.logout(function() {
    console.log('LogOut')
  })
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
    VK.api('friends.get', {'order' : 'random', 'fields' : 'photo_50'}, function(response) {
      console.log(response)
    })
  })
})