
// THESE NEED TO STAY HERE!
var regions_array = [];
var orderChartsData = new Array();
var revenueChartsData = new Array();

(function($) {

    jQuery(document).ready(function() {


        /************************************************
        *                                               *
        *                                               *
        *            GLOBAL JQUERY FUNCTIONS            *
        *                                               *
        *                                               *
        ************************************************/


        // draw views charts
		jQuery._drawViewsChart = function(views) {

			// Views
			data = google.visualization.arrayToDataTable(views);
			options = {
				chartArea: {
					height: '40%',
					left: 75,
					width: '100%'
				},
				width: Math.min($(window).width() * 0.60, 1200), // Set maximum width of 1200px
				legend: { position: 'bottom' },
				colors: ['#44dd88', '#ff7722', '#bb00bb', '#00aaff', '#888888'],
				hAxis: {
					count: -1,
					viewWindowMode: 'pretty',
					slantedText: true,
					textPosition: 'out',
					textStyle: {
						fontSize: 9
					}
				},
				vAxis: {
					count: -1,
					format: 'decimal'
				},
			};
			viewschart = new google.visualization.LineChart($('.chart[name=views]')[0]);

			google.visualization.events.addListener(viewschart, 'ready', function () {
				// add any post load events here
			});

			viewschart.draw(data, options);
			$('.content-block[name=views] .loader').hide();
		
		}

        // draw interactions charts
        jQuery._drawInteractionsChart = function(interactions) {

			// Interactions
			data = google.visualization.arrayToDataTable(interactions);
			options = {
				chartArea: {
					height: '40%',
					left: 75,
					width: '100%'
				},
				width: Math.min($(window).width() * 0.60, 1200), // Set maximum width of 1200px
				legend: { position: 'bottom' },
				colors: ['#44dd88', '#ff7722', '#bb00bb', '#00aaff', '#888888'],
				hAxis: {
					count: -1,
					viewWindowMode: 'pretty',
					slantedText: true,
					textPosition: 'out',
					textStyle: {
						fontSize: 9
					}
				},
				vAxis: {
					count: -1,
					format: 'decimal'
				},
			};
			interactionschart = new google.visualization.LineChart($('.chart[name=interactions]')[0]);

			google.visualization.events.addListener(interactionschart, 'ready', function () {
				// add any post load events here
			});

			interactionschart.draw(data, options);
			$('.content-block[name=interactions] .loader').hide();
		}

        // draw order charts
		function drawOrderCharts(currencyCode,orders_by_currency) {
			const demoModeValue = sessionStorage.getItem('demoMode');

			var num_orders_by_day = new Array();

			Object.keys(orders_by_currency).forEach(function (key) {
				if (key == currencyCode) {
					var currentCurrencyArray = orders_by_currency[key];

					//empty the array to contain only the current currency data 
					num_orders_by_day = new Array();

					// adding the data of the current currency to an array 
					Object.keys(currentCurrencyArray).forEach(function (key) {

						// New order chart data values if demo mode enabled
						if (demoModeValue === "true") {
							let randomOrderValue = Math.floor(Math.random() * 30);
							num_orders_by_day.push([key, currentCurrencyArray[key] + randomOrderValue]);
						}
						else num_orders_by_day.push([key, currentCurrencyArray[key]]);
					});
				}
			});

			// reverse the array for display purposes 
			num_orders_by_day = num_orders_by_day.reverse();

			// add chart headers 
			num_orders_by_day.unshift(['Date', '']);

			// ORDERS chart options 
			var data = google.visualization.arrayToDataTable(num_orders_by_day);
			options = {
				chartArea: {
					height: '40%',
					left: 60,
					width: '92%'
				},
				width: $(window).width() * 0.60,
				// legend: { position: 'bottom' },
				colors: ['#44dd88', '#ff7722', '#bb00bb', '#00aaff', '#888888'],
				hAxis: {
					count: -1,
					viewWindowMode: 'pretty',
					slantedText: true,
					textPosition: 'out',
					textStyle: {
						fontSize: 9
					}
				},
				vAxis: {
					minValue: 0,
					// title: 'Amount',
				},
				interpolateNulls: false,
				legend: { position: 'none' },
			};

			// get the chart
			var chartname = new google.visualization.ColumnChart($('.chart[name=' + currencyCode + '-orders]')[0]);
			$('.tabs[name=ordersByRegion] .tab-body').css("display", "block");
			google.visualization.events.addListener(chartname, 'ready', function () {
				// add any post load events here
			});

			chartname.draw(data, options);
			orderChartsData[currencyCode + 'chart'] = [];
			orderChartsData[currencyCode + 'chart'].push(chartname.getImageURI());

			$('.content-block[name=orders] .loader').hide();

			// select the first tab for each chart
			$('.tabs[name=ordersByRegion] .tab-header:nth-of-type(1)').trigger('click');
		}

		// init order charts
		jQuery._initOrderCharts = function initOrderCharts(orders_by_currency) {

			// for each currency...
			Object.keys(orders_by_currency).forEach(function (key) {

				// get the currency code for this iteration
				currencyCode = key;

				// get the full region data of this currency code
				var extractRegionData = function (item) {
					return item[4] === key;
				}
				var r = regions_array.filter(extractRegionData)[0];

				// create the HTML for that region
				var regionTabHeader = "<div class='tab-header' name='" + key + "' title='" + r[1] + "'>" + r[2] + "</div>";
				var regionTabBody = "<div class='tab-body' name='" + key + "'>" +
					"	<div class='chart' name='" + key + "-orders'></div>" +
					"</div>";
				$('.tabs[name=ordersByRegion] .tab-headers').append($(regionTabHeader));
				$('.tabs[name=ordersByRegion] .tab-bodies').append($(regionTabBody));

				// load charts
				google.charts.load('current', { 'packages': ['corechart', 'bar'] });

				// DO NOT EDIT - FOR SOME REASON WE NEED THE CALLBACK TO BE SET INSIDE A NEW FUNCTION
				function drawOrderChartByCurrency(currencyCode) {
					google.charts.setOnLoadCallback(function () {
						drawOrderCharts(currencyCode,orders_by_currency);
					});
				}
				drawOrderChartByCurrency(currencyCode);
			});
		}

        // draw revenue charts
		function drawRevenueCharts(revenueCurrencyCode, revenue_by_currency) {

			const demoModeValue = sessionStorage.getItem('demoMode');

			var num_revenue_by_day = new Array();

			// creating the currency data array
			Object.keys(revenue_by_currency).forEach(function (key) {
				if (key == revenueCurrencyCode) {
					var currentCurrencyArray = revenue_by_currency[key];

					//empty the array to contain only the current currency data 
					num_revenue_by_day = new Array();

					// adding the data of the current currency to an array 
					Object.keys(currentCurrencyArray).forEach(function (key) {

						// New revenue chart data values if demo mode enabled
						if (demoModeValue === "true") {
							let randomRevenueValue = Math.floor(Math.random() * 300);
							num_revenue_by_day.push([key, currentCurrencyArray[key] + randomRevenueValue]);
						}
						else num_revenue_by_day.push([key, currentCurrencyArray[key]]);
					});
				}
			});
            

			// reverse the array for display purposes 
			num_revenue_by_day = num_revenue_by_day.reverse();

			// add chart headers 
			num_revenue_by_day.unshift(['Date', revenueCurrencyCode]);

			// Revenue chart options 
			var data = google.visualization.arrayToDataTable(num_revenue_by_day);
			options = {
				chartArea: {
					height: '40%',
					left: 60,
					width: '92%'
				},
				width: $(window).width() * 0.60,
				legend: { position: 'bottom' },
				colors: ['#44dd88', '#ff7722', '#bb00bb', '#00aaff', '#888888'],
				hAxis: {
					count: -1,
					viewWindowMode: 'pretty',
					slantedText: true,
					textPosition: 'out',
					textStyle: {
						fontSize: 9
					}
				},
				vAxis: {
					minValue: 0,
					// title: 'Amount',
				},
				interpolateNulls: false,
			};

			// get the chart
			var chartname = new google.visualization.ColumnChart($('.chart[name=' + revenueCurrencyCode + '-revenue]')[0]);
			$('.tabs[name=revenueByRegion] .tab-body').css("display", "block");
			google.visualization.events.addListener(chartname, 'ready', function () {
				// add any post load events here
			});

			chartname.draw(data, options);
			revenueChartsData[revenueCurrencyCode + 'chart'] = [];
			revenueChartsData[revenueCurrencyCode + 'chart'].push(chartname.getImageURI());

			$('.content-block[name=revenue] .loader').hide();

			// select the first tab for each chart
			$('.tabs[name=revenueByRegion] .tab-header:nth-of-type(1)').trigger('click');
		}

		// init revenue charts
		jQuery._initRevenueCharts = function initRevenueCharts(revenue_by_currency) {

			// for each currency...
			Object.keys(revenue_by_currency).forEach(function (key) {

				// get the currency code for this iteration
				revenueCurrencyCode = key;

				// get the full region data of this currency code
				var extractRegionData = function (item) {
					return item[4] === key;
				}
				var r = regions_array.filter(extractRegionData)[0];

				// create the HTML for that region
				var regionTabHeader = "<div class='tab-header' name='" + key + "' title='" + r[1] + "'>" + r[2] + "</div>";
				var regionTabBody = "<div class='tab-body' name='" + key + "'>" +
					"	<div class='chart' name='" + key + "-revenue'></div>" +
					"</div>";
				$('.tabs[name=revenueByRegion] .tab-headers').append($(regionTabHeader));
				$('.tabs[name=revenueByRegion] .tab-bodies').append($(regionTabBody));

				// load charts
				google.charts.load('current', { 'packages': ['corechart', 'bar'] });

				// DO NOT EDIT - FOR SOME REASON WE NEED THE CALLBACK TO BE SET INSIDE A NEW FUNCTION
				function drawRevenueChartByCurrency(revenueCurrencyCode,revenue_by_currency) {
					google.charts.setOnLoadCallback(function () {
						drawRevenueCharts(revenueCurrencyCode , revenue_by_currency);
					});
				}
				drawRevenueChartByCurrency(revenueCurrencyCode,revenue_by_currency);
			});
		}

    });


}(jQuery));





/************************************************
*                                               *
*                                               *
*       GLOBAL JQUERY FUNCTION ACCESSORS        *
*                                               *
*                                               *
************************************************/

function drawViewsChart(views) {
    return jQuery._drawViewsChart(views);
}

function drawInteractionsChart(interactions) {
    return jQuery._drawInteractionsChart(interactions);
}

function initOrderCharts(orders_by_currency) {
    return jQuery._initOrderCharts(orders_by_currency);
}

function initRevenueCharts(revenue_by_currency) {
    return jQuery._initRevenueCharts(revenue_by_currency);
}



