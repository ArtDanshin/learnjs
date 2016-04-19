ymaps.ready(init);
var myMap;

function init() {
  var mapCenter = [55.755381, 37.619044],
  myMap = new ymaps.Map('body-map', {
    center: mapCenter,
    zoom: 11
  });

  var commentsMalloonLayout = ymaps.templateLayoutFactory.createClass(
    '<div id="feedback">' +
      '<div class="header">' +
        '<div class="header__left">' +
          '<div class="address__icon"></div>' +
          '<div class="address__text">{{ properties.address }}</div>' +
        '</div>' +
        '<div class="header__right">' +
          '<div class="cross"></div>' +
        '</div>' +
      '</div>' +
      '<ul class="feeds">' +
        '{% for comment in properties.comments %}' +
          '<li class="feeds__item">' +
            '<div class="feeds__head">' +
              '<div class="feeds__name">{{ comment.name }}</div>' +
              '<div class="feeds__address">{{ comment.place }}</div>' +
              '<div class="feeds__date">{{ comment.date }}</div>' +
            '</div>' +
            '<div class="feeds__text">{{ comment.text }}</div>' +
          '</li>' +
        '{% endfor %}' +
      '</ul>' +
      '<div class="feed">' +
        '<div class="feed__head">Ваш отзыв</div>' +
        '<input type="text" placeholder="Ваше имя" class="feed__name">' +
        '<input type="text" placeholder="Укажите место" class="feed__place">' +
        '<textarea placeholder="Поделитесь впечатлениями" class="feed__text"></textarea>' +
        '<div class="feed__bottom clearfix">' +
          '<button class="feed__submit">Добавить</button>' +
        '</div>' +
      '</div>' +
    '</div>', 
    {
      build: function () {
        commentsMalloonLayout.superclass.build.call(this);
        var button = this._parentElement.getElementsByClassName('feed__submit')[0],
            name = this._parentElement.getElementsByClassName('feed__name')[0],
            place = this._parentElement.getElementsByClassName('feed__place')[0],
            text = this._parentElement.getElementsByClassName('feed__text')[0],
            close = this._parentElement.getElementsByClassName('cross')[0],
            that = this;
        button.addEventListener('click', function() {
          that._data.properties._data.comments.push({
              name: name.value,
              place: place.value,
              text: text.value 
          });
          that.rebuild();
        })
        close.addEventListener('click', this.onCloseClick.bind(this));
      },
      clear: function () {
        commentsMalloonLayout.superclass.clear.call(this);
      },
      onCloseClick: function (e) {
          e.preventDefault();

          this.events.fire('userclose');
      },
    }
  );

  // Развернутое создание точки
  myGeoObject = new ymaps.GeoObject({
            // Описание геометрии.
            geometry: {
                type: "Point",
                coordinates: [55.8, 37.8]
            },
            // Свойства.
            properties: {
                // Контент метки.
                iconContent: 'Я тащусь',
                hintContent: 'Ну давай уже тащи'
            }
        }, {
            // Опции.
            // Иконка метки будет растягиваться под размер ее содержимого.
            preset: 'islands#blackStretchyIcon',
            // Метку можно перемещать.
            draggable: true
        });
  
  // Сокращенное создание точки и добавление на карту
    myMap.geoObjects
        .add(myGeoObject)
        .add(new ymaps.Placemark([55.684758, 37.738521], {
          address: [55.684758, 37.738521],
          comments : [{
              name: 'svetlana',
              place: 'Шоколадница',
              date: '13.12.2015',
              text: 'Очень хорошее место' 
            }, {
              name: 'Сергей Мелюков',
              place: 'Красный куб',
              date: '12.12.2015',
              text: 'Ужасное место! Кругом зомби!!!!!'
            }]
        }, {
            preset: 'islands#icon',
            iconColor: '#3b5998',
            balloonLayout: commentsMalloonLayout,
            hideIconOnBalloonOpen: false,
        }));

    // Создание точки по клику
    myMap.events.add('click', function (e) {
        var coords = e.get('coords');
        var newObj = new ymaps.GeoObject({
          geometry: {
              type: "Point",
              coordinates: [coords[0].toPrecision(6), coords[1].toPrecision(6)]
            }, 
          properties: { 
            address: [coords[0].toPrecision(6), coords[1].toPrecision(6)],
            comments : []
          }}, 
          {
            preset: 'islands#icon',
            iconColor: '#3b5998',
            balloonLayout: commentsMalloonLayout,
            hideIconOnBalloonOpen: false,
          });
        myMap.geoObjects.add(newObj);

    });
}
