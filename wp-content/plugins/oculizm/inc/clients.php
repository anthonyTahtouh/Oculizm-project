<?php

// check client is inactive
function is_client_inactive($client_id) {

    $show_placeholder = false;
    
    // inactive clients
    if ($client_id  == '57345') $show_placeholder = true; // Apatchy
    if ($client_id  == '21296') $show_placeholder = true; // Claudio Lugli
    if ($client_id  == '84424') $show_placeholder = true; // Cocobelle Designs
    if ($client_id  == '82359') $show_placeholder = true; // Crazy Price Beds
    if ($client_id  == '53283') $show_placeholder = true; // Dr Watson CBD
    if ($client_id  == '10152') $show_placeholder = true; // Fusion Living
    if ($client_id  == '23018') $show_placeholder = true; // Gympro Apparel
    if ($client_id  == '67301') $show_placeholder = true; // Jayley
    if ($client_id  == '21846') $show_placeholder = true; // Lungolivigno
    if ($client_id  == '1839') $show_placeholder = true; // Mishanto
    // if ($client_id  == '78904') $show_placeholder = true; // One Choice Apparel
    if ($client_id  == '54428') $show_placeholder = true; // Paw Daw
    if ($client_id  == '14715') $show_placeholder = true; // Raging Bull
    if ($client_id  == '52313') $show_placeholder = true; // Vandem
    // if ($client_id  == '77974') $show_placeholder = true; // alaabi
    
    return $show_placeholder;
}


// get all clients
add_action('wp_ajax_get_all_clients', 'get_all_clients');
function get_all_clients() {
    
    global $wpdb;
    $result = $wpdb->get_results("SELECT * FROM oculizm_clients", ARRAY_A);

    // for each client...
    $clients = array();
    foreach ($result as $c) {

        $client_id = $c['id'];

        // connections
        $connections = $wpdb->get_results("SELECT * FROM oculizm_connections WHERE CLIENT_ID = " . $client_id, ARRAY_A);
        $social_networks = array_column($connections, 'social_network');
        array_multisort($social_networks, SORT_ASC, $connections);
        $c['connections'] = $connections;

        // product feeds
        $product_feeds = $wpdb->get_results("SELECT * FROM oculizm_product_feeds WHERE CLIENT_ID = " . $client_id, ARRAY_A);
        $c['product_feeds'] = $product_feeds;

        // galleries
        $galleries = $wpdb->get_results("SELECT * FROM oculizm_galleries WHERE CLIENT_ID = " . $client_id, ARRAY_A);
        $c['galleries'] = $galleries;
		
		// events
        $last_event = $wpdb->get_row("SELECT created FROM oculizm_events WHERE CLIENT_ID = " . $client_id . " ORDER BY created DESC LIMIT 1 ", OBJECT);
        if (!$last_event) {
			$c['has_tracking'] = 0;
			$c['last_event'] = '-';
		} else {
			$c['has_tracking'] = 1;
			$c['last_event'] = $last_event->created;
		}
		
        // total number of products
        $p = $wpdb->get_results("SELECT COUNT(*) FROM oculizm_products WHERE CLIENT_ID = " . $client_id, ARRAY_A);
        $c['num_products'] = $p[0]['COUNT(*)'];

        // last post date
        $last_post_date = "";
        $the_query = new WP_Query(array('meta_key' => 'client_id', 'meta_value' => $client_id ));
        if ($the_query->have_posts()) {
            while ($the_query->have_posts()) {
                $the_query->the_post();
                $last_post_date = get_the_date('Y-m-d');
                break;
            }
        }
        $c['last_post_date'] = $last_post_date;

        // total number of posts
        $c['num_posts'] = $the_query->found_posts;

        // last login
        $users = get_users(array('meta_key' => 'client_id', 'meta_value' => $client_id));
        $c['users'] = $users;
        $c['last_login'] = "";
        foreach ($users as $u) {
            $user_id = $u->ID;
            $roles = $u->roles;
            if ($roles[0] == "editor") { // assumption is that each client has only one user
                if (get_user_meta($user_id, 'last_login', true) != "") {
                    $last_login = new DateTime(get_user_meta($user_id, 'last_login', true));
                    $c['last_login'] = $last_login->format('Y-m-d');
                }
            }
        }
        $clients[] = $c;
    }

    echo json_encode($clients);
    die();
}


