<?php
// get order stats
add_action('wp_ajax_get_order_stats', 'get_order_stats');
function get_order_stats() {
 
	global $wpdb;
	
    $client_id = get_client_id();
				
	//for react project testing purposes
	$http_origin = get_http_origin();
	if($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com"){
		$client_id = 12453;
	}
				
	// cache
    $clients_stats_cache_file = ABSPATH."wp-content/uploads/analytics/".$client_id."_order-data.json";
 	// if (!file_exists($clients_stats_cache_file) || filemtime($clients_stats_cache_file)<(time() - 21600)) {
	if (true) {
		
		// define variables
		$result = array();
		$all_events = array();
		$orders_with_a_grid_view = array();
		$orders_by_currency = array();

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
		$orders = $wpdb->get_results("SELECT DISTINCT order_id, created, session_id, order_amount, currency, platform, browsername, cookieEnabled, payment_method, version FROM oculizm_orders WHERE client_id = " . $client_id . " AND created>'" . $since ."' AND created<='". $now_date ."'", ARRAY_A);

		// get all products
		$client_products = $wpdb->get_results("SELECT sku , link , product_id , image_link FROM oculizm_products WHERE client_id = '$client_id' ", ARRAY_A);
		
		//get all the session id having multiple order ids:
		$session_Ids_With_Multiple_Orders = $wpdb->get_results("SELECT session_id, count(*) AS number_of_order_id FROM oculizm_events WHERE type='order' AND client_id = '$client_id' GROUP BY session_id HAVING count(*) > 1", ARRAY_A);
	
		// for each order...
		foreach($orders as $order) {

		// break if session id does not have more then one event type
		$curentSessionId = $order['session_id'];

			//getting the session ids having multiple order ids
			if (isset($session_Ids_With_Multiple_Orders)) {
				if (isset($curentSessionId)) {
					if (array_search($curentSessionId, array_column($session_Ids_With_Multiple_Orders, 'session_id')) === FALSE) {
						$order['multipleOrdersSessionid'] = false;
					}
					else{
						$order['multipleOrdersSessionid'] = true;
					}
				}
			}
			
			// reformat the date
			$order['createdDate'] = date("d M", strtotime($order['created']));
			$order['createdTime'] = date("H:i:s", strtotime($order['created']));
			
			// get the order items
			$order_items = $wpdb->get_results("SELECT id, order_id, sku, name, price, quantity, client_id, DATE_FORMAT(created,'%d %b') as created, product_id FROM oculizm_order_items  WHERE order_id='" . $order['order_id'] . "'", ARRAY_A);

			$total_price = 0;

			// for each unique order item... (MUTABLE LOOP!)
			foreach ($order_items as &$unique_order_item) {
				$product_name = $unique_order_item['name'];
				
				if (isset($client_products)) {

					if ($client_id != "71950") {

						// set placeholder image if no matching product found and we dont have any match by product title
						if (array_search($unique_order_item['sku'], array_column($client_products, 'product_id')) === FALSE) {
							
							//matching by product title
							$matchedProductTitles = $wpdb->get_results("SELECT image_link FROM oculizm_products WHERE client_id = '$client_id' AND title LIKE '".$product_name."%' ", ARRAY_A);
							
							if ($client_id == "90211") {
								$matchedProductTitles = $wpdb->get_results("SELECT image_link FROM oculizm_products WHERE client_id = '$client_id' AND title LIKE CONCAT('%', SUBSTRING_INDEX('$product_name' , ' - ', 1), '%') ", ARRAY_A);
							}
							// oLog("matchedProductTitles : " . json_encode($matchedProductTitles) . "...");
							// oLog("Product name: {$product_name}\n");
							
							if(!empty($matchedProductTitles)){
								$unique_order_item['product_img_url'] = $matchedProductTitles[0]['image_link'];
							}
							else{
								$unique_order_item['product_img_url'] = "https://app.oculizm.com/wp-content/themes/oculizm/img/no-image.png";
							}
						}

						// else set the product image
						else {
							foreach ($client_products as $client_product) {
								if ($unique_order_item['sku'] === $client_product['product_id']) {
									$unique_order_item['product_img_url'] = $client_product['image_link'];
								}
							}				
						}
					}
					else {
						// set placeholder image if no matching product found and we dont have any match by product title
						if (array_search($unique_order_item['sku'], array_column($client_products, 'sku')) === FALSE) {
							$matchedProductTitles = $wpdb->get_results("SELECT image_link FROM oculizm_products WHERE client_id = '$client_id' AND title LIKE '".$product_name."%' ", ARRAY_A);
							
							//matching by produt title
							if(!empty($matchedProductTitles)){
								$unique_order_item['product_img_url'] = $matchedProductTitles[0]['image_link'];
							}
							else{
								$unique_order_item['product_img_url'] = "https://app.oculizm.com/wp-content/themes/oculizm/img/no-image.png";
							}
						}

						// else set the product image
						else {
							foreach ($client_products as $client_product) {
								if ($unique_order_item['sku'] === $client_product['sku']) {
									$unique_order_item['product_img_url'] = $client_product['image_link'];
								}
							}			
						}
					}
				}

				// calculate the total price of all items (this won't add count fees etc)
				if (!empty($unique_order_item['price'])){
					$single_price = $unique_order_item['quantity'] * $unique_order_item['price'];
					$total_price += $single_price;
				}
			}

			// if the total price we calculated was zero, get it from the order object
			if ($total_price == "0" ||  $client_id == "22586") {
				if (isset($order['order_amount'])) {
					$total_price = $order['order_amount'];
				}
			}
			$order['total_order_amount'] = number_format($total_price,2);

			// add the order items to the order object 
			$order['order_items'] = $order_items;

			array_push($orders_with_a_grid_view, $order);
		}

		// deduplication (why? is this because we receive duplicate order notifications?)
		$orders_with_a_grid_view_tempArr = array_unique(array_column($orders_with_a_grid_view, 'order_id'));

		// get all items in the first array which have a key in common in the second array
	 	$orders_with_a_grid_view_unique = array_intersect_key($orders_with_a_grid_view, $orders_with_a_grid_view_tempArr) ;
		
		// returns all the values from the array (so removes the keys) and indexes the array numerically
		$orders_with_a_grid_view_Array = array_values($orders_with_a_grid_view_unique);

  		// get all events
		$events_results = $wpdb->get_results("SELECT id, type, created, post_id, session_id, client_id, hostname, order_id, sku FROM oculizm_events WHERE client_id = '$client_id' ", ARRAY_A);

		// sort events array by event type
		usort($events_results, function($a, $b) {
			return strcmp($a["type"], $b["type"]);
		});

		// sort events array by created
		usort($events_results, function($a, $b) {
			$datetime1 = strtotime($a['created']);
			$datetime2 = strtotime($b['created']);
				return $datetime1 - $datetime2;
		});
		// for each order (MUTABLE LOOP!)
		foreach($orders_with_a_grid_view_Array as &$order_event) {

			// get the session id and the order id for each order
			$session_id_value = $order_event['session_id'];
			$order_id_value = $order_event['order_id'];
			$event_types = array();

			//for each event in all events (MUTABLE LOOP!)
			foreach($events_results as &$event_result) {

				//if oder session id  is equal to event session id 
				if($session_id_value === $event_result['session_id']){

					$event_result['createdDate'] = date("d M", strtotime($event_result['created']));
					$event_result['createdTime'] = date("H:i:s", strtotime($event_result['created']));

					//adding event_result to a new array of event types
					array_push($event_types, $event_result);
				}
			}
			

			if (isset($event_types)) {
    // Ordering events by date
    usort($event_types, function ($a, $b) {
        $datetime1 = strtotime($a['created']);
        $datetime2 = strtotime($b['created']);
        return $datetime1 - $datetime2;
    });

				//adding the unique event types to the order event main array 
				$order_event['event_types'] = $event_types;

    // Initialize a flag to check if any of the specified events occurred before the order event
    $eventsOccurredBeforeOrder = false;

    // Loop through the event types and check if any specified event occurred before the order event
    foreach ($event_types as $event) {
        if ($event['type'] === 'order') {
            break; // Stop the loop when the order event is encountered
        }

        // Check if any of the specified events occurred before the order event
        if (
            $event['type'] === 'expand' ||
            $event['type'] === 'ppgLightboxOpen' ||
            $event['type'] === 'hwLightboxOpen' ||
            $event['type'] === 'shop'
        ) {
            $eventsOccurredBeforeOrder = true;
            break; // No need to continue checking
        }
    }

    // Set $order_event['orderWithInteractions'] based on the flag
    $order_event['orderWithInteractions'] = $eventsOccurredBeforeOrder;
}

		}

		usort($orders_with_a_grid_view_Array, function($a, $b) {
			$datetime1 = strtotime($a['created']);
			$datetime2 = strtotime($b['created']);
			return $datetime2 - $datetime1;
		});

		// populate results array
		$result['all_orders'] = $orders_with_a_grid_view_Array;
		
		$res = json_encode($result);
		file_put_contents($clients_stats_cache_file, $res);
 }
	else {
		$res = file_get_contents($clients_stats_cache_file);
	}
	echo $res;
	die;
}
