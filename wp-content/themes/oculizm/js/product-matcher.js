(function ($) {
	
	jQuery(document).ready(function() {
	
		// define variables
		var deletedDataIndex;
		var product_x = -1;
		var product_y = -1;
		var products = [];
		var mouseClicked = false;
		var searchPhrase;
		var searchPhraseWords;
		var exceptions = [];
		var productNames = new Array();
		var timer;
		var maxShoppingMatches = 24;





        /************************************************
        *                                               *
        *                                               *
        *             	    FUNCTIONS                   *
        *                                               *
        *                                               *
        ************************************************/

		// show region tabs
		function showRegionTabs() {
			console.log("showRegionTabs()");

			// for each of this client's supported regions...
			for (var j=0; j<client_region_codes.length; j++) {
				
				var regionTabHeader = "";
	
				// get this region's flat file data
				var myf = function(a) {
					return a[0].toLowerCase() === client_region_codes[j].toLowerCase();
				}
				var r = regions_array.filter(myf)[0];
	
				// create the HTML for that region
				regionTabHeader += "<a href='' class='tab-header' name='" + client_region_codes[j] + "' title='" + r[4] + "'>" + r[2] + "</a>";

				// if a tab header doesn't exist for this region, add it
				if ($(".tab-header[name=" + client_region_codes[j] + "]").length == 0 ) $('.tabs[name=product-matcher] .tab-headers').append($(regionTabHeader));
			}

			// select the first tab
			$('.tabs[name=product-matcher] .tab-header:nth-of-type(1)').trigger('click');
		}
		
		// hide empty region tabs
		function removeEmptyRegionTabs () {
			for (var j=0; j<client_region_codes.length; j++) {
				var rowCount = $('tr[data-region-code="' + client_region_codes[j] + '"').length;
				if (rowCount == 0) {
					$('.tab-header[name=' + client_region_codes[j] + ']').remove();
					$('.tab-body[name=' + client_region_codes[j] + ']').remove();
				}
			}
		}
	
		// exit product search
		function exitProductSearch() {
	
			// hide product matcher message
			$('.product-matcher-message').hide();
	
			// empty fetched products
			$('.product-search-results').empty();

			// if the post form overlay isn't visible, we're on the Products page, so dim the relevant visible elements
			if (!$('.form-overlay[name=post-form-overlay]').is(':visible')) {
				$(".post-grid-container, .pagination").fadeTo( "fast" , 1.0, function() {});
			}
	
			// any other page
			else {
				// if it's an image
				if ($('.main-image-actual').is(':visible')) {
	
					// remove active hotspot
					$('.hotspot.active').remove();
	
					// hide product search input element
					$('.product-search').hide();
				}		
			}		
		}
	
		// get IDs of products whose title contains the search string
		function getProductIDsBySearchPhrase(searchText, products) {
	
			var filteredIDs = new Array();
			var maxResultsToDisplay = 12;
			var numMatches = 0;
			exceptions = []; // reset
	
			// get any minus words (exceptions)
			searchPhraseWords = searchText.split(' ');
			var i = searchPhraseWords.length;
			while (i--) {
	
				// minus sign
				if ((searchPhraseWords[i].charAt(0)) == "-") {
	
					// add minus words to the exceptions list
					if (searchPhraseWords[i].length > 3) {
						exceptions.push(searchPhraseWords[i].substring(1)); // add it to the exceptions array
					}
					searchPhraseWords.splice(i, 1); // remove it from this array
				}
	
				// ampersand
				else if ((searchPhraseWords[i].charAt(0)) == "&") {
					searchPhraseWords.splice(i, 1); // remove it from this array
				}
			}
	
			// search for AND matches e.g. so that searching for "red dress" matches "red and white cocktail dress"
			for (var i=0; i < products.length; i++) {
	
				// check if the main title contains the search words
				var main_title = products[i]['TITLE'].toLowerCase();
				var all_words_matched = searchPhraseWords.every(function(e) {
					return this.indexOf(e) !== -1;
				}, main_title);
							
				// check if any regional titles contain the search words
				var all_region_codes = ["gb", "fr", "de", "ch", "au", "at", "ca", "it", "us", "ar", "se", "dk", "es"];
				for (var region_index=0; region_index < all_region_codes.length; region_index++) {
					var region_title_attribute = all_region_codes[region_index] + "_title";
					if(products[i][region_title_attribute] != null && products[i][region_title_attribute] != ""){
						var all_words_matched_per_region = searchPhraseWords.every(function(e) {
							return this.indexOf(e) !== -1;
						}, products[i][region_title_attribute].toLowerCase());
						
						all_words_matched = all_words_matched || all_words_matched_per_region;
					}
				}
				
				// check for a match on product ID
				var productId = products[i]['productId'].toLowerCase();
					var idMatch = searchPhraseWords.every(function(e) {
						return this.indexOf(e) !== -1;
					}, productId);
					
					if ((all_words_matched || idMatch) && numMatches < maxResultsToDisplay) {

						// check for any exceptions
						var exceptionFound = false;
						for (var j=0; j<exceptions.length; j++) {
							if (main_title.includes(exceptions[j])) exceptionFound = true;
						}

						// only add if the title doesn't contain any minus words (exceptions)
						if (!exceptionFound) {
						filteredIDs.push(products[i]['productId']);
						numMatches++;
					}
				}
			}
			return filteredIDs;
		}

		// set up products
		jQuery._initPostProducts = function(_products) {

			var container 	= $('.hotspot-spots');
			var $hotSpotImg	= container.siblings("img.main-image-actual");
	
			// if it's an image, set up the container
			if ($('.main-image-actual').is(':visible')) {
				// set up the hotspots container
				var w = $('.main-image-actual').width();
				var h = $('.main-image-actual').height();
				var x = $('.main-image-actual').offset().left - $('.main-image-actual').parent().offset().left; // no idea why this works
				container.css({
					'width': w + 'px',
					'height': h + 'px',
					'left': x
				});
				// hide the product search input element
				$('.product-search').hide();
			}
	
			// remove all previously set hotspots to add new ones
			container.find(".hotspot, .hotspot-label").remove();
			
			if (_products) {
				products = _products;
			}
			
			// if there are products to load
			if (products) {		
				// console.log(products)
				
				showRegionTabs();

				var totalCountProducts = 0;
	
				// for each region...
				for (var j=0; j<client_region_codes.length; j++) {

					var region_code = client_region_codes[j].toLowerCase();
					var countProducts = 0;

					// get this region's flat file data
					var myf = function(a) {
						return a[0].toLowerCase() === client_region_codes[j].toLowerCase();
					}
	
					var r = regions_array.filter(myf)[0];
					var regiontab = document.querySelector('.tabs[name=product-matcher] .tab-body[data-region="' + client_region_codes[j] + '"]');
					if (!regiontab) {
						// build the HTML table header for this region
						var productHtml = "<div name="+ client_region_codes[j]  + " data-region="+ client_region_codes[j]  + " class='tab-body'>";
						productHtml += "<table name='tagged-product-" + client_region_codes[j] +  "'><tr class='headers'>";
						productHtml += "<th class='product-id'>ID</th><th class='product-sku'>SKU</th><th class='product-image'>Image</th><th class='product-name'>Title</td><th class='product-price'>Price</th>";
						productHtml += "<th class='product-actions'></th></tr></table></div>";
						$('.tabs[name=product-matcher] .tab-bodies').append(productHtml);
					}
	
					// for each product...
					for (var i=0; i<products.length; i++) {
						var px = products[i]['x'];
						var py = products[i]['y'];
						
						if(!px || !py){
							if(product_x != -1 && product_y != -1){
								px = product_x;
								py = product_y;
							}
						}
						
						var region_title = region_code + '_title';
						var region_price = region_code + '_price';
						var region_link = region_code + '_link';
						if (products[i][region_title] == "") continue;
						
						countProducts++;
						totalCountProducts++;
						
						var product_id = "";
						if (products[i]['product_id'] !== undefined) product_id = products[i]['product_id'];
						else product_id = products[i]['product_id'];
	
						var product_sku = "";
						if (products[i]['sku'] !== undefined) product_sku = products[i]['sku'];
						else product_sku = products[i]['sku'];
						
						var product_name = "";
						if (products[i]['product_id'] !== undefined ) product_name = products[i]['product_name'];
						else product_name = products[i]['title'];
						
						var product_image_url = "";
						if (products[i]['product_image'] !== undefined) product_image_url = products[i]['product_image']['url'];
						else product_image_url = products[i]['image_link'];

						// add it to the list of matched products
						var productHtml = '<tr class="matched-product" data-region-code="' + client_region_codes[j] + '" data-index="' + i + '" data-product-id="' + product_id + '" data-product-sku="' + product_sku + '" data-product-url="' + products[i][region_link] + '" data-x="' + px + '"data-y="' + py + '">' +
										'	<td class="product-id">' + product_id + '</td>' +
										'	<td class="product-sku">' + product_sku + '</td>' +
										'	<td class="product-image">' +
										'		<img src="' + product_image_url + '">' +
										'	</td>' +
										'	<td class="product-name">' + products[i][region_title] + '</td>' +
										'	<td class="product-price"><span class="currency">' + r[3] + '</span><span class="price-value">' + products[i][region_price] + '</span></td>' +
										'	<td class="product-actions"><a data-action="delete-product" href="#"></a></td>' +
										'</tr>';
						$('table[name=tagged-product-' + client_region_codes[j] + ']').append(productHtml);

						// now create the hotspots, if there are any
						if (px && py) {
							var product_id_no_spaces = product_id.replace(/[^a-z0-9]/gi,'');
						
							console.log('yes detected');

							//dont add hotspot if already added for this product
							if ($(".hotspot[data-hotspot-id=hotspot_" + product_id_no_spaces + "]").length > 0) {
								continue;
							}
							
							//create the hotspot HTML 
							var hotspot = $('<div class="hotspot" data-hotspot-id="hotspot_' + product_id_no_spaces +  '" data-x="' + px + '" data-y="' + py + '" data-index="' + i + '"></div>');
							container.append(hotspot);
	
							// turn percentages into relative coordinates on the hotspot map
							var x = Math.round((container.width()*px)/100);
							var y = Math.round((container.height()*py)/100);
	
							if(x > $hotSpotImg.width()) x = $hotSpotImg.width();
							if(y > $hotSpotImg.height()) y = $hotSpotImg.height();
						
							// place the hotspot
							hotspot.css({'left': x, 'top': y+1});
	
							// make it draggable
							hotspot.drags();
	
							// create the label 
							var label = $('<div class="hotspot-label" data-index="' + i + '">' +
										'	<div class="hotspot-label-text">' + product_name + '</div>' +
										'</div>');
	
							// determine label coordinates
							x = hotspot.offset().left - container.offset().left;
							y = hotspot.offset().top - container.offset().top;
	
							// show it
							container.append(label);
							label.css({
								'left' : x-55,
								'top' : y+20
							});
						}
					}
					if (countProducts == 0) {
						$('.tab-header[name=' +  client_region_codes[j] + ']').hide();
					}
				}
				if (totalCountProducts != 0){
					removeEmptyRegionTabs();
					$('.tabs.simple-tabs .tab-header:nth-of-type(1)').trigger('click');
				}
			}
		};

		// reset product hotspots
		jQuery._resetHotspots = function() {
			setTimeout(function(){ 
				const $container 		= $('.hotspot-spots');
				const $hotSpotImg		= $container.siblings("img.main-image-actual");
				const $hotspots 		= $container.find(".hotspot");
				
				// for each hotspot...
				$.each($hotspots, (i, e) => {
					const $e = $(e);
					const dataX = +$e.data("x");
					const dataY = +$e.data("y");
					let x, y, lx, ly;
			
					// update HTML element attributes
					var p = $('.matched-product[data-index=' + $e.attr('data-index') + ']');
					p.attr('data-x', dataX);
					p.attr('data-y', dataY);
	
					// position the hotspot
					x = Math.round(($container.width() * dataX) / 100);
					y = Math.round(($container.height() * dataY) / 100);
					if(x > $hotSpotImg.width()) x = $hotSpotImg.width();
					if(y > $hotSpotImg.height()) y = $hotSpotImg.height();
					$e.css({'left': x-8, 'top': y-8});
			
					// determine label coordinates
					lx = $e.offset().left - $container.offset().left;
					ly = $e.offset().top - $container.offset().top;
			
					// position it
					$($e.siblings(".hotspot-label").get(i)).css({
						'left' : lx-55,
						'top' : ly+20
					});
				})
				
				const $img = jQuery('.main-image-actual');
				var w = $img.width();
				var h = $img.height();
				var imgOffset = $img.offset();
				if (imgOffset != undefined) {
					
					var x = $img.offset().left - $img.parent().offset().left; // no idea why this works
	
					// set up the hotspot container
					$container.css({
						'width': w + 'px',
						'height': h + 'px',
						'left': x
					});
				}
			}, 1000);
		}
	
		// hotspot dragging function
		$.fn.drags = function(opt) {
	
				opt = $.extend({handle : "", cursor : "move"}, opt);
				if (opt.handle === "") var $el = this;
				else var $el = this.find(opt.handle);

				return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
					if (e.which == 3) return; // don't care about right mouse clicks
					$('.hotspot-label[data-index=' + $(this).attr('data-index') + ']').hide(); // hide this hotspot's label while dragging
					if (opt.handle === "") var $drag = $(this).addClass('draggable');
					else var $drag = $(this).addClass('active-handle').parent().addClass('draggable');

					var z_idx = $drag.css('z-index'),
						drg_h = $drag.outerHeight(),
						drg_w = $drag.outerWidth(),
						pos_y = $drag.offset().top + drg_h - e.pageY,
						pos_x = $drag.offset().left + drg_w - e.pageX;
					$drag.css('z-index', 1000).parents().on("mousemove", function(e) {
						$('.draggable').offset({
							top : e.pageY + pos_y - drg_h,
							left : e.pageX + pos_x - drg_w
						}).on("mouseup", function() {
							$(this).removeClass('draggable').css('z-index', z_idx);
						});
					});
					e.preventDefault(); // disable selection
					mouseClicked = true;
				}).on("mouseup", function() {
					if(opt.handle === "") $(this).removeClass('draggable');
					else $(this).removeClass('active-handle').parent().removeClass('draggable');
	
				if (mouseClicked == true) {
					var container = $('.hotspot-spots');
					var h = $(this);
	
					// get coords
					var x = h.offset().left - container.offset().left;
					var y = h.offset().top - container.offset().top;
		
					// get percentages
					var px = Math.round(100*x/container.width());
					var py = Math.round(100*y/container.height());
	
					// update hotspot attributes
					$(this).attr('data-x', px);
					$(this).attr('data-y', py);
	
					// update product attributes
					var p = $('.matched-product[data-index=' + $(this).attr('data-index') + ']');
					p.attr('data-x', px);
					p.attr('data-y', py);
	
					// reposition label 
						var label = $('.hotspot-label[data-index=' + $(this).attr('data-index') + ']');
	
					// get coords
					var x = h.offset().left - container.offset().left;
					var y = h.offset().top - container.offset().top;
	
					label.css({
						'left' : x-55,
						'top' : y+20
					});
	
					label.show();
				}
			});
		};
	



        /************************************************
        *                                               *
        *                                               *
        *             	    EVENTS                      *
        *                                               *
        *                                               *
        ************************************************/

		// window resize events
		$(window).resize(function() {
			resetHotspots();
		});
		
		// remove tagged products object when publishing posts
		$('body').on('click', 'a[data-action=draft], a[data-action=publish]', function(e) {
			products = [];	
			product_x = -1;
			product_y = -1;
		});
	
		// remove tagged products when closing the modal
		$('body').on('click', '.form-overlay[name=post-form-overlay] .overlay-content > .close', function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			products = [];	
			product_x = -1;
			product_y = -1;
			$('.tabs[name=product-matcher] .tab-headers, .tabs[name=product-matcher] .tab-bodies').empty();
			$('.hotspot-spots').empty();
			$('.form-overlay[name=product-details] .content-block-description , .form-overlay[name=post-form-overlay] .content-block-description').show();
		});

		// form overlay background click
		$('body').on('click', '.form-overlay[name=post-form-overlay] .overlay-bg', function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			products = [];	
			product_x = -1;
			product_y = -1;
			$('.tabs[name=product-matcher] .tab-headers, .tabs[name=product-matcher] .tab-bodies').empty();
			$('.hotspot-spots').empty();
			$('.form-overlay[name=product-details] .content-block-description , .form-overlay[name=post-form-overlay] .content-block-description').show();
		});
	
		// remove a product
		$('body').on('click', 'a[data-action=delete-product]', function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			var p = $(this).closest('.matched-product');
			var product_id = p.attr('data-product-id');
					
			$('.matched-product').filter(function(){
				return $(this).data('product-id') == product_id
			}).remove();
			
			removeEmptyRegionTabs();

			// remove the hotspot and the product
			var i = p.attr('data-index');
	
			//setting the deleted hotspost dataindex
			deletedDataIndex = i;
	
			$('.hotspot[data-index=' + i + ']').remove();
			//p.remove();
	
			// remove its label
			$('.hotspot-label[data-index=' + i + ']').remove();
	
			if($('.product-search-results').is(':empty')  ) {
				$('.content-block-description').show();
			}
		});
	
		// click on a matched product item
		$('body').on('click', '.matched-product-item', function(e) {
	
			// if the post form overlay is visible...
			// if ($('.form-overlay[name=post-form-overlay]').is(':visible')) {
			if ($('.media-preview').is(':visible')) {
				e.preventDefault();
	
				// reset UI
				$('.product-search-results').empty();
				$('.product-search').val("");
				$('.tabs[name=product-matcher] .tab-headers').show();
	
				// get product ID
				var productId = $(this).attr('data-product-id');
				var productTitle = $(this).find('.product-title').text();
				
				// check if the product is already tagged
				var product_already_tagged = 0;
				$('.matched-product').each(function() {
					var product_id = $(this).attr('data-product-id');
	
					if (product_id == productId) {
						showPopup("This product has already been tagged.", new Array({'action': 'close-popup', 'text': 'Ok'}));	
						product_already_tagged = 1;
					}
				});
				if (product_already_tagged == 1) return;
				
				// default is empty string for a video
				let x = '';
				let y = '';

				// get active hotspot attributes if they're available
				if ($('.hotspot.active').length > 0) {
					x = $('.hotspot.active').attr('data-x');
					y = $('.hotspot.active').attr('data-y');
				}
				var i = $('.hotspot.active').attr('data-index');
	
				// get the full details of this product
				var index = productSearchResults.findIndex(function(prod) {
					// both of these work
						// return prod.sku == productId; // match by SKU
						// return prod.product_id == productId; // match by ID
						return prod.title == productTitle; // match by title
				});
	
				// add this product to list of products to attach
				products.push(productSearchResults[index]);
	
				product_x = x;
				product_y = y;
				
				// for each region supported by this client...
				for (var j=0; j<client_region_codes.length; j++) {
					var region_code = client_region_codes[j].toLowerCase();
	
					// convert region codes to lower case
					var toLower = function(a) {
						return a[0].toLowerCase() === client_region_codes[j].toLowerCase();
					}
					var r = regions_array.filter(toLower)[0];
					// var regiontab = document.getElementById(client_region_codes[j]);
					var regiontab = document.querySelector('.tabs[name=product-matcher] [data-region="' + client_region_codes[j] + '"]');
					if(!regiontab){
							// build the HTML for the product HTML
							var productHtml = "<div name="+ client_region_codes[j]  + " data-region="+ client_region_codes[j]  + " class='tab-body'>";
							productHtml += "<table name='tagged-product-" + client_region_codes[j] +  "'><tr class='headers'>";
							productHtml += "<th class='product-id'>ID</th><th class='product-sku'>SKU</th><th class='product-image'>Image</th><th class='product-name'>Title</td><th class='product-price'>Price</th>";
							productHtml += "<th class='product-actions'></th></tr></table></div>";
							$('.tabs[name=product-matcher] .tab-bodies').append(productHtml);
					}
					
					// create keys
					var region_title = region_code + '_title';
					var region_price = region_code + '_price';
					var region_link = region_code + '_link';
					
					if (productSearchResults[index][region_title] == "" || productSearchResults[index][region_title] == null) continue;
	
					// add it to the list of matched products
					var productHtml = '<tr class="matched-product" data-region-code="' + client_region_codes[j] + '" data-index="' + i + '" data-product-id="' + productSearchResults[index]['product_id'] + '" data-product-sku="' + productSearchResults[index]['sku'] + '" data-product-url="' + productSearchResults[index][region_link] + '" data-x="' + x + '"data-y="' + y + '">' +                                      
									'	<td class="product-id">' + productSearchResults[index]['product_id'] + '</td>' +
									'	<td class="product-sku">' + productSearchResults[index]['sku'] + '</td>' +
									'	<td class="product-image">' +
									'		<img src="' + productSearchResults[index]['image_link'] + '">' +
									'	</td>' +
									'	<td class="product-name">' + productSearchResults[index][region_title] + '</td>' +
									'	<td class="product-price"><span class="currency">'  + r[3] + '</span><span class="price-value">' + productSearchResults[index][region_price] + '</span></td>' +
									'	<td class="product-actions"><a data-action="delete-product" href="#"></a></td>' +
									'</tr>';
					$('table[name=tagged-product-' + client_region_codes[j] + ']').append(productHtml);
				}

				showRegionTabs();
	
				$(".content-block[name=products] .content-block-description").hide();
	
				// remove active class from hotspot
				$('.hotspot').removeClass('active');
	
				removeEmptyRegionTabs();

				// show all region headers
				$('.tab-header').show();
	
				// auto select the first region tabs
				$('.tabs.simple-tabs .tab-header:nth-of-type(1)').trigger('click');

				// create the hotspot label 
				var label = $('<div class="hotspot-label hidden" data-index="' + i + '">' +
							'	<div class="hotspot-label-text">' +  productSearchResults[index]['title'] + '</div>' +
							'</div>');

				var container = $('.hotspot-spots');

				// turn percentages into relative coordinates on the hotspot map
				x = Math.round((container.width()*x)/100);
				y = Math.round((container.height()*y)/100);
	
				// add it to the DOM
				container.append(label);
				label.css({
					'left' : x-60,
					'top' : y+23
				});

				// show the label
				label.fadeIn();
	
				// if it's an image hide the product search section
				if ($('.main-image-actual').is(':visible')) $('.product-search, .product-matcher-message').hide();
	
				// scroll up a bit
				if ($('.form-overlay').is(":visible")) {
					$('.form-overlay').animate({
						scrollTop: 150
					}, 250);					
				} else {
					$('html, body').animate({
						scrollTop: 150
					}, 250);
				}
			}
		});
	
		// stop a hotspot click triggering the Add New Hotspot event
		$('body').on('click', '.hotspot', function(e) {
			e.stopPropagation();
			var hotspot = $(this);
			// make it draggable on click
			hotspot.drags();
		});
	
		// add a hotspot to an image
		$('body').on('click', '.hotspot-spots', function(e) {
			e.stopPropagation();
			e.preventDefault();
	
			// remove any other hotspots that were in the middle of being added
			$('.hotspot.active').remove();
	
			var container = $(this);
	
			// get coordinates
			var x = e.pageX - container.offset().left;
			var y = e.pageY - container.offset().top;
			
				//checking if we have any prev deleted data index if yes set the new hotspot data index to the deleted index
				if(deletedDataIndex){
					var hotspotId = deletedDataIndex;
				}
				else{
					var hotspotId = $('.hotspot').length;
				}
	
			// get percentages
			var px = Math.round(100*x/container.width());
			var py = Math.round(100*y/container.height());
	
			// create hotspot
			var hotspot = $('<div class="hotspot active" data-x="' + px + '" data-y="' + py + '" data-index="' + hotspotId + '"></div>');
			$('.hotspot-spots').append(hotspot);
			hotspot.css({'left': x-8, 'top': y-8});
	
			// // make it draggable
			hotspot.drags();
	
			// show the product matcher
			$(".content-block[name=products] .content-block-body").show();
			$(".product-search").show();
	
			// scroll down a bit
			if ($('.form-overlay').is(":visible")) {
				$('.form-overlay').animate({
					scrollTop: 400
				}, 250);					
			} else {
				$('html, body').animate({
					scrollTop: 400
				}, 250);
			}

			// focus on the product search input field
			$(".product-search").focus();
		});
	
		// product search key events
		$(".product-search").on({
	
			// every time a key is pressed...
			keyup : function(e) {

				// Escape key
				if (e.which == 27) return;
	
				searchPhrase = this.value;
				if (searchPhrase.length >= 3) {
	
					if (timer) clearTimeout(timer);
					timer = setTimeout(function() {
	
						$('.content-block-header .loader').show();
						$('.product-search-results').empty();
	
						// find matches (returns product group IDs)
						var matches = getProductIDsBySearchPhrase(searchPhrase.toLowerCase(), productNames);
	
						// remove duplicates (we don't need all of the product group IDs)
						var uniqueMatches = new Array();
						$.each(matches, function(i, el){
										if($.inArray(el, uniqueMatches) === -1) uniqueMatches.push(el);
						});
	
						if (uniqueMatches.length == 0) {
							$('.product-matcher-message').text('No products found.');
							$('.product-matcher-message').show();
							$('.content-block-header .loader').hide();
							return;
						}
						
						// get the full details of the matched products
						$.ajax({
							url: ajaxUrl,
							data:{
								'action':'get_products_by_id',
								'product_ids': uniqueMatches
							},
							dataType: 'JSON',
							success:function(data) {
								console.log(data);
								
								productSearchResults = data;

								var productsMatching = [];
	
								// search for AND matches e.g. so that searching for "red dress" matches "red and white cocktail dress"
								for (var i=0; i < data.length; i++) {
						
									// check if the main title contains the search words
									var main_title = data[i]['title'].toLowerCase();
									var all_words_matched = searchPhraseWords.every(function(e) {
										return this.indexOf(e) !== -1;
									}, main_title);

									var productId = data[i]['product_id'].toLowerCase();

									var idMatch = searchPhraseWords.every(function(e) {
										return this.indexOf(e) !== -1;
									}, productId);

									if (idMatch) productsMatching.push(data[i]);
												
									var regionalTitleMatch = false;
	
									// for each region...
									var all_region_codes = ["gb", "fr", "de", "ch", "au", "at", "ca", "it", "us", "ar", "se", "dk", "es"];
									for (var region_index = 0; region_index < all_region_codes.length; region_index++) {
	
										// if this product has a title for this region...
										var region_title_attribute = all_region_codes[region_index] + "_title";
										if (data[i][region_title_attribute] != undefined) {
	
	
											var regional_title = data[i][region_title_attribute].toLowerCase();
											if (data[i][region_title_attribute] != null && data[i][region_title_attribute] != "") {
												var all_words_matched_per_region = searchPhraseWords.every(function(e) {
													return this.indexOf(e) !== -1;
												}, regional_title);
												regionalTitleMatch = all_words_matched_per_region;
												if (regionalTitleMatch) productsMatching.push(data[i]);
											}
										}
									}
								}

								data = uniqueArrayByKey(productsMatching, 'title');
	
								var productsAfterRemovingMinusWords = [];
	
								// ONLY IF there are exceptions...
								if (exceptions.length > 0) {
	
									// for each product...
									for (var i=0; i<data.length; i++) {
	
										var exceptionFound = false;

										// for each minus word...
										for (var j=0; j<exceptions.length; j++) {
											if (!data[i].title.toLowerCase().includes(exceptions[j].toLowerCase())) {
												productsAfterRemovingMinusWords.push(data[i]);
											}
										}
									}
									// replace the data array with the one after removing exceptions
									data = productsAfterRemovingMinusWords;
								}
	
								// for each product...
								for (var i=0; i<data.length; i++) {
	
									// determine stock availability
									outOfStockHtml = "";
									if (data[i].availability == "2") outOfStockHtml = "<div>Preorder</div>";
									else if (data[i].availability != "1") outOfStockHtml = "<div class='red'>Out of stock</div>";
									
									// legacy - DELETE SOON
									outOfStockHtml = "";
									if (data[i].availability == "out of stock") outOfStockHtml = "<div>Out of stock</div>";
	
									// build matching posts label
									var matchingPosts = '';
									if (data[i]['num_tagged_posts'] != "0" ) {
										var matchingPosts ='   <div class="product-attributes-overlay">' +
										'   	<div class="label-icon"><span>' + data[i]['num_tagged_posts']+ '</span></div>' +
										'	</div>';
									}
	
									var productOption = '<div data-href="' + data[i].link + '" class="matched-product-item" data-price="' + data[i].price + '" data-product-id="' + data[i].product_id + '" data-product-sku="' + data[i].sku + '">' +
									'	<img src="' + data[i].image_link + '">' +
									matchingPosts +
									'	<div class="product-title">' + data[i].title + outOfStockHtml + '</div>' +
									'</div>';
									
									$('.product-search-results').append(productOption);
	
									$('.product-matcher-message').text('');
									$('.product-matcher-message').hide();
									
									if (i>=maxShoppingMatches-1) break;
								}
							},
							error: function(errorThrown){
								console.log(errorThrown);
								
								$('.product-matcher-message').text('No products found.');
								$('.product-matcher-message').show();
							},
							complete: function() {
								$('.content-block-header .loader').hide();
							}
						});
					}, 1000);
				}
	
				// else, if less than 3 keys were typed...
				else {
					$('.product-search-results').empty();
				}
			}
		});
	
		// fade out listed products if clicking on search bar on Products page
		$('body').on('click', '.page-header .product-search', function(e) {
			$(".post-grid-container, .pagination").fadeTo( "fast" , 0.5, function() {});
		});
	
		// cancel adding hotspot on clicking anywhere except the product matcher or the product overlay
		$(document).click(function (e) {
			if (!$(e.target).parents('.product-search-results ,.product-matcher, .form-overlay[name=product-details]').length) exitProductSearch();
		});
	




        /************************************************
        *                                               *
        *                                               *
        *             	    MAIN THREAD                 *
        *                                               *
        *                                               *
        ************************************************/

		// get full product list
		$.ajax({
			url: ajaxUrl,
			async: false,
			// cache: false,
			data:{
				'action':'get_product_names'
			},
			dataType: 'JSON',
			success:function(data) {
				// console.log(data);

				productNames = data;
				 //global variable disappears as soon as the user leaves the page
				window['allClientProducts'] = productNames;
	
				if (data) {
					if (data.length == 0) {
						$(".content-block[name=products] .content-block-description").text(
							'No products found. Please ensure that a product feed has been specified.'
						);
						$('.hotspot-spots').hide();
					}
				}
			},
			error: function(errorThrown){
				console.log(errorThrown);
			}
		});
	
		// get client regions
		$.ajax({
			url: ajaxUrl,
			data:{
				'action':'get_product_feeds'
			},
			dataType: 'JSON',
			success:function(data) {
				// console.log(data);
				
				client_region_codes = []
				for (var j=0; j<data.length; j++) {
					client_region_codes.push(data[j]["region"]);
				}
			},
			error: function(errorThrown){
				console.log(errorThrown);
			}
		});
		
	});
	
	}(jQuery));
	
	function initPostProducts(products) {
		return jQuery._initPostProducts(products);
	}
	function resetHotspots(products) {
		return jQuery._resetHotspots(products);
	}

	
	