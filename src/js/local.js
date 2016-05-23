'use strict'

import app from './app';

//start the magic
document.addEventListener('DOMContentLoaded', () => {

	let baseUrl = '/';

	if (window.location.href.indexOf('mie') > -1){
		baseUrl = '/mie.html'
	} 

	app.init({
		baseUrl: baseUrl
	});

});   
