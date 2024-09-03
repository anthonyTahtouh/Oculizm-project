<?php
/*
Controller name: api-app
Controller description: Main wordpress controller for the Oculizm API
Developer name: Oculizm Limited

*/


// handle CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
	$http_origin = $_SERVER['HTTP_ORIGIN'];
    header("Access-Control-Allow-Origin: $http_origin");
    header("Access-Control-Allow-Credentials: true");
}

// add custom Namespace and Endpoints 

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/app_fetch_client_data', array(
			'methods' => 'GET',
			'callback' => 'app_fetch_client_data',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/app_fetch_summary_stats', array(
			'methods' => 'GET',
			'callback' => 'app_fetch_summary_stats',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/app_fetch_posts', array(
			'methods' => 'GET',
			'callback' => 'app_fetch_posts',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/app_fetch_reviews', array(
			'methods' => 'GET',
			'callback' => 'app_fetch_reviews',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/app_fetch_products', array(
			'methods' => 'GET',
			'callback' => 'app_fetch_products',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/app_fetch_support_tickets', array(
			'methods' => 'GET',
			'callback' => 'app_fetch_support_tickets',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/app_create_support_ticket', array(
			'methods' => 'POST',
			'callback' => 'app_create_support_ticket',
			'permission_callback' => '__return_true',
	) );
} );







/****************************************
*										*
*										*
*				APP ROUTES				*
*										*
*										*
****************************************/



