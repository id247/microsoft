'use strict';

import { createHistory } from 'history'

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
			
			const startPosition = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
			const step = parseInt(startPosition * ( startPosition < 1000 ? .15 : .3 ) );

			function scrollAnimation(startPosition, step, callback) {
				var newPosition = startPosition - step > 0 ? startPosition - step : 0;

				document.documentElement.scrollTop = newPosition;
				document.body.scrollTop = newPosition;

				if (newPosition){
					setTimeout(function () {
						scrollAnimation(newPosition, step, callback);
					}, 20);
				}else{
					callback();
				}
			}

			function jumpTo(jumpToId){
				
				const jumpToElement = jumpToId && document.getElementById(jumpToId);

				if (!jumpToElement) return false;

				const newPosition = jumpToElement.offsetTop - 70;

				document.documentElement.scrollTop = newPosition;
				document.body.scrollTop = newPosition;
			}

			function hightlightLinks(links, hash){

				links && [].forEach.call( links, link => {
					var parent = link.parentNode.tagName.toLowerCase() === 'li' ? link.parentNode : false;

					const linkIds = link.getAttribute('data-nav').substr(2).split('/');
					const highlightIndex = parseInt( link.getAttribute('data-highlight') ) || 0;
					let hashIds = hash.substr(2).split('/').map( (hashId) => {
						return hashId.split('#')[0];
					})

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
				
				let jumpToId;

				const pageIds = hash.substr(2).split('/').map( (hashId) => {
						hashId = hashId.split('#');
						
						jumpToId = hashId[1];
						
						return hashId[0];						
				});
	
				pages && [].forEach.call( pages, (page) => {
					if ( pageIds.indexOf(page.id) > -1){
						page.classList.remove('invisible');
						page.classList.add('visible');

						lazyLoad.show(page);

						jumpTo(jumpToId);

					}else{

						if (page.classList.contains('visible')){
							lazyLoad.hide(page);
						}

						page.classList.remove('visible');
						page.classList.add('invisible');

						
					}
					//add transitions only after first routing
					setTimeout( () => {
						page.classList.add('transition');
					}, 1000);
				});

				hightlightLinks(links, hash);

			}

			scrollAnimation(startPosition, step, () => {
				show(links, pages, hash);
			});
			
		}


		function isPageExists(pages, hash){

			var pageIds = hash.substr(2).split('/').map( pageId => {
				return pageId.split('#')[0];
			});

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

			const preloader = function(e){
				if (action === 'show'){
					this.parentNode.classList.add('loaded');
				}else{
					this.parentNode.classList.remove('loaded');
				}
				this.removeEventListener('load', preloader);
			}

			items && [].forEach.call( items,  item => {
				//item.src = (action === 'show') ? item.getAttribute('data-src') : item.getAttribute('data-src-placeholder');
				item.contentWindow.location.replace( (action === 'show') ? item.getAttribute('data-src') : item.getAttribute('data-src-placeholder') );
				
				item.addEventListener('load', preloader);
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

			const distance = parseInt( ( topOffset - parentTop ) / 1.5 );

			if (distance > 1000) return;

			if (distance < 0){
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
