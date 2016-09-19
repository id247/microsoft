'use strict'

import app from './app';

//start the magic
document.addEventListener('DOMContentLoaded', () => {

	let baseUrl = '/';

	//if (window.location.href.indexOf('/promo/mie2') > -1){
		baseUrl = '/promo/mie2/'
	//} 

	app.init({
		baseUrl: baseUrl
	});

});   
