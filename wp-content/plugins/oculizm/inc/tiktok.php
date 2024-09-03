<?php

// get TikTok user info
add_action('wp_ajax_get_tiktok_user_info', 'get_tiktok_user_info');
function get_tiktok_user_info() {

    $client_id = get_client_id();

	$response[] = array();

    global $wpdb;
    
    // get TikTok credentials
    $connections = $wpdb->get_results("SELECT * FROM oculizm_connections WHERE CLIENT_ID = " . $client_id, ARRAY_A);
    foreach ($connections as $c) {
        if ($c['tiktok_access_token'] != null) $tiktok_access_token = $c['tiktok_access_token'];
        $response['connection'] = $c;
    }
    if ($tiktok_access_token === null) {
        echo json_encode("Invalid TikTok credentials");
        die();
    }


    // now get the basic user info
    $url = 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count';

	// set curl header
	$header = array('Authorization: Bearer ' . $tiktok_access_token);

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Return data inplace of echoing on screen
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt( $ch, CURLOPT_ENCODING, "UTF-8" );
	$curl_result = curl_exec($ch);
	curl_close($ch);

	// if the API returned anything...
	if ($curl_result) {

	    // decode the curl result
	    $decoded_curl_result = json_decode($curl_result, true);

	    // example response
	    /*
	    {
		    "user": {
		        "display_name": "sean",
		        "open_id": "d0dae99e-c9d3-5ab7-8864-560b019f7cc8",
		        "union_id": "c0c7e247-a138-568f-baf7-bab7f6483cf5",
		        "avatar_url": "https://p16-sign-va.tiktokcdn.com/musically-maliva-obj/1594805258216454~c5_168x168.jpeg?x-expires=1680782400&x-signature=qlfufYa1HZf9yZ6UeEtaH2ZbysI%3D"
		    }
		}
		*/

	    $response['api_response'] = $decoded_curl_result;

	    echo json_encode($response);
	    die();
	}
    else echo 'Could not complete curl operation';
    die();
}



// get TikTok posts
add_action('wp_ajax_get_tiktoks', 'get_tiktoks');
function get_tiktoks() {

    $client_id = get_client_id();

    global $wpdb;
    
    // get TikTok credentials
    $connections = $wpdb->get_results("SELECT * FROM oculizm_connections WHERE CLIENT_ID = " . $client_id, ARRAY_A);
    foreach ($connections as $c) {
        if ($c['tiktok_access_token'] != null) $tiktok_access_token = $c['tiktok_access_token'];
    }
    if ($tiktok_access_token === null) {
        echo json_encode("Invalid TikTok credentials");
        die();
    }

    $url = 'https://open.tiktokapis.com/v2/video/list/?fields=cover_image_url,id,title,create_time,share_url,video_description,duration,height,width,title,like_count,comment_count,share_count,view_count,embed_html';

	// set curl header
	$header = array('Authorization: Bearer ' . $tiktok_access_token);

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Return data inplace of echoing on screen
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt( $ch, CURLOPT_ENCODING, "UTF-8" );
	$curl_result = curl_exec($ch);
	curl_close($ch);

	// if the API returned anything...
	if ($curl_result) {

	    // decode the curl result
	    $decoded_curl_result = json_decode($curl_result, true);

	    // example response
	    /*
	    	???
		*/

	    echo json_encode($decoded_curl_result);
	    die();
	}
    else echo 'Could not complete curl operation';
    die();
}


