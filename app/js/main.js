var elText = document.getElementById('textjson');
var elButton = document.getElementById('buttonjson');
var elTown = document.getElementById('texttown');

var towns = [];

elButton.addEventListener('click', downloadJson);
elTown.addEventListener('input', findTowns);

function downloadJson() {
	var p = new Promise(function(resolve) {
		var xhr = new XMLHttpRequest();

		xhr.open('POST', 'https://raw.githubusercontent.com/lapanoid/loftblog/master/cities.json', true);
		xhr.onload = function() {	
			resolve(xhr.response);
		}
		xhr.send();
	}).then(function(value) {
		towns = JSON.parse(value);
		elText.value = 'Список успешно загружен';
	})
}

function findTowns() {
	elText.value = '';
	for (var i = 0; i < towns.length; i++) {
		var townName = towns[i].name,
			inputText = elTown.value;
			
		if ( townName.indexOf(inputText) >= 0 ) {
			elText.value = elText.value + '\n' + townName;
		};
	}
}