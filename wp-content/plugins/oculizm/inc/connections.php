<?php

// get a client's connections
add_action('wp_ajax_get_connections', 'get_connections');
function get_connections() {

    $client_id = get_client_id();

    global $wpdb;

    $result = $wpdb->get_results("SELECT * FROM oculizm_connections WHERE CLIENT_ID = " . $client_id, ARRAY_A);

    echo json_encode($result);
    die();
}


// delete a connection
add_action('wp_ajax_delete_connection', 'delete_connection');
function delete_connection() {
    
    $client_id = get_client_id();

    $connection_id = $_REQUEST['connection_id'];

    global $wpdb;

    // delete the connection(s)
    $query = "DELETE FROM oculizm_connections WHERE CLIENT_ID = " . $client_id . " AND id = '" . $connection_id . "'";
    $result = $wpdb->query($query);

    echo json_encode($result);
    die();
}

// Facebook: generate a long lived token
add_action('wp_ajax_generate_facebook_long_lived_token', 'generate_facebook_long_lived_token');
function generate_facebook_long_lived_token() {

    $client_id = get_client_id();

    // get Facebook app credentials
    $facebook_app_id = $GLOBALS['facebook_app_id'];
    $facebook_client_secret = $GLOBALS['facebook_client_secret'];
	$regular_facebook_access_token = $_REQUEST['access_token'];

    // if this is the Facebook Reviewer client, make sure we use our test app credentials
    // if ($client_id == "71948") {
    //     $facebook_app_id = $GLOBALS['facebook_app_id_test'];
    //     $facebook_client_secret = $GLOBALS['facebook_client_secret_test'];
    // }

	$request_url = 'https://graph.facebook.com/' . $GLOBALS['facebook_api_version'] . '/oauth/access_token?grant_type=fb_exchange_token&client_id=' . $facebook_app_id . '&client_secret=' . $facebook_client_secret . '&fb_exchange_token=' . $regular_facebook_access_token;
        
	$response = wp_remote_get($request_url);

    oLog($response);

	echo json_encode($response);
	die();
}


// new Instagram connection
add_action('wp_ajax_setup_instagram', 'setup_instagram');
function setup_instagram() {
	
    $client_id = get_client_id();
    $instagram_connections = array();
    $result = array();

    // get parameters from request
	$facebook_token = $_REQUEST['facebook_token'];
	$facebook_user_id = $_REQUEST['facebook_user_id'];
	$ig_business_accounts = $_REQUEST['ig_business_accounts'];

    oLog("*** NEW INSTAGRAM CONNECTION ***");
    oLog($_REQUEST);
    oLog($ig_business_accounts);

    global $wpdb;

    foreach($ig_business_accounts as $c) {

        $instagram_business_id = $c[0];
        $username = $c[1];
        $screen_name = $c[2];
        $profile_pic_url = $c[3];
        if ($c[4] != "") $client_id = $c[4]; // if a sister client ID has been supplied, use that one instead of the main one defined above

        // add the connnection
        $add_connection = $wpdb->insert(
            'oculizm_connections',
            array(
                'client_id' => $client_id, 
                'social_network' => 'instagram',
                'twitter_oauth_access_token' => '', 
                'twitter_oauth_access_token_secret' => '', 
                'facebook_access_token' => $facebook_token,
                'facebook_user_id' => $facebook_user_id,
                'username' => $username,
                'screen_name' => $screen_name,
                'profile_pic_url' => $profile_pic_url,
                'instagram_business_id' => $instagram_business_id
            ),
            array(
                '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'
            )
        );

        array_push($instagram_connections, $add_connection);
        oLog($add_connection);
    }

    // send email
    $client = $wpdb->get_row("SELECT name FROM oculizm_clients WHERE id = " . $client_id, OBJECT);
    $message = $client->name . " authenticated their Instagram account! (Client ID " . $client_id . ")";
    $email_result = oEmail('sean@oculizm.com', $message, $message);
    $email_result = oEmail('anthony@oculizm.com', $message, $message);
       
    $result =  $instagram_connections;

	echo json_encode($result);
	die();
}


// new Facebook connection
add_action('wp_ajax_setup_facebook', 'setup_facebook');
function setup_facebook() {
    
    $client_id = get_client_id();
    $facebook_connections = array();
    $result = array();

    // get parameters from request
    $facebook_token = $_REQUEST['facebook_token'];
    $facebook_user_id = $_REQUEST['facebook_user_id'];
    $facebook_pages = $_REQUEST['facebook_pages'];

    oLog("*** NEW FACEBOOK CONNECTION ATTEMPT ***");
    oLog($_REQUEST);
    oLog($facebook_pages);

    global $wpdb;

    foreach($facebook_pages as $c) {

        $instagram_business_id = $c[0];
        $screen_name = $c[1];
        $facebook_page_access_token = $c[2];
        $profile_pic_url = $c[3];
        $username = $c[4];
        if ($c[5] != "") $client_id = $c[5]; // if a sister client ID has been supplied, use that one instead of the main one defined above

        // add the connnection
        $add_connection = $wpdb->insert(
            'oculizm_connections',
            array(
                'client_id' => $client_id,
                'social_network' => 'facebook',
                'twitter_oauth_access_token' => '',
                'twitter_oauth_access_token_secret' => '',
                'facebook_access_token' => $facebook_token,
                'facebook_page_access_token' => $facebook_page_access_token,
                'facebook_user_id' => $facebook_user_id,
                'username' => $username,
                'screen_name' => $screen_name,
                'profile_pic_url' => $profile_pic_url,
                'instagram_business_id' => $instagram_business_id
            ),
            array(
                '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'
            )
        );

        array_push($facebook_connections, $add_connection);
        oLog($add_connection);
    }

    $client = $wpdb->get_row("SELECT name FROM oculizm_clients WHERE id = " . $client_id, OBJECT);
    $message = $client->name . " authenticated their Facebook account! (Client ID " . $client_id . ")";
    $email_result = oEmail('sean@oculizm.com', $message, $message);
    $email_result = oEmail('anthony@oculizm.com', $message, $message);

    echo json_encode($facebook_connections);
    die();
}

