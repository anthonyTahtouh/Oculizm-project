<?php

// get all galleries
add_action('wp_ajax_get_all_galleries', 'get_all_galleries');
function get_all_galleries() {

    $client_id = get_client_id();

	global $wpdb;

    $result = $wpdb->get_results("SELECT * FROM oculizm_galleries", ARRAY_A);

	echo json_encode($result);
	die();
}

add_action('wp_ajax_update_gallery_css', 'update_gallery_css');
function update_gallery_css() {

	$client_id = $_REQUEST['client_id'];
	$gallery_css = $_REQUEST['gallery_css'];
	
	global $wpdb;

	$result = $wpdb->query($wpdb->prepare("UPDATE oculizm_clients SET shop_css = %s WHERE id = %s", $gallery_css, $client_id));

	echo json_encode($result);
	die();
}

// get a client's galleries
add_action('wp_ajax_get_galleries', 'get_galleries');
function get_galleries() {

    $client_id = get_client_id();

    //for react project testing purposes
    $http_origin = get_http_origin();
    if ($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com") {
        $client_id = 71950;
    }

	global $wpdb;

	$result = $wpdb->get_results("SELECT * FROM oculizm_galleries WHERE CLIENT_ID = " . $client_id, ARRAY_A);

	echo json_encode($result);
	die();
}


// get a single gallery
add_action('wp_ajax_get_gallery', 'get_gallery');
function get_gallery() {
	
    $client_id = get_client_id();

	$gallery_id = $_REQUEST['gallery_id'];

	global $wpdb;

	$result = $wpdb->get_results("SELECT * FROM oculizm_galleries WHERE CLIENT_ID = " . $client_id ." AND ID = " . $gallery_id, ARRAY_A);
	
	if (count($result) > 0) $result = $result[0];

	echo json_encode($result);
	die();
}


// add a new gallery
add_action('wp_ajax_add_gallery', 'add_gallery');
function add_gallery() {

    $client_id = get_client_id();
	$gallery_name = $_REQUEST['gallery_name'];

    // remove the backslash from gallery_name
    $gallery_name = stripslashes($gallery_name);

	$result = add_gallery_internal($client_id, $gallery_name);

	echo json_encode($result);
	die;
}

function add_gallery_internal($client_id, $gallery_name) {
    global $wpdb;

    $g = array(
        "client_id" => $client_id,
        "name" => $gallery_name,
    );
    $wpdb->insert('oculizm_galleries', $g);

    $last_id = $wpdb->insert_id;

    update_gallery_options_internal(
        strval($client_id),
        strval($last_id),
        ""
    );

    $result = $wpdb->get_row("SELECT * FROM oculizm_galleries WHERE CLIENT_ID = " . $client_id . " AND ID = " . $last_id);

    return $result;
}



// SAVE GALLERY - AJAX HANDLER
add_action('wp_ajax_update_gallery_options', 'update_gallery_options');
function update_gallery_options() {
    
    $client_id = get_client_id();
    $shop_css = $_REQUEST['shop_css'];
    $shop_css = str_replace( array( "\'" ), "'", $shop_css);

    // save settings to the database
    $result = update_gallery_options_internal(
        $client_id,
        $shop_css
    );

	global $wpdb;
	$result = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE id = " . $client_id, ARRAY_A);
	
    echo json_encode($result);
    die();
}


// SAVE GALLERY options to the database
function update_gallery_options_internal(
    $client_id,
    $shop_css = ""
) {
    
    // verify request
    global $wpdb;
    // $g = $wpdb->get_results("SELECT * FROM oculizm_galleries WHERE ID = " . $gallery_id, ARRAY_A);
    // if ($g[0]['client_id'] !== $client_id) {
    //     echo json_encode("Invalid client ID");
    //     die();
    // }

    // save the gallery options to the database
    $sql = $wpdb->prepare("UPDATE oculizm_clients
		SET   shop_css = %s
		WHERE 	ID = %s", 
		$shop_css, $client_id);
    $result = $wpdb->query($sql);
    publish_client_tags($client_id);

    return $result;
}


// edit a gallery
add_action('wp_ajax_update_gallery', 'update_gallery');
function update_gallery() {
	
    $client_id = get_client_id();

	$gallery_id = $_REQUEST['gallery_id'];
	$gallery_name = $_REQUEST['gallery_name'];

	global $wpdb;

	// check that this client actually owns this gallery
	$g = $wpdb->get_results("SELECT * FROM oculizm_galleries WHERE ID = " . $gallery_id, ARRAY_A);
	if ($g[0]['client_id'] !== $client_id) {
		echo json_encode("Invalid client ID");
		die();
	}

	// update the gallery
	$result = $wpdb->query( $wpdb->prepare("UPDATE oculizm_galleries
		SET 	name = %s
		WHERE 	ID = %s", $gallery_name, $gallery_id)
    );

	echo json_encode($result);
	die();
}


// delete a gallery
add_action('wp_ajax_delete_gallery', 'delete_gallery');
function delete_gallery() {
	
    $client_id = get_client_id();

	$gallery_id = $_REQUEST['gallery_id'];

	global $wpdb;
	
	// check that this client actually owns this gallery
	$g = $wpdb->get_results("SELECT * FROM oculizm_galleries WHERE ID = " . $gallery_id, ARRAY_A);
	if ($g[0]['client_id'] != $client_id) {
		echo json_encode("Invalid client ID");
		die();
	}

	// delete the gallery
	$query = $wpdb->prepare('DELETE FROM oculizm_galleries WHERE id = %d', $gallery_id);
	$result = $wpdb->query($query);

	// now also delete any references to this gallery found in client's posts
	$args = array('meta_key' => 'client_id', 'meta_value' => $client_id, 'post_type' => 'post', 'posts_per_page' => -1);
	
	$the_query = new WP_Query($args);
	if ($the_query->have_posts()) {
		// for all posts...
		while ($the_query->have_posts()) {
			$the_query->the_post();

			// get this post's galleries
			$pg_string = get_field('galleries');

			// turn the comma separated list of gallery IDs into an array
			$pg_array = explode(",", $pg_string);

			// get the array key of the gallery ID
			$key = array_search($gallery_id, $pg_array);

			// if this post was indeed in this now deleted gallery...
			if ($key !== false) {
				// remove ref to this gallery
				unset($pg_array[$key]);

				// turn the array back into a comma separated list
				$pg_string = implode(",", $pg_array);

				// update this post's galleries
				$result = update_field('galleries', $pg_string);
			}
		}
	}

	echo json_encode($result);
	die();
}

// set custom ordering
add_action('wp_ajax_set_custom_ordering', 'set_custom_ordering');
function set_custom_ordering() {
    $gallery_id = intval($_REQUEST['gallery_id']);
    $custom_ordering_value = intval($_REQUEST['custom_ordering_value']);

    global $wpdb;

    $rows_affected = $wpdb->query($wpdb->prepare(
        "UPDATE oculizm_galleries
         SET custom_ordering = %d
         WHERE id = %d",
        $custom_ordering_value, $gallery_id
    ));

    echo json_encode($rows_affected);
    die();
}



