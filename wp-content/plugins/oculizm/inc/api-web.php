<?php
/*
Controller name: api-web
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
	register_rest_route( 'v1', '/fetch_oculizm_posts', array(
			'methods' => 'GET',
			'callback' => 'fetch_oculizm_post',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v1', '/fetch_oculizm_as_seen_on_posts', array(
			'methods' => 'GET',
			'callback' => 'fetch_oculizm_as_seen_on_posts',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v1', '/fetch_oculizm_reviews', array(
			'methods' => 'GET',
			'callback' => 'fetch_oculizm_reviews',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v1', '/oculizm_event', array(
			'methods' => 'GET',
			'callback' => 'oculizm_event',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v1', '/oculizm_add_event', array(
			'methods' => 'GET',
			'callback' => 'oculizm_add_event',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v1', '/request_review_form', array(
			'methods' => 'GET',
			'callback' => 'oculizm_request_review_form',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v1', '/add_review', array(
			'methods' => 'GET',
			'callback' => 'oculizm_add_review',
			'permission_callback' => '__return_true',
	) );
} );










/****************************************
*										*
*										*
*				WEB ROUTES				*
*										*
*										*
****************************************/


// main function to get posts
function fetch_oculizm_post($request) {

	global $wpdb;
	$response = array();
		
	// Validate client ID
	if (isset($request['clientID']) && !empty($request['clientID'])) {
		// Sanitize and validate client ID
		$client_id = filter_var($request['clientID'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)));
		
		$show_placeholder = is_client_inactive($client_id);

        $clients = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);

        if (!$clients) return json_encode("");
    }
    else return json_encode("");

	$use_thumb = $clients[0]['use_thumb'];

	// validate format
    if (ISSET($request['format']) && !empty($request['format'])) $format = $request['format'];
	else $format = "json";
	$format = sanitise_lower_case_letters($format);

	// request type
    $requestType = $request['requestType'];
    if (!$requestType) $requestType = "grid";
	
	// sanitise
	$requestType = sanitise_lower_case_letters($requestType);
		
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

	$requested_gallery;
	$menu_html = "<div class='oculizm-menu'><ul>";

	// go through every gallery
	foreach ($galleries as $g) {

		// get the requested gallery
		if ($g['id'] == $gallery_id){
			
			$requested_gallery = $g;
			// build menu HTML
		 $menu_html .= "<li class='selected' data-gallery-id='" . $g['id'] . "'><a href='#'>" . $g['name'] . "</a></li>";
		}
		else{
			// build menu HTML
			$menu_html .= "<li class='' data-gallery-id='" . $g['id'] . "'><a href='#'>" . $g['name'] . "</a></li>";
		}
	}
	
	$menu_html .= "</ul></div>";

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
		'post_status' => 'publish'
	);

	$counter = 0;
	$posts = array();
	$the_query = new WP_Query($args);

	if ($the_query->have_posts()){
		while ($the_query->have_posts()) {
			$the_query->the_post();

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
			if ($key !== false) {

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

				// build the post object
				$post = array(
					'post_id' => get_the_ID(),
					'post_title' => get_the_title(),
					// 'permalink' => get_the_permalink(),
					'caption' => get_the_content(),
					'is_sticky' => is_sticky(),
					'post_shop_link' => $post_shop_link,
					'social_network' => $social_network,
					'image_alt_text' => $image_alt_text,
					'social_id' => $social_id,
					// 'social_url' => $source_url,
					'image_url' => $image,
					'thumb_url' => $thumb,
					'video_url' => $video_url,
					'products' => $products
				);
			
				array_push($posts, $post);
			}
		}
		wp_reset_postdata();
	}

	// now check if a post ID was supplied
	$post_id;
	if (isset($request['postId'])&& !empty($request['postId'])) {
		$post_id = $request['postId'];
		$post_id = sanitise_int($post_id);

		// stop injections
		if (is_numeric($post_id)) {

			// check we haven't already added it to our response
			if (array_search($post_id, array_column($posts, 'post_id')) === FALSE) {
			
				wp_reset_postdata(); // just in case

				// now get the post
				$args = array('p' => $post_id);
				$the_query = new WP_Query($args);

				if ($the_query->have_posts()){
					while ($the_query->have_posts()) {
						$the_query->the_post();

						$video_url = "";
   						$image = "";

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

						// build the social link
						$social_network = get_field('social_network');
						$social_id = get_field('social_id');
						$source_url = get_field('source_url');
						if ($social_network != "instagram" &&  $social_network != "twitter") $source_url = "";
						// $social_url = get_social_url($social_network, $social_id);

						// build the post object
						$post = array(
							'post_id' => get_the_ID(),
							'post_title' => get_the_title(),
							// 'permalink' => get_the_permalink(),
							'caption' => get_the_content(),
							'is_sticky' => is_sticky(),
							'social_network' => $social_network,
							'social_id' => $social_id,
							// 'social_url' => $source_url,
							'image_url' => $image,
							'thumb_url' => $thumb,
							'video_url' => $video_url,
							'products' => $products
						);
				
						array_push($posts, $post);
					}
				}
				wp_reset_postdata(); // again, just in case
			}

		}
	}
	 // Get custom_order if custom_ordering is true for the given gallery_id
	 $custom_ordering = $wpdb->get_results("SELECT custom_ordering FROM oculizm_galleries WHERE id = " . $gallery_id, ARRAY_A);

	 // Check if custom_ordering is true
	 if ($custom_ordering && $custom_ordering[0]['custom_ordering'] == 1) {
		 $custom_order = get_post_meta($gallery_id, 'posts_custom_order', true);
		 if ($custom_order) {
			 $ordered_posts = array();
			 $order = explode(',', $custom_order);
 
			 // Arrange posts in custom order
			 foreach ($order as $post_id) {
				 foreach ($posts as $key => $post) {
					 if ($post['post_id'] == $post_id) {
						 $ordered_posts[] = $post;
						 unset($posts[$key]);
						 break;
					 }
				 }
			 }
 
			 // Append remaining posts that are not in custom order
			 $posts = array_merge($ordered_posts, $posts);
		 }
	 }

	$response['shop_link'] = $shop_link;
	$response['posts'] = $posts;
	$response['show_placeholder'] = $show_placeholder;
	$response['menu_html'] = $menu_html;

	// supply XML if it's a gallery feed
	if ($format == "xml") {
		// Create a new SimpleXMLElement
		$xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8" ?><data></data>');

		// Convert the array to XML
		array_to_xml($xml, $posts);

		// Set the content type to XML
		header('Content-Type: application/xml');

		// Output the XML directly to the browser
		echo $xml->asXML();
		
		// Terminate script execution
		die();
	}
	
	// if there are no posts to show ...
	if (count($response) == 0) {
		// ... and this is an initial request (not a load more)...
		if (ISSET($request['offset'])) {
			if ($request['offset'] == 0) $response["show_placeholder"] = true;
		}
	}

	return json_encode($response);
}