// get a client
add_action('wp_ajax_get_client', 'get_client');
function get_client() {
    
    $client_id = get_client_id();

    global $wpdb;
    $result = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);

    if (!$result) {
        echo json_encode("NO_CLIENT_ID");
        die();        
    }

    echo json_encode($result[0]);
    die();
}


// get a client's package
add_action('wp_ajax_get_package', 'get_package');
function get_package() {
    
    $client_id = get_client_id();

    global $wpdb;
    $result = $wpdb->get_results("SELECT package FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);

    if (!$result) {
        echo json_encode("NO_CLIENT_ID");
        die();        
    }

    echo json_encode($result[0]);
    die();
}


// get a client's sister accounts
add_action('wp_ajax_get_sister_accounts', 'get_sister_accounts');
function get_sister_accounts() {

    $client_id = get_client_id();
    $sister_accounts = array();
    $master_account_id = "";

    global $wpdb;

    $clients = $wpdb->get_results("SELECT * FROM oculizm_clients", ARRAY_A);

    // get the master account ID of this client
    foreach($clients as $c) {
        if ($c['id'] == $client_id) $master_account_id = $c['master_account_id'];
    }

    // if it has one, find its ssister accounts
    if ($master_account_id) {
        foreach($clients as $c) {
            if ($c['master_account_id'] == $master_account_id) $sister_accounts[] = $c;
        }        
    }

    echo json_encode($sister_accounts);
    die();
}


// change client status
add_action('wp_ajax_update_client_status', 'update_client_status');
function update_client_status() {
    
    $client_id = get_client_id();

    global $wpdb;

    $result = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);

    // if 0 make it -1, if -1 make it 0
    $inactive = $result[0]['inactive'];
    $inactive = (-1 * $inactive) + 1;

    $rows_affected = $wpdb->query($wpdb->prepare("UPDATE oculizm_clients
    SET inactive = %s
    WHERE id = %s", $inactive, $client_id));

    // fetch the updated row(s)
    $result = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);

    $result = $result[0];

    echo json_encode($result);
    die();
}


// update a client's lightbox options
add_action('wp_ajax_update_client_widget_options', 'update_client_widget_options');
function update_client_widget_options() {

    $client_id = get_client_id();

    // get options
    $client_data = isset($_REQUEST['client_data']) ? $_REQUEST['client_data']: "";

    $viewer_title = $client_data['viewer_title'];
    $share_text = $client_data['share_text'];
    $lightbox_z_index = $client_data['lightbox_z_index'];
    $hotspot_labels = $client_data['hotspot_labels'];
    $post_viewer = $client_data['post_viewer'];
    $use_thumb = $client_data['use_thumb'];
    $hide_credits = $client_data['hide_credits'];
    $shop_css = $client_data['shop_css'];
    // $shop_css = str_replace( array( "\'" ), "'", $shop_css);
    $shop_css = str_replace( array( '\\"' ), '"', $shop_css);

    global $wpdb;

    $sql = $wpdb->prepare("UPDATE oculizm_clients
        SET share_text = %s, viewer_title = %s, lightbox_z_index = %s, hotspot_labels = %s, post_viewer = %s, use_thumb = %s, hide_credits = %s, shop_css = %s
        WHERE   ID = %s", $share_text, $viewer_title, $lightbox_z_index, $hotspot_labels, $post_viewer, $use_thumb, $hide_credits, $shop_css, $client_id);
    $result = $wpdb->query($sql);
    
    publish_client_tags($client_id);
    
    $result = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
    
    echo json_encode($result);
    die();
}


// update a client's ASO settings
add_action('wp_ajax_update_client_aso_options', 'update_client_aso_options');
function update_client_aso_options() {

    $client_id = get_client_id();

    // get options
    $client_data = isset($_REQUEST['client_data']) ? $_REQUEST['client_data']: "";

    $ppg_hotspot_labels = $client_data['ppg_hotspot_labels'];
    $ppg_custom_css = $client_data['ppg_custom_css'];

    if (isset($client_data['PPGViewer'])) $PPGViewer = $client_data['PPGViewer'];
	else $PPGViewer = "asoNoLightbox";

    if (isset($client_data['ppg_show_products'])) $ppg_show_products = $client_data['ppg_show_products'];
	else $PPGViewer = "0";

    if (isset($client_data['ppg_use_carousel'])) $ppg_use_carousel = $client_data['ppg_use_carousel'];
	else $ppg_use_carousel = "0";

    if (!$ppg_use_carousel) $ppg_use_carousel = "0";

    // remove the backslash from custom css
    // $ppg_custom_css = stripslashes($ppg_custom_css);
    $ppg_custom_css = str_replace('\\"', '"', $ppg_custom_css);
    
    global $wpdb;

    $sql = $wpdb->prepare("UPDATE oculizm_clients
    SET  ppg_hotspot_labels=%s, ppg_use_carousel=%s, PPGViewer=%s, ppg_show_products=%s, ppg_custom_css=%s
    WHERE   ID = %s", $ppg_hotspot_labels, $ppg_use_carousel, $PPGViewer, $ppg_show_products, $ppg_custom_css, $client_id);
    $result = $wpdb->query($sql);

    publish_client_tags($client_id);

    $result = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
    
    echo json_encode($result);
    die();
}


// update a client's affiliate network
add_action('wp_ajax_update_client_affiliate_network', 'update_client_affiliate_network');
function update_client_affiliate_network() {

    $client_id = get_client_id();

    // get options
    $client_data = isset($_REQUEST['client_data']) ? $_REQUEST['client_data']: "";

    $affiliate_network = $client_data['affiliate_network'];
    $merchant_id = $client_data['merchant_id'];
    $banner_id = $client_data['banner_id'];
    $PID = $client_data['PID'];
    $SID = $client_data['SID'];
    $CID = $client_data['CID'];
    $LID = $client_data['LID'];

    global $wpdb;

    $sql = $wpdb->prepare("UPDATE oculizm_clients
        SET affiliate_network = %s, PID = %s, SID = %s, CID = %s, LID = %s, merchant_id = %s, banner_id = %s
        WHERE   ID = %s", $affiliate_network, $PID, $SID, $CID, $LID, $merchant_id, $banner_id, $client_id);

    $update_result = $wpdb->query($sql);

    $publish_result = publish_client_tags($client_id);
    
    $client = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
                
    // build payload
    $result = $client;

    echo json_encode($result);
    die();
}


// update a client's ASO CSS
add_action('wp_ajax_update_client_aso_css', 'update_client_aso_css');
function update_client_aso_css() {

    $client_id = $_REQUEST['client_id'];
    $aso_css = $_REQUEST['aso_css'];
    
    global $wpdb;

    $result = $wpdb->query( $wpdb->prepare("UPDATE oculizm_clients SET ppg_custom_css = %s WHERE id = %s", $aso_css, $client_id));

    echo json_encode($result);
    die();
}


// delete a client
add_action('wp_ajax_delete_client', 'delete_client');
function delete_client() {
    
    $client_id = $_REQUEST['client_id'];

    global $wpdb;

    $query = $wpdb->prepare('DELETE FROM oculizm_connections WHERE client_id = %d', $client_id);
    $result = $wpdb->query($query);

    $query1 = $wpdb->prepare('DELETE FROM oculizm_events WHERE client_id = %d', $client_id);
    $result1 = $wpdb->query($query1);

    $query2 = $wpdb->prepare('DELETE FROM oculizm_cached_instagram_posts WHERE client_id = %d', $client_id);
    $result2 = $wpdb->query($query2);

    $query3 = $wpdb->prepare('DELETE FROM oculizm_order_items WHERE client_id = %d', $client_id);
    $result3 = $wpdb->query($query3);

    $query4 = $wpdb->prepare('DELETE FROM oculizm_orders WHERE client_id = %d', $client_id);
    $result4 = $wpdb->query($query4);

    $query5 = $wpdb->prepare('DELETE FROM oculizm_content_creators WHERE client_id = %d', $client_id);
    $result5 = $wpdb->query($query5);

    $query6 = $wpdb->prepare('DELETE FROM oculizm_products WHERE client_id = %d', $client_id);
    $result6 = $wpdb->query($query6);

    $query7 = $wpdb->prepare('DELETE FROM oculizm_product_feeds WHERE client_id = %d', $client_id);
    $result7 = $wpdb->query($query7);

    $query8 = $wpdb->prepare('DELETE FROM oculizm_searches WHERE client_id = %d', $client_id);
    $result8 = $wpdb->query($query8);

    $query9 = $wpdb->prepare('DELETE FROM oculizm_galleries WHERE client_id = %d', $client_id);
    $result9 = $wpdb->query($query9);

    $query9 = $wpdb->prepare('DELETE FROM oculizm_support_tickets WHERE client_id = %d', $client_id);
    $result9 = $wpdb->query($query9);

    $query9 = $wpdb->prepare('DELETE FROM oculizm_support_ticket_items WHERE client_id = %d', $client_id);
    $result9 = $wpdb->query($query9);

    $query10 = $wpdb->prepare('DELETE FROM oculizm_clients WHERE id = %d', $client_id);
    $result10 = $wpdb->query($query10);

    $results = array($result , $result1 ,$result2 , $result3 ,$result4 ,$result5 ,$result6 ,$result7 ,$result8 ,$result9 ,$result10);
    
    echo json_encode($results);
    die();
}


// get client name from client ID
function get_client_name_from_id($client_id) {
    
    global $wpdb;
    $result = $wpdb->get_results("SELECT name FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);

    if (!$result) return "Client not found";

    return $result[0]['name'];
}


// add a new client
add_action('wp_ajax_add_client', 'add_client');
function add_client() {
    
    global $wpdb;

    // define variables
    // $name = $_POST['name'];
    $name = filter_input(INPUT_POST, "name",FILTER_SANITIZE_STRING);
    $first_name = filter_input(INPUT_POST, "first_name",FILTER_SANITIZE_STRING);
    $category = filter_input(INPUT_POST, "category",FILTER_SANITIZE_STRING);
    $last_name = filter_input(INPUT_POST, "last_name",FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, "client_email",FILTER_SANITIZE_STRING);
    $password = filter_input(INPUT_POST, "client_password",FILTER_SANITIZE_STRING);

    // check if we have same client name in the database
    $Client_name_check = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE name = '$name' ", ARRAY_A);
    if ($Client_name_check) {
    $name = $_POST['name'];
        echo json_encode("Client Name already exists");
        die();
    }

    // generate a new client ID which doesn't match an existing client ID
    do {
        $id = rand(10000, 99999);
        $res = $wpdb->get_results("SELECT id FROM oculizm_clients WHERE id = '$id'");
    }
    while(count($res) > 0);

    // add the new client
    $wpdb->query("INSERT INTO oculizm_clients (`id`, `name`, `category`) VALUES ('$id', '$name', '$category');");
    $client_id = $wpdb->insert_id;

    if ($client_id) {

        // add user
        $user_id = wp_create_user($email, $password, $email);

        // set role
        $user = new WP_User($user_id);
        $user->set_role('editor');

        $result = wp_update_user(['ID' => $user_id, 'first_name' => $first_name, 'last_name' => $last_name]);

        // set client ID
        add_user_meta($user_id, 'client_id', $client_id, false );

        // add gallery
        $gallery_name = stripcslashes($name);
        $gallery_description = "";
        add_gallery_internal($client_id, $gallery_name);
    }

    // build payload
    $result = array(
        "username" => $email, 
        "password" => $password
    );
    
    echo json_encode($result);
    die();
}

// verify client ID
function verify_client_id($client_id) {
    if (ISSET($client_id) && !empty($client_id)) {
        if (is_numeric($client_id)) {
            global $wpdb;
            $result = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
            if (!$result) {
                echo json_encode("Invalid client ID");
                die();
            }
        } else {
            echo json_encode("No client ID supplied");
            die();
        }
    } else {
        echo json_encode("No client ID supplied");
        die();
    }
}



