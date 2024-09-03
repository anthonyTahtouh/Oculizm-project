<?php
/*
Controller name: api-app
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
	register_rest_route( 'v2', '/oculizm_check_latest_app_version', array(
			'methods' => 'GET',
			'callback' => 'oculizm_check_latest_app_version',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/oculizm_login', array(
			'methods' => 'POST',
			'callback' => 'oculizm_login',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/oculizm_signup', array(
			'methods' => 'POST',
			'callback' => 'oculizm_signup',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/oculizm_forgot_password', array(
			'methods' => 'POST',
			'callback' => 'oculizm_forgot_password',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/oculizm_enter_one_time_passcode', array(
			'methods' => 'POST',
			'callback' => 'oculizm_enter_one_time_passcode',
			'permission_callback' => '__return_true',
	) );
} );

add_action( 'rest_api_init', function () {
	register_rest_route( 'v2', '/oculizm_set_new_password', array(
			'methods' => 'POST',
			'callback' => 'oculizm_set_new_password',
			'permission_callback' => '__return_true',
	) );
} );





/****************************************
*										*
*										*
*				APP ROUTES				*
*										*
*										*
****************************************/


// check latest app version
function oculizm_check_latest_app_version($request) {

	oLog("*** APP REQUEST: oculizm_check_latest_app_version ***");

	$latest_app_version = "1.0.5";

	if (isset($request['version']) && !empty($request['version'])) {
		$version = $request['version'];
		if (strlen($version) > 8) {
			$response['error'] = 'Invalid app version supplied';
			return json_encode($response);
		}
	}

	$response = array();
	$response['data'] = $latest_app_version;

	oLog($response);
	return json_encode($response);
}


// login
function oculizm_login($request) {

	global $wpdb;

	oLog("*** APP REQUEST: oculizm_login ***");

	validateAPIKeyAndEmail($request);
	$api_key = $request['api_key'];
	$email = $request['email'];
	$response = array();

    // get user data
    $user = get_user_by('email', $email);

    if (!$user) {
		$response['error'] = 'Account not found';
		return json_encode($response);
	}
	else {
		// oLog($user);

        $password_check = wp_check_password( $request['password'], $user->user_pass, $user->ID );

        if (!$password_check) {
			$response['error'] = 'Incorrect username or password';
			return json_encode($response);
        }
        else {

            // generate a unique auth token
            $token = bin2hex(openssl_random_pseudo_bytes(20));

            // store / update auth token in the database
            if (update_user_meta($user->ID, 'auth_token', $token)) {

                // return generated auth token and user ID
                $response['data']['user'] = array(
                    'auth_token'    =>  $token,
                    'id'       =>  $user->ID,
			    	'display_name' => $user->display_name,
                    'username'    =>  $user->user_login,
                    'email'    =>  $user->user_email
                );

			    // get the client ID
			    $client_id = get_field('client_id', 'user_' . $user->ID);
			    if (!$client_id) {
			    	$response['error'] = "Failed to get client ID";
			    	return json_encode($response);
			    }
			    
			    // get the client data
			    $client = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
			    if (!$client) {
			    	$response['error'] = "Failed to get client data";
					return json_encode($response);
			    }
			    else {
			    	$response['data']['client'] = $client[0];

    				$client_name_kebab = kebabCase($client[0]['name']);
				    $response['data']['client']['logo_url'] = site_url() . "/wp-content/uploads/client-logos/" . $client_name_kebab . ".png";
			    }
            }
            else {
				$response['error'] = 'Login failed';
				return json_encode($response);
            }
        }
    }

	oLog($response);
	return json_encode($response);
}


