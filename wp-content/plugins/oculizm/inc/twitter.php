<?php

// initialise TwitterOAuth
// https://twitteroauth.com/

// load the Composer package handler
require_once "/home/bitnami/vendor/autoload.php";

// use the TwitterOAuth library which should have been installed via Composer
use Abraham\TwitterOAuth\TwitterOAuth as TwitterOAuth;

// AUTH STEP ONE
add_action('wp_ajax_request_twitter_token', 'request_twitter_token');
function request_twitter_token() {

    $client_id = get_client_id();
	$callback_url = site_url() . '/twitter';

    // define connection
    $connection = new TwitterOAuth($GLOBALS['twitter_consumer_key'], $GLOBALS['twitter_consumer_secret']);

    // request token
    $response = $connection->oauth('oauth/request_token', array('oauth_callback' => $callback_url));

    oLog('');
    oLog('*** NEW TWITTER CONNECTION ***');
    oLog('oauth/request_token()');
    oLog($response);

    // save request token
    $at = $response['oauth_token'];
    $ats = $response['oauth_token_secret'];

    global $wpdb;

    // delete the existing Twitter connection
    $query = $wpdb->prepare('DELETE FROM oculizm_connections WHERE social_network="twitter" AND client_id = %s', $client_id);
	$result = $wpdb->query($query);

    // now save the new one
    $c = array(
        "client_id" => $client_id,
        "social_network" => 'twitter',
        "twitter_oauth_access_token" => $at,
        "twitter_oauth_access_token_secret" => $ats
    );
    $result = $wpdb->insert('oculizm_connections', $c);
    $last_id = $wpdb->insert_id;

    // request authorisation URL
    $response = $connection->url("oauth/authorize", [
    	"oauth_token" => $at
    ]);

    oLog('oauth/authorize()');
    oLog($response);

	echo json_encode($response);
	die();
}


