<?php

// get all searches
add_action('wp_ajax_get_searches', 'get_searches');
function get_searches() {

    $client_id = get_client_id();

	global $wpdb;

	$searches = $wpdb->get_results("SELECT * FROM oculizm_searches WHERE CLIENT_ID = " . $client_id, ARRAY_A);

	echo json_encode($searches);
	die;
}

// get a single search
add_action('wp_ajax_get_search', 'get_search');
function get_search() {

    $client_id = get_client_id();

	$search_id = $_REQUEST['search_id'];

	global $wpdb;

	$search = $wpdb->get_results("SELECT * FROM oculizm_searches WHERE CLIENT_ID = " . $client_id . " AND ID = " . $search_id, ARRAY_A);

	$result = $search[0];

	echo json_encode($result);
	die;
}

// add a new search
add_action('wp_ajax_add_search', 'add_search');
function add_search() {
	
    $client_id = get_client_id();

	$social_network = $_REQUEST['social_network'];
	$type = $_REQUEST['type'];

	if (!isset($_REQUEST['term'])) {
		echo json_encode("No search term specified.");
		die;
	}
	$term = $_REQUEST['term'];

	$hashtag_id = "";
	$user_id = "";
	$screen_name = "";
	$profile_pic_url = "";
	if (isset($_REQUEST['hashtag_id'])) $hashtag_id = $_REQUEST['hashtag_id'];
	if (isset($_REQUEST['user_id'])) $user_id = $_REQUEST['user_id'];
	if (isset($_REQUEST['screen_name'])) $screen_name = $_REQUEST['screen_name'];
	if (isset($_REQUEST['profile_pic_url'])) $profile_pic_url = $_REQUEST['profile_pic_url'];

	global $wpdb;

	// get all this client's searches
	$searches = $wpdb->get_results("SELECT * FROM oculizm_searches WHERE CLIENT_ID = " . $client_id . " ORDER BY ID DESC", ARRAY_A);

	// for each saved search...
	foreach ($searches as $s) {

		// check if we have a match, and fail if we find a duplicate
		if (($s['social_network'] == $social_network) && ($s['type'] == $type) && ($s['term'] == $term)) {
			$result = array();
			$result['error'] = "Search already exists";
			echo json_encode($result);
			die;
		}
	}

	// save the search
	$result = $wpdb->insert(
		'oculizm_searches', array(
			'client_id' => $client_id, 
			'social_network' => $social_network,
			'type' => $type,
			'term' => $term,
			'screen_name' => $screen_name,
			'hashtag_id' => $hashtag_id,
			'user_id' => $user_id,
			'profile_pic_url' => $profile_pic_url
		)
	);
	$search_id = (string)$wpdb->insert_id;

    // get the updated row(s)
    $result = $wpdb->get_results("SELECT * FROM oculizm_searches WHERE ID = " . $search_id, ARRAY_A);
    $result = $result[0];
    
	echo json_encode($result);
	die;
}


// delete a search
add_action('wp_ajax_delete_search', 'delete_search');
function delete_search() {
	
    $client_id = get_client_id();

	$search_id = $_REQUEST['search_id'];

	global $wpdb;

	// check that this client actually owns this search
	$s = $wpdb->get_results("SELECT * FROM oculizm_searches WHERE ID = " . $search_id, ARRAY_A);
    if (!isset($s[0]['client_id'])) {
        if ($s[0]['client_id'] !== $client_id) {
            echo json_encode("Invalid client ID");
            die();
        }
    }

	$result = array();
	
	$query1 = $wpdb->prepare('DELETE FROM oculizm_searches WHERE ID = %d', $search_id);
	$delete1 = $wpdb->query($query1);

	// delete also from insta recent posts
	$query2 = $wpdb->prepare('DELETE FROM oculizm_cached_instagram_posts WHERE search_id = %d', $search_id);
	$delete2 = $wpdb->query($query2);
	
	$result['delete1'] = $delete1;
	$result['delete2'] = $delete1;
	
	echo json_encode($result);
	die();
}



// get all searches expired images
add_action('wp_ajax_get_expired_searches', 'get_expired_searches');
function get_expired_searches() {
    
    $client_id = get_client_id();
    global $wpdb;

    $expiredSearchesMedia = array();

     // get all the searches for this client
     $clientSearches = $wpdb->get_results("SELECT * FROM oculizm_searches WHERE (CLIENT_ID = " . $client_id ." AND social_network = 'instagram' AND type = 'user' ) ", ARRAY_A);

     foreach($clientSearches as $search) {

                // setting the variables
                $search_screen_name = $search['screen_name'];
                $search_term = $search['term'];
                $search_id = $search['id'];
                $search_media_url = $search['profile_pic_url'];

                //parsing the media url
                parse_str($search_media_url, $media_url_array);

                //setting default value to media outdated
                $media_outdated = false;

                // or if there is no profile_pic_url at all
                if (empty($search_media_url)) 
                {   
                    $media_outdated = true;

                    //Get the current timestamp.
                    $currentTime = time();

                    //The number of hours that you want to subtract from the date and time.
                    $hoursToSubtract = 14;

                    //Convert those hours into seconds so that we can subtract them from our timestamp.
                    $timeToSubtract = ($hoursToSubtract * 60 * 60);

                    //Subtract the hours from our Unix timestamp.
                    $oeUnix = $currentTime - $timeToSubtract;

                }

                else {
                    // check if there's an OE parameter
                    if (array_key_exists('oe', $media_url_array)) {
                        $oeHex = $media_url_array['oe'];
                        $oeUnix = hexdec($oeHex);
                        $hours = 12;
                        $timestamp = (new DateTime())->modify("+{$hours} hours")->format('U');
                        
                        // check if OE is more then 12 hours
                        if($oeUnix < $timestamp){
                            $media_outdated = true;
                        }
                        // check if OE is not expired yet
                        else{
                            $media_outdated = false;
                        }
                    }
                }

                // OE IS Expired and need to be updated
                if($media_outdated) {

                    // build the search media object
                    $expiredSearcheMedia = array(
                        'search_id' => $search_id,
                        'search_screen_name' => $search_screen_name,
                        'search_term' => $search_term,
                        'search_media_url' => $search_media_url,
                        'search-media-expiry-date' => gmdate("Y-m-d H:i:s", $oeUnix)
                    );
                    array_push($expiredSearchesMedia, $expiredSearcheMedia);
                }


     }
     usort($expiredSearchesMedia, function($a, $b) {
        $datetime1 = strtotime($a['search-media-expiry-date']);
        $datetime2 = strtotime($b['search-media-expiry-date']);
        return $datetime1 - $datetime2;
            });
     echo json_encode($expiredSearchesMedia);
     die;
}


