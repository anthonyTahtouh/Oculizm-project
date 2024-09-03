/*
tracking.js
	Author & copyright (c) 2023 Oculizm Ltd
	oculizm.com
 
	The JavaScript plugin for tracking Oculizm activity
*/
function track() {
	//tracking code

	// define variables
	var oculizmEventsCookieName = "has_oculizm_event"
	var trackingServer = "https://app.oculizm.com";
	// var ocGridDomElement = document.getElementById("oclzm") ? 1 : 0;
	var gallery = "#oclzm";
	var PPG = document.getElementById("oclzmAsSeenOn");
	var invocation = new XMLHttpRequest();
	var hostname = window.location.hostname;
	var url = new URL(window.location.href);
	var oculizmOrder = {};
	// var clientID = {{clientID}}; // replaced by server
	var clientID = '{{clientID}}';



	var firstLoadMoreRecorded = false;
	var carouselNavClicked = false;
	var lightBoxCarouselNavClicked = false;


	//detecting user browser
	function fnBrowserDetect() {

		let userAgent = navigator.userAgent;
		let browserName;
		let width = screen.width;

		var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

		// Firefox 1.0+
		var isFirefox = typeof InstallTrigger !== 'undefined';

		// Safari 3.0+ "[object HTMLElementConstructor]" 
		var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
			return p.toString() === "[object SafariRemoteNotification]";
		})(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification));

		// Internet Explorer 
		var isIE = /MSIE|Trident/.test(navigator.userAgent);

		// Edge 20+
		var isEdge = /Edg/.test(navigator.userAgent);

		// Chrome 1 - 79
		var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

		// Edge (based on chromium) detection
		var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

		// Blink engine detection
		var isBlink = (isChrome || isOpera) && !!window.CSS;


		if (width >= 767) {
			if (isOpera) {
				browserName = "opera";
			} else if (isFirefox) {
				browserName = "firefox";
			} else if (isSafari) {
				browserName = "safari";
			} else if (isIE) {
				browserName = "Internet Explorer";
			} else if (isEdge) {
				browserName = "edge";
			} else if (isChrome) {
				browserName = "chrome";
			} else if (isEdgeChromium) {
				browserName = "Edge Chromium";
			} else if (isBlink) {
				browserName = "Blink";
			} else {
				browserName = "";
			}
		} else {
			if (userAgent.match(/chrome|chromium|crios/i)) {
				browserName = "chrome";
			} else if (userAgent.match(/firefox|fxios/i)) {
				browserName = "firefox";
			} else if (userAgent.match(/safari/i)) {
				browserName = "safari";
			} else if (userAgent.match(/opr\//i)) {
				browserName = "opera";
			} else if (userAgent.match(/opera/i)) {
				browserName = "opera";
			} else if (userAgent.match(/seamonkey/i)) {
				browserName = "seamonkey";
			} else if (userAgent.match(/edg/i)) {
				browserName = "edge";
			} else {
				browserName = "";
			}
		}
		return browserName;

	}

	//function to generate an 8-character random order ID with prefix oculizm_
	function generateRandomOrderId() {
		const prefix = 'oculizm_';
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 8; i++) {
			result += chars[Math.floor(Math.random() * chars.length)];
		}
		return prefix + result;
	}

	// XMLHTTP request
	function pingOculizm(evt, postId, productName, productId, referrer, currentPageUrl) {

		// let height = screen.height;
		// let width = screen.width;
		var platform = navigator.platform;
		var browsername = fnBrowserDetect();
		var cookies = navigator.cookieEnabled;
		var version = navigator.appVersion;

		// setCookie(oculizmEventsCookieName, true, 30);

		setCookie("oculizm_" + evt, true, 30);

		var sessionHasEvents = sessionHasOculizmEvents();

		var session_id = getCookie("oculizm_session_id");

		if (invocation) {
			var pingUrl = trackingServer + "/api/v1/oculizm_add_event/" +
				"?clientID=" + clientID +
				"&currentPageUrl=" + currentPageUrl +
				"&evt=" + evt +
				"&postId=" + postId +
				"&product_id=" + productId +
				"&sku=" + productId +
				"&oculizm_referrer=" + referrer +
				"&order=" + oculizmOrder +
				"&hostname=" + hostname +
				"&platform=" + platform +
				"&browsername=" + browsername +
				"&cookies=" + cookies +
				"&version=" + version +
				"&sessionHasEvents=" + sessionHasEvents +
				"&oculizmSessionId=" + session_id;

			invocation.open('GET', pingUrl, true);
			invocation.withCredentials = true;
			invocation.send();
		}

	}

	// set cookie
	function setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}

	// get cookie
	function getCookie(cname) {
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
		}
		return "";
	}

	// check if session has events
	function sessionHasOculizmEvents() {
		gridViewCookieValue = getCookie("oculizm_gridView");
		shopCookieValue = getCookie("oculizm_shop");
		expandCookieValue = getCookie("oculizm_expand");
		ppgLightboxOpenCookieValue = getCookie("oculizm_ppgLightboxOpen");
		hwLightboxOpenCookieValue = getCookie("oculizm_hwLightboxOpen");
		ppgNavCookieValue = getCookie("oculizm_ppgNav");
		hwNavCookieValue = getCookie("oculizm_hwNav");
		ppgLightboxNavCookieValue = getCookie("oculizm_ppgLightboxNav");
		sgLightboxNavCookieValue = getCookie("oculizm_sgLightboxNav");
		hwLightboxNavCookieValue = getCookie("oculizm_hwLightboxNav");
		loadMoreCookieValue = getCookie("oculizm_loadMore");

		if (gridViewCookieValue || shopCookieValue || expandCookieValue || ppgLightboxOpenCookieValue || hwLightboxOpenCookieValue || ppgNavCookieValue || hwNavCookieValue || ppgLightboxNavCookieValue || sgLightboxNavCookieValue || hwLightboxNavCookieValue || loadMoreCookieValue) {
			return true;
		} else {
			return false;
		}
	}

	//function to set the cookie session id 
	function setSessionidCookie() {
		var sessionIDCookieValue = getCookie("oculizm_session_id");
		if (sessionIDCookieValue) {
			setCookie("oculizm_session_id", sessionIDCookieValue, 30);
		} else {
			var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
			var string_length = 13;
			var randomstring = '';

			for (var x = 0; x < string_length; x++) {

				var letterOrNumber = Math.floor(Math.random() * 2);
				if (letterOrNumber == 0) {
					var newNum = Math.floor(Math.random() * 9);
					randomstring += newNum;
				} else {
					var rnum = Math.floor(Math.random() * chars.length);
					randomstring += chars.substring(rnum, rnum + 1);
				}

			}
			setCookie("oculizm_session_id", randomstring, 30);
		}
	}

	// check if an element is scrolled into view
	function isScrolledIntoView(el) {
		var rect = el.getBoundingClientRect();
		var elemTop = rect.top;
		var elemBottom = rect.bottom;

		// Only completely visible elements return true:
		var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
		return isVisible;
	}

	// handle click events
	document.addEventListener('click', function (e) {

		// lightbox open
		if (hasClass(e.target, 'oclzm-image')) {

			//setting the cookie session id
			setSessionidCookie();

			//recording PPG lightbox open event
			if (PPG) {
				var productId = PPG.attributes.getNamedItem('data-product-id').value;
				var postId = e.target.closest(".post").attributes.getNamedItem('data-post-id').value;

				setTimeout(function () {
					pingOculizm("ppgLightboxOpen", postId, null, productId, null, null);
				}, 300);
			}

			// lightbox open event for home widget and Shoppable Gallery
			else {
				var postId = e.target.closest(".oculizm-post").attributes.getNamedItem('data-post-id').value;
				var lightboxOpen_HomepageWidget = document.querySelector('.post-grid.owl-carousel');

				//recording Shoppable Gallery lightbox open event
				if (lightboxOpen_HomepageWidget === null) {
					setTimeout(function () {
						pingOculizm("expand", postId, null, null, null, null);
					}, 300);
				}

				//recording HomePage Widget lightbox open event
				else {
					setTimeout(function () {
						pingOculizm("hwLightboxOpen", postId, null, null, null, null);
					}, 300);
				}
			}
			return;
		}

		// widget carousel nav clicked
		if ((hasClass(e.target, 'owl-next')) || (hasClass(e.target, 'owl-prev'))) {
			if (!carouselNavClicked) {

				//setting the cookie session id
				setSessionidCookie();

				//setting the flag to true to stop recording carousel nav clicked events for this page
				//load because a carousel nav clicked event has already been recorded for this page load 
				carouselNavClicked = true;

				var carouselNav_HomepageWidget = document.querySelector('.post-grid.owl-carousel');

				if (PPG) {
					pingOculizm("ppgNav", null, null, null, null, null);
				}
				if (carouselNav_HomepageWidget) {
					pingOculizm("hwNav", null, null, null, null, null);
				}
			}
		}

		if ((hasClass(e.target, 'prev-button')) || (hasClass(e.target, 'next-button'))) {
			if (!lightBoxCarouselNavClicked) {

				//setting the cookie session id
				setSessionidCookie();

				//setting the flag to true to stop recording lightbox carousel nav clicked events for this page
				//load because a lightbox carousel nav clicked event has already been recorded for this page load
				lightBoxCarouselNavClicked = true;

				//recording PPG Lightbox carousel clicked
				if (PPG) {
					pingOculizm("ppgLightboxNav", null, null, null, null, null);
				}

				//recording Gallery and  homepage Lightbox carousel clicked
				else {

					var lightboxCarousel_HomepageWidget = document.querySelector('.post-grid.owl-carousel');

					if (lightboxCarousel_HomepageWidget === null) {
						pingOculizm("sgLightboxNav", null, null, null, null, null);
					} else {
						pingOculizm("hwLightboxNav", null, null, null, null, null);
					}

				}
			}
		}

	});

	// record a grid view or Shoppable Gallery lightbox open event with email referrer
	onOclzmReady(function () {

		//setting the cookie session id
		setSessionidCookie();

		setTimeout(function () {
			var GridView_homepageWidget = document.querySelector('.post-grid.owl-carousel');

			// get the referrer
			var referrer = url.searchParams.get("oculizm_src");

			// only ping if this isn't a homepage widget
			if (GridView_homepageWidget === null) {

				//recording Shoppable Gallery lightbox open event with email referrer
				if (referrer === "email") {
					var postId = url.searchParams.get("oculizm_post_id");
					pingOculizm("expand", postId, null, null, referrer, null);
				}

				// recording a grid view 
				else {
					setTimeout(function () {
						pingOculizm("gridView", url.searchParams.get("oculizm_post_id"), null, null, null, null);
					}, 1200);

				}
			}
		}, 800);
	});
	// record a product view
	var productId = url.searchParams.get("oculizm_product_id");
	if (productId) {

		//setting the cookie session id
		setSessionidCookie();

		setTimeout(function () {
			pingOculizm("shop", null, null, productId, null, null);
		}, 300);
	}

	// scroll events in gallery page
	onOclzmReady(function () {
		// Your code that depends on the oclzm div being available
		setTimeout(function () {
			var loadMore_HomepageWidget = document.querySelector('.post-grid.owl-carousel');

			if (loadMore_HomepageWidget === null) {
				window.addEventListener('scroll', function () {
					if (isScrolledIntoView(document.getElementsByClassName("oclzm-footer")[0])) {
						if (!firstLoadMoreRecorded) {
							firstLoadMoreRecorded = true;
							setSessionidCookie();
							pingOculizm("loadMore", null, null, null, null, null);
						}
					}
				});
			}
		}, 900);
	});

	// record as seen on view
	// if (ocAso) pingOculizm("asoView", null, null, null , null ,null); stop recording aso events

	// if (clientID == '78904') {

	// 		// Find the button element
	// 		var button = document.querySelector('.product-form__submit');

	// 		// Add the 'disabled' attribute
	// 		button.disabled = true;

	// 		// Change the text of the <span> element
	// 		var span = button.querySelector('span');
	// 		span.textContent = 'Sold out';

	// 	}


	// Shopify old
	if (typeof Shopify !== 'undefined') {
		if (Shopify.checkout) {
			// console.log(Shopify.checkout);

			//check that this session recorded an oculizm event
			if (Shopify.checkout.order_id && sessionHasOculizmEvents()) {
				oculizmOrder.cms = "shopify";
				oculizmOrder.ID = Shopify.checkout.order_id;
				oculizmOrder.amount = Shopify.checkout.total_price;
				oculizmOrder.items = Shopify.checkout.line_items;
				oculizmOrder.clientID = clientID;
				oculizmOrder.currency = Shopify.checkout.presentment_currency;
				oculizmOrder.shopifyCheckout = Shopify.checkout;
				// oculizmOrder.shopify = Shopify; // if we need to inspect the whole Shopify checkout object
				oculizmOrder.checkoutTimestamp = Shopify.checkout.created_at;

				oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));

				//pingOculizm if cookie session is set (it must be set due to a previous recorded event)
				var sessionIdValue = getCookie("oculizm_session_id");
				if (sessionIdValue) {

					//waiting for the previous invocation to be done if order happens at the same time with previous event
					setTimeout(function () {
						pingOculizm('order', null, null, null, null, null);
					}, 1500);
				}

				// console.log(oculizmOrder);
			}
		}
	}




	// Shopify new 
	// if ((typeof Shopify !== 'undefined' && typeof Shopify.checkout !== 'undefined' && typeof Shopify.checkout.order_id !== 'undefined') ||
	// 				(typeof window.Shopify !== 'undefined' && typeof window.Shopify.order !== 'undefined')) {

	// 				// Check if Shopify checkout order object exists
	// 				if (typeof Shopify !== 'undefined' && typeof Shopify.checkout !== 'undefined' && typeof Shopify.checkout.order_id !== 'undefined') {

	// 								console.log('Shopify Order Object Shopify checkout:', Shopify.checkout);

	// 								//check that this session recorded an oculizm event
	// 								if (sessionHasOculizmEvents()) {
	// 												oculizmOrder.cms = "shopify";
	// 												oculizmOrder.ID = Shopify.checkout.order_id;
	// 												oculizmOrder.amount = Shopify.checkout.total_price;
	// 												oculizmOrder.items = Shopify.checkout.line_items;
	// 												oculizmOrder.clientID = clientID;
	// 												oculizmOrder.currency = Shopify.checkout.presentment_currency;

	// 												// oculizmOrder.shopifyCheckout = Shopify.checkout; // if we need to inspect the whole Shopify checkout object
	// 												oculizmOrder.checkoutTimestamp = Shopify.checkout.created_at;

	// 												oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));

	// 												//pingOculizm if cookie session is set (it must be set due to a previous recorded event)
	// 												var sessionIdValue = getCookie("oculizm_session_id");
	// 												if (sessionIdValue) {

	// 																//waiting for the previous invocation to be done if order happens at the same time with previous event
	// 																setTimeout(function() {
	// 																				pingOculizm("order", null, null, null, null, null);
	// 																}, 1500);
	// 												}

	// 												console.log(oculizmOrder);
	// 								}
	// 				}

	// 				// Check if window.Shopify order object exists
	// 				else {
	// 								console.log('Shopify Order Object window Shopify order:', window.Shopify.order);

	// 								//check that this session recorded an oculizm event
	// 								if (sessionHasOculizmEvents()) {
	// 												oculizmOrder.cms = "shopify";
	// 												oculizmOrder.ID = window.Shopify.order.id;
	// 												oculizmOrder.amount = window.Shopify.order.total_price;
	// 												oculizmOrder.items = window.Shopify.order.line_items;
	// 												oculizmOrder.clientID = clientID;
	// 												oculizmOrder.currency = window.Shopify.order.presentment_currency;

	// 												oculizmOrder.shopifyCheckout = window.Shopify.order; // if we need to inspect the whole Shopify checkout object
	// 												oculizmOrder.checkoutTimestamp = window.Shopify.order.created_at;

	// 												oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));

	// 												//pingOculizm if cookie session is set (it must be set due to a previous recorded event)
	// 												var sessionIdValue = getCookie("oculizm_session_id");
	// 												if (sessionIdValue) {

	// 																//waiting for the previous invocation to be done if order happens at the same time with previous event
	// 																setTimeout(function() {
	// 																				pingOculizm("order", null, null, null, null, null);
	// 																}, 1500);
	// 												}

	// 												console.log(oculizmOrder);
	// 								}
	// 				}
	// }

	// WordPress / WooCommerce
	if (typeof WooCommerceOrder !== 'undefined') {
		if (typeof WooCommerceOrderItems !== 'undefined') {
			//check that this session recorded an oculizm event
			if (WooCommerceOrder.id && sessionHasOculizmEvents()) {
				oculizmOrder.cms = "woocommerce";
				oculizmOrder.ID = WooCommerceOrder.id;
				oculizmOrder.amount = WooCommerceOrder.total;
				oculizmOrder.items = WooCommerceOrderItems;
				oculizmOrder.clientID = clientID;
				oculizmOrder.currency = WooCommerceOrder.currency;
				oculizmOrder.wooCommerceOrder = WooCommerceOrder; // if we need to inspect the whole Shopify checkout object

				oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));

				//pingOculizm if cookie session is set (it must be set due to a previous recorded event)
				var sessionIdValue = getCookie("oculizm_session_id");
				if (sessionIdValue) {

					//waiting for the previous invocation to be done if order happens at the same time with previous event
					setTimeout(function () {
						pingOculizm("order", null, null, null, null, null);
					}, 1500);
				}
			}
		}
	}



	// nopCommerce
	// 	if (typeof Order !== 'undefined' && typeof Order.OrderGuid !== 'undefined') {

	// 		if (sessionHasOculizmEvents()) {
	// 			oculizmOrder.cms = "nopCommerce";
	// 			oculizmOrder.ID = Order.Id;
	// 			oculizmOrder.amount = Order.OrderTotal;
	// 			oculizmOrder.items = Order.OrderItems;
	// 			oculizmOrder.clientID = clientID;
	// 			oculizmOrder.currency = Order.CurrencyCode;

	// 			oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));

	// 			//pingOculizm if cookie session is set (it must be set due to a previous recorded event)
	// 			var sessionIdValue = getCookie("oculizm_session_id");
	// 			if(sessionIdValue){

	// 				//waiting for the previous invocation to be done if order happens at the same time with previous event
	// 				setTimeout(function(){
	// 					pingOculizm("order", null, null, null , null, null);
	// 				},1500);
	// 			}
	// 		}

	// }

	// Record page info and order object for cheaney
	// 	if (clientID == '90211') {

	// 		// Get the current page URL
	// 		const currentPageUrl = window.location.href;

	// 		if(currentPageUrl === "https://www.cheaney.co.uk/checkout/success/"){
	// 			var orderObject = {};

	// 		if(typeof vsIntel !== 'undefined'){

	// 					// Get the current order object
	// 					orderObject = encodeURIComponent(JSON.stringify(vsIntel));
	// 		}
	// 		else{
	// 			orderObject = "";
	// 		}

	// 			pingOculizm('pageInfo', null, null, null, null , currentPageUrl );
	// 		}
	// }





	// //Visualsoft
	if (typeof vsIntel !== 'undefined' && typeof vsIntel.transaction !== 'undefined') {

		//checking if session id has previous events 
		if (sessionHasOculizmEvents()) {

			// extract payment method from transactionAffiliation
			const affiliation = vsIntel.transaction.transactionAffiliation;
			const paymentMethodRegex = /via\s+(\w+\s*\w*)\)/; // matches the payment provider name after "via"
			const paymentMethodMatch = paymentMethodRegex.exec(affiliation);
			const paymentMethod = paymentMethodMatch ? paymentMethodMatch[1] : null;

			oculizmOrder.cms = "Visualsoft";
			oculizmOrder.ID = vsIntel.transaction.products[0].order_id ?? generateRandomOrderId();
			oculizmOrder.amount = vsIntel.transaction.transactionGoodsTotal ?? 0;
			oculizmOrder.items = vsIntel.transaction.products ?? [];
			oculizmOrder.paymentMethod = paymentMethod;
			oculizmOrder.clientID = clientID;
			oculizmOrder.currency = vsIntel.currencyCode ?? 'GBP';
			oculizmOrder.completeTransaction = vsIntel.transaction;

			oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));

			//pingOculizm if cookie session is set (it must be set due to a previous recorded event)
			var sessionIdValue = getCookie("oculizm_session_id");

			// Get the current page URL
			const currentPageUrl = window.location.href;
			if (sessionIdValue) {

				//waiting for the previous invocation to be done if order happens at the same time with previous event
				setTimeout(function () {
					pingOculizm("order", null, null, null, null, currentPageUrl);
				}, 300);
			}
		}

	}

	//Visualsoft
	// if (typeof vsIntel !== 'undefined' && typeof vsIntel.transaction !== 'undefined') {
	// 	// Check if there are previous events for this session
	// 	if (sessionHasOculizmEvents()) {

	// 					// Set up the oculizmOrder object with transaction details
	// 					oculizmOrder.cms = "Visualsoft";
	// 					oculizmOrder.ID = vsIntel.transaction.products[0].order_id;
	// 					oculizmOrder.amount = vsIntel.transaction.transactionGoodsTotal;
	// 					oculizmOrder.items = vsIntel.transaction.products;
	// 					oculizmOrder.clientID = clientID;
	// 					oculizmOrder.currency = vsIntel.currencyCode;
	// 					oculizmOrder.completeTransaction = vsIntel.transaction;

	// 					// Convert oculizmOrder to a string and encode it for safe transport
	// 					oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));

	// 					// Define a function that waits for the oculizm session ID to be set
	// 					function waitForSessionIdValue(callback) {
	// 									var sessionIdValue = getCookie("oculizm_session_id");
	// 									if (sessionIdValue) {
	// 													callback(sessionIdValue);
	// 									} else {
	// 													setTimeout(function() {
	// 																	waitForSessionIdValue(callback);
	// 													}, 300);
	// 									}
	// 					}

	// 					// Call waitForSessionIdValue and pass a callback function to handle the session ID value
	// 					waitForSessionIdValue(function() {
	// 									// Get the current page URL
	// 									const currentPageUrl = window.location.href;

	// 									pingOculizm("order", null, null, null, null, currentPageUrl);
	// 					});
	// 	}
	// }

	// // Magento
	// 	if (typeof window.checkoutConfig !== 'undefined' && typeof window.checkoutConfig.quoteData !== 'undefined') {

	// 		if (sessionHasOculizmEvents()) {
	// 			oculizmOrder.cms = "Magento";
	// 			oculizmOrder.ID = window.checkoutConfig.quoteData.entity_id;
	// 			oculizmOrder.amount = window.checkoutConfig.quoteData.base_grand_total;
	// 			oculizmOrder.items = window.checkoutConfig.quoteItemData;
	// 			oculizmOrder.clientID = clientID;
	// 			oculizmOrder.currency = window.checkoutConfig.quoteData.base_currency_code;

	// 			oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));
	// 			// console.log("oculizmOrder:", oculizmOrder);

	// 			//pingOculizm if cookie session is set (it must be set due to a previous recorded event)
	// 			var sessionIdValue = getCookie("oculizm_session_id");
	// 			if(sessionIdValue){

	// 				//waiting for the previous invocation to be done if order happens at the same time with previous event
	// 				setTimeout(function(){
	// 					pingOculizm("order", null, null, null , null, null);
	// 				},1500);
	// 			}

	// 		}


	// }

	// Magento active check
	
	// if (typeof window.checkoutConfig !== 'undefined' && typeof window.checkoutConfig.quoteData !== 'undefined') {
	// 	if (window.checkoutConfig.quoteData.is_active) { // Check if quote is active
	// 		if (sessionHasOculizmEvents()) {
	// 		oculizmOrder.cms = "Magento";
	// 		oculizmOrder.method = "Complete order object detection";
	// 		oculizmOrder.ID = window.checkoutConfig.orderId || window.checkoutConfig.quoteData.entity_id; // Use orderId if available
	// 		oculizmOrder.amount = window.checkoutConfig.quoteData.base_grand_total;
	// 		oculizmOrder.items = window.checkoutConfig.quoteItemData;
	// 		oculizmOrder.clientID = clientID;
	// 		oculizmOrder.currency = window.checkoutConfig.quoteData.base_currency_code;


	// 		oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));
	// 		//pingOculizm if cookie session is set (it must be set due to a previous recorded event)
	// 		var sessionIdValue = getCookie("oculizm_session_id");
	// 		if(sessionIdValue){

	// 			//waiting for the previous invocation to be done if order happens at the same time with previous event
	// 			setTimeout(function(){
	// 				pingOculizm("order", null, null, null , null, null);
	// 			},1500);
	// 		}

	// 		}
	// 	}
	// }

	//	Magento rattan
	// Check if we're on the order complete page and the required event data is available
	if (window.location.href.includes('rattandirect.co.uk/checkout/onepage/success/')) {
		var orderEventData = null;

		// Iterate through the dataLayer to find the order event data
		for (var i = 0; i < window.dataLayer.length; i++) {
			var eventData = window.dataLayer[i];
			if (eventData.ecommerce && eventData.ecommerce.purchase) {
				orderEventData = eventData;
				break;
			}
		}

		if (orderEventData && sessionHasOculizmEvents()) {
			// Extract order information from the event data
			var orderInfo = orderEventData.ecommerce.purchase;

			// Extract product information from the event data
			var products = orderInfo.products;

			// Convert tax to a numeric value
			var numericTax = parseFloat(orderInfo.actionField.tax);

			// Calculate total amount as the sum of revenue and numericTax
			var totalAmount = orderInfo.actionField.revenue + numericTax;

			// Convert quantity values to numeric
			products.forEach(function (product) {
				product.quantity = parseInt(product.quantity); // Or use parseFloat() if you want to retain decimal places
			});

			// Construct your oculizmOrder object
			var oculizmOrder = {
				cms: "Magento",
				method: "Rattan success page check",
				ID: orderInfo.actionField.id,
				amount: totalAmount,
				items: products, // Add the products array directly
				clientID: clientID,  // Make sure clientID is defined
				currency: orderEventData.ecommerce.currencyCode
			};

			// Encode the oculizmOrder object
			var oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));

			// Perform any additional actions you need, such as calling pingOculizm
			var sessionIdValue = getCookie("oculizm_session_id");
			if (sessionIdValue) {
				setTimeout(function () {
					pingOculizm("order", null, null, null, null, null);
				}, 1500);
			}
		}
	}

    //	Magento order detection
	// Check if window.checkoutConfig is defined
	// if (typeof window.checkoutConfig !== 'undefined' && typeof window.checkoutConfig.quoteData !== 'undefined') {
	// 	// Check if the URL matches the Magento success page pattern
	// 	if (window.location.href.includes('/checkout/onepage/success/')) {
	// 		var orderEventData = null;

	// 		// Iterate through the dataLayer to find the order event data
	// 		for (var i = 0; i < window.dataLayer.length; i++) {
	// 			var eventData = window.dataLayer[i];
	// 			if (eventData.ecommerce && eventData.ecommerce.purchase) {
	// 				orderEventData = eventData;
	// 				break;
	// 			}
	// 		}

	// 		if (orderEventData && sessionHasOculizmEvents()) {
	// 			// Extract order information from the event data
	// 			var orderInfo = orderEventData.ecommerce.purchase;

	// 			// Extract product information from the event data
	// 			var products = orderInfo.products;

	// 			// Convert tax to a numeric value
	// 			var numericTax = parseFloat(orderInfo.actionField.tax);

	// 			// Calculate total amount as the sum of revenue and numericTax
	// 			var totalAmount = orderInfo.actionField.revenue + numericTax;

	// 			// Convert quantity values to numeric
	// 			products.forEach(function (product) {
	// 				product.quantity = parseInt(product.quantity); // Or use parseFloat() if you want to retain decimal places
	// 			});

	// 			// Construct your oculizmOrder object
	// 			var oculizmOrder = {
	// 				cms: "Magento",
	// 				method: "Global url check",
	// 				ID: orderInfo.actionField.id,
	// 				amount: totalAmount,
	// 				items: products, // Add the products array directly
	// 				clientID: clientID,  // Make sure clientID is defined
	// 				currency: orderEventData.ecommerce.currencyCode
	// 			};

	// 			// Encode the oculizmOrder object
	// 			var encodedOrder = encodeURIComponent(JSON.stringify(oculizmOrder));

	// 			// Perform any additional actions you need, such as calling pingOculizm
	// 			var sessionIdValue = getCookie("oculizm_session_id");
	// 			if (sessionIdValue) {
	// 				setTimeout(function () {
	// 					pingOculizm("order", null, null, null, null, null);
	// 				}, 1500);
	// 			}
	// 		}
	// 	}
	// }


	// helper functions
	function hasClass(elem, className) {
		if (elem.className) return elem.className.split(' ').indexOf(className) > -1;
	}
}

function onOclzmReady(callback) {
	var oclzmInterval = setInterval(function () {
		var oclzm = document.getElementById("oclzm");
		if (oclzm) {
			clearInterval(oclzmInterval);
			callback();
		}
	}, 100);
}

// Check if GTM has finished loading all tags
function checkGTM() {
	if (google_tag_manager && google_tag_manager.dataLayer) {
		// GTM has finished loading all tags, so execute our tracking script
		track();
	} else {
		// GTM is not ready yet, so wait a bit and try again
		setTimeout(checkGTM, 100);
	}
}

// If GTM is present, use GTM's built-in trigger to execute your tracking script
if (typeof google_tag_manager !== 'undefined' && google_tag_manager.dataLayer) {
	// GTM is already loaded, so execute your tracking script
	checkGTM();
} else {
	// GTM is not present, so use window load event to execute your tracking script
	window.addEventListener('load', track);
}