// signup
function oculizm_signup($request) {

	global $wpdb;

	oLog("*** APP REQUEST: oculizm_signup ***");

	validateAPIKeyAndEmail($request);
	$api_key = $request['api_key'];
	$email = $request['email'];
	$response = array();

	// validate password
	if (isset($request['password']) && !empty($request['password'])) {
		$password = $request['password'];
		if (strlen($password) < 8) {
			$response['error'] = 'Password should be at least 8 characters';
			return json_encode($response);
		}
	}

	// check email doesn't already exist
	if (true == email_exists($email)) {
		$response['error'] = 'There is already an account using that email';
		return json_encode($response);
	}

    // PLACEHOLDER DATA
    $client_name = "Client Name";
    $client_category = "Apparel";
    $user_first_name = "John";
    $user_last_name = "Smith";

	// add the new the user
	$user_id = wp_create_user($email, $password, $email);
    $user = get_user_by('id', $user_id);

    // generate a new client ID which doesn't match an existing client ID
    do {
        $id = rand(10000, 99999);
        $res = $wpdb->get_results("SELECT id FROM oculizm_clients WHERE id = '$id'");
    }
    while(count($res) > 0);

    // add the new client
    $wpdb->query("INSERT INTO oculizm_clients (`id`, `name`, `category`) VALUES ('$id', '$client_name', '$client_category');");
    $client_id = $wpdb->insert_id;

    // set role
    $user->set_role('editor');

    // update user name
	wp_update_user([
	    'ID' => $user->ID,
	    'first_name' => $user_first_name,
	    'last_name' => $user_last_name,
	]);

    // set user's client ID
    add_user_meta($user->ID, 'client_id', $client_id, false );

    // add a client gallery
    $gallery_name = stripcslashes($client_name);
    add_gallery_internal($client_id, $gallery_name);

    // generate a unique auth token
    $token = bin2hex(openssl_random_pseudo_bytes(20));

    // build the user object
    $user_array = array(
    	'id' => $user->ID,
    	'email' => $user->user_email,
    	'display_name' => $user->display_name,
        'username'    =>  $user->user_login,
        'email'    =>  $user->user_email
    );
    $response['data']['user'] = $user_array;

    // get the client data
    $client = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
    if (!$client) {
    	$response['error'] = "Failed to get client data";
		return json_encode($response);
    }
    else {
    	$response['data']['client'] = $client[0];

	    // client logo URL - made from hyphenated slug of client name
	    $client_slug = preg_replace("/[^\w]+/", "-", $client[0]['name']);
	    $response['data']['client']['logo_url'] = site_url() . "/wp-content/uploads/client-logos/" . strtolower($client_slug) . ".png";
    }

    // store / update auth token in the database
    if (update_user_meta($user->ID, 'auth_token', $token)) {
        $response['data']['user']['auth_token'] = $token;
    }

	return json_encode($response);
}


// forgot password
function oculizm_forgot_password($request) {

	global $wpdb;

	oLog("*** APP REQUEST: oculizm_forgot_password ***");

	validateAPIKeyAndEmail($request);
	$api_key = $request['api_key'];
	$email = $request['email'];
	$response = array();

    // get user data
    $user = get_user_by('email', $email);

    if (!$user) {
		$response['error'] = 'Account not found';
		return json_encode($response);
	}
	else {
		// oLog($user);

		// generate 5 digit OTP
		$otp = str_pad(rand(0, pow(10, 5)-1), 5, '0', STR_PAD_LEFT);

        // store / update auth token in the database
        if (update_user_meta($user->ID, 'auth_token', $otp)) {

        	// now send that user an email with the reset password link
        	$email_subject = "Oculizm one time passcode (OTP)";
            $email_message = "Here is your one time passcode (OTP) for Ocuilzm.<br><br><table width='300'><tr><td bgcolor='#eeeeee'><div style='color: #222222; font-family: Arial, serif, EmojiFont; text-align: center; font-weight:bold; font-size:32px;'>" . $otp . "</div></td></tr></table><br>";
            oEmail($email, $email_subject, $email_message);
            oEmail("sean@oculizm.com", $email_subject, "Someone requested an OTP (one time passcode) " . $email);

            // return generated auth token and user ID
            $response['data']['emailToValidateOTPWith'] = $user->user_email;
        }
        else {
			$response['error'] = 'Login failed';
			return json_encode($response);
        }
    }

	oLog($response);
	return json_encode($response);
}


