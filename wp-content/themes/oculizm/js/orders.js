(function ($) {

	jQuery(document).ready(function () {

		var all_orders = new Array();
		var uaParser = new UAParser();
		var order;
		var orderId;
		var activeOrderRow;

		// fetch order data
		jQuery._fetchOrderStats = function(deepInteractionOnly) {

			const demoModeValue = sessionStorage.getItem('demoMode');

			// fetch client stats
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_order_stats'
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					if (data.error) {
						showPopup(data.error, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
					}


					if (data.all_orders.length == 0) {
						// Check if the warning block already exists
						if ($('.content-block[name="warning"]').length === 0) {
							// Create the warning block HTML
							var warningBlock = "<div class='content-block' name='warning'>" +
												"   <h2 class='h2-icon'>Tracking Tag Not Detected</h2>" +
												"   <div class='content-block-description'>To access full analytics, please ensure the tracking tag has been installed on your website.</div>" +
												"</div>";
							// Prepend the warning block to the main container
							$('.main').prepend($(warningBlock));
						}
					}
					

					// define variables
					all_orders = data.all_orders;

					// ORDERS
					if (!$.isEmptyObject(all_orders)) {
						// Filter orders based on deepInteractionOnly flag
						var filteredOrders = deepInteractionOnly
							? all_orders.filter(function (order) {
								return order.orderWithInteractions; // Only deep interaction orders
							})
							: all_orders; // All orders

						// create order table HTML
						if (filteredOrders.length > 0) {
							// Loop through filteredOrders instead of all_orders
							for (var i = 0; i < filteredOrders.length; i++) {
								var date = filteredOrders[i]['createdDate'];
								var time = filteredOrders[i]['createdTime'];

								// getting the clicked order id
								var objectOrderId = filteredOrders[i]['order_id'];

								// getting the multiordersessionid value
								var multipleOrdersSessionid = filteredOrders[i]['multipleOrdersSessionid'];

								// getting the orderWithInteractions value
								var orderWithInteractions = filteredOrders[i]['orderWithInteractions'];

								// setting default value for the after order clicked flag
								var afterOrderClickedEvent = false;

								// for each order item...
								for (var j = 0; j < filteredOrders[i]['order_items'].length; j++) {
									// get the currency symbol from the currency code
									var currency_code = filteredOrders[i]['currency'];
									var extractRegionData = function (item) {
										return item[4] === currency_code;
									};
									var r = regions_array.filter(extractRegionData)[0];
								}

								// for each event that led to this order...
								var eventsHtml = "";

								if (filteredOrders[i]['event_types'] && typeof filteredOrders[i]['event_types'] === 'object') {
									Object.keys(filteredOrders[i]['event_types']).forEach(function (key) {
									var eventType = filteredOrders[i]['event_types'][key]['type'];
									var post_id;
									var eventIcon = "";
									var product_id;

									// determine row content
									if (eventType == "gridView") eventIcon = "<div class='mini-icon' name='gallery-viewed'></div>";
									if (eventType == "loadMore") eventIcon = "<div class='mini-icon' name='load-more'></div>";
									if (eventType == "shop") product_id = filteredOrders[i]['event_types'][key]['sku'];
									if (eventType == "order") eventIcon = "<div class='mini-icon' name='order'></div>";
									if (
										(eventType == "ppgNav") ||
										(eventType == "hwNav") ||
										(eventType == "ppgLightboxNav") ||
										(eventType == "sgLightboxNav") ||
										(eventType == "hwLightboxNav")
									)
										eventIcon = "<div class='mini-icon' name='widget-scrolled'></div>";
									if (
										(eventType == "ppgLightboxOpen") ||
										(eventType == "expand") ||
										(eventType == "hwLightboxOpen")
									)
										post_id = filteredOrders[i]['event_types'][key]['post_id'];

									// determine row style
									var rowClass = "";
									var currentOrderID = filteredOrders[i]['event_types'][key]['order_id'];
									if (objectOrderId == currentOrderID) {
										rowClass = "main-event";
										afterOrderClickedEvent = true;
									}
									if (afterOrderClickedEvent && objectOrderId != currentOrderID) rowClass = "opacity-50";

									// use human readable event names
									if (eventType == 'gridView') eventType = 'Gallery Viewed';
									if (eventType == 'expand') eventType = 'Lightbox Viewed';
									if (eventType == 'shop') eventType = 'Product Link Clicked';
									if (eventType == 'order') eventType = 'Order Placed ' + currentOrderID;
									if (eventType == 'ppgLightboxOpen') eventType = 'Lightbox Viewed (PDP)';
									if (eventType == 'hwLightboxOpen') eventType = 'Lightbox Viewed (Homepage)';
									if (eventType == 'ppgNav') eventType = 'Widget Scrolled (PDP)';
									if (eventType == 'loadMore') eventType = 'Gallery Loaded More';
									if (eventType == 'hwNav') eventType = 'Widget Scrolled (Homepage)';
									if (eventType == 'ppgLightboxNav') eventType = 'Lightbox Scrolled (PDP)';
									if (eventType == 'sgLightboxNav') eventType = 'Lightbox Scrolled';
									if (eventType == 'hwLightboxNav') eventType = 'Lightbox Scrolled (Homepage)';

									// create the HTML for this event row
									var timeStr =
										filteredOrders[i]['event_types'][key]['createdDate'] +
										' ' +
										filteredOrders[i]['event_types'][key]['createdTime'];
									eventsHtml +=
										"<tr class='" +
										rowClass +
										"' data-event-type='" +
										eventType +
										"' data-post-id='" +
										post_id +
										"' data-product-id='" +
										product_id +
										"'>" +
										"	<td>" +
										timeStr +
										"</td>" +
										"	<td name='event-details'>" +
										eventIcon +
										"</td>" +
										"	<td>" +
										eventType +
										'</td>' +
										'</tr>';
									});
								}

								filteredOrders[i]['user_journey'] = eventsHtml;

								// get order total
								var orderTotalValue = filteredOrders[i]['total_order_amount'];


								// New order Total Value if demo mode enabled
								if (demoModeValue === 'true') {

									// Remove commas from order total value
									orderTotalValue = parseFloat(orderTotalValue.replace(/,/g, ''));
									
									orderTotalValue = (orderTotalValue * 120) / 100;
									orderTotalValue = orderTotalValue.toFixed(2);
									
									// Format the numeric value with commas using Intl.NumberFormat
									var formatter = new Intl.NumberFormat('en-US', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									});

									orderTotalValue = formatter.format(orderTotalValue);
								}

								// multiple order session
								var multipleOrdersIcon = '';
								if (multipleOrdersSessionid) multipleOrdersIcon = '<div class="mini-icon" name="multiple-orders" title="Multiple orders were placed in this session"></div>';

								// order has no prev expand event
								var orderWithInteractionsIcon = '';
								if (orderWithInteractions) orderWithInteractionsIcon = '<div title="This order featured deeper interaction" name="deep-interaction" class="mini-icon"></div>';

								// build order row
								var row =
									"<tr " +
									" data-order-id='" +
									filteredOrders[i]['order_id'] +
									"'" +
									" data-num-items='" +
									filteredOrders[i]['order_items'].length +
									"'>" +
									"	<td>" +
									date +
									' ' +
									time +
									'</td>' +
									"	<td>" +
									filteredOrders[i]['order_id'] +
									'</td>' +
									"	<td>" +
									filteredOrders[i]['order_items'].length +
									'</td>' +
									"	<td>" +
									r[3] +
									orderTotalValue +
									'</td>' +
									"	<td>" +
									multipleOrdersIcon +
									orderWithInteractionsIcon +
									'</td>' +
									'</tr>';

								$('table[name=orders] tbody').append(row);
								$('.content-block-body table[name=orders]').show();
								$('.content-block[name=orders-list] .loader').hide();
							}
						}
					} else {
						// $('.content-block[name=orders-list] .loader').hide();
						// $('.content-block[name=orders-list] .content-block-body').append('<div class="no-data">Nothing to show</div>');

						sampleData("table[name=orders] tbody" , "orders-list");
						$('.content-block[name=orders-list]').removeClass('opacity-50');
						$('.content-block-body table[name=orders]').show();
						$('.content-block[name=orders-list] .loader').hide();
					}
				},
				error: function (errorThrown) {
					console.log(errorThrown);
					showPopup(errorThrown.statusText, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
				},
				complete: function () {
					// Complete callback
				}
			});
		}

		// populate the order details lightbox
		function populateOrderDetailsLightbox(order) {

			const demoModeValue = sessionStorage.getItem('demoMode');

			// set the active order row
			activeOrderRow = $('table[name=orders] tr[data-order-id=' + orderId + ']');

			// get this order's currency
            var currencyCode = order['currency'];
			
			// get the currency symbol from the currency code
			var extractRegionData = function (item) {
				return item[4] === currencyCode;
			}
			var r = regions_array.filter(extractRegionData)[0];
			var currencySymbol = r[3];

			// get this order's order items
            var orderItems = order['order_items'];

            // initialise the basket HTML
			var basketHtml = "";

			// initialise the order total
			var orderTotal = 0;

			// set the overlay title
			$('.content-block[name=order-items] h2').text('Order ' + order['order_id']);

			// for each order item...
			for (var i=0; i<orderItems.length; i++) {

				// get the basket item price, handling the demo mode option
				var productPrice;
				if (demoModeValue === "true") {
					productPrice = (orderItems[i]['price'] * 120)/100;
					productPrice =	productPrice.toFixed(2);
				}
				else {
					productPrice = commaInt(parseFloat(orderItems[i]['price']).toFixed(2));
				}	

				// get other basket item data
				var productImg = orderItems[i]['product_img_url'];
				if (!productImg) productImg = site_url + "/wp-content/themes/oculizm/img/no-image.png";
				var productName = orderItems[i]['name'];
				var productSku = orderItems[i]['sku'];
				var numOrderItems = orderItems[i]['quantity'];

				// build the basket item HTML
				basketHtml += 	"<tr data-product-sku='" + productSku + "'>" +
								// "	<td><a href='" + site_url + "/all-products/?product_id=" + productSku + "'><img src='" + productImg + "'></a></td>" +
								"	<td><img src='" + productImg + "'></td>" +
								"	<td name='product-title'>" + productName + "  (" + numOrderItems + ")</td>" +
								"	<td>" + currencySymbol + productPrice + "</td>" +
								"</tr>";

				// augment the total
				var productPriceNoComma = productPrice.replace(',', '');
				orderTotal += parseFloat(productPriceNoComma*numOrderItems);
			}

			// add a final row for the order total
			basketHtml += 	"<tr>" +
							"	<td class='pad-20'></td>" +
							"	<td class='pad-20'><b>Basket Total</b></td>" +
							"	<td class='pad-20'><b>" + currencySymbol + commaInt(orderTotal.toFixed(2)) + "</b></td>" +
							"</tr>";
			$('table[name=order-items] tbody').html($(basketHtml));

			// build the session info HTML
			var ua = order['version'];
			uaParser.setUA(ua);
			var uaResult = uaParser.getResult();
			var osName = uaResult.os.name;
			var browserName = uaResult.browser.name ?? order['browsername'];
			var paymentMethod = order['payment_method'];

			var uaHtml = "<div class='user-agent'>";
			if (osName) uaHtml += "<span name='" + osName + "'></span>" + osName + "&nbsp;&nbsp;&nbsp;&nbsp;";
			if (browserName) uaHtml += "<span name='" + browserName + "'></span>" + browserName + "&nbsp;&nbsp;&nbsp;&nbsp;";
			if (paymentMethod) uaHtml += "<span name='" + paymentMethod + "'></span>" + paymentMethod + "&nbsp;&nbsp;&nbsp;&nbsp;";

			uaHtml += "</div>";
			// uaHtml += "<div class='pad-10-0'>Session ID: " + $(this).attr('data-session-id') + "</div>";
			$('.content-block[name=session-information] .content-block-body .placeholder').html(uaHtml);

			// build the user journey HTML
			var ujHtml = order['user_journey'];
			$('table[name=user-journey] tbody').html($(ujHtml));

			// get the post IDs we need thumbnails for
			var postIDs = $("table[name=user-journey] tr[data-event-type='Lightbox Viewed'] , table[name=user-journey] tr[data-event-type='Lightbox Viewed (PDP)'] , table[name=user-journey] tr[data-event-type='Lightbox Viewed (Homepage)").map(function() {
			    return $(this).attr('data-post-id');
			}).get();
			if (postIDs.length > 0) {
				$.ajax({
					url: ajaxUrl,
					async: false,
					data: {
						'action': 'get_oculizm_post_media',
						'post_ids': postIDs
					},
					dataType: 'JSON',
					success: function (data) {
						console.log(data);

						if (data) {
							for (var i=0; i<data.length; i++) {

								var eventRow = $('.form-overlay[name=order-details] tr[data-post-id=' + data[i]['post_id'] + ']');
								var eventLink = "<a href='" + site_url + "/edit-post/?post_id=" + data[i]['post_id'] + "'><img src='" + data[i]['image_url'] + "'></a>";

								// image post
								if (data[i]['video_url'] == false) {
									$(eventRow).find('td[name=event-details]').html(eventLink);
								}
								// video post
								else {
									eventLink = "<a href='" + site_url + "/edit-post/?post_id=" + data[i]['post_id'] + "'><img src='" + data[i]['video_thumbnail_url'] + "'></a>";
									$(eventRow).find('td[name=event-details]').html(eventLink);
								}						
							}
						}
					},
					error: function (errorThrown) {
						console.log(errorThrown);
					},
					complete: function () {}
				});
			}

			// get product IDs we need thumbnails for
			var productIDs = $("table[name=user-journey] tr[data-event-type='Product Link Clicked']").map(function() {
			    return $(this).attr('data-product-id');
			}).get();

			if (productIDs.length > 0 ) {
				$.ajax({
					url: ajaxUrl,
					async: false,
					data: {
						'action': 'get_product_images',
						'product_ids': productIDs
					},
					dataType: 'JSON',
					success: function (data) {
						console.log(data);

						if (data) {
							for (var i=0; i<data.length; i++) {
								var eventRow = $('.form-overlay[name=order-details] tr[data-product-id=' + data[i]['product_id'] + ']');
								var eventLink = "<a href='" + site_url + "/all-products/?product_id=" + data[i]['product_id'] + "'><img src='" + data[i]['image_link'] + "'></a>";

								$(eventRow).find('td[name=event-details]').html(eventLink);
							}
						}
					},
					error: function (errorThrown) {
						console.log(errorThrown);
					},
					complete: function () {}
				});				
			}

			// show/hide prev/next buttons
			if ($(activeOrderRow).next().length > 0) $('.form-overlay[name=order-details] .next-button').show();
			else $('.form-overlay[name=order-details] .next-button').hide();
			if ($(activeOrderRow).prev().length > 0) $('.form-overlay[name=order-details] .prev-button').show();
			else $('.form-overlay[name=order-details] .prev-button').hide();
		}




		// open the order filter overlay
		$('body').on('click', '.header-filter-button', function (e) {

			// open the overlay
			$('.form-overlay[name=order-filters]').fadeIn();
		});

		// apply filters
		$('body').on('click', 'a[name=apply-filters]', function (e) {
			e.preventDefault();

			$('table[name=orders] tbody tr').remove(); 
			$('.content-block-body table[name=orders]').hide();
			$('.content-block[name=orders-list] .content-block-body .loader').show();


			// close the overlay
			$('.form-overlay[name=order-filters]').fadeOut();

				// Get the selected radio-option for the status form-row
				var interactionLevel = document.querySelector('div[name="interaction-level"] .radio-option.active').getAttribute('name');
				
				if (interactionLevel === 'all') {
					fetchOrderStats(false);
				} else if (interactionLevel === 'deepInteractionOnly') {
					fetchOrderStats(true)
				}
		});

		// open the order details overlay
		$('body').on('click', 'table[name=orders] tr', function (e) {
			// Check if the clicked tr has class .sample-data
			if ($(this).hasClass('sample-data')) {
				// If it has the class, prevent the default behavior and return
				e.preventDefault();
				return;
			}

			// open the overlay
			$('.form-overlay[name=order-details]').fadeIn();

			// get this order
			orderId = $(this).attr('data-order-id');
			order = searchArrayForOrderID(orderId, all_orders);
			
			populateOrderDetailsLightbox(order);
		});

		// order details overlay nav buttons
		$('body').on('click', '.form-overlay[name=order-details] .next-button', function (e) {
			var targetRow = activeOrderRow.next();
			orderId = $(targetRow).attr('data-order-id');
            order = searchArrayForOrderID(orderId, all_orders);
			populateOrderDetailsLightbox(order);
		});
		$('body').on('click', '.form-overlay[name=order-details] .prev-button', function (e) {
			var targetRow = activeOrderRow.prev();
			orderId = $(targetRow).attr('data-order-id');
            order = searchArrayForOrderID(orderId, all_orders);
			populateOrderDetailsLightbox(order);
		});




		// MAIN THREAD

		// add loaders to Order List Table
		$('.content-block[name=orders-list] .content-block-body').append('<div class="loader"></div>');
		$('.content-block[name=orders-list] .content-block-body .loader').show();

		// time period
		$('.content-block, .metric-inner').append("<div class='time-box'>30 Days</div>");

		// show tooltips on interaction icons and multiple orders icons once loaded
		checkElement('table[name=orders] .mini-icon[name=deep-interaction]').then((selector) => {
			$(".interactions-icon , .mini-icon[name=multiple-orders]").each(function(index) {
				$(this).tooltip({
					tooltipClass: "tooltip",
					position: { collision: 'none' },
					hide: true
				});             
			});
		});

		fetchOrderStats(false);

	});

}(jQuery));


function fetchOrderStats(deepInteractionOnly) {
    return jQuery._fetchOrderStats(deepInteractionOnly);
}

































