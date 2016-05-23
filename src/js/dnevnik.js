'use strict'

import app from './app';

//start the magic
document.addEventListener('DOMContentLoaded', () => {

	let baseUrl = '/promo/mixathon/';

	if (window.location.href.indexOf('/promo/mie') > -1){
		baseUrl = '/promo/mie/'
	} 

	app.init({
		baseUrl: baseUrl
	});

});   
