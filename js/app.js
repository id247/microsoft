'use strict';

//import 'babel-polyfill';

const app = ( () => {

	function getDOM(){
		return{
			container: document.querySelector('#body-container'),
			pages: document.querySelectorAll('.js-page'),
			steps: document.querySelectorAll('.js-step'),
			navLinks: document.querySelectorAll('.js-nav'),
			tutorialNavLinks: document.querySelectorAll('.js-tutorial-nav'),
		}
	}

	function setHeaderFixed(container){
		container.classList.add('fixed-header');
	}


	function scrollAnimationStep(initPos, stepAmount) {
		var newPos = initPos - stepAmount > 0 ? initPos - stepAmount : 0;

		document.body.scrollTop = newPos;

		newPos && setTimeout(function () {
			scrollAnimationStep(newPos, stepAmount);
		}, 20);
	}

	function scrollTopAnimated(speed) {
		var topOffset = document.body.scrollTop;
		var stepAmount = topOffset;

		speed && (stepAmount = (topOffset * 20)/speed);

		scrollAnimationStep(topOffset, stepAmount);
	};		

	function showActivePage(pages, activePageId){

		if (!activePageId) return;

		pages && [].forEach.call( pages, (page) => {
			if (page.id === activePageId){
				page.classList.remove('invisible');
				page.classList.add('visible');
					
				scrollTopAnimated(200);
			}else{
				page.classList.remove('visible');
				page.classList.add('invisible');
			}
			//add transitions only after first routing
			setTimeout( () => {
				page.classList.add('transition');
			}, 1000);
		});

	}

	function hightlightActiveLink(links, activeLinkId){

		if (!activeLinkId) return;

		links && [].forEach.call( links, link => {
			if (link.getAttribute('href') === '#' + activeLinkId){
				link.classList.add('active');
				link.parentNode.classList.add('active');
			}else{
				link.parentNode.classList.remove('active');
				link.classList.remove('active');
			}
		});
	}


	function mainRouter(links, pages, pageId = false){

		let pageExists;

		if (pageId){
			window.location.hash = '#/page-' + pageId;
		}else{
			pageId = window.location.hash.replace('#/page-', '');
			pageExists = [].filter.call( pages, page => { return (pageId === page.id); });
				
			if (pageExists.length == 0 ) { 
				pageId = 'home';
			}
		}

		showActivePage(pages, pageId);

		hightlightActiveLink(links, pageId);
	}

	function stepsRouter(links, pages, pageId = false){

		let pageExists;

		if (!pageId){
			pageId = pages[0].id; 
		}

		showActivePage(pages, pageId);

		hightlightActiveLink(links, pageId);

	}

	function navigation(links, pages, router){

		links && [].forEach.call( links, (link) => {

			link.addEventListener( 'click', (e) => {
				e.preventDefault();

				const pageId = link.getAttribute('href').substr(1);

				const pageExists = [].filter.call( pages, page => { return (pageId === page.id); });
				
				if (pageExists.length == 1 ) { 
					router(links, pages, pageId);
				}
			});

		});

	}


	/*
	*	INIT
	*/
	function init(options){

		let DOM = getDOM();

		setHeaderFixed(DOM.container);

		mainRouter(DOM.navLinks, DOM.pages);
		stepsRouter(DOM.tutorialNavLinks, DOM.steps);
		
		navigation(DOM.navLinks, DOM.pages, mainRouter);		
		navigation(DOM.tutorialNavLinks, DOM.steps, stepsRouter);



	}

	return{
		init: init
	}


})();

export default app;