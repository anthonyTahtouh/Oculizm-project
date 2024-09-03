(function ($) {

	jQuery(document).ready(function () {

		// order variables
		var orders_by_currency = new Array();
		var orderChartsData = new Array();
		var revenueChartsData = new Array();
		// var currencyCode;
		var revenueCurrencyCode;

		// fetch Sales client stats
		jQuery._fetchSalesStats = function() {
			
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_sales_stats'
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					if (data.error) {
						showPopup(data.error, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
					}

					if (data.orders_by_currency.length == 0) {
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
					orders_by_currency = data.orders_by_currency;
					revenue_by_currency = data.sales_by_currency;

					// ORDERS
					if (!$.isEmptyObject(orders_by_currency)) {

						initOrderCharts(orders_by_currency);
						initRevenueCharts(revenue_by_currency);

					} 
					else {
						$('.content-block[name=orders] .loader').hide();
						// $('.content-block[name=orders] .content-block-body').append('<div class="no-data">Nothing to show</div>');
						sampleData(".content-block[name=orders] .content-block-body" , "orders");
						$('.content-block[name=orders]').removeClass('opacity-50');
						
						$('.content-block[name=revenue] .loader').hide();
						// $('.content-block[name=revenue] .content-block-body').append('<div class="no-data">Nothing to show</div>');
						sampleData(".content-block[name=revenue] .content-block-body" , "revenue");
						$('.content-block[name=revenue]').removeClass('opacity-50');
					}

				},
				error: function (errorThrown) {
					console.log(errorThrown);
					showPopup(errorThrown.statusText, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
				},
				complete: function () { 
				}
			});
		}
		

		// // draw order charts
		// function drawOrderCharts(currencyCode) {
		// 	const demoModeValue = sessionStorage.getItem('demoMode');

		// 	var num_orders_by_day = new Array();

		// 	Object.keys(orders_by_currency).forEach(function (key) {
		// 		if (key == currencyCode) {
		// 			var currentCurrencyArray = orders_by_currency[key];

		// 			//empty the array to contain only the current currency data 
		// 			num_orders_by_day = new Array();

		// 			// adding the data of the current currency to an array 
		// 			Object.keys(currentCurrencyArray).forEach(function (key) {

		// 				// New order chart data values if demo mode enabled
		// 				if (demoModeValue === "true") {
		// 					let randomOrderValue = Math.floor(Math.random() * 30);
		// 					num_orders_by_day.push([key, currentCurrencyArray[key] + randomOrderValue]);
		// 				}
		// 				else num_orders_by_day.push([key, currentCurrencyArray[key]]);
		// 			});
		// 		}
		// 	});

		// 	// reverse the array for display purposes 
		// 	num_orders_by_day = num_orders_by_day.reverse();

		// 	// add chart headers 
		// 	num_orders_by_day.unshift(['Date', '']);

		// 	// ORDERS chart options 
		// 	var data = google.visualization.arrayToDataTable(num_orders_by_day);
		// 	options = {
		// 		chartArea: {
		// 			height: '40%',
		// 			left: 60,
		// 			width: '92%'
		// 		},
		// 		width: $(window).width() * 0.60,
		// 		// legend: { position: 'bottom' },
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
		// 			minValue: 0,
		// 			// title: 'Amount',
		// 		},
		// 		interpolateNulls: false,
		// 		legend: { position: 'none' },
		// 	};

		// 	// get the chart
		// 	var chartname = new google.visualization.ColumnChart($('.chart[name=' + currencyCode + '-orders]')[0]);
		// 	$('.tabs[name=ordersByRegion] .tab-body').css("display", "block");
		// 	google.visualization.events.addListener(chartname, 'ready', function () {
		// 		// add any post load events here
		// 	});

		// 	chartname.draw(data, options);
		// 	orderChartsData[currencyCode + 'chart'] = [];
		// 	orderChartsData[currencyCode + 'chart'].push(chartname.getImageURI());

		// 	$('.content-block[name=orders] .loader').hide();

		// 	// select the first tab for each chart
		// 	$('.tabs[name=ordersByRegion] .tab-header:nth-of-type(1)').trigger('click');
		// }

		// // init order charts
		// function initOrderCharts(orders_by_currency) {

		// 	// for each currency...
		// 	Object.keys(orders_by_currency).forEach(function (key) {

		// 		// get the currency code for this iteration
		// 		currencyCode = key;

		// 		// get the full region data of this currency code
		// 		var extractRegionData = function (item) {
		// 			return item[4] === key;
		// 		}
		// 		var r = regions_array.filter(extractRegionData)[0];

		// 		// create the HTML for that region
		// 		var regionTabHeader = "<div class='tab-header' name='" + key + "' title='" + r[1] + "'>" + r[2] + "</div>";
		// 		var regionTabBody = "<div class='tab-body' name='" + key + "'>" +
		// 			"	<div class='chart' name='" + key + "-orders'></div>" +
		// 			"</div>";
		// 		$('.tabs[name=ordersByRegion] .tab-headers').append($(regionTabHeader));
		// 		$('.tabs[name=ordersByRegion] .tab-bodies').append($(regionTabBody));

		// 		// load charts
		// 		google.charts.load('current', { 'packages': ['corechart', 'bar'] });

		// 		// DO NOT EDIT - FOR SOME REASON WE NEED THE CALLBACK TO BE SET INSIDE A NEW FUNCTION
		// 		function drawOrderChartByCurrency(currencyCode) {
		// 			google.charts.setOnLoadCallback(function () {
		// 				drawOrderCharts(currencyCode);
		// 			});
		// 		}
		// 		drawOrderChartByCurrency(currencyCode);
		// 	});
		// }

		// // draw revenue charts
		// function drawRevenueCharts(revenueCurrencyCode) {

		// 	const demoModeValue = sessionStorage.getItem('demoMode');

		// 	var num_revenue_by_day = new Array();

		// 	// creating the currency data array
		// 	Object.keys(revenue_by_currency).forEach(function (key) {
		// 		if (key == revenueCurrencyCode) {
		// 			var currentCurrencyArray = revenue_by_currency[key];

		// 			//empty the array to contain only the current currency data 
		// 			num_revenue_by_day = new Array();

		// 			// adding the data of the current currency to an array 
		// 			Object.keys(currentCurrencyArray).forEach(function (key) {

		// 				// New revenue chart data values if demo mode enabled
		// 				if (demoModeValue === "true") {
		// 					let randomRevenueValue = Math.floor(Math.random() * 300);
		// 					num_revenue_by_day.push([key, currentCurrencyArray[key] + randomRevenueValue]);
		// 				}
		// 				else num_revenue_by_day.push([key, currentCurrencyArray[key]]);
		// 			});
		// 		}
		// 	});

		// 	// reverse the array for display purposes 
		// 	num_revenue_by_day = num_revenue_by_day.reverse();

		// 	// add chart headers 
		// 	num_revenue_by_day.unshift(['Date', revenueCurrencyCode]);

		// 	// Revenue chart options 
		// 	var data = google.visualization.arrayToDataTable(num_revenue_by_day);
		// 	options = {
		// 		chartArea: {
		// 			height: '40%',
		// 			left: 60,
		// 			width: '92%'
		// 		},
		// 		width: $(window).width() * 0.60,
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
		// 			minValue: 0,
		// 			// title: 'Amount',
		// 		},
		// 		interpolateNulls: false,
		// 	};

		// 	// get the chart
		// 	var chartname = new google.visualization.ColumnChart($('.chart[name=' + currencyCode + '-revenue]')[0]);
		// 	$('.tabs[name=revenueByRegion] .tab-body').css("display", "block");
		// 	google.visualization.events.addListener(chartname, 'ready', function () {
		// 		// add any post load events here
		// 	});

		// 	chartname.draw(data, options);
		// 	revenueChartsData[revenueCurrencyCode + 'chart'] = [];
		// 	revenueChartsData[revenueCurrencyCode + 'chart'].push(chartname.getImageURI());

		// 	$('.content-block[name=revenue] .loader').hide();

		// 	// select the first tab for each chart
		// 	$('.tabs[name=revenueByRegion] .tab-header:nth-of-type(1)').trigger('click');
		// }

		// // init revenue charts
		// function initRevenueCharts() {

		// 	// for each currency...
		// 	Object.keys(revenue_by_currency).forEach(function (key) {

		// 		// get the currency code for this iteration
		// 		revenueCurrencyCode = key;

		// 		// get the full region data of this currency code
		// 		var extractRegionData = function (item) {
		// 			return item[4] === key;
		// 		}
		// 		var r = regions_array.filter(extractRegionData)[0];

		// 		// create the HTML for that region
		// 		var regionTabHeader = "<div class='tab-header' name='" + key + "' title='" + r[1] + "'>" + r[2] + "</div>";
		// 		var regionTabBody = "<div class='tab-body' name='" + key + "'>" +
		// 			"	<div class='chart' name='" + key + "-revenue'></div>" +
		// 			"</div>";
		// 		$('.tabs[name=revenueByRegion] .tab-headers').append($(regionTabHeader));
		// 		$('.tabs[name=revenueByRegion] .tab-bodies').append($(regionTabBody));

		// 		// load charts
		// 		google.charts.load('current', { 'packages': ['corechart', 'bar'] });

		// 		// DO NOT EDIT - FOR SOME REASON WE NEED THE CALLBACK TO BE SET INSIDE A NEW FUNCTION
		// 		function drawRevenueChartByCurrency(revenueCurrencyCode) {
		// 			google.charts.setOnLoadCallback(function () {
		// 				drawRevenueCharts(revenueCurrencyCode);
		// 			});
		// 		}
		// 		drawRevenueChartByCurrency(revenueCurrencyCode);
		// 	});
		// }


		// window resize events
		$(window).resize(function () {

			$(".tab-headers").empty();
			$(".tab-bodies").empty();

			initOrderCharts(orders_by_currency);
			initRevenueCharts(revenue_by_currency);
		});


		// MAIN THREAD

		// add loaders to charts
		$('.chart-container .content-block-body').append('<div class="loader"></div>');

		// time period
		$('.content-block, .metric-inner').append("<div class='time-box'>30 Days</div>");

		fetchSalesStats();

	});

}(jQuery));

function fetchSalesStats() {
    return jQuery._fetchSalesStats();
}
