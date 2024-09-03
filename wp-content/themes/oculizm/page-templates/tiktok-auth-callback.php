<?php

/* Template Name: TikTok Auth Callback */

// function to encode a URL
function encodeURIComponent($str) {
    $revert = array('%21'=>'!', '%2A'=>'*', '%27'=>"'", '%28'=>'(', '%29'=>')');
    return strtr(rawurlencode($str), $revert);
}

// TikTok app variables 
$client_key = "awan4p17k1hwgb5w";
$client_secret = "861a2e031c9b33018571e115efb98818";

// AUTH WORKFLOW
/*
	Click the TikTok login button on the front end which takes you here
	This page is also used as the callback page after authneticating with the TikTok server. 
	So to differentiate between the two stages we check for the existence of the $_REQUEST['code'] parameter. If it's not present then it's the earlier stage.



*/




// AUTH STEP 1
if (!isset($_REQUEST['code'])) {
	oLog('request-code is not set');

	$callback_url = encodeURIComponent("https://app.oculizm.com/tiktok-auth-callback");

	// determine CSRF
	session_start();
	if (empty($_SESSION['csrf'])) {
	    $_SESSION['csrf'] = bin2hex(random_bytes(32));
	}
	$csrf = $_SESSION['csrf'];

	// build TikTok URL
	$tiktok_auth_url = 'https://www.tiktok.com/auth/authorize/';
	$tiktok_auth_url .= '?client_key=' . $client_key;
	$tiktok_auth_url .= '&scope=user.info.basic,video.list';
	$tiktok_auth_url .= '&response_type=code';
	$tiktok_auth_url .= '&redirect_uri=' . $callback_url;
	$tiktok_auth_url .= '&state=' . $csrf;

	// redirect - we must use the wp_redirect here as header() doesn't work - maybe because this is WordPress
	wp_redirect($tiktok_auth_url);

	exit();


}

// AUTH STEP 2
else {

	// example response
	/*
	array(3) { 
		["code"]=> string(327) "b1IHizXUHIWIJPOSpO9IcwF-7qtBYShor6k9hgzl0SjivXU11L4MoHIeqocmz1xQnfD1E0OcLH0B3ek2K4flys94XsyKAJpcypcqzv3Lk2JNtUrHMlsZV89PglmWgZI_6UOcJPQuttWLdH4uXWzW23G5m2cxWW48mYNM4M0Wj1FuRG_RK1Jx7u5HNewr1pspYl1n5Mu0Uy8bGPyP6FUzCi18kXiqlwgCMaPl6Kds8L8gtHJqe3Te9n_4GeA9AdlvwdP2gaEpr59MeSXEwQcoxKp1DrJUcaqE3yx0Xvl46v5f6orSGbyul5Si10NF9L-f*3!5036" 
		["scopes"]=> string(26) "user.info.basic,video.list" 
		["state"]=> string(64) "bf098b39e6df373eb97980816d3abf701330906219219ab617d2061b3a7b88fb" 
	} 
	*/

	$csrf = $_REQUEST['state'];
	$code = $_REQUEST['code'];

	// TO DO: validate the CSRF

	// build the auth URL
	$tiktok_auth_url = 'https://open-api.tiktok.com/oauth/access_token/';
	$tiktok_auth_url .= '?client_key=' . $client_key;
	$tiktok_auth_url .= '&client_secret=' . $client_secret;
	$tiktok_auth_url .= '&code=' . $code;
	$tiktok_auth_url .= '&grant_type=authorization_code';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Return data inplace of echoing on screen
	curl_setopt($ch, CURLOPT_URL, $tiktok_auth_url);
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
		 array(2) { 
		 	["data"]=> array(11) { 
		 		["access_token"]=> string(69) "act.c168a2d4f8feb9202bbb01387aa87ecdcfVCd0JwGYhCWAW0Lf2hx7jmNJCL!5031" 
		 		["captcha"]=> string(0) "" 
		 		["desc_url"]=> string(0) "" 
		 		["description"]=> string(0) "" 
		 		["error_code"]=> int(0) 
		 		["expires_in"]=> int(86400) 
		 		["log_id"]=> string(34) "20230404110042D65F927831F53570C0D5" 
		 		["open_id"]=> string(36) "d0dae99e-c9d3-5ab7-8864-560b019f7cc8" 
		 		["refresh_expires_in"]=> int(31536000) 
		 		["refresh_token"]=> string(69) "rft.59b61f08607c1f0f791eb0ad3f2686ffoONVI8M3Y4SYJCBHTMM960N3wshh!4971" 
		 		["scope"]=> string(15) "user.info.basic" 
		 	} 
		 	["message"]=> string(7) "success" 
		 }
		 */

	    if (array_key_exists('data', $decoded_curl_result)) {

	    	// get the access token and open ID
	        if (isset($decoded_curl_result["data"]["access_token"])) $tiktok_access_token = $decoded_curl_result["data"]["access_token"];
	        if (isset($decoded_curl_result["data"]["open_id"])) $tiktok_open_id = $decoded_curl_result["data"]["open_id"];

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
			$curl_result_2 = curl_exec($ch);
			curl_close($ch);

			// if the API returned anything...
			if ($curl_result_2) {

			    // decode the curl result
			    $decoded_curl_result_2 = json_decode($curl_result_2, true);

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

	            if (array_key_exists('data', $decoded_curl_result_2)) {

	            	$decoded_curl_result_2 = $decoded_curl_result_2['data'];

		            if (array_key_exists('user', $decoded_curl_result_2)) {

		                if (isset($decoded_curl_result_2["user"]["display_name"])) $tiktok_display_name = $decoded_curl_result_2["user"]["display_name"];
		                if (isset($decoded_curl_result_2["user"]["avatar_url"])) $tiktok_profile_pic_url = $decoded_curl_result_2["user"]["avatar_url"];
		            
				    	$client_id = get_client_id();

				        // add the connnection
				        $add_connection = $wpdb->insert(
				            'oculizm_connections',
				            array(
				                'client_id' => $client_id, 
				                'social_network' => 'tiktok',
				                'tiktok_csrf' => $csrf, 
				                'tiktok_access_token' => $tiktok_access_token,
				                'tiktok_open_id' => $tiktok_open_id,
				                'tiktok_display_name' => $tiktok_display_name,
				                'tiktok_profile_pic_url' => $tiktok_profile_pic_url
				            ),
				            array(
				                '%s', '%s', '%s', '%s', '%s'
				            )
				        );

				        // SUCCESS
						if ($add_connection == "1") wp_redirect(home_url() . '/tiktok');

						// FAILURE
						else echo "Could not add connection to database.";
		            }
					else {
						echo "User parameter not found";
						var_dump($decoded_curl_result_2);
					}
	            }
				else {
					echo "User parameter not found";
					var_dump($decoded_curl_result_2);
				}
			}
	        else echo 'Could not complete curl operation';
	    }
	}


}




?>