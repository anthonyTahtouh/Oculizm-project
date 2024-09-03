<?php

// get content stats
add_action('wp_ajax_get_content_stats', 'get_content_stats');
function get_content_stats() {
 
	global $wpdb;

    $client_id = get_client_id();
				
	//for react project testing purposes
	$http_origin = get_http_origin();
	if($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com"){
		$client_id = 12453;
	}
	
	// cache
    $clients_stats_cache_file = ABSPATH."wp-content/uploads/analytics/".$client_id."_content-data.json";
 	if (!file_exists($clients_stats_cache_file) || filemtime($clients_stats_cache_file)<(time() - 21600)) {
 	// if (true) {
		
		// define variables
		$result = array();

		$top_performing_posts = array();
		$top_hashtags = array();
		$hashtag_count_array = array();

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
		* 					TOP POSTS 					*
		* 												*
		* 												*
		************************************************/

		$top_posts = $wpdb->get_results("SELECT count(post_id) as count_post_id, post_id FROM oculizm_events WHERE client_id = $client_id AND post_id <> 0 GROUP BY post_id ORDER BY count(post_id) DESC LIMIT 5", ARRAY_A);

		foreach ($top_posts as $_post) {
			$post_id = $_post['post_id'];
			$args = array('post_type' => 'any', 'p' => $post_id);
			$the_query = new WP_Query($args);
			
			if ($the_query->have_posts()) {
				while ($the_query->have_posts()) {
					$the_query->the_post();
					
					// get the featured image
					$tn_id = get_post_meta(get_the_ID(), '_thumbnail_id', true);
					$image_url = wp_get_attachment_image_src( $tn_id, 'large' )[0];

					// image
					if ($image_url != null) {
						$image_url = str_replace("http:", "https:", $image_url);
						$image_url = str_replace("https://localhost", "http://localhost", $image_url);
					} else $image_url = wp_get_attachment_url($tn_id);

					// get the video image
					$vid_id = get_post_meta($tn_id, '_thumbnail_id', true);
					$video_url = wp_get_attachment_url($vid_id);

					// social network
					$social_network = get_field("social_network");
					
					// date
					$date = get_the_time('U');
					$date_diff = human_time_diff($date, current_time('timestamp'), 1);

					// build the post object
					$post = array(
						'post_id' => get_the_ID(),
						'post_title' => get_the_title(),
						'social_network' => $social_network,
						'image_url' => $image_url,
						'video_url' => $video_url,
						'count' => $_post['count_post_id'],
						'date' => $date,
						'date_diff' => $date_diff,
					);
					break;
				}
				wp_reset_postdata();
				$top_performing_posts[] = $post;
			}
		}
		



		/************************************************
		* 												*
		* 												*
		* 				   TOP HASHTAGS 				*
		* 												*
		* 												*
		************************************************/

		// build the query
		$args = array(
			'meta_key' => 'client_id', 
			'meta_value' => $client_id, 
			'post_type' => 'post', 
			'posts_per_page' => -1, 
			'post_status' => 'publish'
		);

		$the_query = new WP_Query($args);

		//get the hashtag counts function
		function getHashtags($string) {
			$hashtags = FALSE;
			preg_match_all("/(#\w+)/u", $string, $matches);
			if ($matches) $hashtagsArray = $matches[0];
			$result = preg_replace('/[^a-zA-Z0-9_ -]/s','',$hashtagsArray);
			return $result;
		}

		if ($the_query->have_posts()) {

			while ($the_query->have_posts()) {
				
				$the_query->the_post();

				//getting the post caption data
				$caption_string = get_the_content();
				
				//get the hashtag counts from the caption using getHashtags function
				$post_hashtags = getHashtags($caption_string);

				//convert to lower case
				$post_hashtags = array_map('strtolower', $post_hashtags);

				// get the featured image
				$tn_id = get_post_meta(get_the_ID(), '_thumbnail_id', true);
				$image = wp_get_attachment_image_src( $tn_id, 'large' )[0];

				//for each hashtag inside the post hashtag array 
				foreach($post_hashtags as $hashtag) {

					if (!empty($image)) {
							
						$item = null;

						//check if hashtag exist in the global array and if yes increment the count (MUTABLE LOOP!)
						foreach($top_hashtags as &$struct) {

							if ($hashtag === $struct['hashtag']) {

								// minimum 3 characters hashtags
								if(strlen($hashtag)<3) continue;

								// ignore generic hashtag count update
				    			if (in_array($hashtag, $GLOBALS['generic_hashtags'])) continue;

								++$struct['count'];
								$item = $struct;
								break;
							}
							else $itemexist = false;
						}

						//hashtag does not exist in the global array add it 
						if (empty($item)) {

							$hashtag_result = array('hashtag' => $hashtag, 'count' => 1, 'image_url' => $image);

							// minimum 3 characters hashtags
							if(strlen($hashtag)<3) continue;

							// not pushing the hashtag to the gloabal array if generic hashtag
							if (in_array($hashtag, $GLOBALS['generic_hashtags'])) continue;

							array_push($top_hashtags, $hashtag_result);
						}
					}
				}
			}
			wp_reset_postdata();
		}
		usort($top_hashtags, function($a, $b) {
			return $b['count'] - $a['count'];
		});






		/************************************************
		* 												*
		* 												*
		* 				TOP CONTENT CREATORS 			*
		* 												*
		* 												*
		************************************************/

		
		//getting all the users linked to this client (some clients might have multiple users)
		$users = get_users(array('meta_key' => 'client_id', 'meta_value' => $client_id));

		// getting the list of the content creators from the database 
		$creators = $wpdb->get_results("SELECT id, username,screen_name, social_network_user_id, profile_pic_url FROM oculizm_content_creators WHERE social_network_user_id != 0 AND client_id = $client_id ", ARRAY_A);
		
		// add a count column and social network to each creator (MUTABLE LOOP!)
		foreach($creators as &$creator) {
			$creator['count'] = 0;
			$creator['social_network'] = "instagram";
		}
		
		foreach ($users as $u) {

			$user_id = $u->ID;

			//now for each user, get all published posts 	
			$args = array('author' => $user_id, 'post_type' => 'post', 'post_status' => array('publish'), 'posts_per_page' => -1 );
			$the_query = new WP_Query($args);

			if ($the_query->have_posts()) {	
				while ($the_query->have_posts()) {
					// for each post
					$the_query->the_post();
					
					$hashtag = get_field("hashtag");
					$creator_username = get_field("social_network_username");
					$creator_snu_id = get_field("social_network_user_id");
					
					//search if we already created an entry for this hashtag or this creator
					$hashtag_key = array_search($hashtag, array_keys($hashtag_count_array));
					
					//if it's the first occurence of this hashtag, initialize the counter to 1
					if(strlen($hashtag)>0){
						if(!$hashtag_key){
							$hashtag_count_array[$hashtag] = 1;
						}
						//otherwise increment it
						else{
							++$hashtag_count_array[$hashtag];
						}
					}

					//if business account
					if(strlen($creator_snu_id)>0){
						// check for each creator if user id equal creator social network user id (MUTABLE LOOP!)
						foreach($creators as &$c){
							if($c['social_network_user_id'] == $creator_snu_id) ++$c['count'];
						}
					}

					//if personal account
					//it will not be showing we are filtering in db all the social_network_user_id = 0
					// else if(strlen($creator_username)>0){

					// 	//checking for each creator if username equal creator username (MUTABLE LOOP!)
					// 	foreach($creators as &$c){
					// 				if($c['username'] == $creator_username) ++$c['count'] ;
					// 	}
					// }
				}

				//dont forget to reset the query for later user
				wp_reset_postdata();
			}
		}
		
		// sort hashtags by descending order
		arsort($hashtag_count_array);

		// sort content creators by post count	
		usort($creators, function($a, $b) {
			return $b['count'] - $a['count'];
		});

					
		// saved searches
		$saved_searches = $wpdb->get_results("SELECT * FROM oculizm_searches WHERE CLIENT_ID = " . $client_id, ARRAY_A);
		
		// populate results array
		$result['top_posts'] = $top_performing_posts;
		$result['top_content_creators'] = $creators;
		$result['top_hashtags'] = $top_hashtags;
		$result['saved_searches'] = $saved_searches;
		
		$res = json_encode($result);
		file_put_contents($clients_stats_cache_file, $res);
	 }
	else {
		$res = file_get_contents($clients_stats_cache_file);
	}
	echo $res;
	die;
}