// AUTH STEP TWO
function exchange_twitter_token($twitter_oauth_access_token, $oauth_verifier) {

    $client_id = get_client_id();

	$connection_id;
	global $wpdb;

	// get this client's request token that we saved in step 1
	$connections = $wpdb->get_results('SELECT * FROM oculizm_connections WHERE social_network="twitter" AND CLIENT_ID = ' . $client_id, ARRAY_A);

	// find the right connection
    foreach ($connections as $c) {
        if ($c['twitter_oauth_access_token'] != null) {
        	$connection_id = $c['id'];
        	$oauth_token = $c['twitter_oauth_access_token'];
        	$oauth_token_secret = $c['twitter_oauth_access_token_secret'];
        }
    }

    // define connection
    $connection = new TwitterOAuth($GLOBALS['twitter_consumer_key'], $GLOBALS['twitter_consumer_secret'], $oauth_token, $oauth_token_secret);

	// exchange the request token for an access token
    $response = $connection->oauth('oauth/access_token', array('oauth_verifier' => $oauth_verifier));

    oLog('oauth/access_token');
    oLog($response);

    if (is_array($response)) {

    	// get the user ID
    	$twitter_user_id = $response['user_id'];

	    // now create a new connection object with the access token we just received
	    $connection = new TwitterOAuth($GLOBALS['twitter_consumer_key'], $GLOBALS['twitter_consumer_secret'], $response['oauth_token'], $response['oauth_token_secret']);
	
    	// now get the username and profile pic
		$args = ['user.fields' => 'created_at,description,entities,id,location,most_recent_tweet_id,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified_type,withheld'];
		$twitter_user = $connection->get("users/" . $twitter_user_id, $args);

    	oLog('users/' . $twitter_user_id);
		oLog($twitter_user);

    	// if there was no error...
    	if (isset($twitter_user->data)) {

    		$username = $twitter_user->data->username;
    		$screen_name = $twitter_user->data->name;
    		$profile_image_url = $twitter_user->data->profile_image_url;
			oLog($username);
			oLog($screen_name);
			oLog($profile_image_url);

			// now save the data
			$result = $wpdb->query( $wpdb->prepare("UPDATE oculizm_connections
				SET 	twitter_oauth_access_token = %s, 
						twitter_oauth_access_token_secret = %s, 
						twitter_user_id = %s, 
						screen_name = %s,
						username = %s, 
						profile_pic_url = %s
				WHERE 	ID = %s", $response['oauth_token'], $response['oauth_token_secret'], $response['user_id'], $screen_name, $username, $profile_image_url, $connection_id)
		    );
		}
    }

	$client = $wpdb->get_row("SELECT name FROM oculizm_clients WHERE id = " . $client_id, OBJECT);
    $message = $client->name . " authenticated their Twitter account! (Client ID " . $client_id . ")";

    oEmail('sean@oculizm.com', $message, $message);
    oEmail('anthony@oculizm.com', $message, $message);
	
    return $response;
}


// get X user
add_action('wp_ajax_get_twitter_user', 'get_twitter_user');
function get_twitter_user() {

    $client_id = get_client_id();
	$response = array();
	$connection_id;

    global $wpdb;

    // get Twitter credentials
    $client_connections = $wpdb->get_results("SELECT * FROM oculizm_connections WHERE CLIENT_ID = " . $client_id, ARRAY_A);
    foreach ($client_connections as $c) {
        if ($c['twitter_oauth_access_token'] != null) {
        	$twitter_oauth_access_token = $c['twitter_oauth_access_token'];
        	$twitter_oauth_access_token_secret = $c['twitter_oauth_access_token_secret'];
			$twitter_user_id = $c['twitter_user_id'];
			$connection_id = $c['id'];
			$response['connection'] = $c;
        }
    }
    if ($twitter_oauth_access_token === null) {
        echo json_encode("Invalid Twitter credentials");
        die();
    }

    // create the connection object
    $connection = new TwitterOAuth($GLOBALS['twitter_consumer_key'], $GLOBALS['twitter_consumer_secret'], $twitter_oauth_access_token, $twitter_oauth_access_token_secret);
	
	// connect to the API
	// WARNING: THERE SHOULD BE NO COMMAS SPACES IN BETWEEN THE FIELDS AND THE COMMAS!
	$args = ['user.fields' => 'created_at,description,entities,id,location,most_recent_tweet_id,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified_type,withheld'];
	$response['api_response'] = $connection->get("users/" . $twitter_user_id, $args);
	oLog($response);

	// save the profile pic in the database
	$profile_pic_url = $response['api_response']->data->profile_image_url;
	$result = $wpdb->query( $wpdb->prepare("UPDATE oculizm_connections
		SET 	profile_pic_url = %s
		WHERE 	ID = %s", $profile_pic_url, $connection_id)
    );

	// re-fetch the updated connection object
	$client_connection = $wpdb->get_results("SELECT * FROM oculizm_connections WHERE id = " . $connection_id, ARRAY_A);
	$response['connection'] = $client_connection[0];

	echo json_encode($response);
	die;
}

// lookup Twitter username
add_action('wp_ajax_get_twitter_users', 'get_twitter_users');
function get_twitter_users() {

    $client_id = get_client_id();
	$username = $_REQUEST['username'];

    global $wpdb;

    // get Twitter credentials
    $client_connections = $wpdb->get_results("SELECT * FROM oculizm_connections WHERE CLIENT_ID = " . $client_id, ARRAY_A);
    foreach ($client_connections as $c) {
        if ($c['twitter_oauth_access_token'] != null) {
        	$twitter_oauth_access_token = $c['twitter_oauth_access_token'];
        	$twitter_oauth_access_token_secret = $c['twitter_oauth_access_token_secret'];
			$twitter_user_id = $c['twitter_user_id'];
			$connection_id = $c['id'];
			$response['connection'] = $c;
        }
    }
    if ($twitter_oauth_access_token === null) {
        echo json_encode("Invalid Twitter credentials");
        die();
    }

    // create the connection object
    $connection = new TwitterOAuth($GLOBALS['twitter_consumer_key'], $GLOBALS['twitter_consumer_secret'], $twitter_oauth_access_token, $twitter_oauth_access_token_secret);
	
	// connect to the API
	// WARNING: THERE SHOULD BE NO COMMAS SPACES IN BETWEEN THE FIELDS AND THE COMMAS!
	$args = [
		"usernames" => $username,
		"user.fields" => 'profile_image_url'
	];
	$response = $connection->get("users/by", $args);
	oLog($response);

	echo json_encode($response);
	die;
}

// get X posts
add_action('wp_ajax_get_twitter_posts', 'get_twitter_posts');
function get_twitter_posts() {

    $client_id = get_client_id();
	$response = array();
	$connection_id;
	$search_term = $_REQUEST['search_term'];
	$search_type = $_REQUEST['search_type'];
	if (isset($_REQUEST['twitter_user_id'])) $twitter_user_id = $_REQUEST['twitter_user_id'] ?? '';
	$max_results = 24;

    global $wpdb;

	if (isset($_REQUEST['pagination_token']) && is_string($_REQUEST['pagination_token']) && $_REQUEST['pagination_token'] !== "") { 
		$pagination_token = $_REQUEST['pagination_token'];
	}

    // get Twitter credentials
    $client_connections = $wpdb->get_results("SELECT * FROM oculizm_connections WHERE CLIENT_ID = " . $client_id, ARRAY_A);
    foreach ($client_connections as $c) {
        if ($c['twitter_oauth_access_token'] != null) {
        	$twitter_oauth_access_token = $c['twitter_oauth_access_token'];
        	$twitter_oauth_access_token_secret = $c['twitter_oauth_access_token_secret'];
			$connection_id = $c['id'];
			$response['connection'] = $c;
		}
    }
    if ($twitter_oauth_access_token === null) {
        echo json_encode("Invalid Twitter credentials");
        die();
    }

    // create the connection object
    $connection = new TwitterOAuth($GLOBALS['twitter_consumer_key'], $GLOBALS['twitter_consumer_secret'], $twitter_oauth_access_token, $twitter_oauth_access_token_secret);

	// mentions
	if ($search_type == "mentions") {

		$args = [
	        'max_results' => $max_results,
	        'tweet.fields' => 'context_annotations',
	        'expansions' => 'attachments.media_keys,author_id,referenced_tweets.id,referenced_tweets.id.author_id',
	        'media.fields' => 'media_key,url,public_metrics,organic_metrics,duration_ms,width,height,preview_image_url,variants,alt_text',
	        'user.fields' => 'public_metrics,profile_image_url,verified,username,url',
	        // 'exclude' => 'replies',
		];
	    $response = $connection->get("users/$search_term/mentions", $args);
	}

	// profile or user
	else if ($search_type == "user") {

		// if a twitter_user_id is set then this is for a saved user search, not the profile
		if (ISSET($_REQUEST['twitter_user_id'])) $search_term = $twitter_user_id;

		$args = [
	        'max_results' => $max_results,
            'tweet.fields' => 'created_at,author_id,attachments,conversation_id,entities,in_reply_to_user_id,public_metrics,referenced_tweets',
            'expansions' => 'attachments.media_keys,author_id,referenced_tweets.id,referenced_tweets.id.author_id',
            'media.fields' => 'media_key,url,public_metrics,organic_metrics,duration_ms,width,height,preview_image_url,variants,alt_text',
            'user.fields' => 'public_metrics,profile_image_url,verified,username,url',
            'exclude' => 'replies',
		];
		if ($pagination_token !== null && $pagination_token !== "") {
			$args['pagination_token'] = $pagination_token;
		  }
	    $response = $connection->get("users/$search_term/tweets", $args);
	}

	// hashtag
	else {
        $search_term = str_replace("#", "", $search_term);

		$args = [
	        'max_results' => '100', // we need a lot here because a lot of videos are returned which currently (Nov 2023) aren't supported in the API
			"query" => $search_term . " has:media -is:retweet",
            'tweet.fields' => 'created_at,author_id,attachments,conversation_id,entities,in_reply_to_user_id,public_metrics,referenced_tweets',
            'expansions' => 'attachments.media_keys,author_id,referenced_tweets.id,referenced_tweets.id.author_id',
            'media.fields' => 'media_key,url,public_metrics,organic_metrics,duration_ms,width,height,preview_image_url,variants,alt_text',
            'user.fields' => 'public_metrics,profile_image_url,verified,username,url',
		];
		if ($pagination_token !== null && $pagination_token !== "") {
			$args['pagination_token'] = $pagination_token;
		  }
		$response = $connection->get("tweets/search/recent", $args);
	}
	// oLog($response);
	// oLog("pagination_token : " .$_REQUEST['pagination_token']. "...");

	echo json_encode($response);
	die;
}

