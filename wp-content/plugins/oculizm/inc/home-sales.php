<?php

// get sales stats
add_action('wp_ajax_get_sales_stats', 'get_sales_stats');
function get_sales_stats() {
 
	global $wpdb;
	ini_set('memory_limit', '1024M');

    $client_id = get_client_id();
	
	// for react project testing purposes
	$http_origin = get_http_origin();
	if ($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com"){
		$client_id = 12453;
	}
	
	// cache
    $clients_stats_cache_file = ABSPATH."wp-content/uploads/analytics/".$client_id."_sales-data.json";
 	// if (!file_exists($clients_stats_cache_file) || filemtime($clients_stats_cache_file)<(time() - 21600)) {
	if (true) {
		
		// define variables
		$result = array();
		$events_by_date = array();
		$orders_by_currency = array();
		$sales_by_currency = array();

		// date variables
	    $since = date("Y-m-d H:i:s",mktime(date("H"),date("i"),date("s"),(date("m")-1),date("d"),date("Y")));
	    $now_date = date("Y-m-d H:i:s",mktime(date("H"),date("i"),date("s"),date("m"),(date("d")),date("Y")));

		// get an array representing the last 30 days
		$dates = array();
		for($i = 0; $i < 30; $i++) {
			$dates[] = date("d M", strtotime('-'. $i .' days'));
		}



		/************************************************
		* 												*
		* 												*
		* 					ORDERS 	 					*
		* 												*
		* 												*
		************************************************/

		// get all orders
		$orders = $wpdb->get_results("SELECT DISTINCT order_id, created, order_amount, currency FROM oculizm_orders WHERE client_id = " . $client_id . " AND created>'" . $since ."' AND created<='". $now_date ."'", ARRAY_A);

		// deduplication (why? is this because we receive duplicate order notifications?)
		$orders_with_a_grid_view_tempArr = array_unique(array_column($orders, 'order_id'));
		// get all items in the first array which have a key in common in the second array
	 	$orders_with_a_grid_view_unique = array_intersect_key($orders, $orders_with_a_grid_view_tempArr) ;
		// returns all the values from the array (so removes the keys) and indexes the array numerically
		$orders_with_a_grid_view_Array = array_values($orders_with_a_grid_view_unique);

		// now for each of those, create an array of orders by distinct date
		foreach ($orders_with_a_grid_view_Array as $order) {

			$order['created'] = date("d M", strtotime(substr($order['created'], 0, 10)));
			$currency = $order['currency'];
			
			// convert datetime to date
			$order_date = date("d M", strtotime(substr($order['created'], 0, 10)));

			// if this currency is already in this array, increment and replace
			if (array_key_exists($currency, $orders_by_currency)) {

				// orders
				$this_currencys_dates_array = $orders_by_currency[$currency];

				if (isset($this_currencys_dates_array[$order_date])) {
					$this_currencys_dates_array[$order_date] = $this_currencys_dates_array[$order_date]+1;
				}
				$orders_by_currency[$currency] = $this_currencys_dates_array;

				// sales
				$this_currencys_dates_array = $sales_by_currency[$currency];

				if (isset($this_currencys_dates_array[$order_date])) {
					$this_currencys_dates_array[$order_date] = round($this_currencys_dates_array[$order_date] + $order['order_amount'], 2);
				}
				$sales_by_currency[$currency] = $this_currencys_dates_array;
			}
			// else create a new empty dates array for this currency, increment and add
			else {
				// orders
				$new_array_of_dates = array();
				foreach($dates as $d) {
					$new_array_of_dates[$d] = 0;
				}
				if (isset($new_array_of_dates[$order_date])) {
					$new_array_of_dates[$order_date] = $new_array_of_dates[$order_date]+1;
				}
				$orders_by_currency[$currency] = $new_array_of_dates;

				// sales
				$new_array_of_dates = array();
				foreach($dates as $d) {
					$new_array_of_dates[$d] = 0;
				}
				if (isset($new_array_of_dates[$order_date])) {
					$new_array_of_dates[$order_date] = round($new_array_of_dates[$order_date] + $order['order_amount'], 2);
				}
				$sales_by_currency[$currency] = $new_array_of_dates;
			}
		}

		// sort array by descending order
		arsort($orders_by_currency);

		// populate results array
		$result['orders_by_currency'] = $orders_by_currency;
		$result['sales_by_currency'] = $sales_by_currency;
		
		$res = json_encode($result);
		file_put_contents($clients_stats_cache_file, $res);
 }
	else {
		$res = file_get_contents($clients_stats_cache_file);
	}
	echo $res;
	die;
}