<?php

// used by manage-client-events.js
add_action('wp_ajax_get_events', 'get_events');
function get_events() {

	global $wpdb;

	$client_id = get_client_id();	

	$events = $wpdb->get_results("SELECT E.id as event_id, E.type, E.post_id, E.hostname, E.created, E.session_id, E.sku, O.id as order_id, O.order_amount, I.name as item_name, I.price, I.quantity from `oculizm_events` E LEFT JOIN `oculizm_orders` O ON O.id = E.order_id LEFT JOIN `oculizm_order_items` I ON I.order_id = E.order_id where E.client_id = $client_id ORDER BY created DESC LIMIT 100", ARRAY_A);

	$all_events_obj = [];
	$order_id = -1;
	$orders = [];
	$adding_orders_for_same_event = false;

	foreach ($events as $key=>$event) {
		if ($event["order_id"]){
			if ($event["order_id"] != $order_id && $order_id != -1) {
				$event_obj = [];
				$event_obj["created"] = $event["created"];
				$event_obj["post_id"] = $event["post_id"];
				$event_obj["order_id"] = $event["order_id"];
				$event_obj["hostname"] = $event["hostname"];
				$event_obj["event_id"] = $event["event_id"];
				$event_obj["type"] = $event["type"];
				$event_obj["session_id"] = $event["session_id"];
				$event_obj["sku"] = $event["sku"];
				$event_obj["orders"] = $orders;
				$all_events_obj[] = $event_obj;
				$orders = [];
			}
			$order_obj = [];
			$order_obj["item_name"] = $event["item_name"];
			$order_obj["price"] = $event["price"];
			$order_obj["quantity"] = $event["quantity"];
			$orders[] = $order_obj;
			$order_id = $event["order_id"];
			
		} else {
			$order_id = -1;
			$event_obj = [];
			$event_obj["created"] = $event["created"];
			$event_obj["post_id"] = $event["post_id"];
			$event_obj["order_id"] = $event["order_id"];
			$event_obj["hostname"] = $event["hostname"];
			$event_obj["event_id"] = $event["event_id"];
			$event_obj["type"] = $event["type"];
			$event_obj["session_id"] = $event["session_id"];
			$event_obj["sku"] = $event["sku"];
			$event_obj["orders"] = $orders;
			$all_events_obj[] = $event_obj;
			$orders = [];
		}
	}
	
	echo json_encode($all_events_obj);
    die;
}







// record an event
function add_event($event) {

	global $wpdb;
	$table_name = 'oculizm_events';

	$result = $wpdb->insert($table_name, $event);
	$last_id = (string)$wpdb->insert_id;

	return $last_id;
}

// record an order
function add_order($order) {
    global $wpdb;
	$result = $wpdb->insert('oculizm_orders', $order);
}

// record order items
function add_order_items($client_id, $order) {
	global $wpdb;
	
	$time = time();
	$created = date('Y-m-d H:i:s', $time);

	$items_string = "<br><b>Order Items</b><br>";

	// save the order items
	foreach ($order->items as $item) {

		// // remove this after Lifestyle Furniture updates their script
		// $i = array(
		// 	"client_id" => $client_id,
		//     "order_id" => $order->ID,
		//     "sku" => isset($item->sku) ? $item->sku : '',
		// 	"name" => isset($item->title) ? $item->title : ( isset($item->name) ? $item->name : ''),
	 //    	"created" => $created,
		//     "price" => isset($item->price) ? $item->price : '',
		// 	"quantity" => isset($item->quantity) ? $item->quantity : ''
		// );

		if (isset($order->cms)) {

			// Shopify
			if ($order->cms == "shopify") {
				$i = array(
					"client_id" => $client_id,
					"order_id" => $order->ID,
					"sku" => isset($item->sku) ? $item->sku : '',
					"name" => isset($item->title) ? $item->title : ( isset($item->name) ? $item->name : ''),
					"created" => $created,
					"price" => isset($item->price) ? $item->price : '',
					"quantity" => isset($item->quantity) ? $item->quantity : ''
				);
			}

			// Visualsoft
			if ($order->cms == "Visualsoft") {
				$i = array(
					"client_id" => $client_id,
					"order_id" => $order->ID,
					"sku" => isset($item->sku) ? $item->sku : '',
					"name" => $item->product_name,
					"created" => $created,
					"price" => isset($item->price) ? $item->price : '',
					"quantity" => isset($item->quantity) ? $item->quantity : ''
				);
			}

			// Wordpress
			if ($order->cms == "Wordpress") {
		
			}

			// Magento
			if ($order->cms == "Magento") {
				
				$i = array(
					"client_id" => $client_id,
				 	"order_id" => $order->ID,
					"sku" => isset($item->sku) ? $item->sku : (isset($item->id) ? $item->id : ''),
       				"product_id" => isset($item->item_id) ? $item->item_id : (isset($item->id) ? $item->id : ''),
					"name" => isset($item->name) ? $item->name : '',
			  		"created" => $created,
					"price" => isset($item->price) ? $item->price : '',
					"quantity" => isset($item->qty) ? $item->qty : (isset($item->quantity) ? $item->quantity : '')
				);
			}
		}
		$items_string .= "<br>" . implode("|", $i) . "<br>";
		$result = $wpdb->insert('oculizm_order_items', $i);
	}

	$order_id = $order->ID;
	$count_items = count($order->items);
	$session_id = $order->guid;
	$order_amount = $order->amount;
	$order_currency = $order->currency;

	$client_name = get_client_name_from_id($client_id);
	
	// if this was an order placed through Oculizm, email admins
	$title = "New order (" . $order_id . ") for " . $client_name;
	$message = "Order ID: $order_id <br> Session ID: $session_id <br> Order Amount: $order_amount <br> Order Currency: $order_currency <br>";
	$message .= $items_string;

	oEmail('sean@oculizm.com', $title, $message);
	
	$session_id = $order->guid;

	$last_id = (string)$wpdb->insert_id;
	return $last_id;
	/* need to be tested later this check for the session before inserting the order
    }
    return 0;
    */
}
