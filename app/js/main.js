var elCheckCookie = document.getElementById('check-cookie');
var elBodyCookies = document.getElementById('cookies-body');

elCheckCookie.addEventListener('click', checkCookie);

function checkCookie(e) {
	var cookiesList = document.cookie.split('; ');

	elBodyCookies.innerHTML = '';

	for (var i = 0; i < cookiesList.length; i++) {
		var childCookie = document.createElement('div'),
			deleteBut = document.createElement('button'),
			cookieText = document.createElement('span'),
			cookieName = cookiesList[i].split('=')[0];

		deleteBut.innerHTML = 'X';
		deleteBut.setAttribute('data-cookie',cookieName);
		cookieText.innerHTML = cookiesList[i];

		deleteBut.addEventListener('click', deleteCookie);

		childCookie.appendChild(deleteBut);
		childCookie.appendChild(cookieText);
		elBodyCookies.appendChild(childCookie);
	}
}

function deleteCookie(e) {
	var elItemCookie = e.srcElement.parentElement,
		nameCookie = e.srcElement.getAttribute('data-cookie');
		date = new Date(0);

	elBodyCookies.removeChild(elItemCookie);
	document.cookie = nameCookie + "=; path=/; expires=" + date.toUTCString();
}