// enter one time passcode
function oculizm_enter_one_time_passcode($request) {

	global $wpdb;

	oLog("*** APP REQUEST: enter_one_time_passcode ***");

	validateAPIKeyAndEmail($request);
	$api_key = $request['api_key'];
	$email = $request['email'];
	$response = array();

	// validate OTP
	if (isset($request['otp']) && !empty($request['otp'])) {
		$otp = $request['otp'];
		if (!is_numeric($otp)) {
			$response['error'] = 'Invalid OTP';
			return json_encode($response);
		}
	}

    // get user data
    $user = get_user_by('email', $email);

    if (!$user) {
		$response['error'] = 'Account not found';
		return json_encode($response);
	}
	else {
		// oLog($user);

		// get this user's OTP from the database
		$otp_from_database = get_user_meta($user->ID, 'auth_token', true);

		// check it matches the one supplied in the request
        if ($otp_from_database === $otp) {
            $response['data']['result'] = "true";
        }
        else {
			$response['error'] = 'OTP validation failed';
			return json_encode($response);
        }
    }

	oLog($response);
	return json_encode($response);
}


// set new password
function oculizm_set_new_password($request) {

	global $wpdb;

	validateAPIKeyAndEmail($request);
	$api_key = $request['api_key'];
	$email = $request['email'];
	$response = array();

	// validate password
	if (isset($request['password']) && !empty($request['password'])) {
		$password = $request['password'];
		if (strlen($password) < 8) {
			$response['error'] = 'Password should be at least 8 characters';
			return json_encode($response);
		}
	}

    // get user data
    $user = get_user_by('email', $email);

    if (!$user) {
		$response['error'] = 'Account not found';
		return json_encode($response);
	}
	else {
		// oLog($user);

	    // get the client ID
	    $client_id = get_field('client_id', 'user_' . $user->ID);
	    if (!$client_id) {
	    	$response['error'] = "Failed to get client ID";
	    	return json_encode($response);
	    }
	    
	    // get the client data
	    $client = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
	    if (!$client) {
	    	$response['error'] = "Failed to get client data";
			return json_encode($response);
	    }
	    else {
	    	$response['data']['client'] = $client[0];

    		$client_name_kebab = kebabCase($client['0']['name']);
		    $response['data']['client']['logo_url'] = site_url() . "/wp-content/uploads/client-logos/" . $client_name_kebab . ".png";
	    }

		// update the password
		wp_set_password($password, $user->ID);

        // generate a unique auth token
        $token = bin2hex(openssl_random_pseudo_bytes(20));

        // store / update auth token in the database
        if (update_user_meta($user->ID, 'auth_token', $token)) {

            // return generated auth token and user ID
            $response['data']['user'] = array(
                'auth_token'    =>  $token,
                'id'       =>  $user->ID,
		    	'display_name' => $user->display_name,
                'username'    =>  $user->user_login,
                'email'    =>  $user->user_email
            );
        }
        else {
			$response['error'] = 'Failed to update password';
			return json_encode($response);
        }
    }

	oLog($response);
	return json_encode($response);
}

















/********************* HELPER FUNCTIONS ***********************/

function validateAPIKeyAndEmail($request) {

	oLog($request['email']);

	// validate API key (hardcoded into the app so no one else can use it)
	if (isset($request['api_key']) && !empty($request['api_key'])) {
		$api_key = $request['api_key'];
		if ($api_key !== 'QWERTY-15873') {
			$response['error'] = 'Invalid API Key';
			return json_encode($response);
		}
	}

	// validate email
	if (isset($request['email']) && !empty($request['email'])) {
		$email = $request['email'];
		if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
			$response['error'] = 'Invalid email';
			return json_encode($response);
		}
	}
}



