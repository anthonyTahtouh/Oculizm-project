/*
 oculizm-tracking.js
 Author & copyright (c) 2018 Oculizm Ltd
 oculizm.com
 
 The JavaScript plugin for tracking Oculizm activity
*/
	// define variables
	var trackingServer = "https://uat.oculizm.com";
	var title = encodeURIComponent(document.title);
	var ocGrid = document.getElementById("oclzm") ? 1 : 0;
	var ocCarousel = document.getElementById("oclzmCrsl") ? 1 : 0;
	var invocation = new XMLHttpRequest();
	var hostname = window.location.hostname;
	var url = new URL(window.location.href);
	var oculizmOrder = {};

	function pingOculizm(evt, postId, productName) {
		if (invocation) {
			var pingUrl = trackingServer + "/api/v1/oculizm_event/" +
			"?clientID=" + 15873 + 
			"&page=" + title + 
			"&evt=" + evt + 
			"&ocGrid=" + ocGrid + 
			"&ocCarousel=" + ocCarousel + 
			"&postId=" + postId + 
			"&productName=" + productName + 
			"&order=" + oculizmOrder + 
			"&hostname=" + hostname;
			invocation.open('GET', pingUrl, true);
			invocation.withCredentials = true;
			invocation.send(); 
		}
	}

	// handle click events
	document.addEventListener('click', function (e) {
		// GRID PAGE EXPAND
	    if (hasClass(e.target, 'oclzm-image')) {
	    	var postId = e.target.parentNode.parentNode.attributes.getNamedItem('data-post-id').value;
	    	console.log(postId);
	        pingOculizm("expand", postId);
	    	return;
	    }
	});

	// record a carousel view
	if (ocCarousel) pingOculizm("carouselView");

	// record a post view
	var postId = url.searchParams.get("oculizm_post_id");
	if (ocGrid) pingOculizm("gridView", postId, null);

	// record a product view
	var productName = url.searchParams.get("oculizm_product_name");
	if (productName) pingOculizm("shop", null, productName);

	// record an order
	if (typeof oculizmOrderId != 'undefined') {
		oculizmOrder.ID = oculizmOrderId;
		oculizmOrder.amount = oculizmOrderAmount;
		oculizmOrder.items = oculizmItems;
		oculizmOrder = encodeURIComponent(JSON.stringify(oculizmOrder));
		pingOculizm('order');
	}
	console.log(oculizmOrder);

	// helper functions
	function hasClass(elem, className) {
	    if (elem.className) return elem.className.split(' ').indexOf(className) > -1;
	}
	
