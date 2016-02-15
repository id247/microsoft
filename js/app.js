'use strict';

//import 'babel-polyfill';

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

		function scrollAnimationStep(initPos, stepAmount) {
			var newPos = initPos - stepAmount > 0 ? initPos - stepAmount : 0;

			if (document.documentElement && document.documentElement.scrollTop){
				document.documentElement.scrollTop = newPos;
			}else{
				document.body.scrollTop = newPos;
			}

			newPos && setTimeout(function () {
				scrollAnimationStep(newPos, stepAmount);
			}, 20);
		}

		function scrollTopAnimated(topOffset, speed) {
			
			var stepAmount = topOffset;

			speed && (stepAmount = (topOffset * 20)/speed);

			scrollAnimationStep(topOffset, stepAmount);
		}

		function showActivePage(links, pages, hash){

			const pageIds = hash.substr(2).split('/');

			const topOffset = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

			let timout = 0;

			if (topOffset < 200 ){
				timout = 0;
			}else if (topOffset < 1000){
				timout = 200;
			}else{
				timout = 300;
			}

			scrollTopAnimated(topOffset, timout);

			setTimeout( () => {

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

			}, timout);


			hightlightLinks(links, hash);

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

		function route(links, pages){
			
			let hash = window.location.hash;

			if ( !isPageExists(pages, hash) ) { 
				hash = '#/home';
			}

			showActivePage(links, pages, hash);

			links && [].forEach.call( links, (link) => {

				link.addEventListener( 'click', (e) => {
					e.preventDefault();

					const hash = link.getAttribute('data-nav');

					if (isPageExists(pages, hash) ) { 
						window.location.hash = hash;
						showActivePage(links, pages, hash);
					}else{
						console.error('no such page');
					}
				});

			});
		}

		function init(links, pages){
			route(links, pages);
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

		mainRouter.init(DOM.navLinks, DOM.pages);

		parallax(DOM.mixTablet);

	}

	return{
		init: init
	}


})();

export default app;