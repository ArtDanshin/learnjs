ymaps.ready(init);
var myMap;

function init() {
  var mapCenter = [55.755381, 37.619044],
  myMap = new ymaps.Map('body-map', {
    center: mapCenter,
    zoom: 11
  });
  downloadAll();

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
        button.addEventListener('click', function(e) {
          var now = formatDate(new Date());

          var comment = {
            coords: that._data.properties._data.coords,
            address: that._data.properties._data.address,
            name: name.value,
            place: place.value,
            text: text.value,
            date: now
          }; 

          that._data.properties._data.comments.push(comment);
          uploadTo(comment);
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
  
  var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
    '<h2 class=cluster__title>{{ properties.address|raw }}</h2>' +
    '<ul class="cluster__list">' +
      '{% for comment in properties.comments %}' +
        '<li class="cluster__item">' +
          '<div class="cluster__item-head">' +
            '<div class="cluster__item-name">{{ comment.name }}</div>' +
            '<div class="cluster__item-address">{{ comment.place }}</div>' +
            '<div class="cluster__item-date">{{ comment.date }}</div>' +
          '</div>' +
          '<div class="cluster__item-text">{{ comment.text }}</div>' +
        '</li>' +
      '{% endfor %}' +
    '</ul>'
  );

  var clusterer = new ymaps.Clusterer({
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: true,
    clusterBalloonContentLayout: 'cluster#balloonCarousel',
    clusterBalloonItemContentLayout: customItemContentLayout,
    clusterBalloonPanelMaxMapArea: 0,
    clusterBalloonPagerSize: 5
  });

  myMap.events.add('click', function (e) {
    if (!myMap.balloon.isOpen()) {
      var coords = e.get('coords');
      getAddress(coords);
      var newObj = new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: [coords[0].toPrecision(6), coords[1].toPrecision(6)]
        }, 
        properties: { 
          coords: { 
            x: coords[0].toPrecision(6), 
            y: coords[1].toPrecision(6)
          },
          comments: []
        }
      }, {
        preset: 'islands#icon',
        iconColor: '#3b5998',
        balloonLayout: commentsMalloonLayout,
        hideIconOnBalloonOpen: false,
      });
      getAddress(coords,newObj);
      clusterer.add(newObj);
      newObj.balloon.open(coords, { 
        address: [coords[0].toPrecision(6), coords[1].toPrecision(6)],
        comments : []
      });
    } else {
      myMap.balloon.close();
    }
  });

  function getAddress(coords,point) {
    ymaps.geocode(coords).then(function (res) {
      var firstGeoObject = res.geoObjects.get(0);

      point.properties
        .set({
          address: firstGeoObject.properties.get('text')
        });
    });
  }

  function downloadAll() {
    var objTo = {
      op: 'all'
    }

    var p = new Promise(function(resolve) {
      var xhr = new XMLHttpRequest();

      xhr.open('POST', 'http://localhost:3000/', true);
      xhr.onload = function() { 
        resolve(xhr.response);
      }
      xhr.send( JSON.stringify(objTo) );
    }).then(function(value) {
      var all = JSON.parse(value);
      var allPlace = Object.keys(all);

      allPlace.forEach(function(el) {
        var placeComments = all[el];

        ymaps.geocode(el).then(function (res) {
          var firstGeoObject = res.geoObjects.get(0),
              coords = firstGeoObject.geometry.getCoordinates();
            
          clusterer.add(
            new ymaps.Placemark(coords, {
              address: el,
              coords: { x: coords[0],
                        y: coords[1] },
              comments : placeComments
            }, {
                preset: 'islands#icon',
                iconColor: '#3b5998',
                balloonLayout: commentsMalloonLayout,
                hideIconOnBalloonOpen: false,
            })
          );
        });
      })
      myMap.geoObjects.add(clusterer);
    });
  }
}

function uploadTo(obj) {
  var objTo = {
    op: 'add',
    review: obj
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:3000/', true);

  xhr.send( JSON.stringify(objTo) );
}

function formatDate(date) {
  var dd = date.getDate();
  var mm = date.getMonth()+1; //January is 0!
  var yyyy = date.getFullYear();

  if(dd<10){
      dd='0'+dd
  } 
  if(mm<10){
      mm='0'+mm
  } 
  return dd+'.'+mm+'.'+yyyy;
}