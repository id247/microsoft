'use strict';

import { createHistory } from 'history'
import 'babel-polyfill';

const app = ( () => {

	function getDOM(){
		return{
			container: document.querySelector('#body-container'),
			pages: document.querySelectorAll('.js-page'),
			navLinks: document.querySelectorAll('[data-nav]'),
			mixTablet: document.querySelector('#home-mix-tablet'),
		}
	}

	function setHeaderFixed(container){
		container.classList.add('fixed-header');
	}


	const mainRouter = ( () => {

		let history = createHistory();

		function historyHandler(links, pages){
			
			let unlisten = history.listen(location => {
				//console.log(location);
				if ( location.action === 'PUSH' || location.action === 'POP' ){
					showActivePage(links, pages, location.hash);
				}
			});
			
		}

		function showActivePage(links, pages, hash){

			if ( !isPageExists(pages, hash) ) { 
				hash = '#/home';
			}
			
			const initPos = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
			const step = initPos < 1000 ? parseInt(initPos * .15) : parseInt(initPos * .3);

			function scrollAnimation(initPos, step, callback) {
				var newPos = initPos - step > 0 ? initPos - step : 0;

				if (document.documentElement && document.documentElement.scrollTop){
					document.documentElement.scrollTop = newPos;
				}else{
					document.body.scrollTop = newPos;
				}

				if (newPos){
					setTimeout(function () {
						scrollAnimation(newPos, step);
					}, 20);
				}else{
					callback();
				}
			}

			function hightlightLinks(links, hash){

				links && [].forEach.call( links, link => {
					var parent = link.parentNode.tagName.toLowerCase() === 'li' ? link.parentNode : false;

					const linkIds = link.getAttribute('data-nav').substr(2).split('/');
					const highlightIndex = parseInt( link.getAttribute('data-highlight') ) || 0;
					const hashIds = hash.substr(2).split('/');

					if ( hashIds.indexOf( linkIds[highlightIndex - 1] ) > -1 ){
						link.classList.add('active');
						if (parent){
							parent.classList.add('active');
						}
					}else{
						link.classList.remove('active');
						if (parent){
							parent.classList.remove('active');
						}
					}
				});
			}

			function show(links, pages, hash){

				const pageIds = hash.substr(2).split('/');
					
				pages && [].forEach.call( pages, (page) => {
					if ( pageIds.indexOf(page.id) > -1){
						page.classList.remove('invisible');
						page.classList.add('visible');

						lazyLoad.show(page);

					}else{
						page.classList.remove('visible');
						page.classList.add('invisible');

						lazyLoad.hide(page);
					}
					//add transitions only after first routing
					setTimeout( () => {
						page.classList.add('transition');
					}, 1000);
				});

				hightlightLinks(links, hash);

			}

			scrollAnimation(initPos, step, () => {
				show(links, pages, hash);
			});
			
		}


		function isPageExists(pages, hash){

			var pageIds = hash.substr(2).split('/');

			var existsPages = [].filter.call( pages, page => { 
				return ( 
					pageIds.indexOf(page.id) > -1 
				); 
			});
			
			if (existsPages.length === pageIds.length){
				return true;
			}
			
			return false;
		}

		function route(links, pages, baseUrl){
			
			const hash = window.location.hash;
			const url = baseUrl + hash;

			history.push(url);

			links && [].forEach.call( links, (link) => {

				link.addEventListener( 'click', (e) => {
					e.preventDefault();

					const hash = link.getAttribute('data-nav');
					const url = baseUrl + hash;

					if (isPageExists(pages, hash) ) { 						
						history.push(url);
					}else{
						console.error('no such page');
					}
				});

			});
		}

		function init(links, pages, baseUrl){
			route(links, pages, baseUrl);
			historyHandler(links, pages);
		}	

		return {
			init: init
		};

	})();

	const lazyLoad = ( () => {

		function each(page, action = 'show'){
			const items =  page.querySelectorAll('[data-src]');

			items && [].forEach.call( items,  item => {
				item.src = (action === 'show') ? item.getAttribute('data-src') : item.getAttribute('data-src-placeholder');
			});
		}

		function hide(page){
			each(page, 'hide');
		}

		function show(page){
			each(page, 'show');
		}

		return {
			hide: hide,
			show: show
		}

	})();

	function parallax(element){

		function move(element){
			const topOffset = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
			
			const parentTop = element.parentNode.offsetTop;

			const distance = ( topOffset - parentTop ) / 1.5;

			if (distance <= 0){
				element.style.bottom = distance + 'px';
			}else{
				element.style.bottom = 0 + 'px';
			}
		}

		document.addEventListener('scroll', (e) => {
			move(element);
		});

	}


	/*
	*	INIT
	*/
	function init(options){

		let DOM = getDOM();

		setHeaderFixed(DOM.container);

		mainRouter.init(DOM.navLinks, DOM.pages, options.baseUrl);

		parallax(DOM.mixTablet);

	}

	return{
		init: init
	}


})();

export default app;