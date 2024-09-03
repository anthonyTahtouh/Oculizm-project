(function ($) {

	jQuery(document).ready(function () {

		// event variables
		var all_events = new Array();
		var views = new Array();
		var interactions = new Array();
		var viewschart;
		var interactionschart;

		jQuery._fetchSummaryStats = function() {

			// reset arrays
			views = new Array();
			interactions = new Array();

			const demoModeValue = sessionStorage.getItem('demoMode');
			// fetch client stats
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_summary_stats'
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					if (data.error) {
						showPopup(data.error, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
					}

					if (data.events_by_date.length == 0) {
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
					all_events = data.events_by_date;
					var sg_visit_conversion_rate = data.sg_visit_conversion_rate;
					var email_click_conversion_rate = data.email_click_conversion_rate;
					var hw_conversion_rate = data.hw_conversion_rate;
					var ppg_conversion_rate = data.ppg_conversion_rate;
					var sg_interaction_conversion_rate = data.sg_interaction_conversion_rate;
					var touchpoints = data.touchpoints;
					var total_distinct_session_ids_count = data.total_distinct_session_ids_count;
					var total_assisted_sales_in_primary_currency = data.total_assisted_sales_in_primary_currency;

					// Assisted Orders 

					// New Assisted Orders value if demo mode enabled
					if (demoModeValue === "true") {
						let randomTotalAssistedOrdersValue = Math.floor(Math.random() * 30);
						$('.metric[name=assisted-orders] .metric-inner .metric-highlight-value').text(commaInt(data.total_assisted_orders + randomTotalAssistedOrdersValue));
					}
					else{
						$('.metric[name=assisted-orders] .metric-inner .metric-highlight-value').text(commaInt(data.total_assisted_orders));
					}
					

					// Assisted Sales 
					if(total_assisted_sales_in_primary_currency){
						var primary_currency =Object.keys(total_assisted_sales_in_primary_currency)[0];
						var assisted_sales = Object.values(total_assisted_sales_in_primary_currency)[0];
					}
					

					// New Assisted Sales value if demo mode enabled
					if (demoModeValue === "true") {
					assisted_sales = (Object.values(total_assisted_sales_in_primary_currency)[0] * 120)/100;
					}
				
					// get the currency symbol for the primary_currency code
					if(primary_currency){
						var extractRegionData = function (item) {
							return item[4] === primary_currency;
						}
						var r = regions_array.filter(extractRegionData)[0];
						var primaryCurrencySymbol = r[3];
					}
					if(total_assisted_sales_in_primary_currency){
						$('.metric[name=assisted-sales] .metric-inner .metric-highlight-value').text(commaInt(assisted_sales.toFixed(2)));
						$('.metric[name=assisted-sales] .metric-inner .metric-highlight-unit').html(primaryCurrencySymbol);
					}
					else{
						$('.metric[name=assisted-sales] .metric-inner .metric-highlight-value').text(0);
					$('.metric[name=assisted-sales] .metric-inner .metric-highlight-unit').html();
					}

					// Conversion Rate 

					// New Conversion Rates values if demo mode enabled
					if (demoModeValue === "true") {
						sg_visit_conversion_rate = Math.floor(Math.random() * 100);
						email_click_conversion_rate = Math.floor(Math.random() * 100);
						hw_conversion_rate = Math.floor(Math.random() * 100);
						ppg_conversion_rate = Math.floor(Math.random() * 100);
						sg_interaction_conversion_rate = Math.floor(Math.random() * 100);
						}
					
					if(sg_visit_conversion_rate === null){
						sg_visit_conversion_rate = 0;
					}
					if(email_click_conversion_rate === null){
						email_click_conversion_rate = 0;
					}
					if(hw_conversion_rate === null){
						hw_conversion_rate = 0;
					}
					if(ppg_conversion_rate === null){
						ppg_conversion_rate = 0;
					}
					if(sg_interaction_conversion_rate === null){
						sg_interaction_conversion_rate = 0;
					}
					$('.metric[name=sg-conversion-rate] .metric-inner .metric-highlight-value-sg_visited').text(Number(sg_visit_conversion_rate.toFixed(2)));
					$('.metric[name=sg-conversion-rate] .metric-inner .metric-highlight-value-sg_interact').text(Number(sg_interaction_conversion_rate.toFixed(2)));
					$('.metric[name=email-conversion-rate] .metric-inner .metric-highlight-value').text(Number(email_click_conversion_rate.toFixed(2)));
					$('.metric[name=hw-conversion-rate] .metric-inner .metric-highlight-value').text(Number(hw_conversion_rate.toFixed(2)));
					$('.metric[name=ppg-conversion-rate] .metric-inner .metric-highlight-value').text(Number(ppg_conversion_rate.toFixed(2)));
					$('.metric[name=total-shoppable-sessions] .metric-inner .metric-highlight-value').text(commaInt(Number(total_distinct_session_ids_count.toFixed(2))));

					
					
					// Touchpoints 
					// $('.metric[name=touchpoints] .metric-inner .metric-highlight-value.shopViews').text(commaInt(Number(touchpoints['distinct_gridView_events'])));
					// $('.metric[name=touchpoints] .metric-inner .metric-highlight-value.lightboxViews').text(commaInt(Number(touchpoints['distinct_expand_events'])));
					// $('.metric[name=touchpoints] .metric-inner .metric-highlight-value.productLinkClicked').text(commaInt(Number(touchpoints['distinct_shop_events'])));

					//Average Order Value
					var average_order_value = assisted_sales/data.total_assisted_orders;
					if(!average_order_value){
						average_order_value = 0;
					}

					// New Average Order Value if demo mode enabled
					if (demoModeValue === "true") {
						average_order_value = ((assisted_sales/data.total_assisted_orders) * 120)/100;
					}
					$('.metric[name=average-order-value] .metric-inner .metric-highlight-value').text(commaInt(average_order_value.toFixed(2)));
					$('.metric[name=average-order-value] .metric-inner .metric-highlight-unit').html(primaryCurrencySymbol);
					
					$('.metric .metric-inner .metric-body .loader').hide();
					$('.metric .metric-inner .metric-body .metric-highlight , .metric .metric-inner .metric-body .metric-description').show();
					
					// EVENTS

					// if data exists, get events data into the right graphs
					Object.keys(all_events).forEach(function (key) {
						views.push([key, all_events[key][0]]);
						interactions.push([key, all_events[key][1], all_events[key][2] , all_events[key][4] ]);
					});

					if (!$.isEmptyObject(all_events)) {
						if (!$.isEmptyObject(views)) {
							views.unshift(['Date', 'Shoppable Gallery']);
							interactions.unshift(['Date', 'Lightbox Views', 'Product Clicks' , 'Email Clicks']);
							
							// load charts
							google.charts.load('current', { 'packages': ['corechart', 'bar'] });
							google.charts.setOnLoadCallback(function () {
								drawViewsChart(views);
								drawInteractionsChart (interactions);
							});
						}
					}
					else {
						$('.content-block[name=interactions] .loader').hide();
						// $('.content-block[name=interactions] .content-block-body').append('<div class="no-data">Nothing to show</div>');

						sampleData(".content-block[name=interactions] .content-block-body" , "interactions");

						$('.content-block[name=views] .loader').hide();
						// $('.content-block[name=views] .content-block-body').append('<div class="no-data">Nothing to show</div>');

						sampleData(".content-block[name=views] .content-block-body" , "views");
					}

				},
				error: function (errorThrown) {
					console.log(errorThrown);
					showPopup(errorThrown.statusText, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
				},
				complete: function () { 
					$('.content-block[name=top-hashtags] .loader').hide();
				}
			});
	}

		// next steps constants
		// const NEXT_STEPS_KEYS = {
		// 	NO_FEED: 'no_feed',
		// 	NO_INSTA: 'no_insta',
		// 	NO_PRODUCTS: 'no_products',
		// 	NO_GALLERIES: 'no_galleries',
		// 	LOW_POSTS: 'low_posts',
		// 	ALL_GOOD: 'all_good'
		// }
		// const NEXT_STEPS = {
		// 	[NEXT_STEPS_KEYS.NO_FEED]: {
		// 		content: `<b>Add your product feed</b> Your store should have a product feed, either in XML or CSV format.`,
		// 		buttonText: 'Add Product Feed',
		// 		buttonTarget: '/settings/',
		// 	},
		// 	[NEXT_STEPS_KEYS.NO_INSTA]: {
		// 		content: `<b>Connect your Instagram account</b> Visit the <a class='dashboard-link' href='${site_url}/instagram/'>Instagram</a> page to authenticate your Instagram account and see where you\'ve been tagged.`,
		// 		buttonText: 'Connect My Instagram Account',
		// 		buttonTarget: '/instagram/',
		// 	},
		// 	[NEXT_STEPS_KEYS.NO_PRODUCTS]: {
		// 		content: `<b>Check your product feed.</b> The product feed you supplied is either broken or needs updating. Go to the  <a class='dashboard-link' href='${site_url}/settings/'>Settings</a> to check your product feed`,
		// 		buttonText: 'Check Product Feed',
		// 		buttonTarget: '/settings/',
		// 	},
		// 	[NEXT_STEPS_KEYS.NO_GALLERIES]: {
		// 		content: `<b>Add your first gallery</b> You need a gallery for your website to display your curated posts. Visit the <a class='dashboard-link' href='${site_url}/galleries/'>Galleries</a> page to get started.`,
		// 		buttonText: 'Add a gallery',
		// 		buttonTarget: '/galleries/',
		// 	},
		// 	[NEXT_STEPS_KEYS.LOW_POSTS]: {
		// 		content: '<b>Curate some posts</b> You don\'t have enough posts curated to get a good looking gallery on your website. The more posts you curate, the better the conversion rate.',
		// 		buttonText: 'Curate Instagram Posts',
		// 		buttonTarget: '/instagram/',
		// 	},
		// 	[NEXT_STEPS_KEYS.ALL_GOOD]: {
		// 		content: 'You\'re doing great. Keep curating!',
		// 		buttonText: '',
		// 		buttonTarget: '',
		// 	},
		// }

		// get the next step
		// function getNextStep(data) {
		// 	if (!data.hasFeed) return NEXT_STEPS_KEYS.NO_FEED;
		// 	if (!data.connections.includes('instagram')) return NEXT_STEPS_KEYS.NO_INSTA;
		// 	if (!data.productsCount) return NEXT_STEPS_KEYS.NO_PRODUCTS;
		// 	if (!data.galleries || data.galleries.length === 0) return NEXT_STEPS_KEYS.NO_GALLERIES;
		// 	if (data.posts.total < 24) return NEXT_STEPS_KEYS.LOW_POSTS;
		// 	return NEXT_STEPS_KEYS.ALL_GOOD;
		// }



		// fetch next step data
// 		$.ajax({
// 			url: ajaxUrl,
// 			data: {
// 				'action': 'get_next_steps'
// 			},
// 			dataType: 'JSON',
// 
// 			success: function (data) {
// 				console.log(data);
// 
// 				var productsPerRegionHtml = "";
// 				var totalProductsCountHtml = "";
// 				var totalProductsCount = 0;
// 
// 				// build products by region html
// 				Object.keys(data.clientFeeds).forEach(function (key) {
// 
// 					// get the full region data of this currency code
// 					var extractRegionData = function (item) {
// 						return item[0] === data.clientFeeds[key]['region'];
// 					}
// 					var r = regions_array.filter(extractRegionData)[0];
// 
// 					var clientNumProducts = parseInt(data.clientFeeds[key]['num_products'], 10);
// 					clientNumProducts = clientNumProducts.toLocaleString();
// 
// 					productsPerRegionHtml += "<div>" + r[2] + " " + clientNumProducts + "</div>";
// 					totalProductsCount += parseInt(data.clientFeeds[key]['num_products'], 10);
// 				});
// 				var totalProductsCountString = totalProductsCount.toLocaleString();
// 				totalProductsCountHtml = "<div> Total " + totalProductsCountString + "</div>";
// 
// 				// next steps
// 				const nextStep = getNextStep(data);
// 				var nextStepButton = $(".content-block[name=next-steps] .cta-secondary");
// 				$(".content-block[name=next-steps] .content-block-description").append(NEXT_STEPS[nextStep].content);
// 				nextStepButton.text(NEXT_STEPS[nextStep].buttonText);
// 				nextStepButton.attr('href', nextStepButton.attr('href') + NEXT_STEPS[nextStep].buttonTarget);
// 				if (!NEXT_STEPS[nextStep].buttonTarget) $(".content-block[name=next-steps] .cta-group").hide();
// 
// 				// social networks
// 				const socialMediaPlatforms = ['facebook', 'instagram', 'twitter'];
// 				socialMediaPlatforms.map(socialMediaPlatform => {
// 					$(".content-block[name=social-networks]").append(`
// 						<div class="dashboard-item">
// 							<span>${socialMediaPlatform}</span>
// 							<span class='social-network-icon ${data.connections.includes(socialMediaPlatform) ? 'active' : ''}'></span>
// 						</div>
// 					`);
// 				});
// 
// 				// posts
// 				const postsTypes = [{
// 					key: "published",
// 					text: "Published"
// 				}, {
// 					key: "draft",
// 					text: "Draft"
// 				}, {
// 					key: "total",
// 					text: "Total"
// 				}];
// 				postsTypes.map(type => {
// 					const postsNumber = data.posts[type.key];
// 					if (postsNumber > 0) {
// 						$(".content-block[name=posts]").append(`
// 							<div class="dashboard-item">
// 								<span>${type.text}</span>
// 								<span>${postsNumber}</span>
// 							</div>
// 						`);
// 					}
// 				});
// 				if (data.posts.total > 0) $(".content-block[name=posts]").append('<a href="posts/">View latest posts</a>');
// 				else $(".content-block[name=posts]").append('<div class="no-data">Nothing to show</div>');
// 
// 				// galleries
// 				if (data.galleries && data.galleries.length > 0) {
// 					data.galleries.map(gallery => {
// 						$(".content-block[name=galleries]").append(`
// 							<div class="dashboard-item">
// 								<span>${gallery.name}</span>
// 								<span>${gallery.total}</span>
// 							</div>
// 						`);
// 					});
// 				}
// 				if (data.galleries.length > 0) $(".content-block[name=galleries]").append('<a href="galleries/">View galleries</a>');
// 				else $(".content-block[name=galleries]").append('<div class="no-data">Nothing to show</div>');
// 
// 				// products
// 				if (totalProductsCount > 0) {
// 					$(".content-block[name=products]").append(`
// 						<div class="dashboard-item">
// 							<span>${productsPerRegionHtml}</span>
// 						</div>
// 						<div><b>${totalProductsCountHtml}</b></div>
// 					`);
// 				}
// 				if (totalProductsCount > 0) $(".content-block[name=products]").append('<a href="products/">View products</a>');
// 				else $(".content-block[name=products]").append('<div class="no-data">Nothing to show</div>');
// 			},
// 			error: function (errorThrown) {
// 				console.log(errorThrown);
// 				showPopup(errorThrown.statusText, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
// 			},
// 			complete: function () {}
// 		})



		// draw event charts
		// function drawEventCharts() {

		// 	// Views
		// 	data = google.visualization.arrayToDataTable(views);
		// 	options = {
		// 		chartArea: {
		// 			height: '40%',
		// 			left: 75,
		// 			width: '100%'
		// 		},
		// 		width: Math.min($(window).width() * 0.60, 1200), // Set maximum width of 1200px
		// 		legend: { position: 'bottom' },
		// 		colors: ['#44dd88', '#ff7722', '#bb00bb', '#00aaff', '#888888'],
		// 		hAxis: {
		// 			count: -1,
		// 			viewWindowMode: 'pretty',
		// 			slantedText: true,
		// 			textPosition: 'out',
		// 			textStyle: {
		// 				fontSize: 9
		// 			}
		// 		},
		// 		vAxis: {
		// 			count: -1,
		// 			format: 'decimal'
		// 		},
		// 	};
		// 	viewschart = new google.visualization.LineChart($('.chart[name=views]')[0]);

		// 	google.visualization.events.addListener(viewschart, 'ready', function () {
		// 		// add any post load events here
		// 	});

		// 	viewschart.draw(data, options);
		// 	$('.content-block[name=views] .loader').hide();

		// 	// Interactions
		// 	data = google.visualization.arrayToDataTable(interactions);
		// 	options = {
		// 		chartArea: {
		// 			height: '40%',
		// 			left: 75,
		// 			width: '100%'
		// 		},
		// 		width: Math.min($(window).width() * 0.60, 1200), // Set maximum width of 1200px
		// 		legend: { position: 'bottom' },
		// 		colors: ['#44dd88', '#ff7722', '#bb00bb', '#00aaff', '#888888'],
		// 		hAxis: {
		// 			count: -1,
		// 			viewWindowMode: 'pretty',
		// 			slantedText: true,
		// 			textPosition: 'out',
		// 			textStyle: {
		// 				fontSize: 9
		// 			}
		// 		},
		// 		vAxis: {
		// 			count: -1,
		// 			format: 'decimal'
		// 		},
		// 	};
		// 	interactionschart = new google.visualization.LineChart($('.chart[name=interactions]')[0]);

		// 	google.visualization.events.addListener(interactionschart, 'ready', function () {
		// 		// add any post load events here
		// 	});

		// 	interactionschart.draw(data, options);
		// 	$('.content-block[name=interactions] .loader').hide();
		// }




		// window resize events
		$(window).resize(function () {
			drawViewsChart(views);
			drawInteractionsChart (interactions);
		});




		// MAIN THREAD

		// add loaders to metrics
		$('.metric .metric-inner .metric-body').append('<div class="loader"></div>');
		$('.metric .metric-inner .metric-body .metric-highlight , .metric .metric-inner .metric-body .metric-description').hide();
		$('.metric .metric-inner .metric-body .loader').show();

		// add loaders to charts
		$('.chart-container .content-block-body').append('<div class="loader"></div>');
		
		// time period
		$('.content-block, .metric-inner').append("<div class='time-box'>30 Days</div>");

		fetchSummaryStats();

	});
}(jQuery));

function fetchSummaryStats() {
    return jQuery._fetchSummaryStats();
}

