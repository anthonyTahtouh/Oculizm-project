/*

 aso.js
 Author & copyright (c) 2023 Oculizm Ltd
 https://oculizm.com
 
 The jQuery plugin for loading "As Seen On" posts from Oculizm in plain HTML
 
 */

(function (jQuery) {

	jQuery.fn.oculize = function(options) {





		/* * * * * * * * * * * * * * * * * * * * *
		*										 *
		*										 *
		*				PAGE SETUP				 *
		*										 *
		*										 *
		* * * * * * * * * * * * * * * * * * * * */

		// define variables
		var clientID = '{{clientID}}';
		var widget = "#oclzmAsSeenOn";
		var lightboxClass = ".aso-lightbox";
		var hotspotLabels = "/* asoHotspotLabels */";
		var hideOculizmCredit = "/* hideOculizmCredit */";
		var region = "/* region */"; // this is the DEFAULT region
		var numItems = 24;
		var viewerProducts = [];
		var addToBasketButton = "";
		var lastOpenPost;
		var eof = false;
		var requesting = false;
		var shareText = "/* shareText */";
		var posts;
		var postsLoadedInCarousel;
  		var postViewer = "/* PPGViewer */";
  		var useCarousel = "/* ppg_use_carousel */";
		var supplied_post_id;

		var ppg_show_products = "/* ppg_show_products */";
		var PPG = document.getElementById("oclzmAsSeenOn");
		var postGridLoaded = false;

		// override variables if supplied in the script
        if (options.container && options.container != "") widget = options.container; // is this needed? We never pass "container" as an option in the injection script
		if (options.region && options.region != "") region = options.region;
		if (PPG && options.productID) PPG.setAttribute("data-product-id", options.productID);

		// add classes to elements
		jQuery(widget).addClass('/* ASO CONTAINER CLASSES */');
		if (postViewer == "asoNoLightbox") jQuery(widget).addClass('no-lightbox');
		if (useCarousel == 1) jQuery(widget).addClass('has-oculizm-carousel');

		// load inline stylesheet
		const inlineStyle = document.createElement('style');
		inlineStyle.textContent = '{{asSeenOnCss}}';
		document.head.appendChild(inlineStyle);


		// load main HTML elements
		const widgetElement = document.querySelector(widget);
		document.querySelector(widget).insertAdjacentHTML( 'beforeend',
			'<div class="post-grid-container">' +
			'	<div class="post-grid"></div>' +
			'	<div class="oclzm-loader"></div>' +
			'</div>' +
			'<div class="oclzm-footer">' +
			'	<a class="oculizm-credit" href="https://oculizm.com" target="_blank">' +
			'		<img src="https://app.oculizm.com/static/powered-by-oculizm.png" alt="Oculizm logo">' +
			'	</a>' +
			'</div>'
		);

		// define HTML elements
		var lightboxNext = "data-grid-lightbox-next";
		var lightboxPrev="data-grid-lightbox-prev";
		var lightboxNextSelector = `[${lightboxNext}]`;
		var lightboxPrevSelector = `[${lightboxPrev}]`;
		const loader = document.querySelector(widget + ' .oclzm-loader');
		const footer = document.querySelector(widget + ' .oclzm-footer');
		var viewerHtml = 	'<div class="viewer aso-lightbox">' +
							'	<div class="viewer-container">' +
							'		<div class="viewer-left">' +
							'			<div class="main-image">' +
							'				<div class="hotspot-container">' +
							'					<div class="hotspot-map">' +
							'						<img class="main-image-actual" width="100%">' +
							'						<div class="hotspot-spots"></div>' +
							'					</div>' +
							'				</div>' +
							'			</div>' +
							'			<div class="main-video">' +
							'				<video class="video main-video-actual">' +
							'					<source type="video/mp4">' +
							'				</video>' +
							'				<div class="video-icon"></div>' +
							'			</div>' +
							'		</div>' +
							'		<div class="viewer-right">' +
							'			<div class="viewer-right-inner">' +
							'				<div class="product-list-title">Shop the look</div>' +
							'				<div class="oclzm-products"></div>' +
							'				<div class="oclzm-post-caption"></div>' +
							'				<div class="oclzm-post-title"></div>' +
							'			</div>' +
							'			<div class="share"></div>' +
							'		</div>' +
							'		<a href="#" class="close"></a>' +
							'	</div>' + (() => {
								if (postViewer == "asoLightboxWithCarousel") {
									return `
										<div ${lightboxPrev} class="prev-button"></div>
										<div ${lightboxNext} class="next-button"></next
									`;
								} else {
									return '';
								}
							})() +
							'</div>';






		/* * * * * * * * * * * * * * * * * * * * *
		*										 *
		*										 *
		*				FUNCTIONS				 *
		*										 *
		*										 *
		* * * * * * * * * * * * * * * * * * * * */

		// size grid media
		function sizeGridMedia() {

			// image
			jQuery(widget).find('.oclzm-image').on('load', function() {

				// get original image dimensions
				var imgw = jQuery(this).get(0).width;
				var imgh = jQuery(this).get(0).height;
				var aspect = imgw/imgh;

				// reset image size
				jQuery(this).css({'width' : 'auto', 'height' : 'auto'});
				
				// // landscape
				// if (aspect > 1) {
				// 	jQuery(this).css({'width': '150%'});
				// 	jQuery(this).parent().css('height', imgw + 'px');
				// 	jQuery(this).css({'height': '100%'});
				// }

				// // portrait
				// else {
				// 	jQuery(this).css('width', '100%');
				// 	jQuery(this).parent().css('height', imgw + 'px'); // chop
				// }

				// landscape
				if (aspect > 1) {
					jQuery(this).css({'height': '100%'}); // constrain by smaller dimension
					jQuery(this).css({'width': '150%'}); 
				}

				// portrait
				else {
					jQuery(this).css('width', '100%'); // constrain by smaller dimension
				}
			})
			.each(function() {
				if(this.complete) jQuery(this).trigger('load');
			});
			
			// video
			jQuery(widget).find('.video').each(function() {
				// square the container
				var vc = jQuery(this).parent();
				vc.css('height', vc.width() + 'px');
			});
		}

		// size viewer media
		function sizeViewerMedia(height = 0) {

			// this must be set with JS, not CSS
			jQuery(lightboxClass + ' .main-image-actual, ' + lightboxClass + ' .video').css({'width' : '100%', 'height' : 'auto'});
			
			// desktop
			if (jQuery(window).width() > 768) {

				jQuery(lightboxClass + ' .owl-carousel').trigger('refresh.owl.carousel');
				
				if (jQuery(lightboxClass + ' .video').is(':visible')) height = 512;
				if (height != 0) viewer_left_height = height;
				var viewer_left_height = jQuery(lightboxClass + " .viewer-left").innerHeight();
				
				//main image actual height should be set here directly after getting the viewer left height
				jQuery(lightboxClass + " .main-image-actual").height(viewer_left_height);

				var viewer_left_width = jQuery(lightboxClass + " .viewer-left").innerWidth();
				if (viewer_left_width == 0) viewer_left_width = 512;
				var viewer_aspect = viewer_left_width/viewer_left_height;

				//Set the video elements heights
				jQuery(lightboxClass + " .main-video").height(viewer_left_height );
				jQuery(lightboxClass + " .main-video-actual").height(viewer_left_height );
				
				//Set the viewer right height same as viewer left
				jQuery(lightboxClass + " .viewer-right").height(viewer_left_height);

				//get the share element height to set the viewer right inner height
				var share_element_height = jQuery(lightboxClass + " .share").innerHeight();
				var viewer_right_inner_height = viewer_left_height - share_element_height;
				jQuery(lightboxClass + " .viewer-right-inner").height(viewer_right_inner_height);

				// landscape
				if (viewer_aspect >= 1) {
					var viewer_container_width = jQuery(lightboxClass + " .viewer-container").innerWidth();
					var viewer_right_width = viewer_container_width - viewer_left_width;
					jQuery(lightboxClass + " .viewer-right").width(viewer_right_width);
				}

				// portrait
				else {
					var viewer_container_width = viewer_left_width + viewer_left_width;
					jQuery(lightboxClass + " .viewer-right").width(viewer_left_width);
					jQuery(lightboxClass + " .viewer-container").width(viewer_container_width);
				}
			}
			if (jQuery(window).width() < 768) {
				var viewer_left_width = jQuery(lightboxClass + " .viewer-left").innerWidth();
				jQuery(lightboxClass + " .viewer-right").width(viewer_left_width);
				jQuery(lightboxClass + " .viewer-right-inner").width(viewer_left_width);
				jQuery(lightboxClass + " .video").width(viewer_left_width );
				jQuery(lightboxClass + " .video").height(viewer_left_width );
			}
			
			initViewerHotspots(viewerProducts);
		}

		// main function to load posts on page
		function loadPosts() {

			loader.style.display = 'block';

			var offset = jQuery(widget).find('.post').length;
			requesting = true;

	        jQuery.ajax({
	            url: 'https://app.oculizm.com/api/v1/fetch_oculizm_as_seen_on_posts/',
				dataType: 'json',
				data: {
					requestType: 'aso',
					clientID: '{{clientID}}',
					productID: options.productID,
					count: numItems,
					region: region,
					offset: offset
				},
	            success: function(data) {
	            	data = jQuery.parseJSON(data);
					// console.log(data);
	            	
	            	posts = data.posts;

	                // if the whole Shopify section exists
	                if (jQuery('.oculizm-aso-section').length > 0) {
						// if there are less than 3 posts...
						if ((!posts.length) || (posts.length < 3)) {
							// hide the whole section
							jQuery('.oculizm-aso-section').hide();
						}	                	
	                }

					if (data.show_placeholder) {
						showPlaceholder(posts);
						return;
					}

	                // add posts to the gallery
	                for (var i=0; i<posts.length; i++) {
	                	addPost(posts[i].post_title, posts[i].thumb_url, posts[i].image_url, posts[i].video_url, posts[i].post_id, posts[i].caption, posts[i].image_alt_text, posts[i].products, posts[i].social_network, posts[i].social_id);
	                }

	        		setTimeout(function() {
	        			/* INIT CAROUSEL CODE */
			        }, 100);

	                setTimeout(sizeGridMedia, 250);
	            },
	            error: function(jqXHR, textStatus, errorThrown) {
	                console.log(errorThrown);
	            },
	            complete: function() {
					loader.style.display = 'none';
	            }
	        });
		}

		// add a post to the gallery
		function addPost(post_title, thumb_url, image_url, video_url, post_id, post_caption, image_alt_text, products, social_network, social_id) {

			// if there are products, show them (there always will be here in aso.js)
			var productsHtml = "";
			if (products) {

				productsHtml = products.reduce(function(accumulator, currentItem) {

					// build product URL
					var productUrl = currentItem.product_url;
					productUrl = {{productUrl}}; // DO NOT EDIT THIS LINE - IT'S REPLACED BY THE SERVER

					// build our param string
			    	var product_id = encodeURIComponent(currentItem.product_id);
			    	var productName = encodeURIComponent(currentItem.product_name);
			    	var paramsSuffix = "oculizm_product_name=" + productName + "&oculizm_product_id=" + product_id;

			    	// count the number of question marks
		    		var numQuestionMarks = char_count(productUrl,"?");
		    		numQuestionMarks += (productUrl.match(/%3F/g) || []).length; // also count encoded question marks

		    		// determine whether to use a ? or a &
			    	var hrefSuffix = "?";
		    		if (numQuestionMarks >= 1) hrefSuffix = "&";
		    		
		    		// check if the links are already encoded with affiliate network links
					affIsAwin = (productUrl.match(/awin1/g) || []).length;
					if (affIsAwin >= 1) hrefSuffix = "?";
					affIsWebgains = (productUrl.match(/webgains/g) || []).length;
					if (affIsWebgains >= 1) hrefSuffix = "?";
					
					// build the new product URL
					productUrl += hrefSuffix + paramsSuffix;

					// format prices
					var price = parseFloat(currentItem.product_price); // turn into a float
        			if (Math.round(price) !== price) price = price.toFixed(2); // if non-integer, use 2 decimal places
        			price = price.toLocaleString("en"); // add commas
					var strikeoutPrice = parseFloat(currentItem.product_price_strikeout); // turn into a float
        			if (Math.round(strikeoutPrice) !== strikeoutPrice) strikeoutPrice = strikeoutPrice.toFixed(2); // use 2 decimal places
        			strikeoutPrice = strikeoutPrice.toLocaleString("en"); // add commas

					// create the link HTML
					return accumulator + 
						'<div data-href="' + productUrl + '" class="oclzm-product" data-x="' + currentItem.x + '"" data-y="' + currentItem.y + '">' +
						'	<a href="' + productUrl + '">' +
						'		<div class="oclzm-modal-img-holder"> ' +
						'			<div class="oclzm-modal-img-holder-inner"> ' +
						'				<img class="oclzm-product-image" src="' + currentItem.product_image_url + '" alt="' + currentItem.product_name +'">' +
						'			</div>' +
						'		</div>' +
						'		<div class="product-name">' + currentItem.product_name + '</div>' +
						'		<div class="product-price"><b>' + currency + price + '</b></div>' +
						'		<div class="product-price-strikeout"><b>' + currency + strikeoutPrice + '</b></div>' +
						'	</a>' +
						'	<div class="product-actions">' +
						'		<a href="' + productUrl + '&src=btn" class="oclzm-shop-now-btn">Shop Now</a>' +
								// addToBasketButton +
						'	</div>' +
						'</div>';
				}, '');
			}

			var sourceHtml = "";
			if (social_network && social_id) sourceHtml = 'data-feed-source="' + social_network + '" data-social-id="' + social_id + '"';
			
			// image alt text - use title if null
			if (image_alt_text == null) image_alt_text = post_title;

			// lazy load
			var srcClass = "src";
			var owlLazyClass = "";
			if (postsLoadedInCarousel) owlLazyClass = "owl-lazy owlLazy";

			// image
			if (!video_url) {
				var mediaHtml = '<div class="oclzm-post-inner">' +
								'	<div class="oclzm-img-holder">' +
								'		<img class="oclzm-image ' + owlLazyClass + '" ' + srcClass + '="https://app.oculizm.com/wp-content/themes/oculizm/img/no-image.png" data-full-image="' + image_url + '"  alt="' + image_alt_text +'">' +
								'		<div class="hotspot-spots"></div>' + // needed for ASO
								'	</div>' +
								'</div>';
			}

			// video
			else {
				var mediaHtml = '<div class="oclzm-post-inner">' +
								'	<div class="vid-holder">' +
								'		<video class="video" preload="none">' +
								'			<source src="' + video_url + '#t=2" type="video/mp4">' + // show thumbnail at 2s
								'			Your browser does not support the video tag.' +
								'		</video>' +
								'		<div class="video-icon"></div>' +
								'	</div>' +
								'</div>';
			}

			post_caption = createHyperlinks(post_caption);

			// append to gallery
			jQuery(widget).find('.post-grid').append('<div class="post" data-post-id="' + post_id + '" ' + sourceHtml + '>' +
				// '	<div class="post-cover"><i class="post-cover-icon"></i><span class="post-cover-text">Shop the look</span></div>' +
				mediaHtml +
				'	 <div class="oclzm-post-details">' +
				'	 <div style="clear:both;"></div>' +
				'		<div class="oclzm-post-title"><span class="post-title-value">' + post_title + '</span></div>' +
				'		<div class="oclzm-products">' + productsHtml + '</div>' +
				'		<div class="oclzm-post-caption">' + post_caption + '</div>' +
				'	</div>' +
				// '	<div class="oclzm-social-network ' + social_network + '"><div class="oclzm-social-network-icon"></div></div>' +
				'</div>').fadeIn('fast', function() {
					// unlike grid.js, we need to call initGridHotspots here because ASO can show hotspots on the gallery
					if (hotspotLabels != "aso_noHotspots") setTimeout(initGridHotspots, 800);
					if (ppg_show_products == 1) setTimeout(initGridHotspots, 800);
				});

			// show the footer
			footer.style.display = 'block';
		}

		// init carousel videos
		function initCarouselVideos() {

			const element = document.querySelector('#oclzmAsSeenOn .owl-carousel');
			if (element) {
				clearInterval(intervalId);
		
				// lazy load for videos
				var owlCarousel = jQuery('.owl-carousel');
				owlCarousel.owlCarousel({});
				var items = jQuery(owlCarousel).find('.owl-item.active');

				for (var i = 0; i < 4 ; i++) {
					var currentItem = items.eq(i);
					var currentVideo = currentItem.find('video');

					// Remove preload attribute for videos
					if (currentVideo.length) {
						var currentVideoSource = currentVideo.find('source');
						var currentVideoSrc = currentVideoSource.attr('src');
						currentVideoSource.attr('src', currentVideoSrc);
						currentVideo[0].removeAttribute('preload');
					}
				}
	
				owlCarousel.on('changed.owl.carousel', function (event) {
					var current = event.item.index;
					var items = jQuery(event.target).find('.owl-item');
					
					// Iterate through the first 4 items
					for (var i = current; i < current + 4; i++) {
						var currentItem = items.eq(i);
						var currentVideo = currentItem.find('video');
		
						// Play if video found
						if (currentVideo.length) {
							var currentVideoSource = currentVideo.find('source');
							var currentVideoSrc = currentVideoSource.attr('src');
							currentVideoSource.attr('src', currentVideoSrc);
							currentVideo[0].removeAttribute('preload');
						}
					}
				});
			}
		}

		// show/hide arrows
		function showOrHideLightboxArrows(postId) {
			const $post = jQuery(`[data-post-id=${postId}]`);
			jQuery(lightboxNextSelector).show();
			jQuery(lightboxPrevSelector).show();
			postsLoadedInCarousel = document.querySelector('.owl-carousel') ? 1 : 0;

			// if posts are not loaded in a carousel
			if (!postsLoadedInCarousel) {

				// If the current post is the last one, the next arrow should be hidden.
				// However, since the next element does not exist yet, this will result in
				// all next arrows being hidden for the email (even for posts that are not the last).
				// Therefore, the next arrow should be displayed again in the callback function
				if (!$post.next().get(0)) jQuery(lightboxNextSelector).hide();

				// If the current post is the first one and there is no previous elements, hide the prev arrow
				if (!$post.prev().get(0)) jQuery(lightboxPrevSelector).hide();

				waitForNextPostLoaded(function() {

					// Since the next element had not been created prior to entering this callback function, it was hidden.
					// Therefore, it must be displayed again
					jQuery(lightboxNextSelector).show();

					//If the current post is the last one and there is no next element, hide the next arrow 
					if (!$post.next().get(0)) jQuery(lightboxNextSelector).hide();
				});
				
			}

			// if the posts are being displayed in a carousel format (as a homepage widget)
			else {
				if (!$post.parents().eq(1).next().find('.post').get(0)) jQuery(lightboxNextSelector).hide();
				if (!$post.parents().eq(1).prev().find('.post').get(0)) jQuery(lightboxPrevSelector).hide();
			}
		}

		// callback function executed on post load
		function waitForNextPostLoaded(callback) {
			jQuery(widget).find('.oclzm-image').on('load', function() {
				callback();
			});
		}
	
		// open viewer
		function openViewer(post) {
			lastOpenPost = post.data("postId");
			
			jQuery(lightboxClass).remove();
			jQuery('body').append(jQuery(viewerHtml));
			
			// populate title
			jQuery(lightboxClass + ' .oclzm-post-title').text(post.find('.post-title-value').text());
			
			// Check if post_title is "Untitled" and hide oclzm-post-title in the viewer
			if (post.find('.post-title-value').text() === 'Untitled') {
				jQuery(lightboxClass + ' .oclzm-post-title').hide();
			}

			// hide all media types
			jQuery('.main-image, .main-video').hide();

			// image
			if (post.find('.video').length === 0) {
				jQuery(lightboxClass + ' .main-image-actual').attr('src', (post.find('.oclzm-image').data('fullImage')) );
				jQuery(lightboxClass + ' .main-image-actual').attr('alt',  (post.find('.oclzm-image').attr('alt')) );
				jQuery('.main-image').show();
			}
			// video
			else { 
				jQuery(lightboxClass + ' .video source').attr('src', (post.find('.video source').attr('src')));
				jQuery('.main-video').show();
				jQuery(".main-video .video").get(0).play();
			}

			var captionSection = jQuery(lightboxClass + ' .oclzm-post-caption');
			captionSection.html(post.find('.oclzm-post-caption').html());

			// build share URL
			var shareUrl = window.location.href;
			if (shareUrl.indexOf('post_id') >= 0) shareUrl = shareUrl.substr(0, shareUrl.indexOf('post_id')-1);
			shareUrl += "?oculizm_post_id=" + post.attr('data-post-id');
			// add share buttons
			var shareButtons = "<div>";
			shareButtons += '<a class="facebook" href="https://www.facebook.com/sharer/sharer.php?u=' + shareUrl + '&quote=' + encodeURIComponent(shareText) + '" target="_blank"></a>';
			shareButtons += '<a class="twitter" href="http://twitter.com/share?text=' + encodeURIComponent(shareText) + '&url=' + shareUrl + '" title="Share on Twitter" rel="nofollow" target="_blank"></a>';
			shareButtons += '<a class="pinterest pin-it-button" href="http://pinterest.com/pin/create/button/?url=' + shareUrl + '&media=' + post.find('.oclzm-image').attr('src') + '&description=' + encodeURIComponent(shareText) + '" count-layout="horizontal" target="_blank"></a>';
			shareButtons += '<a class="whatsapp" href="https://wa.me/?text=' + encodeURIComponent(shareText) + '%20' + encodeURIComponent(shareUrl) + '" target="_blank"></a>';			    
			// shareButtons += '<a class="email" href="mailto:?subject=' + encodeURIComponent(shareText) + '&body=' + shareUrl + '"></a>';
			shareButtons += "</div>";
			shareButtons += '<a class="oculizm-credit" href="https://oculizm.com" target="_blank"><img src="https://app.oculizm.com/static/powered-by-oculizm.png" alt="Oculizm logo"></a>';
			jQuery(lightboxClass + ' .share').html(shareButtons);

			// reset products array
			let products = [];
			viewerProducts = products;

			// open lightbox
			jQuery(lightboxClass).fadeIn('fast');
			showOrHideLightboxArrows(lastOpenPost);
			
			// products
			if (post.find('.oclzm-product').length > 0) {
				
				// set up html
				var productsSection = jQuery(lightboxClass + ' .oclzm-products');
				productsSection.html(post.find('.oclzm-products').html());

				/* INIT PRODUCT CAROUSEL CODE */

				// show product list title
				jQuery(lightboxClass + ' .product-list-title').show();

				// set up hotspots
				post.find('.oclzm-product').each(function() {
					products.push({
						'product_name': jQuery(this).find('.product-name').text(),
						'product_url': jQuery(this).attr('data-href'),
						'x': jQuery(this).attr('data-x'), 
						'y': jQuery(this).attr('data-y'), 
					});
				});
				if (post.find('.oclzm-product').length < 3 && jQuery(window).width() > 768) {
					jQuery(lightboxClass + ' .owl-carousel').addClass("carousel-center-class");
				}
			}

			//	setting viewer-right to have the same height as viewer-left	
			if (post.find('.video').length === 0) { 
				const $img = jQuery('.main-image-actual');
				if ($img.attr('src')) {
					const mainImg = $img[0];
					mainImg.onload = () => sizeViewerMedia(); 
				}
			}
			// video
			else { 
				const video = jQuery('.main-video-actual');
				if (video) video.on("loadeddata", sizeViewerMedia());
			}
		}

		// initialise lightbox hotspots
		function initViewerHotspots(products) {

		    // remove previous hotspots / labels
		    jQuery(lightboxClass + ' .hotspot, ' + lightboxClass + ' .hotspot-label').remove();

		    var hotspotContainer = jQuery(lightboxClass + ' .hotspot-spots');

			// if it's an image, set up the hotspots
			const $img = jQuery('.main-image-actual');
			if ($img.attr('src')) {
				const mainImg = $img[0];
				const isLoaded = mainImg.complete && mainImg.height !== 0;
				if (!isLoaded && !mainImg.onload) {
					mainImg.onload = () => initViewerHotspots(products);
					return;
				}
				var w = jQuery('.main-image-actual').width();
				var h = jQuery('.main-image-actual').height();
				// no idea why this works
				var x = jQuery('.main-image-actual').offset().left - jQuery('.main-image-actual').parent().offset().left;
				// position the hotspots
				hotspotContainer.css({
					'width': w + 'px',
					'height': h + 'px',
					'left': x
				});
			}

		    // if there are products to load
		    if (products) {

			    // for each product...
				for (var i=0; i<products.length; i++) {

					var px = products[i]['x'];
					var py = products[i]['y'];

					// now create the hotspots, if there are any
					if (px && py) {
						if ((px != "undefined") && (py != "undefined")) {

							var hotspot = jQuery('<div class="hotspot" data-x="' + px + '" data-y="' + py + '" data-index="' + i + '"></div>');
							hotspotContainer.append(hotspot);

							// turn percentages into relative coordinates on the hotspot map
							var x = Math.round((hotspotContainer.width()*px)/100);
							var y = Math.round((hotspotContainer.height()*py)/100);

							// place the hotspot
							// hotspot.css({'left': x-8, 'top': y-8});
							hotspot.css({'left': x, 'top': y+1});

							// labels
							if (hotspotLabels != "aso_noLabels") {

								var productUrl = products[i]['product_url'];

								// create the label 
								var label = jQuery('<a class="hotspot-label" data-index="' + i + '" href="' + productUrl + '">' +
									'	<div class="hotspot-label-text">' + products[i]['product_name'] + '</div>' +
									'</a>');

								// determine label coordinates
								x = hotspot.offset().left - hotspotContainer.offset().left;
								y = hotspot.offset().top - hotspotContainer.offset().top;

								// show it
								hotspotContainer.append(label);
								label.css({
									'left' : x-55,
									'top' : y+20
								});
							}
					    }
					}
				}

				// if labels should only be shown on hover, hide them initially
				if (hotspotLabels == "aso_labelsOnHover") jQuery(lightboxClass + ' .hotspot-label').hide();
			}
		}

		// opacity fix (DO NOT DELETE - this is referenced in gallery-options.php)
		function oculizmCarouselOnChanged() {
			jQuery(widget).find('.post').css('opacity', '1');
		}

	    // placeholder code
	    function showPlaceholder (data = []) {
	        const placeholderDom = `
				<div class="oclzm-placeholder">
					<div class="oclzm-placeholder-images">
						${data ? data.map( post => `
							<img src="${post.image_url}" style="width: 100%;min-width: 0; padding: 10px; object-fit: cover;"/>
						`).join('') : ''}
					</div>
					<p>
						Coming soon - your shoppable user generated content gallery from 
						<a href='https://oculizm.com/' target='_blank'>Oculizm</a>
					</p>
					<br>
					<a href='https://oculizm.com/' target='_blank' style="
						display: inline-block; width: 120px; height: 15px; background-repeat: no-repeat; background-size: contain;
						background-image: url(https://app.oculizm.com/static/powered-by-oculizm.png);
					"></a>
				</div>
			`;
			jQuery(widget).html(placeholderDom);
			jQuery('.oculizm-section').hide();
		}

		// turn "http..." substrings into actual hyperlinks
		function createHyperlinks(text) {
	        var url1 = /(^|&lt;|\s)(www\..+?\..+?)(\s|&gt;|$)/g;
	        var url2 = /(^|&lt;|\s)(((https?|ftp):\/\/|mailto:).+?)(\s|&gt;|$)/g;

	        var html = jQuery.trim(text);
	        if (html) {
	            html = html
	                .replace(url1, '$1<a href="http://$2">$2</a>$3')
	                .replace(url2, '$1<a href="$2">$2</a>$5');
	        }
	        return html;
	    }

	    // count the number of question marks in a URL
		function char_count(str, letter) {
			var letter_Count = 0;
			for (var position = 0; position < str.length; position++) {
				if (str.charAt(position) == letter) letter_Count += 1;
			}
			return letter_Count;
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

		// initialise gallery hotspots
		function initGridHotspots() {

		    // remove previous hotspots / labels
		    jQuery(widget).find('.hotspot').remove();
		    jQuery(widget).find('.hotspot-label').remove();

			// if it's an image, set up the hotspots
		    jQuery('.oclzm-image').each( function() {

		    	var hotspotContainer = jQuery(this).parent().find('.hotspot-spots');
							var imageContainer = jQuery(this).parent().find('.oclzm-img-holder');
							var image_container = hotspotContainer.parent();


				var w = jQuery(this).width();
				var h = jQuery(this).height();
				// no idea why this works
				var x = jQuery(this).offset().left - jQuery(this).parent().offset().left;
				// position the hotspots
				hotspotContainer.css({
					'width': w + 'px',
					'height': w + 'px',
					'left': x
				});

				image_container.css({
					'width': w + 'px',
					'height': w + 'px',
					'left': x
				});

				// get the products of the post we're processing
				var post_id = jQuery(this).closest('.post').attr('data-post-id'); // gallery posts
				let products;
				for (var k=0; k<posts.length; k++) {
					if (posts[k].post_id == post_id) products = posts[k].products;
				}

				if (products) {

				    // for each product...
					for (var i=0; i<products.length; i++) {

						var px = products[i]['x'];
						var py = products[i]['y'];

						// now create the hotspots, if there are any
						if (px && py) {
							if ((px != "undefined") && (py != "undefined")) {

								var hotspot = jQuery('<div class="hotspot" data-x="' + px + '" data-y="' + py + '" data-index="' + i + '"></div>');
								hotspotContainer.append(hotspot);

								// turn percentages into relative coordinates on the hotspot map
								var x = Math.round((hotspotContainer.width()*px)/100);
								var y = Math.round((hotspotContainer.height()*py)/100);

								// place the hotspot
								// hotspot.css({'left': x-8, 'top': y-8});
								hotspot.css({'left': x, 'top': y+1});

								var productUrl = products[i]['product_url'];

						    	// create the label 
						    	var label = jQuery('<a class="hotspot-label" data-index="' + i + '" href="' + productUrl + '">' +
						    				'	<div class="hotspot-label-text">' + products[i]['product_name'] + '</div>' +
						    				'</a>');

					            // determine label coordinates
								x = hotspot.offset().left - hotspotContainer.offset().left;
								y = hotspot.offset().top - hotspotContainer.offset().top;


								// show it
						    	hotspotContainer.append(label);
						    	label.css({
						    		'left' : x-55,
						    		'top' : y+20
						    	});
						    }
						}
					}
				}
				// if labels should only be shown on hover, hide them initially
				if (hotspotLabels == "aso_labelsOnHover") jQuery(widget).find('.hotspot-label').hide();
				if (hotspotLabels == "aso_noLabels") jQuery(widget).find('.hotspot-label').hide();
				if (hotspotLabels == "aso_noHotspots") {
					jQuery(widget).find('.hotspot').remove();
					jQuery(widget).find('.hotspot-label').remove();
				}
		    });
		}

		// load images
		function loadImagesSrcs() {
			jQuery('.oclzm-image').each(function () {
				var $img = jQuery(this);
				var thumb_url = $img.attr('data-full-image');
				$img.attr('src', thumb_url);
			});
		}
		
		function checkForPost() {
			const postElement = document.getElementsByClassName("post")[0];
			if (postElement) {
				clearInterval(intervalPost);

				if (isScrolledIntoView(document.getElementsByClassName("post")[0]) && !postGridLoaded) {
					postGridLoaded = true;
					loadImagesSrcs();
				}
			}
		}






		/* * * * * * * * * * * * * * * * * * * * *
		*										 *
		*										 *
		*				LISTENERS				 *
		*										 *
		*										 *
		* * * * * * * * * * * * * * * * * * * * */

		// window resize events
		jQuery(window).resize(function() {
    		setTimeout(sizeGridMedia, 250);
			setTimeout(sizeViewerMedia, 250);
			if (hotspotLabels != "aso_noHotspots") setTimeout(initViewerHotspots, 400);
   			if (ppg_show_products == 1) setTimeout(initGridHotspots, 400);
		});

		// window scroll events
		jQuery(window).scroll(function () { 
			if (isScrolledIntoView(document.getElementsByClassName("post")[0]) && !postGridLoaded) {
				postGridLoaded = true;
				loadImagesSrcs();
			}
		});
		
		// hotspot hovering
		jQuery(document).on({
		    mouseenter: function () {
		        var i = jQuery(this).attr('data-index');
		        if (hotspotLabels != "aso_noLabels") jQuery(this).parent().find('.hotspot-label[data-index=' + i + ']').show(); 
		    },
		    mouseleave: function () {
		        var i = jQuery(this).attr('data-index');
				if (hotspotLabels != "aso_showLabels") jQuery(this).parent().find('.hotspot-label').hide();
		    }
		}, '.hotspot');

		// post click event
		jQuery(widget).on('click', '.post', function(e) {
			if (postViewer != "asoNoLightbox") {
				e.preventDefault();
				openViewer(jQuery(this));
			}
		});

		// close lightbox if clicked outside the lightbox
		jQuery(document).on('click', lightboxClass, function(e) {
			if (jQuery(e.target).hasClass('oculizm-lightbox')) jQuery(lightboxClass + ' .close').click();
		});

		// close lightbox
		jQuery(document).on('click', lightboxClass + ' .close', function(e) {
			e.preventDefault();
			jQuery(lightboxClass).fadeOut( 300, function() { jQuery(this).remove(); });

			// also stop any video playing
			if (jQuery(".video").length > 0) {
				// jQuery(".video").get(0).pause(); // not needed (tested on Mac/Chrome only)
			}
		});

		// video controls
		jQuery(document).on('click', '.main-video', function(e) {
			var vc = jQuery(this);
			var video = jQuery(this).children(".video").get(0);
		    if (video.paused) {
			    video.play();
			    vc.children(".video-icon").fadeOut();
			    video.onended = function(e) {
				    vc.children(".video-icon").fadeIn();
			    };
		    } else {
			    video.pause();
				// size video icon
		        var w = jQuery(lightboxClass + ' .video').width();
		        var h = jQuery(lightboxClass + ' .video').height();
				setTimeout(function() {
					jQuery(lightboxClass + ' .video-icon').css({'width' : w, 'height' : h});
				}, 50);
			    vc.children(".video-icon").fadeIn();
		    }
		});

		// lightbox prev button
		jQuery(document).on('click', lightboxPrevSelector, () => {

			if (postViewer == "lightbox_carousel") {
				if (!postsLoadedInCarousel) {
					const prevPost = jQuery(`[data-post-id=${lastOpenPost}]`).prev();
					if (prevPost.get(0)) openViewer(prevPost);
				}
				else {
					const prevPost = jQuery(`[data-post-id=${lastOpenPost}]`).parents().eq(1).prev().find('.post');
					if (prevPost.get(0)) openViewer(prevPost);
				}
			}
		});

		// lightbox next button
		jQuery(document).on('click', lightboxNextSelector, () => {
			
			if (postViewer == "lightbox_carousel") {
				if (!postsLoadedInCarousel) {
					const nextPost = jQuery(`[data-post-id=${lastOpenPost}]`).next();
					if (nextPost.get(0)) openViewer(nextPost);
				}
				else {
					const nextPost = jQuery(`[data-post-id=${lastOpenPost}]`).parents().eq(1).next().find('.post');
					if (nextPost.get(0)) openViewer(nextPost);
				}
			}
		});





		/* * * * * * * * * * * * * * * * * * * * *
		*										 *
		*										 *
		*				MAIN THREAD				 *
		*										 *
		*										 *
		* * * * * * * * * * * * * * * * * * * * */

		// determine currency symbol to display
		if (region && region != "") {
			// reduced set of currencies
			var regions_array=[
				["GB","&#163;"],
				["FR","&#8364;"],
				["DE","&#8364;"],
				["CH","&#8364;"],
				["AU","&#036;"],
				["AT","&#8364;"],
				["CA","&#036;"],
				["IT","&#8364;"],
				["US","&#036;"],
				["AR","&#036;"],
				["SE","kr"],
				["DK","kr"],
				["ES","&#8364;"]
			];
			var myf = function(a) { return a[0].toLowerCase() === region.toLowerCase(); };
			var r = regions_array.filter(myf)[0];
			if (r) currency = r[1];	
		}

		// hide credit
		if (hideOculizmCredit != "0") {
			footer.style.padding = '0';
			let credit = footer.querySelector('.oculizm-credit');
			if (credit) footer.removeChild(credit);
		}

		// check the URL params for a specific post ID
		var urlParams = new RegExp('[\?&]oculizm_post_id=([^&#]*)').exec(window.location.href);
	    if (urlParams) supplied_post_id = urlParams[1] || 0;
	    
		// check the URL params for a specific product ID
		var urlParams = new RegExp('[\?&]oculizm_product_id=([^&#]*)').exec(window.location.href);
	    if (urlParams) supplied_product_id = urlParams[1] || 0;
	    
		// set an interval to periodically check for the carousel and load videos if necessary
		const intervalId = setInterval(initCarouselVideos, 10); 

		// Set an interval to periodically check for Post
		const intervalPost = setInterval(checkForPost, 10); 

		loadPosts();

		return this; // allows chaining
	};
	
}( jQuery ));