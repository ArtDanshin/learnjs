ymaps.ready(init);
var myMap;

function init() {
  myMap = new ymaps.Map('body-map', {
    center: [55.76, 37.64],
    zoom: 11
  });

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

    myMap.geoObjects
        .add(myGeoObject)
        .add(new ymaps.Placemark([55.684758, 37.738521], {
            balloonContent: 'цвет <strong>воды пляжа бонди</strong>'
        }, {
            preset: 'islands#icon',
            iconColor: '#3b5998'
        }));

    myMap.events.add('click', function (e) {
        var coords = e.get('coords');
        var newObj = new ymaps.GeoObject({
          geometry: {
              type: "Point",
              coordinates: [coords[0].toPrecision(6), coords[1].toPrecision(6)]
            }
          }, {
              preset: 'islands#icon',
              iconColor: '#3b5998',
              draggable: true
            }
          );
        myMap.geoObjects.add(newObj);
    });
}
