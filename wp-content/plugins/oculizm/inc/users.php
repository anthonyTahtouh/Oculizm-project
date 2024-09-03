<?php

// get client ID
function get_client_id() {

    global $current_user;

    if (function_exists('wp_get_current_user')) {
      wp_get_current_user();
      $user_id = $current_user->ID; 

      if ($user_id !== null) {
          $client_id = get_field('client_id', 'user_' . $user_id);
          if ($client_id !== null) return $client_id;
          else return "NO_CLIENT_ID";
      }
    }
    else return "NO_CLIENT_ID";
}

// get a user
add_action('wp_ajax_get_oculizm_user', 'get_oculizm_user');
function get_oculizm_user() {
    global $wpdb;
    $client_id = get_client_id();
    $result = $wpdb->get_results("SELECT name FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
    $client_name = $result[0]['name'];

    $client_name_replace = preg_replace('/[^A-Za-z0-9\s]/', '', $client_name);
    $client_name_kebab = strtolower(str_replace(' ', '-', $client_name_replace));

    oLog("client_name_kebab : " . $client_name_kebab . "...");
    $client_logo = "https://app.oculizm.com/wp-content/uploads/client-logos/" . $client_name_kebab . ".png";

   
    
    $shop_links = $wpdb->get_results("SELECT shop_link , region FROM oculizm_product_feeds WHERE CLIENT_ID = " . $client_id, ARRAY_A);

    foreach ($shop_links as &$linkData) {
        $urlParts = parse_url($linkData['shop_link']);
        $domain = $urlParts['scheme'] . '://' . $urlParts['host'];
        $linkData['domain'] = $domain;
    }


    global $current_user;

    $user = array(
        "username" => $current_user->user_login,
        "email" => $current_user->user_email,
        "first_name" => $current_user->user_firstname,
        "last_name" => $current_user->user_lastname,
        "client_name" => $client_name,
        "client_logo" => $client_logo,
        "sites" => $shop_links
    );

    echo json_encode($user);
    die();
}

// get a client's users
add_action('wp_ajax_get_client_users', 'get_client_users');
function get_client_users() {
    
    $client_id = $_REQUEST['client_id'];

    $result = get_users(
        array(
            'meta_key' => "client_id",
            'meta_value' => $client_id,
            'number' => -1
        )
    );
    
    echo json_encode($result);
    die();
}

// edit a user
add_action('wp_ajax_update_user', 'update_user');
function update_user() {

    global $current_user;

    $first_name = $_REQUEST['first_name'];
    $last_name = $_REQUEST['last_name'];
    $email = $_REQUEST['email'];

    if ($current_user->user_email != $email) {
        if (!is_email(esc_attr($email))) {

            // NEW OCULIZM ERROR HANDLER
            $result = array("error" => "The Email you provided is not valid.  please try again.");
            echo json_encode($result);
            die();
        }
        
        if (email_exists(esc_attr($email))) {

            // NEW OCULIZM ERROR HANDLER
            $result = array("error" => "The email you provided is already used by another user.  try a different one.");
            echo json_encode($result);
            die();
        }
    }

    $user_id = $current_user->ID;

    $result = wp_update_user([
        'ID' => $user_id,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'user_email' => $email
    ]);

    // response
    if ($result == 1) {
        echo json_encode($current_user);
        die();        
    }
    echo json_encode($result);
    die();
}


// change user password
add_action('wp_ajax_update_user_password', 'update_user_password');
function update_user_password() {

    global $current_user;

    $password = $_REQUEST['password'];

    // check password is not empty
    if (empty($password)) {
        
        // NEW OCULIZM ERROR HANDLER
        $result = array("error" => "Password must not be empty.");
        echo json_encode($result);
        die();
    }

    // check password is long enough
    if (strlen($password) < 8) {

        // NEW OCULIZM ERROR HANDLER
        $result = array("error" => "Password must be at least 8 characters.");
        echo json_encode($result);
        die();
    }

    $user_id = $current_user->ID;

    $result = wp_update_user([
        'ID' => $user_id,
        'user_pass' => $password
    ]);

    // response
    if ($result == 1) {
        echo json_encode($current_user);
        die();        
    }
    echo json_encode($result);
    die();
}


// change client ID (from drop down in admin bar)
add_action('wp_ajax_update_user_client_id', 'update_user_client_id');
function update_user_client_id() {

    $client_id = get_client_id();

    $new_client_id = $_REQUEST['new_client_id'];

    // get the current user ID
    $current_user = wp_get_current_user();
    $user_id = 'user_' . $current_user->ID;

    $result = update_field('client_id', $new_client_id, $user_id );

    echo json_encode($result);
    die();
}


// get a user's preferences
add_action('wp_ajax_get_user_prefs', 'get_user_prefs');
function get_user_prefs() {
    
    // get the current user ID
    $current_user = wp_get_current_user();
    $user_id = $current_user->ID;

    global $wpdb;

    // see if this user preference already has a row in the DB
    $result = $wpdb->get_results("SELECT * FROM oculizm_user_prefs WHERE user_id = " . $user_id, ARRAY_A);

    if (sizeof($result) > 0) $result = $result[0];
    else $result = "";

    echo json_encode($result);
    die();
}

// set a user preference
add_action('wp_ajax_set_user_pref', 'set_user_pref');
function set_user_pref() {
    
    $client_id = get_client_id();

    // get the current user ID
    $current_user = wp_get_current_user();
    $user_id = $current_user->ID;

    // get the user preference to be set
    $user_pref_name = $_REQUEST['user_pref_name'];
    $user_pref_value = $_REQUEST['user_pref_value'];

    global $wpdb;

    // see if this user preference already has a row in the DB
    $result = $wpdb->get_results("SELECT * FROM oculizm_user_prefs WHERE user_id = " . $user_id, ARRAY_A);
    oLog($result);

    // if there is no row yet for this user, create it
    if (sizeof($result) == 0) {
        $result = $wpdb->query("INSERT INTO oculizm_user_prefs (`user_id`,`client_id`) VALUES ('$user_id','$client_id');");
        oLog($result);
    }

    // now update that row
    $result = $wpdb->query( $wpdb->prepare("UPDATE oculizm_user_prefs SET $user_pref_name = %s WHERE user_id = %s", $user_pref_value, $user_id));
    oLog($result);

    echo json_encode($result);
    die();
}