// fetch "As Seen On" / ASO posts
function fetch_oculizm_as_seen_on_posts($request) {
	
	global $wpdb;
	
	$response = array();
	$posts = array();

	// validate client ID
	if (isset($request['clientID']) && !empty($request['clientID'])) {
		// Sanitize and validate client ID
		$client_id = filter_var($request['clientID'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)));
		
		$show_placeholder = is_client_inactive($client_id);
    	$clients = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);

	    if (!$clients) return json_encode("");
	}
	else return json_encode("");

	$use_thumb = $clients[0]['use_thumb'];

	// validate format
    if (ISSET($request['format']) && !empty($request['format'])) $format = $request['format'];
	else $format = "json";
	$format = sanitise_lower_case_letters($format);

    // check if region was supplied
	$region = "";
	if (isset($request['region']) && !empty($request['region']) &&  $request['region'] != null) {
		$region = strtolower($request['region']);
	}
	$region = sanitise_lower_case_letters($region);
		
	// validate format
    if (ISSET($request['format']) && !empty($request['format'])) $format = $request['format'];
	else $format = "json";
	$format = sanitise_lower_case_letters($format);
	
	// validate product IDs
    if (ISSET($request['productID']) && !empty($request['productID'])) $product_id = $request['productID'];
	else {
		$response["errors"] = [0 => "Invalid product ID"];
        return json_encode($response);
    }
    if (strlen($product_id) < 1) {
		$response["errors"] = [0 => "Invalid product ID"];
        return json_encode($response);
    }
    $product_id = rtrim($product_id, ','); // Remove the trailing comma if there is one

	$supplied_product_ids = array_map('sanitise_product_id', explode(",", $product_id)); // Create an array of the supplied IDs and sanitize them

	// count 						
	$count = 24;
	if (isset($request['count'])) {
		if ($request['count'] != null) $count = $request['count'];
	}
	$count = sanitise_int($count);

    // get an array of all this client's posts
	$args = array('post_type' => 'post', 'posts_per_page' => -1, 'post_status' => 'publish');
	$args['meta_query'] = array('relation'=> 'OR',
		array(array('key'=> 'client_id','value'		=> $client_id,'compare'	=> '='))
	);
	
	$response = array();
	$counter = 0;

	$the_query = new WP_Query($args);
	if ($the_query->have_posts()) {
		while ($the_query->have_posts()) {
		 $the_query->the_post();

			$video_url = "";
			$image = "";

			// always return $count posts, when we reach $count we quit the loop
			if (is_array($response)) if (count($response) >= $count) break;
			
			// get the post's matched products
			$products = get_field('matched_products');

			// get the product IDs of this post's attached products
			if (!is_array($products)) continue;
			$post_product_ids = array();
		    for ($i=0; $i<count($products); $i++) {
		        $p = $products[$i];
		        $post_product_ids[] = $p['product_id'];
		    }
			// and if this product is not in that list, skip it
			$intersect = array_intersect($supplied_product_ids, $post_product_ids);
			if (count($intersect) === 0) continue;

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

			// skip videos as the product might not be shown in the first frame
			if ($video_url!=null) continue;

			// get the image alt text
			$image_alt_text = get_field('image_alt_text');

			// build the social link
			$social_network = get_field('social_network');
			$social_id = get_field('social_id');
			// $social_url = get_social_url($social_network, $social_id);

			// build the post object
			$post = array(
				'post_id' => get_the_ID(),
				'post_title' => get_the_title(),
				// 'permalink' => get_the_permalink(),
				'caption' => get_the_content(),
				'is_sticky' => is_sticky(),
				'image_alt_text' => $image_alt_text,
				'social_network' => $social_network,
				'social_id' => $social_id,
				// 'social_url' => $social_url,
				'image_url' => $image,
				'thumb_url' => $thumb,
				'video_url' => $video_url,
				'products' => $products
			);

			array_push($posts, $post);

			$counter++;
			if ($counter == $count) break;
		}
		wp_reset_postdata();
	}

	// $results = array("posts" => $response);
	$response['posts'] = $posts;
	$response['show_placeholder'] = $show_placeholder;

	// supply XML if it's a gallery feed
	if ($format == "xml") {
		// Create a new SimpleXMLElement
		$xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8" ?><data></data>');

		// Convert the array to XML
		array_to_xml($xml, $posts);

		// Set the content type to XML
		header('Content-Type: application/xml');

		// Output the XML directly to the browser
		echo $xml->asXML();
		
		// Terminate script execution
		die();
	}

	
	if (count($response) == 0) $response["show_placeholder"] = true;

	return json_encode($response);
}