// get top products
add_action('wp_ajax_get_top_products', 'get_top_products');
function get_top_products() {

    global $wpdb;

    $client_id = get_client_id();

    //for react project testing purposes
    $http_origin = get_http_origin();
    if($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com"){
        $client_id = 71950;
    }

    $top_product_counter = 0;

    // define variables
    $result = array();
    $top_performing_products = array();

    // some of the products do not exist anymore so we had to increase the limit and control it in the frontend 
    $top_products = $wpdb->get_results("SELECT count(*) as count_sku , sku , name
    FROM oculizm_order_items
    WHERE client_id = $client_id 
    GROUP BY sku, name
    ORDER BY count_sku DESC", ARRAY_A);
    
    // for each top product...
    foreach ($top_products as $p) {

        $product_sku = $p['sku'];
        $count_products = $p['count_sku'];
								$product_name = $p['name'];

        $product_obj = $wpdb->get_row("SELECT sku , product_id, title, image_link From oculizm_products WHERE ( sku = '$product_sku' && client_id='$client_id' && sku !='') LIMIT 1", OBJECT);  
        
								//if acumen match on the product name instead of the sku because the sku provided in the order item list
								// are different then the one in the DB or product feeds
								if ($client_id == "83953") {
									$product_obj = $wpdb->get_row("SELECT sku , product_id, title, image_link From oculizm_products WHERE ( title LIKE CONCAT('%', SUBSTRING_INDEX('$product_name' , ' - ', 1), '%') && client_id='$client_id' && sku !='') LIMIT 1", OBJECT);
								}	
        if ($product_obj) {
            $top_product_counter++;
            if ($product_obj->title == 'Item Customizations') continue; // Shopify feature
                
            $product = array(
                'product_id' => $product_obj->product_id,
                'product_sku' => $product_obj->sku,
                'image_link' => $product_obj->image_link,
                'product_title' => $product_obj->title,
                'count' => $count_products,
                'client_id' => $client_id
            );
            $top_performing_products[] = $product;

            if ($top_product_counter > 4) {

                // populate results array
                $result['top_products'] = $top_performing_products;
                $res = json_encode($result);
                echo $res;
                die();
            }
        }
    }

    $result = $top_performing_products;
    
    echo json_encode($result);
    die;
}