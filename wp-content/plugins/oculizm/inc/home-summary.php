<?php

// get summary stats
add_action('wp_ajax_get_summary_stats', 'get_summary_stats');
function get_summary_stats() {
 
	global $wpdb;
	ini_set('memory_limit', '1024M');

    $client_id = get_client_id();

	// for react project testing purposes
	$http_origin = get_http_origin();
	if ($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com"){
		$client_id = 12453;
	}
	
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
		


		
		// populate results array
		$result['events_by_date'] = $events_by_date;
		$result['sg_visit_conversion_rate'] = $sg_visit_conversion_rate;
		$result['email_click_conversion_rate'] = $email_click_conversion_rate;
		$result['hw_conversion_rate'] = $hw_conversion_rate;
		$result['ppg_conversion_rate'] = $ppg_conversion_rate;
		$result['sg_interaction_conversion_rate'] = $sg_interaction_conversion_rate;
		$result['total_distinct_session_ids_count'] = $total_distinct_session_ids_count;
		$result['touchpoints'] = $touchpoints;
		$result['total_assisted_orders'] = count($orders_without_keys);
		
		if (!empty($default_client_currency)) {
			$result['total_assisted_sales_in_primary_currency'][$default_client_currency] = $total_assisted_sales_in_primary_currency;
		}
		
		$res = json_encode($result);
		file_put_contents($clients_stats_cache_file, $res);
 }
	else {
		$res = file_get_contents($clients_stats_cache_file);
	}
	echo $res;
	die;
}

// get next steps
add_action('wp_ajax_get_next_steps', 'get_next_steps');
function get_next_steps() {

    global $wpdb;

    $client_id = get_client_id();

    // count the number of products
    $productsCount = $wpdb->get_var( "SELECT COUNT(*) FROM oculizm_products WHERE client_id = " . $client_id );

    // build an array of connections by name of social network
    $connections = $wpdb->get_results("SELECT social_network FROM oculizm_connections WHERE client_id = " . $client_id, ARRAY_A);
    $connectionsNameArray = array();
    foreach ($connections as $connection) {
    	array_push($connectionsNameArray, $connection["social_network"]);
    }

    // check how many posts are in each gallery
    $galleries = $wpdb->get_results("SELECT id, name FROM oculizm_galleries WHERE CLIENT_ID = " . $client_id, ARRAY_A);
    $args = array('post_type' => 'post', 'post_status' => array('draft', 'publish'));

    // for each gallery... (MUTABLE LOOP!)
    foreach ($galleries as &$gallery) {
        $args['meta_query'] = array('relation'=> 'AND',
            array(
                array('key'=>'client_id','value'=>$client_id,'compare'=>'='),
                array('key'=>'galleries','value'=>$gallery['id'],'compare'=>'like')
            )
        );    
        $the_query = new WP_Query($args);
        $gallery['total'] = (int)$the_query->found_posts;
    }

    wp_reset_postdata();

    // get post information
    $posts_query = array('relation'=> 'AND', array(array('key'=> 'client_id','value' => $client_id,'compare'	=> '=')));
    $published_posts = array('post_type' => 'post', 'post_status' => array('publish'));
    $published_posts['meta_query'] = $posts_query;
    $published_posts_query = new WP_Query($published_posts);
    $draft_posts = array('post_type' => 'post', 'post_status' => array('draft'));
    $draft_posts['meta_query'] = $posts_query;
    $draft_posts_query = new WP_Query($draft_posts);
    $all_posts = array('post_type' => 'post', 'post_status' => array('draft', 'publish'));
    $all_posts['meta_query'] = $posts_query;
    $all_posts_query = new WP_Query($all_posts);
    $posts = array(
        "published" => (int)$published_posts_query->found_posts,
        "draft" => (int)$draft_posts_query->found_posts,
        "total" => (int)$all_posts_query->found_posts
    );

    // get the feeds
    $feeds = $wpdb->get_results("SELECT num_products, http_url, ftp_url, region FROM oculizm_product_feeds WHERE client_id = " . $client_id, ARRAY_A);
    $hasFeed = false;
    foreach ($feeds as $feed) {
        if(isset($feed)) {
            if(isset($feed['http_url']) || isset($feed['ftp_url'])) {
                $hasFeed = true;
                break;
            }
        }
    }
				
	// build payload
    $results = array (
        'hasFeed' => $hasFeed,
        'connections' => $connectionsNameArray,
        'productsCount' => (int)$productsCount,
        'galleries' => $galleries,
        'posts' => $posts,
        'clientFeeds' => $feeds
    );

    echo json_encode($results);
    die;
}