// add event
function oculizm_event($request) {
	

	global $wpdb;
	
	// header("Access-Control-Allow-Origin: *");

	// Validate client ID
	if (isset($request['clientID']) && !empty($request['clientID'])) {
		// Sanitize and validate client ID
		$client_id = filter_var($request['clientID'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)));
		
		$is_client_inactive = is_client_inactive($client_id);

		if ($is_client_inactive) {
			return json_encode("");
			die();
		}
	}
	else {
		return json_encode("");
		die();
	}

	verify_client_id($client_id);

	$time = time();
	$expiryDate = $time + 2592000;
	$cookieUpdateDate = gmdate('Y-m-d H:i:s', $time);
	$cookieExpiryDate = gmdate('Y-m-d H:i:s', $expiryDate);
	// $referrer = $_GET['oculizm_referrer'];

	if (isset($_GET['oculizm_referrer'])) $referrer = $_GET['oculizm_referrer'];
	else $referrer = null;

	if (isset($_GET['currentPageUrl'])) $currentPageUrl = $_GET['currentPageUrl'];
	else $currentPageUrl = null;				

	if (isset($_GET['sessionHasEvents'])) $sessionHasEvents = $_GET['sessionHasEvents'];
	else $sessionHasEvents = "not provided";

	if (isset($_GET['platform'])) $platform = $_GET['platform'];
	else $platform = "not provided";

	if (isset($_GET['browsername'])) $browsername = $_GET['browsername'];
	else $browsername = "not provided";

	if (isset($_GET['cookies'])) $cookies = $_GET['cookies'];
	else $cookies = "not provided";
	
	if (isset($_GET['version'])) $browserVersion = $_GET['version'];
	else $browserVersion = "not provided";

	if ( (isset($_GET['oculizmSessionId'])) && (!empty($_GET['oculizmSessionId'])) ){

		$oculizmSessionId = $_GET['oculizmSessionId'];

		if($client_id == "90211"){
			oLog("oculizmSessionId is set : " . $oculizmSessionId . "...");
		}
	} 

	//if oculizmSessionId empty set it to a uniq id with oculizm prefix
	else if(empty($_GET['oculizmSessionId'])){

		$oculizmSessionIdValue = uniqid();
		$oculizmSessionId = "oculizm_" . $oculizmSessionIdValue;

		if($client_id == "90211"){
			oLog("oculizmSessionId is empty and a new session id was set : " . $oculizmSessionId . "...");
		}
	}

	// dont record null events
	if ( (!isset($_GET['evt'])) ){
		die();
	}

	
	if( (($client_id == "16005") && ($_GET['evt'] == "pageInfo")) || (($client_id == "90211") && ($_GET['evt'] == "pageInfo")) ) {

		// dont record pageInfo events
		die();
	}
		
	// set the guid value to be the cookie session id set on the client side 
	$guid = $oculizmSessionId;

	// now get the other info the client's browser sent us
	$ip = $_SERVER['REMOTE_ADDR'];               
	$event_type = $_GET['evt'];


	//stop recording carouselView for lifestyle furniture they are still using the old script 
	if ($event_type == "carouselView"){
		die();
	}

	$created = date('Y-m-d H:i:s', $time);
	$post_id = $_GET['postId'];
	if ($post_id == "undefined") $post_id = null;
	$hostname = $_GET['hostname'];

	// stop recording events where the hostname includes shopifypreview.com
	if (preg_match("/shopifypreview.com/i", $hostname)) {
		die();
	}

	$sku = null;
	if (isset($_GET['sku'])) $sku = $_GET['sku'];

	$product_id = null;
	if (isset($_GET['product_id'])) $product_id = $_GET['product_id'];

	// order handling
	$order = json_decode(stripslashes($_GET['order']));

	// if the event type is an order 
	if ($event_type == "order") {
		if ($order) {
			if (is_object($order)) {
				if ($client_id == "90211") {

								oLog("
							-------- PageUrl is : " . $currentPageUrl . "
							-------- Session ID is : " . $oculizmSessionId . "
							-------- cookies enabled is : " . $cookies . "
							-------- Order object is : " . $_GET['order'] . "...");
					
							$subject = 'Cheaney order recorded';
							$message = "PageUrl is : " . $currentPageUrl . "...<br/><br/>" ;
							$message .= "Session ID is : " . $oculizmSessionId . "...<br/><br/>" ;
							$message .= "cookies enabled is : " . $cookies . "...<br/><br/>" ;
							$message .= "Order object is : " . $_GET['order'] . "..." ;
							// oEmail('sean@oculizm.com', $subject, $message);
							// oEmail('anthony@oculizm.com', $subject, $message);
				}
				

					oLog("
				-------- Order object is for the client : " . $client_id . " : " . $_GET['order'] . "...");
				
				
				oLog("
				-------- Order created in : " . $created . "...");

				oLog("
				-------- Session ID is : " . $oculizmSessionId . "...");
		
				

				//search into the database if session id with same order id and client id already exist  
				$sessionIdExist = $wpdb->get_results("SELECT * FROM oculizm_events WHERE session_id= '$guid' AND order_id= '$order->ID' AND client_id = '$client_id' ", ARRAY_A);

				//order exist in the database 
				if(!empty($sessionIdExist)) {

					if (($client_id == "16005") || ($client_id == "83953")) {
						oLog("the event is an order but we already have similar data in the DB ,
					-------- User Platform is : " . $platform . "
					-------- Browser name is : " . $browsername . "
					-------- Browser version : " . $browserVersion . "
					-------- oculizmSession_id cookie is : --- " . $oculizmSessionId . "
					-------- client id is : --- " . $client_id . " and session ID : " . $guid . " and order id : " . $order->ID . "...");
					}

					die();
				}
				
				//order does not exist in the database so add it  
				else {
					// build the event object and save it to the database
					$event = array(
						"client_id" => $client_id,
						"session_id" => $guid,
						"type" => $event_type,
						"created" => $created,
						"hostname" => $hostname,
						"post_id" => $post_id,
						"sku" => $sku,
						"product_id" => $product_id,
						"order_id" => $order && is_object($order) ? $order->ID : 0
					);
					$result = add_event($event);

					//why??
					$order->guid = $guid;
							
					$order_db = array(
						"client_id" => $client_id,
						"session_id" => $order->guid,
						"order_id" => $order->ID,
						"payment_method" => isset($order->paymentMethod) ? $order->paymentMethod : null,
						"currency" => $order->currency,
						"created" => $created,
						"order_amount" => $order->amount,
						"platform" => $platform,
						"browsername" => $browsername,
						"cookieEnabled" => $cookies,
						"version" => $browserVersion
					);
					
					add_order($order_db);
					add_order_items($client_id, $order);

					if (($client_id == "16005") || ($client_id == "90211")) {
						oLog("the event is an order ,  
					-------- User Platform is : " . $platform . "
					-------- Browser name is : " . $browsername . "
					-------- Browser version : " . $browserVersion . "
					-------- oculizmSession_id cookie is : --- " . $oculizmSessionId . "
					-------- client id is : --- " . $client_id . " and session ID : " . $guid . " and order id : " . $order->ID . "...");
					}

					return json_encode($order->items); // why do we return the order items here?
					return json_encode($result);
				}
			}
		}
	}

	// event type is not an order  
	else {
		// build the event object and save it to the database
		$event = array(
			"client_id" => $client_id,
			"session_id" => $guid,
			"type" => $event_type,
			"created" => $created,
			"hostname" => $hostname,
			"post_id" => $post_id,
			"sku" => $sku,
			"product_id" => $product_id,
			"referrer" => $referrer,
			"order_id" => $order && is_object($order) ? $order->ID : 0
		);
		$result = add_event($event);

	return json_encode($result);
	}
}


// NEW VERSION add event
function oculizm_add_event($request) {
	

	global $wpdb;
	
	// header("Access-Control-Allow-Origin: *");

	// Validate client ID
	if (isset($request['clientID']) && !empty($request['clientID'])) {
		// Sanitize and validate client ID
		$client_id = filter_var($request['clientID'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)));
		
		$is_client_inactive = is_client_inactive($client_id);

		if ($is_client_inactive) {
			return json_encode("");
			die();
		}
	}
	else {
		return json_encode("");
		die();
	}

	verify_client_id($client_id);

	$time = time();
	$expiryDate = $time + 2592000;
	$cookieUpdateDate = gmdate('Y-m-d H:i:s', $time);
	$cookieExpiryDate = gmdate('Y-m-d H:i:s', $expiryDate);
	// $referrer = $_GET['oculizm_referrer'];

	if (isset($_GET['oculizm_referrer'])) $referrer = $_GET['oculizm_referrer'];
	else $referrer = null;

	if (isset($_GET['currentPageUrl'])) $currentPageUrl = $_GET['currentPageUrl'];
	else $currentPageUrl = null;				

	if (isset($_GET['sessionHasEvents'])) $sessionHasEvents = $_GET['sessionHasEvents'];
	else $sessionHasEvents = "not provided";

	if (isset($_GET['platform'])) $platform = $_GET['platform'];
	else $platform = "not provided";

	if (isset($_GET['browsername'])) $browsername = $_GET['browsername'];
	else $browsername = "not provided";

	if (isset($_GET['cookies'])) $cookies = $_GET['cookies'];
	else $cookies = "not provided";
	
	if (isset($_GET['version'])) $browserVersion = $_GET['version'];
	else $browserVersion = "not provided";

	if ( (isset($_GET['oculizmSessionId'])) && (!empty($_GET['oculizmSessionId'])) ){

		$oculizmSessionId = $_GET['oculizmSessionId'];

		if($client_id == "90211"){
			oLog("oculizmSessionId is set : " . $oculizmSessionId . "...");
		}
	} 

	//if oculizmSessionId empty set it to a uniq id with oculizm prefix
	else if(empty($_GET['oculizmSessionId'])){

		$oculizmSessionIdValue = uniqid();
		$oculizmSessionId = "oculizm_" . $oculizmSessionIdValue;

		if($client_id == "90211"){
			oLog("oculizmSessionId is empty and a new session id was set : " . $oculizmSessionId . "...");
		}
	}

	// dont record null events
	if ( (!isset($_GET['evt'])) ){
		die();
	}

	
	if( (($client_id == "16005") && ($_GET['evt'] == "pageInfo")) || (($client_id == "90211") && ($_GET['evt'] == "pageInfo")) ) {

		// dont record pageInfo events
		die();
	}
		
	// set the guid value to be the cookie session id set on the client side 
	$guid = $oculizmSessionId;

	// now get the other info the client's browser sent us
	$ip = $_SERVER['REMOTE_ADDR'];               
	$event_type = $_GET['evt'];


	//stop recording carouselView for lifestyle furniture they are still using the old script 
	if ($event_type == "carouselView"){
		die();
	}

	$created = date('Y-m-d H:i:s', $time);
	$post_id = $_GET['postId'];
	if ($post_id == "undefined") $post_id = null;
	$hostname = $_GET['hostname'];

	// stop recording events where the hostname includes shopifypreview.com
	if (preg_match("/shopifypreview.com/i", $hostname)) {
		die();
	}

	$sku = null;
	if (isset($_GET['sku'])) $sku = $_GET['sku'];

	$product_id = null;
	if (isset($_GET['product_id'])) $product_id = $_GET['product_id'];

	// order handling
	$order = json_decode(stripslashes($_GET['order']));

	// if the event type is an order 
	if ($event_type == "order") {
		if ($order) {
			if (is_object($order)) {
				if ($client_id == "90211") {

								oLog("
							-------- PageUrl is : " . $currentPageUrl . "
							-------- Session ID is : " . $oculizmSessionId . "
							-------- cookies enabled is : " . $cookies . "
							-------- Order object is : " . $_GET['order'] . "...");
					
							$subject = 'Cheaney order recorded';
							$message = "PageUrl is : " . $currentPageUrl . "...<br/><br/>" ;
							$message .= "Session ID is : " . $oculizmSessionId . "...<br/><br/>" ;
							$message .= "cookies enabled is : " . $cookies . "...<br/><br/>" ;
							$message .= "Order object is : " . $_GET['order'] . "..." ;
							// oEmail('sean@oculizm.com', $subject, $message);
							// oEmail('anthony@oculizm.com', $subject, $message);
				}
				

					oLog("
				-------- Order object is for the client : " . $client_id . " : " . $_GET['order'] . "...");
				
				
				oLog("
				-------- Order created in : " . $created . "...");

				oLog("
				-------- Session ID is : " . $oculizmSessionId . "...");
		
				

				//search into the database if session id with same order id and client id already exist  
				$sessionIdExist = $wpdb->get_results("SELECT * FROM oculizm_events WHERE session_id= '$guid' AND order_id= '$order->ID' AND client_id = '$client_id' ", ARRAY_A);

				//order exist in the database 
				if(!empty($sessionIdExist)) {

					if (($client_id == "16005") || ($client_id == "83953")) {
						oLog("the event is an order but we already have similar data in the DB ,
					-------- User Platform is : " . $platform . "
					-------- Browser name is : " . $browsername . "
					-------- Browser version : " . $browserVersion . "
					-------- oculizmSession_id cookie is : --- " . $oculizmSessionId . "
					-------- client id is : --- " . $client_id . " and session ID : " . $guid . " and order id : " . $order->ID . "...");
					}

					die();
				}
				
				//order does not exist in the database so add it  
				else {
					// build the event object and save it to the database
					$event = array(
						"client_id" => $client_id,
						"session_id" => $guid,
						"type" => $event_type,
						"created" => $created,
						"hostname" => $hostname,
						"post_id" => $post_id,
						"sku" => $sku,
						"product_id" => $product_id,
						"order_id" => $order && is_object($order) ? $order->ID : 0
					);
					$result = add_event($event);

					//why??
					$order->guid = $guid;
							
					$order_db = array(
						"client_id" => $client_id,
						"session_id" => $order->guid,
						"order_id" => $order->ID,
						"payment_method" => isset($order->paymentMethod) ? $order->paymentMethod : null,
						"currency" => $order->currency,
						"created" => $created,
						"order_amount" => $order->amount,
						"platform" => $platform,
						"browsername" => $browsername,
						"cookieEnabled" => $cookies,
						"version" => $browserVersion
					);
					
					add_order($order_db);
					add_order_items($client_id, $order);

					if (($client_id == "16005") || ($client_id == "90211")) {
						oLog("the event is an order ,  
					-------- User Platform is : " . $platform . "
					-------- Browser name is : " . $browsername . "
					-------- Browser version : " . $browserVersion . "
					-------- oculizmSession_id cookie is : --- " . $oculizmSessionId . "
					-------- client id is : --- " . $client_id . " and session ID : " . $guid . " and order id : " . $order->ID . "...");
					}

					return json_encode($order->items); // why do we return the order items here?
					return json_encode($result);
				}
			}
		}
	}

	// event type is not an order  
	else {
		// build the event object and save it to the database
		$event = array(
			"client_id" => $client_id,
			"session_id" => $guid,
			"type" => $event_type,
			"created" => $created,
			"hostname" => $hostname,
			"post_id" => $post_id,
			"sku" => $sku,
			"product_id" => $product_id,
			"referrer" => $referrer,
			"order_id" => $order && is_object($order) ? $order->ID : 0
		);
		$result = add_event($event);

	return json_encode($result);
	}
}


// // main function to get reviews
// function fetch_oculizm_reviews($request) {

// 	global $wpdb;
// 	$response = array();
	
// 	// Validate client ID
// 	if (isset($request['clientID']) && !empty($request['clientID'])) {
// 		// Sanitize and validate client ID
// 		$client_id = filter_var($request['clientID'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)));
		
// 		$show_placeholder = is_client_inactive($client_id);

//         $clients = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
// 		$client_name = $clients[0]['name']; 

//         if (!$clients) return json_encode("");
//     }
//     else return json_encode("");

// 	// request type
//     $requestType = $request['requestType'];
//     if (!$requestType) $requestType = "list";
	
// 	// sanitise
// 	$requestType = sanitise_lower_case_letters($requestType);
		
//  	// check if region was supplied
// 	$region = "";
// 	if (isset($request['region']) && !empty($request['region']) &&  $request['region'] != null) {
// 		$region = strtolower($request['region']);
// 	}
// 	// sanitise
// 	$region = sanitise_lower_case_letters($region);

// 	// get all this client's reviews
// 	$reviews = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE CLIENT_ID = " . $client_id . " AND status = 'published' ORDER BY created DESC", ARRAY_A);

// 	$resultCurrency = $wpdb->get_results("SELECT currency FROM oculizm_orders WHERE CLIENT_ID = '" . $client_id . "' ORDER BY created ASC LIMIT 1", ARRAY_A);
	
// 	// Extract the currency value from the result
// 	$currency = !empty($resultCurrency) ? trim($resultCurrency[0]['currency']) : null;

// 	// Initialize product_id to null
// 	$product_id = null;

// 	// Initialize price to null
// 	$price = null;

// 	// Initialize image_link and url to null
// 	$image_link = null;
// 	$url = null;

// 	// Check if any review has a product_id
// 	foreach ($reviews as $review) {
// 		if (!empty($review['product_id'])) {
// 			// If a review has a product_id, set it and break the loop
// 			$product_id = $review['product_id'];
// 			$product_info = $wpdb->get_row(
// 				$wpdb->prepare(
// 					"SELECT price, image_link , link FROM oculizm_products WHERE product_id = %d",
// 					$product_id
// 				),
// 				ARRAY_A
// 			);
			
// 			if ($product_info) {
// 				$price = $product_info['price'];
// 				$image_link = $product_info['image_link'];
// 				$url = $product_info['link'];
// 			}
// 			break;
// 		}
// 	}
	
// 	// count & offset
// 	$count = 24;
// 	if (isset($request['count'])) {
// 		if ($request['count'] != null) $count = $request['count'];
// 	}
// 	$count = sanitise_int($count);

// 	$offset = 0;
// 	if (isset($request['offset']))  $offset = $request['offset'];
// 	$offset = sanitise_int($offset);

// 	$response['reviews'] = $reviews;
// 	$response['show_placeholder'] = $show_placeholder;
// 	$response['client_name'] = $client_name;
// 	$response['currency'] = $currency;
// 	$response['price'] = $price;
// 	$response['image_link'] = $image_link;
// 	$response['url'] = $url;

// 	// if there are no posts to show ...
// 	if (count($reviews) == 0) {
// 		// ... and this is an initial request (not a load more)...
// 		if (ISSET($request['offset'])) {
// 			if ($request['offset'] == 0) $response["show_placeholder"] = true;
// 		}
// 	}

// 	return json_encode($response);
// }

// main function to get reviews
function fetch_oculizm_reviews($request) {
    global $wpdb;
    $response = array();
    
    // Validate client ID
    if (isset($request['clientID']) && !empty($request['clientID'])) {
        // Sanitize and validate client ID
        $client_id = filter_var($request['clientID'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)));
        
        $show_placeholder = is_client_inactive($client_id);

        $clients = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
        $client_name = $clients[0]['name']; 

        if (!$clients) return json_encode("");
    }
    else return json_encode("");

    // request type
    $requestType = $request['requestType'];
    if (!$requestType) $requestType = "list";
    
    // sanitise
    $requestType = sanitise_lower_case_letters($requestType);
        
    // check if region was supplied
    $region = "";
    if (isset($request['region']) && !empty($request['region']) &&  $request['region'] != null) {
        $region = strtolower($request['region']);
    }
    // sanitise
    $region = sanitise_lower_case_letters($region);

    // get all this client's reviews
    $reviews = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE CLIENT_ID = " . $client_id . " AND status = 'published' ORDER BY created DESC", ARRAY_A);

    $resultCurrency = $wpdb->get_results("SELECT currency FROM oculizm_orders WHERE CLIENT_ID = '" . $client_id . "' ORDER BY created ASC LIMIT 1", ARRAY_A);
    
    // Extract the currency value from the result
    $currency = !empty($resultCurrency) ? trim($resultCurrency[0]['currency']) : null;

    // Initialize product_id to null
    $product_id = null;

    // Initialize price to null
    $price = null;

    // Initialize image_link and url to null
    $image_link = null;
    $url = null;

    // Check if any review has a product_id
    foreach ($reviews as $review) {
        if (!empty($review['product_id'])) {
            // If a review has a product_id, set it and break the loop
            $product_id = $review['product_id'];
            $product_info = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT price, image_link , link FROM oculizm_products WHERE product_id = %d",
                    $product_id
                ),
                ARRAY_A
            );
            
            if ($product_info) {
                $price = $product_info['price'];
                $image_link = $product_info['image_link'];
                $url = $product_info['link'];
            }
            break;
        }
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

    // Separate product reviews and site reviews
    $productReviews = array_filter($reviews, function($review) {
        return !empty($review['product_id']);
    });

    $siteReviews = array_filter($reviews, function($review) {
        return empty($review['product_id']);
    });

    // Calculate average ratings for product reviews and site reviews
    $productAverageRating = calculateAverageRating($productReviews);
    $siteAverageRating = calculateAverageRating($siteReviews);

    $response['reviews'] = $reviews;
    $response['show_placeholder'] = $show_placeholder;
    $response['client_name'] = $client_name;
    $response['currency'] = $currency;
    $response['price'] = $price;
    $response['image_link'] = $image_link;
    $response['url'] = $url;
    $response['productAverageRating'] = $productAverageRating;
    $response['siteAverageRating'] = $siteAverageRating;

    // if there are no posts to show ...
    if (count($reviews) == 0) {
        // ... and this is an initial request (not a load more)...
        if (ISSET($request['offset'])) {
            if ($request['offset'] == 0) $response["show_placeholder"] = true;
        }
    }

    return json_encode($response);
}

// Calculate the average rating based on individual review ratings
function calculateAverageRating($reviews) {
    if (empty($reviews)) {
        return "0.0"; // No reviews, return 0.0 as default.
    }

    $totalRating = 0;
    $reviewCount = count($reviews);

    foreach ($reviews as $review) {
        $totalRating += $review['rating'];
    }

    $averageRating = $totalRating / $reviewCount;
    return number_format((float)$averageRating, 1, '.', ''); // Format with one decimal place
}




// request review form
function oculizm_request_review_form($request) {

	global $wpdb;
	$response = array();

	// Validate client ID
	if (isset($request['clientID']) && !empty($request['clientID'])) {
		// Sanitize and validate client ID
		$client_id = filter_var($request['clientID'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)));

		// Get the IP address
		$public_ip = file_get_contents('https://api64.ipify.org?format=json');
		$ip_data = json_decode($public_ip);
		if ($ip_data !== null) {
			$ip = $ip_data->ip;
			oLog("Public IP address is: " . $ip);
		}

		// check for a review with the same IP address
		$product_id;
		if (isset($request['productID']) && !empty($request['productID'])) {
			$product_id = sanitise_product_id($request['productID']);
			$ip_exists = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE ip_address = '$ip' AND client_id = '$client_id' AND product_id = '$product_id'", ARRAY_A);
    		$p = $wpdb->get_results("SELECT title, image_link FROM oculizm_products WHERE client_id=$client_id AND product_id=$product_id", ARRAY_A);
			$response['product'] = $p[0];
		} else {
			$ip_exists = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE ip_address = '$ip' AND client_id = '$client_id'", ARRAY_A);
		}
		if (false) {
			$response["errors"] = [0 => "There is already a review with this IP address and client ID."];
			return json_encode($response);
		}

		$response['result'] = 1;
		return json_encode($response);

	} else {
		return json_encode("");
	}
}


// add a review
function oculizm_add_review($request) {

	global $wpdb;
	$response = array();
	
	 // Validate client ID
	if (isset($request['clientID']) && !empty($request['clientID'])) {
		// Sanitize and validate client ID
		$client_id = filter_var($request['clientID'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 1)));
		
		// get the IP address
		$public_ip = file_get_contents('https://api64.ipify.org?format=json');
		$ip_data = json_decode($public_ip);
		if (!empty($ip_data)) {
			$ip = $ip_data->ip;
			oLog("Public IP address is: " . $ip) ;
		} 			

		// check for a review with the same IP address
		$product_id;
		if (isset($request['productID']) && !empty($request['productID'])) {
			$product_id = sanitise_product_id($request['productID']);
			$ip_exists = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE ip_address = '$ip' AND client_id = '$client_id' AND product_id = '$product_id'", ARRAY_A);
		} else {
			$ip_exists = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE ip_address = '$ip' AND client_id = '$client_id'", ARRAY_A);
			$product_id = "";
		}
		if (false) {
			$response["errors"] = [0 => "There is already a review with this IP address and client ID."];
			return json_encode($response);
		}

		// rating
		$rating = (isset($request['rating']) && !empty($request['rating'])) ? filter_var($request['rating'], FILTER_VALIDATE_INT, array('options' => array('min_range' => 1))) : null;

		// referrer URL
		$referrer_url = isset($request['referrerURL']) ? filter_var($request['referrerURL'], FILTER_SANITIZE_URL) : null;


		// reviewer name
		if (ISSET($request['reviewerName']) && !empty($request['reviewerName'])) {
			$reviewer_name = $request['reviewerName'];
		}
		$reviewer_name = sanitise_full_name($reviewer_name);

		// review title
		if (isset($request['reviewTitle']) && !empty($request['reviewTitle'])) {
			$review_title = sanitise_plain_text($request['reviewTitle']);
		} else {
			// Handle the case when the title is not provided
			$review_title = ""; // or set it to a default value
		}

		// review description
		if (isset($request['reviewDescription']) && !empty($request['reviewDescription'])) {
			$review_description = sanitise_plain_text($request['reviewDescription'], 10000); // Adjust the max length as needed
		} else {
			// Handle the case when the description is not provided
			$review_description = ""; // or set it to a default value
		}

		$time = time();
		$created = date('Y-m-d H:i:s', $time);

	    $review = array(
	        "client_id" => $client_id,
	        "created" => $created,
	        "status" => 'new',
	        "title" => $review_title,
	        "description" => $review_description,
	        "rating" => $rating,
	        "reviewer_name" => $reviewer_name,
	        "ip_address" => $ip,
	        "product_id" => $product_id,
			"referrer_url" => $referrer_url,
	    );
	    $wpdb->insert('oculizm_reviews', $review);

	    // handle DB result
	    $last_id = $wpdb->insert_id;

	    // create email subject
	    $review_failed_msg = "";
	    if (!is_numeric($last_id)) $review_failed_msg = "FAILED";
	    $client = $wpdb->get_row("SELECT name FROM oculizm_clients WHERE id = " . $client_id, OBJECT);
	    $subject = "New " . $review_failed_msg . " review for " . $client->name . " (Client ID " . $client_id . ")";

	    // create email body
	    $rating_html = "";
		$arr = array(1, 2, 3, 4, 5);
		foreach ($arr as $value) {
		    if ($rating >= $value) $rating_html = $rating_html . "⭐";
		}
	    $message = "Reviewer name: " . $reviewer_name . "<br>" . 
	    	"Rating: " . $rating_html . "<br>" . 
	    	"Review title: " . $review_title . "<br>" . 
	    	"Review text: " . $review_description . "<br>";

	    if ($product_id != "") $message = $message . "<br>Product ID: " . $product_id;

	    // send email
	    $email_result = oEmail('sean@oculizm.com', $subject, $message);
	    $email_result = oEmail('anthony@oculizm.com', $subject, $message);

	    if (is_numeric($last_id)) {
	    	return json_encode("Success");
	    }

		$response["errors"] = [0 => "The review was not saved."];
		return json_encode($response);
    }
    else return json_encode(""); // invalid client ID
}





















/********************* HELPER FUNCTIONS ***********************/


// helper function to get the URL of a social network post
function get_social_url($social_network, $social_id) {

	$social_url = "";

    // Instagram
    if ($social_network == "instagram") {
        $parts = explode('_', $social_id);
        $social_id = $parts[0];
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
        $shortenedId = '';
        while ($social_id > 0) {
            $remainder = $social_id % 64;
            $social_id = ($social_id - $remainder) / 64;
            $shortenedId = $alphabet[$remainder] . $shortenedId;
        };                  
        $social_url = 'https://www.instagram.com/p/' . $shortenedId;
    }

    // Twitter
    if ($social_network == "twitter") {
        $social_url = 'https://twitter.com/twitter-user-screen-name/status/' . $social_id;
    }

    return $social_url;
}