// fetch client data - returns [client, region, summary_stats]
function app_fetch_client_data($request) {

	oLog("*** APP REQUEST: app_fetch_client_data ***");
	oLog($request['auth_token']);

	$response = array();
	$user;

	// validate auth token
	if (isset($request['auth_token']) && !empty($request['auth_token'])) {
		$auth_token = $request['auth_token'];
		$users = get_users(
			array(
				'meta_key' => 'auth_token',
				'meta_value' => $auth_token,
				'number' => 1,
				'count_total' => false
			)
		);
		$user = $users[0];
	}
	else {
		$response['error'] = "Invalid auth token";
    	return json_encode($response);
	}
	if (!$user) {
		$response['error'] = "User not found";
    	return json_encode($response);
	}

    // get the client ID
    $client_id = get_field('client_id', 'user_' . $user->ID);
    if (!$client_id) {
    	$response['error'] = "Failed to get client ID";
    	return json_encode($response);
    }

	$response['data']['metrics'] = array();

    global $wpdb;

	// get this client's primary region
	$regions_file = ABSPATH."wp-content/themes/oculizm/data/regions.json";
	$feeds = $wpdb->get_results("SELECT region FROM oculizm_product_feeds WHERE client_id = " . $client_id, ARRAY_A);
    if (file_exists($regions_file) && count($feeds) > 0) {
    	$regions_json = file_get_contents($regions_file);
		$regions = json_decode($regions_json , true); 
		$client_region = $feeds[0]['region'];
		$region_index = array_search($client_region, array_column($regions, 'code'));
		$response['data']['region'] = $regions[$region_index];

		// convert the currency symbol HTML entity into plain text 
		// TBC: update the regions.json file to include it instead!
		$primary_currency_code = $regions[$region_index]['currency_code'];
		if ($primary_currency_code === "GBP") $response['data']['region']['symbol'] = "£";
    }

	ini_set('memory_limit', '1024M');

	// cache
    $clients_stats_cache_file = ABSPATH."wp-content/uploads/analytics/".$client_id."_summary-data.json";
 	// if (!file_exists($clients_stats_cache_file) || filemtime($clients_stats_cache_file)<(time() - 21600)) {
	if (true) {
		
		// define variables
		$result = array();
		$events_by_date = array();
		$orders_by_currency = array();
		$sales_by_currency = array();
		$total_sales_by_currency = array();

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
		* 					EVENTS 						*
		* 												*
		* 												*
		************************************************/

		// get all events by distinct session
		$events_by_distinct_session = $wpdb->get_results("SELECT DISTINCT session_id, DATE_FORMAT(created,'%d %b %Y') as created, type, referrer FROM oculizm_events WHERE client_id = " . $client_id . " AND created>'" . $since . "' AND created<='". $now_date ."'", ARRAY_A);
		
		// for each event...
		foreach($events_by_distinct_session as $e) {

			$date = $e['created'];

			// if this date is NOT in our distinct dates array, create a new entry
			if (!array_search($date, array_keys($events_by_date))) {

				// $event_counts structure [gridView, expand, shop, order, asoView] 
				
				// create event counts array initialised with count=1 for that event
				if ($e['type'] == "gridView"){
					$event_counts = array(1, 0, 0, 0, 0);
				}
				 else if ($e['type'] == "expand"){
						if($e['referrer'] == "email"){
							$event_counts = array(0, 0, 0, 0, 1);
						}
						else{
							$event_counts = array(0, 1, 0, 0, 0);
						}
				}
				 else if ($e['type'] == "shop"){
					$event_counts = array(0, 0, 1, 0, 0); 
				} 
				else if ($e['type'] == "order") {
					$event_counts = array(0, 0, 0, 1, 0);
				}
				else $event_counts = array(0, 0, 0, 0, 0);
				
				//now create the entry for this date in the main events_by_date array
				$events_by_date[$date] = $event_counts;
			}
			
			// otherwise, if we already have an array for this date, update that entry
			else {
				
				// get the events for this date
				$existing_event_counts = $events_by_date[$date];

				// update this event's count in the event counts array
				if ($e['type'] == "gridView") {
					if (isset($existing_event_counts[0])) {
						$existing_event_counts[0] = ++$existing_event_counts[0];
					}
				} 
				else if ($e['type'] == "expand") {
					if($e['referrer'] == "email"){
						if (isset($existing_event_counts[4])) {
							$existing_event_counts[4] = ++$existing_event_counts[4];
						}
					}
					else{
						if (isset($existing_event_counts[1])) {
							$existing_event_counts[1] = ++$existing_event_counts[1];
						}
					}
				} 
				else if ($e['type'] == "shop") {
					if (isset($existing_event_counts[2])) {
						$existing_event_counts[2] = ++$existing_event_counts[2];
					}
				}
				 else if ($e['type'] == "order") {
					if (isset($existing_event_counts[3])) {
						$existing_event_counts[3] = ++$existing_event_counts[3];
					}
				} 

				// replace the array with the updated one
				$events_by_date[$date] = $existing_event_counts;
			}
		}
		
		// sort the array by date
		uksort($events_by_date, function($a, $b) {
			return strtotime($a) - strtotime($b);
		});




		/************************************************
		* 												*
		* 												*
		* 					ORDERS 	 					*
		* 												*
		* 												*
		************************************************/

		// get all orders
		$orders = $wpdb->get_results("SELECT DISTINCT order_id, created, session_id, order_amount, currency, platform, browsername, cookieEnabled, version FROM oculizm_orders WHERE client_id = " . $client_id . " AND created>='" . $since ."' AND created<='". $now_date ."'", ARRAY_A);

		// remove array keys
		$orders_without_keys = array_values($orders);

		// for each order...
		foreach ($orders_without_keys as $order) {

			// get order date and currency
			$order['created'] = date("d M", strtotime(substr($order['created'], 0, 10)));
			$order_date = date("d M", strtotime(substr($order['created'], 0, 10)));
			$currency = $order['currency'];


			// if this currency is already in this array...
			if (array_key_exists($currency, $orders_by_currency)) {

				// ORDERS - get this currency's dates array and if there's already a value for this date, increment it and set it
				$this_currencys_dates_array = $orders_by_currency[$currency];
				if (isset($this_currencys_dates_array[$order_date])) {
					$this_currencys_dates_array[$order_date] = $this_currencys_dates_array[$order_date]+1;
				}
				$orders_by_currency[$currency] = $this_currencys_dates_array;

				// SALES - get this currency's dates array and if there's already a value for this date, increment it and set it
				$this_currencys_dates_array = $sales_by_currency[$currency];
				if (isset($this_currencys_dates_array[$order_date])) {
					$this_currencys_dates_array[$order_date] = round($this_currencys_dates_array[$order_date] + $order['order_amount'], 2);
				}
				$sales_by_currency[$currency] = $this_currencys_dates_array;
			}
			// else...
			else {
				// ORDERS
				$new_array_of_dates = array();
				foreach($dates as $d) {
					$new_array_of_dates[$d] = 0;
				}
				if (isset($new_array_of_dates[$order_date])) {
					$new_array_of_dates[$order_date] = $new_array_of_dates[$order_date]+1;
				}
				$orders_by_currency[$currency] = $new_array_of_dates;

				// SALES
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

		usort($orders_without_keys, function($a, $b) {
			$datetime1 = strtotime($a['created']);
			$datetime2 = strtotime($b['created']);
			return $datetime2 - $datetime1;
		});




		/************************************************
		* 												*
		* 												*
		* 					Conversion Rate 	 		*
		* 												*
		* 												*
		************************************************/

		// get the rates file
  		$rates_json = file_get_contents(ABSPATH."wp-content/uploads/data/rates.json");
		$rates = json_decode($rates_json);

		/************************************************
		* 												*
		* 												*
		* 					Visit Conversion Rate 	 		*
		* 												*
		* 												*
		************************************************/

		//get distinct session id's with an order and grid views 
		$gv_order_session_ids = $wpdb->get_results("SELECT DISTINCT oculizm_orders.session_id FROM oculizm_orders LEFT JOIN oculizm_events ON oculizm_orders.session_id = oculizm_events.session_id  AND oculizm_orders.client_id = '$client_id' WHERE oculizm_events.type='gridView' AND oculizm_events.created >= (CURDATE() - INTERVAL 1 MONTH )", ARRAY_A);

		//get all grid views session id's
		$all_grid_view_sessions = $wpdb->get_results("SELECT DISTINCT session_id  FROM oculizm_events WHERE client_id = '$client_id'  AND type='gridView' AND created >= (CURDATE() - INTERVAL 1 MONTH  )", ARRAY_A);

		//get distinct session id's with an order and grid views count
		if(!empty($gv_order_session_ids)){
			$gv_order_session_ids_count = count($gv_order_session_ids);
		}

		//get all grid views session id's count
		if(!empty($all_grid_view_sessions)){
			$all_grid_view_sessions_count = count($all_grid_view_sessions);
		}

		// work out the Visit conversion rate
		if((!empty($gv_order_session_ids)) && (!empty($all_grid_view_sessions))){
			$sg_visit_conversion_rate = ($gv_order_session_ids_count / $all_grid_view_sessions_count)*100;
		}
		if((empty($gv_order_session_ids)) || (empty($all_grid_view_sessions))) {
			$sg_visit_conversion_rate = 0;
		}

		/************************************************
		* 												*
		* 												*
		* 					Email Click Conversion Rate 	 		*
		* 												*
		* 												*
		************************************************/

		//get distinct session id's with an order and referrer equal email 
		$email_order_session_ids = $wpdb->get_results("SELECT DISTINCT oculizm_orders.session_id FROM oculizm_orders LEFT JOIN oculizm_events ON oculizm_orders.session_id = oculizm_events.session_id  AND oculizm_orders.client_id = '$client_id' WHERE oculizm_events.referrer='email' AND oculizm_events.created >= (CURDATE() - INTERVAL 1 MONTH )", ARRAY_A);

		//get all referrer equal email session id's
		$all_email_clicks_session_ids = $wpdb->get_results("SELECT DISTINCT session_id  FROM oculizm_events WHERE client_id = '$client_id'  AND referrer='email' AND created >= (CURDATE() - INTERVAL 1 MONTH  )", ARRAY_A);

		//get distinct session id's with an order and referrer equal email count
		if(!empty($email_order_session_ids)){
			$email_order_session_ids_count = count($email_order_session_ids);
		}

		//get all referrer equal email session id's count
		if(!empty($all_email_clicks_session_ids)){
			$all_email_clicks_session_ids_count = count($all_email_clicks_session_ids);
		}

		// work out the Email Click conversion rate
		if((!empty($email_order_session_ids)) && (!empty($all_email_clicks_session_ids))){
			$email_click_conversion_rate = ($email_order_session_ids_count / $all_email_clicks_session_ids_count)*100;
		}
		if((empty($email_order_session_ids)) || (empty($all_email_clicks_session_ids))) {
			$email_click_conversion_rate = 0;
		}



		/************************************************
		* 												*
		* 												*
		* 					Homepage Widget Conversion Rate 	 		*
		* 												*
		* 												*
		************************************************/

		//get distinct session id's with an order and Homepage Widget event 
		$hw_order_session_ids = $wpdb->get_results("SELECT DISTINCT oculizm_orders.session_id FROM oculizm_orders LEFT JOIN oculizm_events ON oculizm_orders.session_id = oculizm_events.session_id  AND oculizm_orders.client_id = '$client_id' WHERE (oculizm_events.type='hwLightboxOpen' || oculizm_events.type='hwNav' || oculizm_events.type='hwLightboxNav') AND oculizm_events.created >= (CURDATE() - INTERVAL 1 MONTH )", ARRAY_A);

		//get all Homepage Widget events session id's
		$hw_events_session_ids = $wpdb->get_results("SELECT DISTINCT session_id  FROM oculizm_events WHERE client_id = '$client_id'  AND (type='hwLightboxOpen' || type='hwNav' || type='hwLightboxNav') AND created >= (CURDATE() - INTERVAL 1 MONTH  )", ARRAY_A);

		//get distinct session id's with an order and Homepage Widget event count
		if(!empty($hw_order_session_ids)){
			$hw_order_session_ids_count = count($hw_order_session_ids);
		}

		//get all Homepage Widget events session id's count
		if(!empty($hw_events_session_ids)){
			$hw_events_session_ids_count = count($hw_events_session_ids);
		}

		// work out the Homepage Widget conversion rate
		if((!empty($hw_order_session_ids)) && (!empty($hw_events_session_ids))){
			$hw_conversion_rate = ($hw_order_session_ids_count / $hw_events_session_ids_count)*100;
		}
		if((empty($hw_order_session_ids)) || (empty($hw_events_session_ids))) {
			$hw_conversion_rate = 0;
		}

		/************************************************
		* 												*
		* 												*
		* 					PPG Conversion Rate 	 		*
		* 												*
		* 												*
		************************************************/

		//get distinct session id's with an order and PPG event 
		$ppg_order_session_ids = $wpdb->get_results("SELECT DISTINCT oculizm_orders.session_id FROM oculizm_orders LEFT JOIN oculizm_events ON oculizm_orders.session_id = oculizm_events.session_id  AND oculizm_orders.client_id = '$client_id' WHERE (oculizm_events.type='ppgLightboxOpen' || oculizm_events.type='ppgNav' || oculizm_events.type='ppgLightboxNav') AND oculizm_events.created >= (CURDATE() - INTERVAL 1 MONTH )", ARRAY_A);

		//get all PPG events session id's
		$ppg_events_session_ids = $wpdb->get_results("SELECT DISTINCT session_id  FROM oculizm_events WHERE client_id = '$client_id'  AND (type='ppgLightboxOpen' || type='ppgNav' || type='ppgLightboxNav') AND created >= (CURDATE() - INTERVAL 1 MONTH  )", ARRAY_A);

		//get distinct session id's with an order and PPG event count
		if(!empty($ppg_order_session_ids)){
			$ppg_order_session_ids_count = count($ppg_order_session_ids);
		}

		//get all PPG events session id's count
		if(!empty($ppg_events_session_ids)){
			$ppg_events_session_ids_count = count($ppg_events_session_ids);
		}

		// work out the PPG conversion rate
		if((!empty($ppg_order_session_ids)) && (!empty($ppg_events_session_ids))){
			$ppg_conversion_rate = ($ppg_order_session_ids_count / $ppg_events_session_ids_count)*100;
		}
		if((empty($ppg_order_session_ids)) || (empty($ppg_events_session_ids))) {
			$ppg_conversion_rate = 0;
		}

		/************************************************
		* 												*
		* 												*
		* 					Shoppable gallery Conversion Rate 	 		*
		* 												*
		* 												*
		************************************************/

			//get distinct session id's with an order and Shoppable gallery event 
			$sg_order_session_ids = $wpdb->get_results("SELECT DISTINCT oculizm_orders.session_id FROM oculizm_orders LEFT JOIN oculizm_events ON oculizm_orders.session_id = oculizm_events.session_id  AND oculizm_orders.client_id = '$client_id' WHERE (oculizm_events.type='sgLightboxNav' || oculizm_events.type='expand' || oculizm_events.type='gridView' || oculizm_events.type='loadMore') AND oculizm_events.created >= (CURDATE() - INTERVAL 1 MONTH )", ARRAY_A);

			//get all Shoppable gallery events session id's
			$sg_events_session_ids = $wpdb->get_results("SELECT DISTINCT session_id  FROM oculizm_events WHERE client_id = '$client_id'  AND (type='sgLightboxNav' || type='expand' || type='gridView' || type='loadMore') AND created >= (CURDATE() - INTERVAL 1 MONTH  )", ARRAY_A);
	
			//get distinct session id's with an order and Shoppable gallery event count
			if(!empty($sg_order_session_ids)){
				$sg_order_session_ids_count = count($sg_order_session_ids);
			}
	
			//get all Shoppable gallery events session id's count
			if(!empty($sg_events_session_ids)){
				$sg_events_session_ids_count = count($sg_events_session_ids);
			}
	
			// work out the Shoppable gallery conversion rate
			if((!empty($sg_order_session_ids)) && (!empty($sg_events_session_ids))){
				$sg_interaction_conversion_rate = ($sg_order_session_ids_count / $sg_events_session_ids_count)*100;
			}
			if((empty($sg_order_session_ids)) || (empty($sg_events_session_ids))) {
				$sg_interaction_conversion_rate = 0;
			}

			/************************************************
		* 												*
		* 												*
		* 					Total Shoppable Sessions 	 		*
		* 												*
		* 												*
		************************************************/

			//get Total Shoppable Distinct session id's
			$total_distinct_session_ids = $wpdb->get_results("SELECT DISTINCT session_id  FROM oculizm_events WHERE client_id = '$client_id'  AND created >= (CURDATE() - INTERVAL 1 MONTH  )", ARRAY_A);
	
			//get Total Shoppable Distinct session id'scount
			if(!empty($total_distinct_session_ids)){
				$total_distinct_session_ids_count = count($total_distinct_session_ids);
			}
			if(empty($total_distinct_session_ids)){
				$total_distinct_session_ids_count = 0;
			}





		/************************************************
		* 												*
		* 												*
		* 					Touchpoints 	 			*
		* 												*
		* 												*
		************************************************/

		$distinct_events = $wpdb->get_results("SELECT COUNT(DISTINCT session_id) as distinct_events_count , type FROM oculizm_events WHERE client_id = " . $client_id . " AND type!='order'   AND created >= (CURDATE() - INTERVAL 1 MONTH ) GROUP BY type ORDER BY type ASC", ARRAY_A);
		if(!empty($distinct_events[0]['distinct_events_count'])){
			$touchpoints['distinct_expand_events'] = $distinct_events[0]['distinct_events_count'];
		}
		else{
			$touchpoints['distinct_expand_events'] = 0;
		}
		if(!empty($distinct_events[1]['distinct_events_count'])){
			$touchpoints['distinct_gridView_events'] = $distinct_events[1]['distinct_events_count'];
		}
		else{
			$touchpoints['distinct_gridView_events'] = 0;
		}
		if(!empty($distinct_events[2]['distinct_events_count'])){
			$touchpoints['distinct_shop_events'] = $distinct_events[2]['distinct_events_count'];
		}
		else{
			$touchpoints['distinct_shop_events'] = 0;
		}




		/************************************************
		* 												*
		* 												*
		* 				TOTAL ASSISTED SALES 	 		*
		* 												*
		* 												*
		************************************************/

		// get the primary region
		$regions_file = ABSPATH."wp-content/themes/oculizm/data/regions.json";
		$feeds = $wpdb->get_results("SELECT region FROM oculizm_product_feeds WHERE client_id = " . $client_id, ARRAY_A);
	    if (file_exists($regions_file) && count($feeds) > 0) {
	    	$regions_json = file_get_contents($regions_file);
			$regions = json_decode($regions_json , true); 
			$client_region = $feeds[0]['region'];
 			$region_index = array_search($client_region, array_column($regions, 'code'));
			$default_client_currency = $regions[$region_index]['currency_code'];

			// convert the currency symbol HTML entity into plain text 
			// TBC: update the regions.json file to include it instead!
			$primary_currency_code = $regions[$region_index]['currency_code'];
			if ($primary_currency_code === "GBP") $primary_currency_symbol = "£";
			if ($primary_currency_code === "USD") $primary_currency_symbol = "$";
			if ($primary_currency_code === "EUR") $primary_currency_symbol = "€";
	    }

		// get the total sales for each currency
		foreach ($sales_by_currency as $key=>$single_currency_array) {
			$tally = 0;
			foreach($single_currency_array as $single_order_total) {
				$tally += $single_order_total;
			}
			$total_sales_by_currency[$key] = $tally;
		}

		// go through the total sales for each currency...
		$total_assisted_sales_in_primary_currency = 0;
		foreach($total_sales_by_currency as $key=>$single_currency_total) {

			$tally = 0;
			$this_currency_index = array_search($key, $rates[0]);
			$primary_currency_index = array_search($default_client_currency, $rates[0]);

			// get the rate
			// the file_get_contents() function we use to get the rates above converts floats with more than 5 decimal places into horrible notation 
			// eg "5.2-e5" which is actually valid PHP representation for floats. Use number_float() to convert it to normal decimal notation
			$rate = number_format($rates[$this_currency_index][$primary_currency_index], 6);

		 	// convert to primary currency
			$tally = $single_currency_total*$rate;
			// add to total
			$total_assisted_sales_in_primary_currency += $tally;
		}
		



		/************************************************
		* 												*
		* 												*
		* 				METRIC BOXES 		 	 		*
		* 												*
		* 												*
		************************************************/

		// METRIC
		$metric = array(
			'title' => "Assisted Orders",
			'format' => "count",
			'highlight_value' => count($orders_without_keys),
			'highlight_prefix' => "",
			'highlight_suffix' => "Orders",
			'description' => "Total number of orders assisted by shoppable content, including shoppable gallery views and lightbox interactions"
		);
		array_push($response['data']['metrics'], $metric);
		
		if (!empty($default_client_currency)) {
			$result['total_assisted_sales_in_primary_currency'][$default_client_currency] = $total_assisted_sales_in_primary_currency;

			// METRIC
			$metric = array(
				'title' => "Assisted Sales",
				'format' => "currency",
				'highlight_value' => $total_assisted_sales_in_primary_currency,
				'highlight_prefix' => $primary_currency_symbol,
				'highlight_suffix' => "",
				'description' => "Total number of sales assisted by shoppable content, including shoppable gallery views and lightbox interactions"
			);
			array_push($response['data']['metrics'], $metric);
			
			// METRIC
			$metric = array(
				'title' => "Average Order Value",
				'format' => "currency",
				'highlight_value' => 0,
				'highlight_prefix' => $primary_currency_symbol,
				'highlight_suffix' => "",
				'description' => "Average value of an order assisted by shoppable content"
			);
			if (count($orders_without_keys) > 0) {
				$metric['highlight_value'] = $total_assisted_sales_in_primary_currency/count($orders_without_keys);
			}
			array_push($response['data']['metrics'], $metric);
		}
		
		// METRIC
		$metric = array(
			'title' => "Total Shoppable Sessions",
			'format' => "count",
			'highlight_value' => $total_distinct_session_ids_count,
			'highlight_prefix' => "",
			'highlight_suffix' => "Sessions",
			'description' => "Total number of sessions interacting with shoppable content"
		);
		array_push($response['data']['metrics'], $metric);
		
		// METRIC
		$metric = array(
			'title' => "Homepage Widget Conversion",
			'format' => "percent",
			'highlight_value' => $hw_conversion_rate,
			'highlight_prefix' => "",
			'highlight_suffix' => "%",
			'description' => "Conversion rate if there was interaction with the homepage widget"
		);
		array_push($response['data']['metrics'], $metric);
		
		// METRIC
		$metric = array(
			'title' => "Shoppable Gallery Conversion",
			'format' => "percent",
			'highlight_value' => $sg_interaction_conversion_rate,
			'highlight_prefix' => "",
			'highlight_suffix' => "%",
			'description' => "Conversion rate if there was interaction with the shoppable gallery page"
		);
		array_push($response['data']['metrics'], $metric);
		
		// METRIC
		$metric = array(
			'title' => "Product Page Widget Conversion",
			'format' => "percent",
			'highlight_value' => $ppg_conversion_rate,
			'highlight_prefix' => "",
			'highlight_suffix' => "%",
			'description' => "Conversion rate if there was interaction with the product page gallery"
		);
		array_push($response['data']['metrics'], $metric);
		
		// METRIC
		$metric = array(
			'title' => "Shoppable Email Conversion",
			'format' => "percent",
			'highlight_value' => $email_click_conversion_rate,
			'highlight_prefix' => "",
			'highlight_suffix' => "%",
			'description' => "Conversion rate if a shoppable gallery link was clicked in an email"
		);
		array_push($response['data']['metrics'], $metric);
		




		$res = $result;
		// file_put_contents($clients_stats_cache_file, json_encode($res));
 }
	else {
		$res = file_get_contents($clients_stats_cache_file);
	}

	$response['data']['summary_stats'] = $res;
	return json_encode($response);
}


// fetch posts
function app_fetch_posts($request) {

	oLog("*** APP REQUEST: app_fetch_posts ***");
	oLog($request['auth_token']);

	$response = array();
	$user;

	// validate auth token
	if (isset($request['auth_token']) && !empty($request['auth_token'])) {
		$auth_token = $request['auth_token'];
		$users = get_users(
			array(
				'meta_key' => 'auth_token',
				'meta_value' => $auth_token,
				'number' => 1,
				'count_total' => false
			)
		);
		$user = $users[0];
	}
	else {
		$response['error'] = "Invalid auth token";
    	return json_encode($response);
	}
	if (!$user) {
		$response['error'] = "User not found";
    	return json_encode($response);
	}

    // get the client ID
    $client_id = get_field('client_id', 'user_' . $user->ID);
    if (!$client_id) {
    	$response['error'] = "Failed to get client ID";
    	return json_encode($response);
    }

    global $wpdb;

	$gallery_id = (isset($request['galleryID']) && !empty($request['galleryID'])) ? filter_var($request['galleryID'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 1))) : json_encode("");

	 // check if region was supplied
	$region = "";
	if (isset($request['region']) && !empty($request['region']) &&  $request['region'] != null) {
		$region = strtolower($request['region']);
	}
	// sanitise
	$region = sanitise_lower_case_letters($region);

	// get this client's product feeds
	$product_feeds = $wpdb->get_results("SELECT region, shop_link FROM oculizm_product_feeds WHERE client_id=$client_id", ARRAY_A);

	// get the shop link
	$shop_link = "";
	if (sizeof($product_feeds) == 0) {} // no feeds? no shop link
	else if (sizeof($product_feeds) == 1) $shop_link = $product_feeds[0]['shop_link']; // single region
	else if (sizeof($product_feeds) > 1) { // multi region
		foreach ($product_feeds as $pf) {
			if ($region == strtolower($pf['region'])) $shop_link = $pf['shop_link'];
		}
	}

	// get all this client's galleries
	$galleries = $wpdb->get_results("SELECT * FROM oculizm_galleries WHERE CLIENT_ID = " . $client_id, ARRAY_A);

	// count & offset
	$count = 24;
	if (isset($request['count'])) {
		if ($request['count'] != null) $count = $request['count'];
	}
	$count = sanitise_int($count);

	$offset = 0;
	if (isset($request['offset']))  $offset = $request['offset'];
	$offset = sanitise_int($offset);

	// build the query
	$args = array(
		'meta_key' => 'client_id', 
		'meta_value' => $client_id, 
		'post_type' => 'post', 
		'posts_per_page' => -1, 
		'post_status' => 'publish',
    	// 'post__in' => get_option('sticky_posts'),
	    // 'ignore_sticky_posts' => 1
	);

	$counter = 0;
	$posts = array();
	$the_query = new WP_Query($args);

	if ($the_query->have_posts()){
		while ($the_query->have_posts()) {
			$the_query->the_post();

			// WEIRD BEHAVIOUR ALERT
			// WP_Query will return sticky posts in all queries. I tried the solution in the below article but it didn't work.
			// So here we need another check for the post's actual client ID
			// https://wordpress.stackexchange.com/questions/192251/all-sticky-posts-are-returned-in-custom-query
			if ($client_id != get_field('client_id')) continue;

			$video_url = "";
			$image = "";

			// always return $count posts, when we reach $count we quit the loop
			if (count($posts) >= $count) break;
				
			// get the post's galleries
			$pg_string = get_field('galleries');
			// turn the comma separated list of gallery IDs into an array
			$pg_array = explode(",", $pg_string);
			// check if the array contains the supplied gallery ID
			$key = array_search($gallery_id, $pg_array);

			// and if this post is in the requested gallery...
			// if ($key !== false) {

			// for the App API we want it to be able to handle the case where no gallery ID is supplied
			if (true) {

				// if we still have a number of items we need to skip...
				if ($offset > 0) {
					$offset--;
					continue;
				}

				// get the post's matched products
				$products = get_field('matched_products');

				// build a region-specific products list
				if (is_array($products) || is_object($products)) {
					$products = trim_matched_products_for_region($products, $region);
				}

				// get the featured image
				$tn_id = get_post_meta(get_the_ID(), '_thumbnail_id', true);
				if (isset($use_thumb)){
					if ($use_thumb == 1) $thumb = wp_get_attachment_image_src( $tn_id, 'thumbnail' )[0];
					else $thumb = wp_get_attachment_image_src( $tn_id, 'large' )[0];
				}
				else $thumb = wp_get_attachment_image_src( $tn_id, 'large' )[0];
				$image = wp_get_attachment_image_src( $tn_id, 'large' )[0];

				// now check for the featured image's thumbnail ID (this is where we store a video if there is one)
				$vid_id = get_post_meta($tn_id, '_thumbnail_id', true);
				$video_url = wp_get_attachment_url($vid_id);

				// for videos created using the create page
				if ($image == null) {
					$image = wp_get_attachment_url($tn_id);
					$thumb = wp_get_attachment_url($tn_id);
					$video_url = $image;
				}

				// get the image alt text
				$image_alt_text = get_field('image_alt_text');

				// build the social link
				$social_network = get_field('social_network');
				$social_id = get_field('social_id');
				$source_url = get_field('source_url');
				if ($social_network != "instagram" &&  $social_network != "twitter") $source_url = "";
				// $social_url = get_social_url($social_network, $social_id);
				
				// now add the POST's shop link
				$post_shop_link = $shop_link . "?oculizm_post_id=" . get_the_ID();

	            // date
	            $date = get_the_time('U');
	            $date_diff = human_time_diff($date, current_time('timestamp'), 1);
	            
	            // author
	            $author_name = get_the_author();

				// build the post object
				$post = array(
					'post_id' => get_the_ID(),
					'post_title' => html_entity_decode(get_the_title()),
					// 'permalink' => get_the_permalink(),
					'caption' => get_the_content(),
					// 'is_sticky' => is_sticky(),
					// 'post_shop_link' => $post_shop_link,
					'social_network' => $social_network,
					// 'image_alt_text' => $image_alt_text,
					// 'social_id' => $social_id,
					// 'social_url' => $source_url,
					'image_url' => $image,
					// 'thumb_url' => $thumb,
					'video_url' => $video_url,
					// 'products' => $products,
					'likes' => 'TBC',
					'date' => $date,
					'date_diff' => $date_diff,
					'author_name' => $author_name
				);
			
				array_push($posts, $post);
			}
		}
		wp_reset_postdata();
	}

	$response['data'] = $posts;
	// oLog($response);

	return json_encode($response);
}


// fetch reviews
function app_fetch_reviews($request) {

	oLog("*** APP REQUEST: app_fetch_reviews ***");
	oLog($request['auth_token']);

	$response = array();
	$user;

	// validate auth token
	if (isset($request['auth_token']) && !empty($request['auth_token'])) {
		$auth_token = $request['auth_token'];
		$users = get_users(
			array(
				'meta_key' => 'auth_token',
				'meta_value' => $auth_token,
				'number' => 1,
				'count_total' => false
			)
		);
		$user = $users[0];
	}
	else {
		$response['error'] = "Invalid auth token";
    	return json_encode($response);
	}
	if (!$user) {
		$response['error'] = "User not found";
    	return json_encode($response);
	}

    // get the client ID
    $client_id = get_field('client_id', 'user_' . $user->ID);
    if (!$client_id) {
    	$response['error'] = "Failed to get client ID";
    	return json_encode($response);
    }

    global $wpdb;

	// get all this client's reviews
	$reviews = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE CLIENT_ID = " . $client_id . " AND status = 'published' ORDER BY created DESC", ARRAY_A);

	// MUTATIVE FOR LOOP!!!
	foreach ($reviews as &$r) {
		$created = $r['created'];
        $date_formatted = DateTime::createFromFormat('Y-m-d H:i:s', $created);
        $timestamp = $date_formatted->getTimestamp();
        $date_diff = human_time_diff($timestamp, current_time('timestamp'), 1);
        $r['date_diff'] = $date_diff;
	}

	// count & offset
	$count = 24;
	if (isset($request['count'])) {
		if ($request['count'] != null) $count = $request['count'];
	}
	$count = sanitise_int($count);

	$offset = 0;
	if (isset($request['offset']))  $offset = $request['offset'];
	$offset = sanitise_int($offset);

	$response['data'] = $reviews;

	return json_encode($response);
}


// fetch products
function app_fetch_products($request) {

	oLog("*** APP REQUEST: app_fetch_products ***");
	oLog($request['auth_token']);

	$response = array();
	$user;

	// validate auth token
	if (isset($request['auth_token']) && !empty($request['auth_token'])) {
		$auth_token = $request['auth_token'];
		$users = get_users(
			array(
				'meta_key' => 'auth_token',
				'meta_value' => $auth_token,
				'number' => 1,
				'count_total' => false
			)
		);
		$user = $users[0];
	}
	else {
		$response['error'] = "Invalid auth token";
    	return json_encode($response);
	}
	if (!$user) {
		$response['error'] = "User not found";
    	return json_encode($response);
	}

    // get the client ID
    $client_id = get_field('client_id', 'user_' . $user->ID);
    if (!$client_id) {
    	$response['error'] = "Failed to get client ID";
    	return json_encode($response);
    }

    $results = array();
    $matchedProductsIds = array();

    global $wpdb;

    // get a full list of this client's products
    $products = $wpdb->get_results("SELECT * FROM oculizm_products WHERE CLIENT_ID = " . $client_id . " ORDER BY ID ASC", ARRAY_A);


    // get all this client's posts
    $args = array('meta_key' => 'client_id', 'orderby' => 'publish_date', 'order' => 'DESC', 'meta_value' => $client_id, 'post_type' => 'post', 'posts_per_page' => -1, 'post_status' => 'publish');
	$the_query = new WP_Query($args);

    if ($the_query->have_posts()){
        while ($the_query->have_posts()) {
                            
            $the_query->the_post();
            
            // get the matched products
            $matched_products = get_field('matched_products');

            if (is_array($matched_products) || is_object($matched_products)) {

                for($i = 0; $i <count($matched_products); $i++) {

                    // get the Product IDs of matched products
                    $mpid = array('product_id' => $matched_products[$i]['product_id']);
            
                    // Funky Chunky Furniture matches by SKU
                    if ($client_id == "71950") {
                        $mpid = array('product_id' => $matched_products[$i]['sku']);
                    }
                    array_push($matchedProductsIds, $mpid);
                }
            }
        }
        wp_reset_postdata();
    }

    // get the products on this page
    $page = 1;
    if (ISSET($request['page'])) $page = $request['page'];
    $limit = 96;
    $starting_index = ($page-1) * $limit;
    $products_on_this_page = array_slice($products, $starting_index, $limit);

    // for each product on this page...
    foreach ($products_on_this_page as &$p) {

        $counter = 0;

        $pId = $p['product_id'];

        // Funky Chunky Furniture matches by SKU
        if ($client_id == "71950") {
            $pId = $p['sku'];
        }

        // calculate the number of matching posts for each product
        if (is_array($matchedProductsIds) || is_object($matchedProductsIds)) {				
            foreach ($matchedProductsIds as $key=>$productId) {
                if ($counter < 99) { // max tagged of 99
                    if ($productId["product_id"] == $pId) {
                        $counter++;
                    }  
                }
                else continue;
            }
        }
        else continue;
        
        $p['num_tagged_posts'] = $counter;
    }

    $results['products'] = $products_on_this_page;
    $results['matchedProductsIds'] = $matchedProductsIds;
    $results['total'] = sizeof($products);
    // $results['allClientProducts'] = $products;
    $results['starting_index'] = $starting_index;
    $results['limit'] = $limit;

	$response['data'] = $results;

	return json_encode($response);
}


// fetch support tickets
function app_fetch_support_tickets($request) {

	oLog("*** APP REQUEST: app_fetch_support_tickets ***");
	oLog($request['auth_token']);

	$response = array();
	$user;

	// validate auth token
	if (isset($request['auth_token']) && !empty($request['auth_token'])) {
		$auth_token = $request['auth_token'];
		$users = get_users(
			array(
				'meta_key' => 'auth_token',
				'meta_value' => $auth_token,
				'number' => 1,
				'count_total' => false
			)
		);
		$user = $users[0];
	}
	else {
		$response['error'] = "Invalid auth token";
    	return json_encode($response);
	}
	if (!$user) {
		$response['error'] = "User not found";
    	return json_encode($response);
	}

    // get the client ID
    $client_id = get_field('client_id', 'user_' . $user->ID);
    if (!$client_id) {
    	$response['error'] = "Failed to get client ID";
    	return json_encode($response);
    }

    global $wpdb;

    // get this client's support tickets
    $support_tickets = $wpdb->get_results("SELECT * FROM oculizm_support_tickets WHERE CLIENT_ID = " . $client_id . " ORDER BY ID DESC", ARRAY_A);

    // get this client's support ticket items
    $support_ticket_items = $wpdb->get_results("SELECT * FROM oculizm_support_ticket_items WHERE CLIENT_ID = " . $client_id, ARRAY_A);

    // for each support ticket (MUTATIVE FOR LOOP)
    foreach($support_tickets as &$st) {

    	// get the date diff
		$last_updated = $st['last_updated'];
        $date_formatted = DateTime::createFromFormat('Y-m-d H:i:s', $last_updated);
        $timestamp = $date_formatted->getTimestamp();
        $date_diff = human_time_diff($timestamp, current_time('timestamp'), 1);
        $st['date_diff'] = $date_diff;

        // create a new array for its support ticket items
        $this_ticket_items = [];
        foreach($support_ticket_items as $sti) {
            if ($sti['ticket_id'] == $st['id']) array_push($this_ticket_items, $sti);
        }

        $st['items'] = $this_ticket_items;
    }

    $response['data'] = $support_tickets;

	return json_encode($response);
}


// create support ticket
function app_create_support_ticket($request) {

	global $wpdb;

	oLog("*** APP REQUEST: app_create_support_ticket ***");

	$response = array();
	$user;

	// validate auth token
	if (isset($request['auth_token']) && !empty($request['auth_token'])) {
		$auth_token = $request['auth_token'];
		$users = get_users(
			array(
				'meta_key' => 'auth_token',
				'meta_value' => $auth_token,
				'number' => 1,
				'count_total' => false
			)
		);
		$user = $users[0];
	}
	else {
		$response['error'] = "Invalid auth token";
    	return json_encode($response);
	}
	if (!$user) {
		$response['error'] = "User not found";
    	return json_encode($response);
	}

    // get the client ID
    $client_id = get_field('client_id', 'user_' . $user->ID);
    if (!$client_id) {
    	$response['error'] = "Failed to get client ID";
    	return json_encode($response);
    }

    $subject = $request['subject'];
    $message = $request['message'];

    // remove the backslash from the subject and the message
    $subject = stripslashes($subject);
    $message = stripslashes($message);

    // check the fields exist
    if ($subject && $message) {

        $time = time();
        $created = date('Y-m-d H:i:s', $time);
        $last_updated = date('Y-m-d H:i:s', $time);

        // create the parent support ticket
        $row = array(
            "client_id" => $client_id,
            "subject" => $subject,
            "status" => "open",
            "created" => $created,
            "last_updated" => $last_updated,
        );
        $insert_result_1 = $wpdb->insert('oculizm_support_tickets', $row);

        $support_ticket_id = $wpdb->insert_id;

        // get the author
        $author = $user->user_firstname . " " . $user->user_lastname;

        // create the support ticket message
        $row = array(
            "client_id" => $client_id,
            "message" => $message,
            "created" => $created,
            "author" => $author,
            "ticket_id" => $support_ticket_id,
        );
        $insert_result_2 = $wpdb->insert('oculizm_support_ticket_items', $row);

        if ($insert_result_1 && $insert_result_2) {

            // get this support ticket from the DB
            $result = $wpdb->get_row("SELECT * FROM oculizm_support_tickets WHERE ID = " . $support_ticket_id);

            // construct email
            $email_title = 'New Oculizm Support Ticket: ' . $subject . '(' . $client_id . ')';
            $email_message = "An Oculizm support ticket has been opened:<br><br><i>" . $message . "</i><br><br>Please <a href='" . site_url() . "'>log in</a> to view the ticket.";

            // send admin emails
            $admin_email_result = oEmail('sean@oculizm.com', $email_title, $email_message);
            $admin_email_result = oEmail('anthony@oculizm.com', $email_title, $email_message);

            // send client email
            $client_email = $user->user_email;
            $client_email_result = oEmail($client_email, $email_title, $email_message);
        }

        $debug = array(
            "insert_result_1" => $insert_result_1,
            "insert_result_2" => $insert_result_2,
            "support_ticket_id" => $support_ticket_id,
            "admin_email_result" => $admin_email_result,
            "client_email_result" => $client_email_result
        );

        // get the support ticket
        $support_ticket = $wpdb->get_results("SELECT * FROM oculizm_support_tickets WHERE ID = " . $support_ticket_id, ARRAY_A);
        $support_ticket = $support_ticket[0];

        // get the support ticket items
        $support_ticket_items = $wpdb->get_results("SELECT * FROM oculizm_support_ticket_items WHERE TICKET_ID = " . $support_ticket_id, ARRAY_A);

        // attach them to the support ticket object
        $support_ticket['items'] = $support_ticket_items;

        $response['data'] = $support_ticket;
    }

	oLog($response);
	return json_encode($response);
}


















/********************* HELPER FUNCTIONS ***********************/
