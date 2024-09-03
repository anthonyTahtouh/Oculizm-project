<?php

// get saved hashtag posts
add_action('wp_ajax_get_cached_instagram_posts', 'get_cached_instagram_posts');
function get_cached_instagram_posts() {

    global $wpdb;

    $client_id = get_client_id();

    $hashtag_id = $_REQUEST['hashtag_id'];
    $sql = "select * from `oculizm_cached_instagram_posts` where `search_id`='$hashtag_id' and `client_id`='$client_id' order by `created_date` desc";

    $result = $wpdb->get_results($sql, ARRAY_A);

    // mutable for loop!
    foreach ($result as &$r) {
        // add the path prefix (we don't store it in the DB to save space)
        $r['local_src'] = "/wp-content/uploads/" . $r['local_src'];
    }

    echo json_encode($result);

    die();
}


// Get post social IDs - needed on the front end to cross reference already curated posts
add_action('wp_ajax_get_already_curated_network_posts', 'get_already_curated_network_posts');
function get_already_curated_network_posts() {

    $client_id = get_client_id();
    $social_network = $_REQUEST['social_network'];

    $args = array('post_type' => 'post', 'post_status' => array('draft', 'future', 'publish'));
    
     // build the meta query
     if ($social_network) {
        $args['meta_query'] = array('relation'=> 'AND',
            array(
                array('key'=>'client_id','value'=>$client_id,'compare'=>'='),
                array('key'=>'social_network','value'=>$social_network,'compare'=>'like')
            ));
    } else {
        $args['meta_query'] = array('relation'=> 'AND',
            array(array('key'=> 'client_id','value'     => $client_id,'compare' => '='))
        );
    }

    // only returns 250 posts but it's the latest 100 posts so that's good
    $args['posts_per_page'] = 250;

    $the_query = new WP_Query($args);
    $posts = array();
    
    if ($the_query->have_posts()) {
        
        while ($the_query->have_posts()) {
            $the_query->the_post();
            
            // build the post object
            $post = array(
                'social_id' => get_field('social_id'),
                'album_index' => get_field('album_index')
            );
            array_push($posts, $post);
        }
        wp_reset_postdata();
    }

    $results = array(
        "posts" => $posts,
    );
    echo json_encode($results);
    die;
}


// get hidden network posts
add_action('wp_ajax_get_hidden_network_posts', 'get_hidden_network_posts');
function get_hidden_network_posts() {

    global $wpdb;

    $client_id = get_client_id();

    $sql = "select * from `oculizm_hidden_network_posts` where `client_id`='$client_id'";

    $result = $wpdb->get_results($sql, ARRAY_A);

    echo json_encode($result);

    die();
}


// hide a network post
add_action('wp_ajax_hide_network_post', 'hide_network_post');
function hide_network_post() {

    $client_id = get_client_id();
    $network_post_id = $_REQUEST['network_post_id'];

    global $wpdb;

    $result = $wpdb->insert( 
        'oculizm_hidden_network_posts', 
        array( 
            'client_id' => $client_id,
            'network_post_id' => $network_post_id
        ), 
        array( 
            '%s', 
            '%s'
        ) 
    );

    echo json_encode($result);

    die();
}


// unhide a network post
add_action('wp_ajax_unhide_network_post', 'unhide_network_post');
function unhide_network_post() {
    
    $client_id = get_client_id();
    $network_post_id = $_REQUEST['network_post_id'];

    global $wpdb;

    $query = "DELETE FROM oculizm_hidden_network_posts WHERE CLIENT_ID = " . $client_id . " AND network_post_id = '" . $network_post_id . "'";
    $result = $wpdb->query($query);

    echo json_encode($result);
    die();
}












