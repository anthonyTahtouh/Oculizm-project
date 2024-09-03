<?php

// get all posts from a client
// add_action('wp_ajax_get_oculizm_posts', 'get_oculizm_posts');
// function get_oculizm_posts() {
    
//     $client_id = get_client_id();

//      //for react project testing purposes
//      $http_origin = get_http_origin();
//      if($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com"){
//          $client_id = 71950;
//      }
    
//     $gallery_id = '';
//     if (isset($_REQUEST['gallery_id'])) {
//         if ($_REQUEST['gallery_id'] != null) $gallery_id = $_REQUEST['gallery_id'];
//     }
    
//     // pagination
//     $page = 1;
//     $limit = 96;
    
//     //for react project testing purposes
//     $http_origin = get_http_origin();
//     if($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com"){
//         $limit = 10000;
//     }
//     if (ISSET($_REQUEST['page'])) $page = $_REQUEST['page'];

//     $args = array('post_type' => 'post','paged'=>$page, 'posts_per_page' => $limit, 'post_status' => array('draft', 'future', 'publish'));
    
//     // build the meta query
//     if ($gallery_id) {
//         $args['meta_query'] = array('relation'=> 'AND',
//             array(
//                 array('key'=>'client_id','value'=>$client_id,'compare'=>'='),
//                 array('key'=>'galleries','value'=>$gallery_id,'compare'=>'like')
//             ));
//     } else {
//         $args['meta_query'] = array('relation'=> 'AND',
//             array(array('key'=> 'client_id','value'		=> $client_id,'compare'	=> '='))
//         );
//     }
    
//     $the_query = new WP_Query($args);
//     $posts = array();
    
//     if ($the_query->have_posts()) {
        
//         while ($the_query->have_posts()) {
//             $the_query->the_post();
            
//             // get the post's galleries
//             $pg_string = get_field('galleries');

//             //initializing video url
//             $video_url = "";
//             $image_url = "";
            
//             // turn the comma separated list of gallery IDs into an array
//             $pg_array = explode(",", $pg_string);
            
//             // if a gallery ID was supplied...
//             if (isset($gallery_id)) {
//                 if($gallery_id){
//                     // check if the array contains the supplied gallery ID
//                     $key = array_search($gallery_id, $pg_array);
                    
//                     // and if this post is not in that gallery, skip it
//                     if ($key === false) continue;
//                 }
//             }
            
//             // get the featured image
//             $tn_id = get_post_meta(get_the_ID(), '_thumbnail_id', true);
//             $image_url = wp_get_attachment_image_src($tn_id, 'large');
            
//             // now check for the featured image's thumbnail ID (this is where we store a video if there is one)
//             $vid_id = get_post_meta($tn_id, '_thumbnail_id', true);
//             $video_url = wp_get_attachment_url($vid_id);
            
//             // image
//             if ($image_url != null) {
//                 $image_url = $image_url[0];
//                 $image_url = str_replace("http:", "https:", $image_url);
//                 $image_url = str_replace("https://localhost", "http://localhost", $image_url);
//             }
            
//             // video created using create page
//             else{
//                 $image_url = wp_get_attachment_url($tn_id);
//                 $video_url = $image_url;
//             } 
            
//             // user / creator / author
//             $author_name = get_the_author();

//             // date
//             $date = get_the_time('U');
//             $date_diff = human_time_diff($date, current_time('timestamp'), 1);
            
//             // pinned post
//             $pinned_post = false;
//             if (is_sticky()) $pinned_post = true;
            
//             // build the post object
//             $post = array(
//                 'post_id' => get_the_ID(),
//                 'post_title' => get_the_title(),
//                 // 'permalink' => get_the_permalink(),
//                 'caption' => get_the_content(),
//                 'image_url' => $image_url,
//                 'post_status' => get_post_status(),
//                 'image_alt_text' => get_field('image_alt_text'),
//                 'products' => get_field('matched_products'),
//                 'source_url' => get_field('source_url'),
//                 'social_network' => get_field('social_network'),
//                 'social_id' => get_field('social_id'),
//                 'galleries' => $pg_array,
//                 'date' => $date,
//                 'date_diff' => $date_diff,
//                 'video_url' => $video_url,
//                 'pinned_post' => $pinned_post,
//                 'author_name' => $author_name
//             );
//             array_push($posts, $post);
//         }
//         wp_reset_postdata();
//     }

//     $results = array(
//         "posts" => $posts,
//         "total" => $the_query->found_posts,
//         "limit" => $limit,
//     );
//     echo json_encode($results);
//     die;
// }



// get all posts from a client
add_action('wp_ajax_get_oculizm_posts', 'get_oculizm_posts');
function get_oculizm_posts() {
    
    $client_id = get_client_id();
    global $wpdb;

    // for react project testing purposes
    $http_origin = get_http_origin();
    if($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com"){
        $client_id = 71950;
    }
    
    $gallery_id = '';
    if (isset($_REQUEST['gallery_id'])) {
        if ($_REQUEST['gallery_id'] != null) $gallery_id = $_REQUEST['gallery_id'];
    }

    
    // pagination
    $page = 1;
    $limit = 96;
    
    // for react project testing purposes
    $http_origin = get_http_origin();
    if($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com"){
        $limit = 10000;
    }
    if (isset($_REQUEST['page'])) $page = $_REQUEST['page'];

    $args = array('post_type' => 'post', 'paged' => $page, 'posts_per_page' => $limit, 'post_status' => array('draft', 'future', 'publish'));
    
    // build the meta query
    if ($gallery_id) {
        $args['meta_query'] = array('relation'=> 'AND',
            array(
                array('key'=>'client_id','value'=>$client_id,'compare'=>'='),
                array('key'=>'galleries','value'=>$gallery_id,'compare'=>'like')
            ));
    } else {
        $args['meta_query'] = array('relation'=> 'AND',
            array(array('key'=> 'client_id','value' => $client_id,'compare'=> '='))
        );
    }
    
    $the_query = new WP_Query($args);
    $posts = array();
    
    if ($the_query->have_posts()) {
        
        while ($the_query->have_posts()) {
            $the_query->the_post();
            
            // get the post's galleries
            $pg_string = get_field('galleries');

            // initializing video url
            $video_url = "";
            $image_url = "";
            
            // turn the comma separated list of gallery IDs into an array
            $pg_array = explode(",", $pg_string);
            
            // if a gallery ID was supplied...
            if (isset($gallery_id)) {
                if($gallery_id){
                    // check if the array contains the supplied gallery ID
                    $key = array_search($gallery_id, $pg_array);
                    
                    // and if this post is not in that gallery, skip it
                    if ($key === false) continue;
                }
            }
            
            // get the featured image
            $tn_id = get_post_meta(get_the_ID(), '_thumbnail_id', true);
            $image_url = wp_get_attachment_image_src($tn_id, 'large');
            
            // now check for the featured image's thumbnail ID (this is where we store a video if there is one)
            $vid_id = get_post_meta($tn_id, '_thumbnail_id', true);
            $video_url = wp_get_attachment_url($vid_id);
            
            // image
            if ($image_url != null) {
                $image_url = $image_url[0];
                $image_url = str_replace("http:", "https:", $image_url);
                $image_url = str_replace("https://localhost", "http://localhost", $image_url);
            }
            
            // video created using create page
            else{
                $image_url = wp_get_attachment_url($tn_id);
                $video_url = $image_url;
            } 
            
            // user / creator / author
            $author_name = get_the_author();

            // date
            $date = get_the_time('U');
            $date_diff = human_time_diff($date, current_time('timestamp'), 1);
            
            // pinned post
            $pinned_post = false;
            if (is_sticky()) $pinned_post = true;
            
            // build the post object
            $post = array(
                'post_id' => get_the_ID(),
                'post_title' => get_the_title(),
                // 'permalink' => get_the_permalink(),
                'caption' => get_the_content(),
                'image_url' => $image_url,
                'post_status' => get_post_status(),
                'image_alt_text' => get_field('image_alt_text'),
                'products' => get_field('matched_products'),
                'source_url' => get_field('source_url'),
                'social_network' => get_field('social_network'),
                'social_id' => get_field('social_id'),
                'galleries' => $pg_array,
                'date' => $date,
                'date_diff' => $date_diff,
                'video_url' => $video_url,
                'pinned_post' => $pinned_post,
                'author_name' => $author_name
            );
            array_push($posts, $post);
        }
        wp_reset_postdata();
    }

    // Get custom_order if custom_ordering is true for the given gallery_id
    $custom_ordering = $wpdb->get_results("SELECT custom_ordering FROM oculizm_galleries WHERE id = " . $gallery_id, ARRAY_A);

    // Check if custom_ordering is true
    if ($custom_ordering && $custom_ordering[0]['custom_ordering'] == 1) {
        $custom_order = get_post_meta($gallery_id, 'posts_custom_order', true);
        if ($custom_order) {
            $ordered_posts = array();
            $order = explode(',', $custom_order);

            // Arrange posts in custom order
            foreach ($order as $post_id) {
                foreach ($posts as $key => $post) {
                    if ($post['post_id'] == $post_id) {
                        $ordered_posts[] = $post;
                        unset($posts[$key]);
                        break;
                    }
                }
            }

            // Append remaining posts that are not in custom order
            $posts = array_merge($ordered_posts, $posts);
        }
    }

    $results = array(
        "posts" => $posts,
        "total" => $the_query->found_posts,
        "limit" => $limit,
    );
    echo json_encode($results);
    die;
}


// Function to save the custom order of posts
add_action('wp_ajax_save_oculizm_posts_order', 'save_oculizm_posts_order');
function save_oculizm_posts_order() {
    $gallery_id = $_POST['gallery_id'];
    $custom_order = $_POST['custom_order'];
    
    if ($gallery_id && $custom_order) {
        update_post_meta($gallery_id, 'posts_custom_order', $custom_order);
        wp_send_json_success();
    } else {
        wp_send_json_error('Invalid gallery ID or custom order.');
    }
}


//get filtered posts for a client
add_action('wp_ajax_get_oculizm_filtered_posts', 'get_oculizm_filtered_posts');
function get_oculizm_filtered_posts() {
    
    $client_id = get_client_id();
    global $wpdb;
    
    $gallery_id = '';
    if (isset($_REQUEST['gallery_id'])) {
        if ($_REQUEST['gallery_id'] != null) $gallery_id = $_REQUEST['gallery_id'];
    }
    $status = '';
    if (isset($_REQUEST['status'])) {
        if ($_REQUEST['status'] != null){
            if($_REQUEST['status'] == "all") $status = array('draft', 'publish');
            if($_REQUEST['status'] == "published") $status = array('publish');
            if($_REQUEST['status'] == "draft") $status = array('draft');
            if($_REQUEST['status'] == "future") $status = array('future');
        } 
    }

    $mediaType = '';
    if (isset($_REQUEST['mediaType'])) {
        if ($_REQUEST['mediaType'] != null) $mediaType = $_REQUEST['mediaType'];
    }

    $taggedProducts = '';
    if (isset($_REQUEST['taggedProducts'])) {
        if ($_REQUEST['taggedProducts'] != null) $taggedProducts = $_REQUEST['taggedProducts'];
    }

    $pinnedStatus = '';
    if (isset($_REQUEST['pinnedStatus'])) {
        if ($_REQUEST['pinnedStatus'] != null) $pinnedStatus = $_REQUEST['pinnedStatus'];
    }

    // pagination
    $page = 1;
    $limit = 96;
    
    if (ISSET($_REQUEST['page'])) $page = $_REQUEST['page'];

    $args = array('post_type' => 'post', 'posts_per_page' => -1, 'post_status' => $status);
    
    // build the meta query
    if ($gallery_id) {
        $args['meta_query'] = array('relation'=> 'AND',
            array(
                array('key'=>'client_id','value'=>$client_id,'compare'=>'='),
                array('key'=>'galleries','value'=>$gallery_id,'compare'=>'like')
            ));
    } else {
        $args['meta_query'] = array('relation'=> 'AND',
            array(array('key'=> 'client_id','value'		=> $client_id,'compare'	=> '='))
        );
    }
    
    $the_query = new WP_Query($args);
    $posts = array();
    
    if ($the_query->have_posts()) {
        
        while ($the_query->have_posts()) {
            $the_query->the_post();
            
            // get the post's galleries
            $pg_string = get_field('galleries');

            //initializing video url
            $video_url = "";
            $image_url = "";
            
            // turn the comma separated list of gallery IDs into an array
            $pg_array = explode(",", $pg_string);
            
            // if a gallery ID was supplied...
            if (isset($gallery_id)) {
                if($gallery_id){
                    // check if the array contains the supplied gallery ID
                    $key = array_search($gallery_id, $pg_array);
                    
                    // and if this post is not in that gallery, skip it
                    if ($key === false) continue;
                }
            }
            
            // get the featured image
            $tn_id = get_post_meta(get_the_ID(), '_thumbnail_id', true);
            $image_url = wp_get_attachment_image_src( $tn_id, 'large' )[0];
            
            // $image_url = wp_get_attachment_image_src( $tn_id, 'thumbnail' )[0];
            
            // now check for the featured image's thumbnail ID (this is where we store a video if there is one)
            $vid_id = get_post_meta($tn_id, '_thumbnail_id', true);
            $video_url = wp_get_attachment_url($vid_id);

            // user / creator / author
            $author_name = get_the_author();

            // date
            $date = get_the_time('U');
            $date_diff = human_time_diff($date, current_time('timestamp'), 1);
            
            // pinned post
            $pinned_post = false;
            if (is_sticky()) $pinned_post = true;

            $matched_products = get_field('matched_products');

            $matched_products = get_field('matched_products');

            if (is_array($matched_products)) {
                $count_matched_products = count($matched_products);
            } else {
                $count_matched_products = 0;
            }

            // fixing the image url
            $image_url = str_replace("http:", "https:", $image_url);
            $image_url = str_replace("https://localhost", "http://localhost", $image_url);

            // build the post object
            $post = array(
                'post_id' => get_the_ID(),
                'post_title' => get_the_title(),
                // 'permalink' => get_the_permalink(),
                'caption' => get_the_content(),
                'image_url' => $image_url,
                'post_status' => get_post_status(),
                'image_alt_text' => get_field('image_alt_text'),
                'products' => get_field('matched_products'),
                'source_url' => get_field('source_url'),
                'social_network' => get_field('social_network'),
                'social_id' => get_field('social_id'),
                'galleries' => $pg_array,
                'date' => $date,
                'date_diff' => $date_diff,
                'video_url' => $video_url,
                'pinned_post' => $pinned_post,
                'author_name' => $author_name
            );

            // if no tagged products filter is selected
            if($taggedProducts == "no-tagged-products"){

                //if number of tagged products is 0 
                if($count_matched_products == 0){

                    // Filter by pinned status
                    if ($pinnedStatus == 'all') {
                        // Include all posts regardless of pinned status

                        //Images
                        if (($mediaType == "images" || $mediaType == "images-and-videos") && $video_url == false) {
                            array_push($posts, $post);
                        } elseif (($mediaType == "videos" || $mediaType == "images-and-videos") && $video_url != false) {
                            array_push($posts, $post);
                        }
                    } 
                
                    //Videos
                    elseif ($pinnedStatus == 'pinned' && $pinned_post) {
                        // Include only pinned posts
                        if (($mediaType == "images" || $mediaType == "images-and-videos") && $video_url == false) {
                            array_push($posts, $post);
                        } elseif (($mediaType == "videos" || $mediaType == "images-and-videos") && $video_url != false) {
                            array_push($posts, $post);
                        }
                    }
                }
            }

        

            // if  tagged products filter is selected
            else if($taggedProducts == "tagged-products"){

                //if number of tagged products is >1
                if($count_matched_products >= 1){

                    // Filter by pinned status
                    if ($pinnedStatus == 'all') {
                        // Include all posts regardless of pinned status

                        //Images
                        if (($mediaType == "images" || $mediaType == "images-and-videos") && $video_url == false) {
                            array_push($posts, $post);
                        } elseif (($mediaType == "videos" || $mediaType == "images-and-videos") && $video_url != false) {
                            array_push($posts, $post);
                        }
                    } 
                    
                    //Videos
                    elseif ($pinnedStatus == 'pinned' && $pinned_post) {
                        // Include only pinned posts
                        if (($mediaType == "images" || $mediaType == "images-and-videos") && $video_url == false) {
                            array_push($posts, $post);
                        } elseif (($mediaType == "videos" || $mediaType == "images-and-videos") && $video_url != false) {
                            array_push($posts, $post);
                        }
                    }
                }
            }

            // if  all filter is selected
            else if($taggedProducts == "all"){

                // Filter by pinned status
                if ($pinnedStatus == 'all') {
                    // Include all posts regardless of pinned status

                    //Images
                    if (($mediaType == "images" || $mediaType == "images-and-videos") && $video_url == false) {
                        array_push($posts, $post);
                    } elseif (($mediaType == "videos" || $mediaType == "images-and-videos") && $video_url != false) {
                        array_push($posts, $post);
                    }
                } 
            
                //Videos
                elseif ($pinnedStatus == 'pinned' && $pinned_post) {
                    // Include only pinned posts
                    if (($mediaType == "images" || $mediaType == "images-and-videos") && $video_url == false) {
                        array_push($posts, $post);
                    } elseif (($mediaType == "videos" || $mediaType == "images-and-videos") && $video_url != false) {
                        array_push($posts, $post);
                    }
                }
            }
            
        }
        wp_reset_postdata();
    }

    // Get custom_order if custom_ordering is true for the given gallery_id
    $custom_ordering = $wpdb->get_results("SELECT custom_ordering FROM oculizm_galleries WHERE id = " . $gallery_id, ARRAY_A);

    // Check if custom_ordering is true
    if ($custom_ordering && $custom_ordering[0]['custom_ordering'] == 1) {
        $custom_order = get_post_meta($gallery_id, 'posts_custom_order', true);
        if ($custom_order) {
            $ordered_posts = array();
            $order = explode(',', $custom_order);

            // Arrange posts in custom order
            foreach ($order as $post_id) {
                foreach ($posts as $key => $post) {
                    if ($post['post_id'] == $post_id) {
                        $ordered_posts[] = $post;
                        unset($posts[$key]);
                        break;
                    }
                }
            }

            // Append remaining posts that are not in custom order
            $posts = array_merge($ordered_posts, $posts);
        }
    }

    $results = array(
        "posts" => $posts,
        "total" => $the_query->found_posts,
        "limit" => $limit

    );

    //get the total number of pages 
    $total_posts = count($posts);
    $numPages = ceil($total_posts / 96);

    //get the total number of filtered posts
    $totalNumberOfFilteredPosts = $total_posts;

    // Calculate the offset based on the current page
    $offset = ($page - 1) * 96;

    // Slice the posts array to get the nth 96 posts
    $sliced_posts = array_slice($results['posts'], $offset, 96);

    // Update the posts key in the results array with the sliced posts
    $results['posts'] = $sliced_posts;

    // adding the numPages key in the results array with the total number of Pages
    $results['numPages'] = $numPages;

    // adding the totalNumberOfFilteredPosts key in the results array with the total number of filtered posts
    $results['totalNumberOfFilteredPosts'] = $totalNumberOfFilteredPosts;

    echo json_encode($results);
    die;
}


// get a single post
add_action('wp_ajax_get_oculizm_post', 'get_oculizm_post');
function get_oculizm_post() {
    
    $client_id = get_client_id();

     //for react project testing purposes
     $http_origin = get_http_origin();
     if($http_origin == "http://localhost:3000" || $http_origin == "https://main.d3jj8nolr6evqb.amplifyapp.com"){
         $client_id = 71950;
     }
    
    $post_id = $_REQUEST['post_id'];
    $args = array('post_type' => 'any', 'p' => $post_id);
    $post = [];

    if ((empty($post_id)) || (!isset($post_id))) {
        $postid_result = array('error' => 'No Post ID Was Applied');
        echo json_encode($postid_result);
        die();
    }
    //check for the user number of loggins
    $login_amount = get_user_meta( get_current_user_id(), 'login_amount', true );

    // check that this client actually owns this post
    $cid = get_field('client_id', $post_id);
    if ($cid != $client_id) {
        echo json_encode("Illegal post update");
        die();
    }

    $argsnew = array(
        'post_type'  => 'any',
        'author'     => get_current_user_id(),
    );
    
    $wp_posts = get_posts($argsnew);

    // check that this client has posts
    if (count($wp_posts)) {
        $user_has_posts = true;
    } else {
        $user_has_posts = false;
    }
	
    $the_query = new WP_Query($args);
    if ($the_query->have_posts()) {
        while ($the_query->have_posts()) {
            $the_query->the_post();

            //initializing video url
            $video_url = "";
            $image_url = "";
            
            // get the featured image
            $tn_id = get_post_meta(get_the_ID(), '_thumbnail_id', true);
            $image_url = wp_get_attachment_image_src($tn_id, 'large');
            
            // now check for the featured image's thumbnail ID (this is where we store a video if there is one)
            $vid_id = get_post_meta($tn_id, '_thumbnail_id', true);
            $video_url = wp_get_attachment_url($vid_id);
            
            // image
            if ($image_url != null) {
                $image_url = $image_url[0];
                $image_url = str_replace("http:", "https:", $image_url);
                $image_url = str_replace("https://localhost", "http://localhost", $image_url);
            }
            
            // video created using create page
            else{
                $image_url = wp_get_attachment_url($tn_id);
                $video_url = $image_url;
            } 
            
            // get the galleries
            $pg_string = get_field('galleries');
            $pg_array = explode(",", $pg_string);
            
            // date
            $date = get_the_time('U');
            $date_diff = human_time_diff($date, current_time('timestamp'), 1);
            
            // pinned post
            $pinned_post = false;
            if (is_sticky()) $pinned_post = true;
            
            // build the post object
            $post = array(
                'post_id' => get_the_ID(),
                'post_title' => get_the_title(),
                // 'permalink' => get_the_permalink(),
                'caption' => get_the_content(),
                'image_url' => $image_url,
                'post_status' => get_post_status(),
                'products' => get_field('matched_products'),
                'source_url' => get_field('source_url'),
                'social_id' => get_field('social_id'),
                'search_id' => get_field('search_id'),
                'social_network' => get_field('social_network'),
                'image_alt_text' => get_field('image_alt_text'),
                'galleries' => $pg_array,
                'date' => $date,
                'date_diff' => $date_diff,
                'video_url' => $video_url,
                'pinned_post' => $pinned_post,
                'logins_number' => $login_amount,
                'user_has_posts' => $user_has_posts,
                'client_id' => $client_id
            );
        }
        wp_reset_postdata();
    }
    echo json_encode($post);
    die;
}



// get post media (used in the order details modal)
add_action('wp_ajax_get_oculizm_post_media', 'get_oculizm_post_media');
function get_oculizm_post_media() {
    
    $client_id = get_client_id();

    $post_ids = $_REQUEST['post_ids'];

    $post = [];
    $posts = [];

    // build and execute query
    $args = array(
       'post_type' => 'any',
       'post__in'      => $post_ids
    );
    $the_query = new WP_Query($args);

    if ($the_query->have_posts()) {
        while ($the_query->have_posts()) {
            $the_query->the_post();

            //initializing video url
            $video_url = "";
            $image_url = "";
            
            // get the featured image
            $tn_id = get_post_meta(get_the_ID(), '_thumbnail_id', true);
            $image_url = wp_get_attachment_image_src( $tn_id, 'large' )[0];
            
            // now check for the featured image's thumbnail ID (this is where we store a video if there is one)
            $vid_id = get_post_meta($tn_id, '_thumbnail_id', true);
            $video_url = wp_get_attachment_url($vid_id);
            
            // image
            if ($image_url != null) {
                $image_url = str_replace("http:", "https:", $image_url);
                $image_url = str_replace("https://localhost", "http://localhost", $image_url);
                
                // build the post object
                $post = array(
                    'post_id' => get_the_ID(),
                    'image_url' => $image_url,
                    'video_url' => $video_url
                );
            }
            
            // video
            else{
                $image_url = wp_get_attachment_url($tn_id);
                $video_url = $image_url;

                $post_id = get_the_ID();
                $video_thumbnail_url = get_field('video_thumbnail', $post_id);
                $video_thumbnail_url = str_replace("/opt/bitnami/wordpress", "https://app.oculizm.com", $video_thumbnail_url);

                // build the post object
                $post = array(
                    'post_id' => get_the_ID(),
                    'image_url' => $image_url,
                    'video_url' => $video_url,
                    'video_thumbnail_url' => $video_thumbnail_url
                );
                
            } 
            
            
            array_push($posts, $post);
        }
    }
    echo json_encode($posts);
    die;
}  
















// get all posts per products for a client
add_action('wp_ajax_get_product_posts', 'get_product_posts');
function get_product_posts() {
    
    $client_id = get_client_id();
    $product_id = $_REQUEST['product_id'];
    $env = get_environment();

    global $wpdb;

    $args = array('meta_key' => 'client_id', 'orderby' => 'publish_date', 'order' => 'DESC', 'meta_value' => $client_id, 'post_type' => 'post', 'posts_per_page' => -1, 'post_status' => 'publish');
    $the_query = new WP_Query($args);
    
    $counter = 0;
    $posts = [];
    $limit = 4;
    
    if ($the_query->have_posts()){
        while ($the_query->have_posts() && $counter < $limit) {
                            
            $the_query->the_post();
            
            $tn_id = get_post_meta(get_the_ID(), '_thumbnail_id', true);
            $image_url = wp_get_attachment_image_src( $tn_id, 'large' )[0];
            $vid_id = get_post_meta($tn_id, '_thumbnail_id', true);
            $video_url = wp_get_attachment_url($vid_id);
            
            // if ($video_url) continue; // skip video posts
            if (get_post_status() == "draft") continue; // skip drafts
                        
            // build the post object
            $post = array(
                'post_id' => get_the_ID(),
                'post_title' => get_the_title(),
                'image_url' => $image_url,
                'video_url' => $video_url,
            );

            $products = get_field('matched_products');
            if (is_array($products) || is_object($products)) {              
                foreach ($products as $key=>$product) {
                    // Funky Chunky Furniture matches by SKU
                    if ($client_id == "71950") {
                        if($product["sku"] == $product_id){
                            $posts[] = $post;
                            $counter++;
                            if ($counter == $limit) continue;
                        }
                    }
                    else{
                        if($product["product_id"] == $product_id){
                            $posts[] = $post;
                            $counter++;
                            if ($counter == $limit) continue;
                        }
                    }
                    
                }
            } else {
                continue;
            }
        }
        wp_reset_postdata();
    }
    
    $results = $posts;

    echo json_encode($results);
    die;
}


// add a post
add_action('wp_ajax_add_post', 'add_post');
function add_post() {

    $client_id = get_client_id();

    if (ISSET($_POST['post_title'])) $post_title = $_POST['post_title'];
    else $post_title = "Untitled";
    if ($post_title == "") $post_title = "Untitled";
    
    $post_caption = $_POST['post_caption'];
    $image_alt_text = $_POST['image_alt_text'];
    $post_status = $_POST['post_status'];
    $pinned_post = $_POST['pinned_post'];
    $prefix = "";

    if (ISSET($_POST['screen_name'])) $screen_name = $_POST['screen_name'];
	else $screen_name = "";

    if (ISSET($_POST['social_network_user_id'])) $social_network_user_id = $_POST['social_network_user_id'];
	else $social_network_user_id = "";

    if (ISSET($_POST['album_index'])) $album_index = $_POST['album_index'];
	else $album_index = "";

    if (ISSET($_POST['social_network'])) $social_network = $_POST['social_network'];
    if (ISSET($_POST['media_url'])) $media_url = $_POST['media_url'];
    if (ISSET($_POST['social_id'])) $social_id = $_POST['social_id'];

    if (ISSET($_POST['original_date'])) {
        $original_date = $_POST['original_date'];
        $original_date = strtotime($original_date);
        if ($original_date !== false) $original_date = date('Y-m-d H:i:s', $original_date);
    }

    if (ISSET($_POST['source_url'])) $source_url = $_POST['source_url'];
    if (ISSET($_POST['video_url'])) $video_url = $_POST['video_url'];
	
	if (ISSET($_POST['hashtag'])) $hashtag = $_POST['hashtag'];
	else $hashtag = "";
		
	if (ISSET($_POST['social_network_username'])) $social_network_username = $_POST['social_network_username'];
	else $social_network_username = "";
	
	if (ISSET($_POST['user_profile_pic'])) $profile_pic_url = $_POST['user_profile_pic'];
	else $profile_pic_url = "";
		
    // create post parameters
    $my_post = array(
        'post_title'    => $post_title,
        'post_content'  => $post_caption,
        'post_status' => $post_status
    );
    

    // // handle scheduled post
    // if ($post_status == 'future') {
    //     if (isset($_POST['post_date'])) {
    //         $post_date = sanitize_text_field($_POST['post_date']);
    //         $my_post['post_date'] = $post_date;
    //         $my_post['post_date_gmt'] = get_gmt_from_date($post_date);

    //         // Schedule an event to publish the scheduled post
    //         $event_timestamp = strtotime($post_date);
    //         $event_hook = 'publish_scheduled_post';
    //         $event_args = array('post_id' => $post_id);

    //         // Schedule the event
    //         wp_schedule_single_event($event_timestamp, $event_hook, $event_args);
    //     }
    // }


    if ($post_status == 'future') {
        if (isset($_POST['post_date']) && isset($_POST['now_time'])) {
            $post_date = sanitize_text_field($_POST['post_date']);
            $now_time = sanitize_text_field($_POST['now_time']);
    
            // Calculate the time difference in seconds
            $time_difference = strtotime($post_date) - strtotime($now_time);
    
            // Get the current server time
            $server_time = current_time('timestamp');
    
            // Schedule an event to publish the scheduled post
            $event_timestamp = $server_time + $time_difference;

            // Convert timestamp to formatted date
            $formatted_event_timestamp = date('Y-m-d H:i', $event_timestamp);

            $my_post['post_date'] = $formatted_event_timestamp;
            $my_post['post_date_gmt'] = get_gmt_from_date($formatted_event_timestamp);


            $event_hook = 'publish_scheduled_post';
            $event_args = array('post_id' => $post_id);
    
            // Schedule the event
            wp_schedule_single_event($event_timestamp, $event_hook, $event_args);
        }
    }
    
    // need to set GMT date for draft posts
    if ($post_status == 'draft') {
        $my_post['post_date'] = date('Y-m-d H:i:s', time());
        $my_post['post_date_gmt'] = get_gmt_from_date($my_post['post_date']);
    }
	
    // create post
    $post_id = wp_insert_post($my_post);

    // update client ID
    update_field('client_id', $client_id, $post_id);
    
    // add to galleries
    $pg_string = '';
    if(isset($_POST['galleries'])) {
        $galleries = $_POST['galleries'];
        $galleries = json_decode(stripslashes($galleries), true); // json_decode with (true) converts to a proper array, not stdclass
        if (!empty($galleries)) {
            
            // turn the array into a comma separated list (string)
            $pg_string = implode(",", $galleries);
            
            // save the galleries
            update_field('galleries', $pg_string, $post_id);
        }
    }

    // save custom fields
    if (!isset($_FILES['uploaded_files'])) {
        update_field('social_network', $social_network, $post_id);
        update_field('social_id', $social_id, $post_id);
        update_field('source_url', $source_url, $post_id);
        update_field('original_date', $original_date, $post_id);
    	update_field('social_network_username', $social_network_username, $post_id);
    	update_field('hashtag', $hashtag, $post_id);
        update_field('screen_name', $screen_name, $post_id);
        update_field('social_network_user_id', $social_network_user_id, $post_id);
        update_field('album_index', $album_index, $post_id);
    }

    update_field('image_alt_text', $image_alt_text, $post_id);

    global $wpdb;
    
    // if this was a user post...
	if (!empty($social_network_username) && $social_network == "instagram") {

        //if account is personal we still want to save it 
        if(empty($social_network_user_id)) {
            // oLog("it is a personal account");
            // check if this client has not already saved this content creator 
            $result = $wpdb->get_results("SELECT * FROM oculizm_content_creators 
            WHERE CLIENT_ID = " . $client_id ." AND username = " . $social_network_username , ARRAY_A);
            if (empty($result)) {
                // oLog("content creator not saved before will be saved now");
                // add a new content creator to the DB
                $wpdb->query("INSERT INTO oculizm_content_creators (`client_id`,`username`,`screen_name`,`profile_pic_url`,`social_network_user_id`,`social_network`) VALUES ('$client_id','$social_network_username','$screen_name','$profile_pic_url','$social_network_username','$social_network');");
            }
        }
        // if it is a business account 
        else{
            // oLog("it is a business account");
            // check if this client has not already saved this content creator 
            $result = $wpdb->get_results("SELECT * FROM oculizm_content_creators 
            WHERE CLIENT_ID = " . $client_id ." AND social_network_user_id = " . $social_network_user_id , ARRAY_A);

            // check this client doesn't already have this content creator saved
            if (empty($result)){
                // oLog("content creator not saved before will be saved now");
                // add a new content creator to the DB
                $wpdb->query("INSERT INTO oculizm_content_creators (`client_id`,`username`,`screen_name`,`profile_pic_url`,`social_network_user_id`,`social_network`) VALUES ('$client_id','$social_network_username','$screen_name','$profile_pic_url','$social_network_user_id','$social_network');");
            }
            else{
                // oLog("content creator prev saved");
            }
        }
	}
    
    if (isset($_POST['current_page'])){
        //Set the image prefix depending on the current page template
        if ($_POST['current_page'] == "instagram-profile") {
            $prefix = "insta_profile_";
        }
        if ($_POST['current_page'] == "instagram-tags") {
            $prefix = "insta_tags_";
        }
        if ($_POST['current_page'] == "instagram-hashtag") {
            $prefix = "insta_hashtag_";
        }
        if ($_POST['current_page'] == "instagram-user") {
            $prefix = "insta_user_";
        }
        if ($_POST['current_page'] == "instagram-reels") {
            $prefix = "insta_reels_";
        }
        if ($_POST['current_page'] == "instagram-stories") {
            $prefix = "insta_stories_";
        }
        if ($_POST['current_page'] == "facebook-posts" || $_POST['current_page'] == "facebook-photos" || $_POST['current_page'] == "facebook-videos" ) {
            $prefix = "facebook_";
        }
        if ($_POST['current_page'] == "tiktok-profile") {
            $prefix = "tiktok_profile_";
        }
        if ($_POST['current_page'] == "twitter-user" || $_POST['current_page'] == "twitter-profile" || $_POST['current_page'] == "twitter-mentions" || $_POST['current_page'] == "twitter-hashtag" || $_POST['current_page'] == "twitter-search") {
            $prefix = "twitter_";
        }
    }


   // UPLOADED FROM THE CREATE PAGE
    if (isset($_FILES['uploaded_files'])) $files = $_FILES['uploaded_files'];
    oLog("files are : " .$files . "...");
    if (!empty($files) && isset($files)) {

        foreach ($files['name'] as $key => $value) {

            if ($files['name'][$key]) {
                $file = array(
                    'name' => "create_" . $client_id . "_" . $files['name'][$key],
                    'type' => $files['type'][$key],
                    'tmp_name' => $files['tmp_name'][$key],
                    'error' => $files['error'][$key],
                    'size' => $files['size'][$key]
                );

                // Extract file extension using pathinfo
                $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);

                $_FILES = array("uploaded_files" => $file);
                $count = 0;

                // for some reason this for loop only has one cycle, even if we have multiple files
                foreach ($_FILES as $file_key => $file_array) {
                    $attach_id = prepare_media_upload($file_key);
                }

                // image
                if (in_array(strtolower($file_extension), array('jpg', 'jpeg', 'png', 'gif' , 'heic'))) {
                    update_post_meta($post_id, '_thumbnail_id', $attach_id);
                    $post_type = "it is an image post upload ... with attached id = " . $attach_id . "...";

                    // get the featured image
                    $tn_id = get_post_meta($post_id, '_thumbnail_id', true);
                    $image_url = wp_get_attachment_image_src($tn_id, 'large')[0];

                    // image
                    $image_url = str_replace("http:", "https:", $image_url);
                    $image_url = str_replace("https://localhost", "http://localhost", $image_url);
                }

                // video
                elseif (strpos($file['type'], 'video') !== false) {
                    update_post_meta($post_id, '_thumbnail_id', $attach_id - 1);
                    update_post_meta($attach_id - 1, '_thumbnail_id', $attach_id);
                    $post_type = "it is a video post upload... with attached id = " . $attach_id . "...";

                    // get the featured image
                    $tn_id = get_post_meta($post_id, '_thumbnail_id', true);

                    // video created using create page
                    $image_url = wp_get_attachment_url($tn_id);

                    $prefix = "create_";

                    // save the video thumbnail
                    $video_thumbnail_url = generate_video_thumbnail($image_url, 'video_thumbnail', $prefix, $post_id);

                    // update the ACF field 'video_thumbnail'
                    if (isset($video_thumbnail_url)) update_field('video_thumbnail', $video_thumbnail_url, $post_id);
                }

                // other
                else {
                    // Unsupported file type
                    oLog("Unsupported file type for " . $file['name'] . "...");
                }
            }
        }

        if (isset($_POST['products'])) {
            $products = $_POST['products'];
            $products = json_decode(stripslashes($products), true);
        } else $products = [];

        //send email when post created using Upload page
        $client = $wpdb->get_row("SELECT name FROM oculizm_clients WHERE id = " . $client_id, OBJECT);

        //replacing & encoded character in client name
        $client_name = str_replace('&amp;', '&', $client->name);
        $subject = $client_name . ' created a post using create page!';
        if (!isset($_POST['products']) || (isset($_POST['products']) && empty($products))) {
            $subject .= " [No Products Attached]";
        }

        $url = "https://app.oculizm.com/edit-post/?post_id=$post_id";
        send_admin_email_new_post('anthony@oculizm.com', $subject, $image_url, $post_title, stripslashes($post_caption), $products, $url);
        send_admin_email_new_post('sean@oculizm.com', $subject, $image_url, $post_title, stripslashes($post_caption), $products, $url);
    }




    // IMAGE SUPPLIED
    else if(isset($media_url)) {

        // save the image
        $upload_dir = wp_upload_dir();
        $image_data = file_get_contents($media_url);
        $filename = $prefix . $client_id /* . "-" . time()*/ . "-" . basename($media_url); // prefix filename with client ID
        if (strpos($filename, "?") > 0) $filename = substr($filename, 0, strpos($filename, "?"));
        if (wp_mkdir_p($upload_dir['path'])) $file = $upload_dir['path'] . '/' . $filename;
        else $file = $upload_dir['basedir'] . '/' . $filename;
        $image_success = true; //checks if an image is saved correctly on our server
        $image_success = file_put_contents($file, $image_data);
        
        // add it as an attachment to the post we just created
        $wp_filetype = wp_check_filetype($filename, null );
        $attachment = array(
            'post_mime_type' => $wp_filetype['type'], // usually 'image/jpeg'
            'post_title' => 'Social Media Image',
            'post_content' => '',
            'post_status' => 'inherit'
        );
        $attach_id = wp_insert_attachment($attachment, $file, $post_id);

        $image_attach_id = $attach_id;
    
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        // for images
        $attach_data = wp_generate_attachment_metadata($attach_id, $file);
        wp_update_attachment_metadata($attach_id, $attach_data);
        $new_post_meta_id = set_post_thumbnail($post_id, $attach_id);
    }


    // if video
    if (isset($video_url)) {
        // save the video
        $upload_dir = wp_upload_dir();
        $media_data = file_get_contents($video_url);
        $filename = $prefix . basename($video_url);
        if (strpos($filename, "?") > 0) $filename = substr($filename, 0, strpos($filename, "?"));
        if (wp_mkdir_p($upload_dir['path'])) $file = $upload_dir['path'] . '/' . $filename;
        else $file = $upload_dir['basedir'] . '/' . $filename;
        file_put_contents($file, $media_data);

        // add it as an attachment to the post we just created
        $wp_filetype = wp_check_filetype($filename, null);
        $attachment = array(
            'post_mime_type' => $wp_filetype['type'], // usually 'image/jpeg'
            'post_title' => 'Social Media Image',
            'post_content' => '',
            'post_status' => 'inherit'
        );
        $attach_id = wp_insert_attachment($attachment, $file, null);
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        // Update ACF field 'is_video'
        update_field('is_video', 1, $post_id);
                
        // Check if the media is a video and no video thumbnail was supplied
        if (empty($media_url)) {
            // Create video thumbnail using ffmpeg
            $video_thumbnail_url = generate_video_thumbnail($video_url, 'video_thumbnail', $prefix, $post_id);

            // update the ACF field 'video_thumbnail'
            if (isset($video_thumbnail_url)) {
                update_field('video_thumbnail', $video_thumbnail_url, $post_id);
            }

            // Attach the video thumbnail as a featured image
            if (!empty($video_thumbnail_url)) {
                // Get the upload directory path
                $upload_dir = wp_upload_dir();

                // Move the generated thumbnail to the upload directory
                $thumbnail_filename = $prefix . 'video_thumbnail_' . md5($video_url) . '.jpg';
                $thumbnail_path = $upload_dir['path'] . '/' . $thumbnail_filename;
                rename($video_thumbnail_url, $thumbnail_path);

                // Add it as an attachment to the post we just created
                $wp_filetype = wp_check_filetype($thumbnail_filename, null);
                $attachment = array(
                    'post_mime_type' => $wp_filetype['type'],
                    'post_title' => 'Video Thumbnail',
                    'post_content' => '',
                    'post_status' => 'inherit',
                );

                $thumbnail_attach_id = wp_insert_attachment($attachment, $thumbnail_path, $post_id);

                // Include image.php for image processing functions
                require_once(ABSPATH . 'wp-admin/includes/image.php');

                // Generate and update attachment metadata
                $attach_data = wp_generate_attachment_metadata($thumbnail_attach_id, $thumbnail_path);
                wp_update_attachment_metadata($thumbnail_attach_id, $attach_data);

                // Set the thumbnail as featured image
                set_post_thumbnail($post_id, $thumbnail_attach_id);
            }
        }
    }


    // pinned post
    if ($pinned_post == "true") stick_post($post_id);
    else unstick_post($post_id);
    
    // add matched products
    if (isset($_POST['products'])) {
        $products = $_POST['products'];
        $products = json_decode(stripslashes($products), true); // json_decode with (true) converts to a proper array, not stdclass
        if (!empty($products)) $products_added = add_post_products($post_id, $products);
    }
    else $products = [];

    



    // DEBUGGING (only from social network posts, not the Create page)
    if (!isset($_FILES['uploaded_files'])) {
        $client = $wpdb->get_row("SELECT name FROM oculizm_clients WHERE id = " . $client_id, OBJECT);

        // encoded characters in client name
        $client_name = str_replace('&amp;', '&', $client->name);
        $message = $client_name . " (client ID " . $client_id . ") created a post. <br/>";
    	$message .= "<b>POST Caption:</b> <br/> $post_caption <br/>";

        // debug
    	$debug = "| Current Page: " . $_POST['current_page'] . " | POST ID: " . $post_id;
    	$debug .= " | Social Source: " . $_POST['social_source'];
    	$debug .= " | Post Num: " . $_POST['postNum'] . " | Post Type: " . $_POST['type'] . " | Album Index: " . $_POST['album_index'] . " | Action: " . $_POST['_action'];
        $debug .= "| Post Title: " . $post_title;
        
        // if it's an image...
        if (!isset($video_url)) {
            oLog($debug);

        	if ($image_success === FALSE || ( !isset($_POST['media_url']) && !isset($_POST['video_url']) )) {
        		$subject = 'Cient ID: ' . $client_id  .' published a post with undefinied image_url!';
        		$message .= "The link to the POST : https://app.oculizm.com/edit-post/?post_id=$post_id <br/><br/>";
        		$message .= "<b>Find below the debug log:</b> <br/> $debug <br/>"; 
        		oEmail('sean@oculizm.com', $subject, $message);
                oEmail('anthony@oculizm.com', $subject, $message);
        	}
        }
        
    	if (isset($media_url)) $message .= "<img src='$media_url' width='50%' height='50%' /> <br/>";

		$url = "https://app.oculizm.com/edit-post/?post_id=$post_id";
		$message .= "<br/> The link to edit post is: " . '<a href="' . $url . '" > ' . $url . '</a>' ;

        //replacing & encoded character in client name
        $client_name = str_replace('&amp;', '&', $client->name);
    	$subject = $client_name  .' created a post!';
    	if (!isset($_POST['products']) || ( isset($_POST['products']) && empty($products))) {
    		$subject .= " [No Products Attached]";
    	}

        if ($post_status == 'draft') $subject .= " [draft]";

        if (!$client->name) oEmail('sean@oculizm.com', 'Post created with no Client Name! Check logs!', '');

    	send_admin_email_new_post('sean@oculizm.com', $subject, $media_url, $post_title, stripslashes($post_caption), $products, $url);
        send_admin_email_new_post('anthony@oculizm.com', $subject, $media_url, $post_title, stripslashes($post_caption), $products, $url);
    }

    // build payload
    $result = get_post($post_id);

    // send result
    echo json_encode($result);
    die;
}

// edit a post
add_action('wp_ajax_update_post', 'update_post');
function update_post() {
    
    $client_id = get_client_id();
    
    $post_id = $_POST['post_id'];

    // check if a new image was supplied eg from the cropper tool
    $files = null;
    if(isset($_FILES["uploaded_files"])) $files = $_FILES["uploaded_files"];

    if (!empty($files) && isset($files)) {
        
        foreach ($files['name'] as $key => $value) {

            if ($files['name'][$key]) {
                $file = array(
                    'name' => $files['name'][$key],
                    'type' => $files['type'][$key],
                    'tmp_name' => $files['tmp_name'][$key],
                    'error' => $files['error'][$key],
                    'size' => $files['size'][$key]
                );
                $_FILES = array ("uploaded_files" => $file);
                $count = 0;
                // for some reason this for loop only has one cycle, even if we have multiple files
                foreach ($_FILES as $file => $array) {
                    $attach_id = prepare_media_upload($file);
                }
            }
        }
        
        // if only one file was received, it was an image upload
        $num_files = count($files['name']);
        if (is_numeric($attach_id)) {
            // image
            if ($num_files == 1) {
                update_post_meta($post_id, '_thumbnail_id', $attach_id);
            }
        }
    }

    $post_title = "Untitled";
    if (isset($_POST['post_title'])) {
        if ($_POST['post_title'] != null) $post_title = $_POST['post_title'];
    }
    $post_caption = "";
    if (isset($_POST['post_caption'])) {
        if ($_POST['post_caption'] != null) $post_caption = $_POST['post_caption'];
    }
    $image_alt_text = "";
    if (isset($_POST['image_alt_text'])) {
        if ($_POST['image_alt_text'] != null) $image_alt_text = $_POST['image_alt_text'];
    }
    $post_status = "";
    if (isset($_POST['post_status'])) {
        if ($_POST['post_status'] != null) $post_status = $_POST['post_status'];
    }
    $pinned_post = "";
    if (isset($_POST['pinned_post'])) {
        if ($_POST['pinned_post'] != null) $pinned_post = $_POST['pinned_post'];
    }
	
    // check that this client actually owns this post
    $cid = get_field('client_id', $post_id);
    if ($cid != $client_id) {
        echo json_encode("Illegal post update");
        die();
    }

    $now = date('Y-m-d H:i:s');
    
    // build post array
    $my_post = array(
        'ID'    => $post_id,
        'post_title'    => $post_title,
        'post_content'  => $post_caption,
        'post_status' => $post_status,
        'post_date' => $now
    );
    

    //   // handle scheduled post
    //   if ($post_status == 'future') {
    //     if (isset($_POST['post_date'])) {
    //         $post_date = sanitize_text_field($_POST['post_date']);
    //         $my_post['post_date'] = $post_date;
    //         $my_post['post_date_gmt'] = get_gmt_from_date($post_date);

    //         // Schedule an event to publish the scheduled post
    //         $event_timestamp = strtotime($post_date);
    //         $event_hook = 'publish_scheduled_post';
    //         $event_args = array('post_id' => $post_id);

    //         // Schedule the event
    //         wp_schedule_single_event($event_timestamp, $event_hook, $event_args);
    //     }
    // }

    if ($post_status == 'future') {
        if (isset($_POST['post_date']) && isset($_POST['now_time'])) {

            $post_date = sanitize_text_field($_POST['post_date']);
            $now_time = sanitize_text_field($_POST['now_time']);
    
            // Calculate the time difference in seconds
            $time_difference = strtotime($post_date) - strtotime($now_time);
    
            // Get the current server time
            $server_time = current_time('timestamp');
    
            // Schedule an event to publish the scheduled post
            $event_timestamp = $server_time + $time_difference;

            // Convert timestamp to formatted date
            $formatted_event_timestamp = date('Y-m-d H:i', $event_timestamp);

            $my_post['post_date'] = $formatted_event_timestamp;
            $my_post['post_date_gmt'] = get_gmt_from_date($formatted_event_timestamp);


            $event_hook = 'publish_scheduled_post';
            $event_args = array('post_id' => $post_id);
    
            // Schedule the event
            wp_schedule_single_event($event_timestamp, $event_hook, $event_args);
        }
    }
    
    // update the post
    $result = wp_update_post($my_post);
    
    // debug
    if (is_wp_error($result)) {
        $errors = $result->get_error_messages();
        foreach ($errors as $error) {
            oEmail('sean@oculizm.com', "Error!", $error);
            oEmail('anthony@oculizm.com', "Error!", $error);
        }
    }

    $result = get_post($post_id);
    
    // add to galleries
    $pg_string = '';
    if (isset($_POST['galleries'])) {
        $galleries = $_POST['galleries'];
        $galleries = json_decode(stripslashes($galleries), true); // json_decode with (true) converts to a proper array, not stdclass
        // if (!empty($galleries)) {
            
            // turn the array into a comma separated list (string)
            $pg_string = implode(",", $galleries);
            
            // save the galleries
            update_field('galleries', $pg_string, $post_id);
        // }
    }

    // add products
    if (isset($_POST['products'])) {
        $products = $_POST['products'];
        $products = json_decode(stripslashes($products), true); // json_decode with (true) converts to a proper array, not stdclass
        if (!empty($products)) 
			$products_added = add_post_products($post_id, $products);
		else
			$test = update_field('matched_products', array(), $post_id);
    }
    else {
        // remove all products
        $emptyArray = array();
        $test = update_field('matched_products', $emptyArray, $post_id);
    }


    // pinned post
    if ($pinned_post == "true") stick_post($post_id);
    else unstick_post($post_id);
    
    // image alt text
    if (isset($_POST['image_alt_text'])) {
        if ($_POST['image_alt_text'] != null) {
            update_field('image_alt_text', $image_alt_text, $post_id);
        }
    }

    echo json_encode($result);
    die;
}


// Hook to handle the scheduled post event
add_action('publish_scheduled_post', 'publish_scheduled_post_callback', 10, 1);
function publish_scheduled_post_callback($post_id) {
    // Update the post status to 'publish'
    wp_update_post(array('ID' => $post_id, 'post_status' => 'publish'));
}

// push to top
add_action('wp_ajax_update_post_publish_date', 'update_post_publish_date');
function update_post_publish_date() {
    
    $client_id = get_client_id();
    
    $post_id = $_REQUEST['post_id'];
    
    // check that this client actually owns this post
    $cid = get_field('client_id', $post_id);
    if ($cid != $client_id) {
        echo json_encode("Illegal post update");
        die();
    }
    
    $now = date('Y-m-d H:i:s');

    $update_post = array(
        'ID' => $post_id,
        'post_date' => $now
    );

    $result = wp_update_post($update_post);

    echo json_encode($result);
    die();
}

// delete a post
add_action('wp_ajax_delete_oculizm_post', 'delete_oculizm_post');
function delete_oculizm_post() {
    
    $client_id = get_client_id();
    
    $post_id = $_REQUEST['post_id'];
    
    // check that this client actually owns this post
    $cid = get_field('client_id', $post_id);
    if ($cid != $client_id) {
        echo json_encode("Illegal post update");
        die();
    }
    
    $result = wp_delete_post($post_id);
    
    echo json_encode($result);
    die();
}

// reverse post order
add_action('wp_ajax_reverse_post_order', 'reverse_post_order');
function reverse_post_order() {

    $client_id = get_client_id();

    // build query
    $args = array(
        'post_type' => 'post', 
        'post_status' => array('draft', 'future', 'publish'),
        'posts_per_page' => -1,
        'order' => 'ASC'
    );
    $args['meta_query'] = array('relation'=> 'AND',
        array(array('key'=> 'client_id','value'     => $client_id,'compare' => '='))
    );
    
    $the_query = new WP_Query($args);
    $posts = array();
    
    // get the time now
    $now = date('Y-m-d H:i:s');
    $counter = 2;
    $num_updates = 0;

    if ($the_query->have_posts()) {
        
        while ($the_query->have_posts()) {
            $the_query->the_post();
            
            // set the date to today's date -n days where n is the index of this post
            $new_date = date('Y-m-d H:i:s', strtotime($now . " -" . $counter . " days"));

            // make the update
            $update_post = array('ID' => get_the_ID(), 'post_date' => $new_date);
            $result = wp_update_post($update_post);

            if ($result > 0) $num_updates++;

            // build a post object including the result
            $post = array(
                'post_id' => get_the_ID(),
                'post_date' => get_the_date(),
                'new_date' => $new_date,
                'result' => $result
            );

            array_push($posts, $post);
            $counter++;
        }
        wp_reset_postdata();
    }

    $results = array(
        "posts" => $posts,
        'num_updates' => $num_updates
    );
    echo json_encode($results);
    die;
}


// add products to a post
function add_post_products($post_id, $matched_products) {

    global $wpdb;
    $client_id = get_client_id();
    $mp = [];

    foreach ($matched_products as $key => $p) {
        ++$key;
        // get product values from AJAX request
        $x = $p['x'];
        $y = $p['y'];
        $product_id = $p['product_id'];
        $product_sku = $p['product_sku'];
        $product_name = $p['product_name'];
        $product_name = str_replace("'", "\'", $product_name);

        // fetch more data on this product from the DB

        // changed to match by product title as if we use product_id it's not always unique, and we end up tagging the rustic pine instead of the medium oak (FCF)
        // $product_info = $wpdb->get_row("SELECT * FROM oculizm_products WHERE client_id = $client_id AND sku = '$product_id' LIMIT 1", OBJECT); // search by product ID
        $product_info = $wpdb->get_row("SELECT * FROM oculizm_products WHERE client_id = $client_id AND title = '$product_name' LIMIT 1", OBJECT);
        if (!$product_info) continue;

        // oLog($product_info);
        // we chose medium oak and we got rustic pine
                
        $image = $product_info->image_link;
        $name = $product_info->title;
        $url = $product_info->link;
        
        $gb_title = $product_info->gb_title;
        $gb_price = $product_info->gb_price;
        $gb_link = $product_info->gb_link;
        
        $fr_title = $product_info->fr_title;
        $fr_price = $product_info->fr_price;
        $fr_link = $product_info->fr_link;
    
        $de_title = $product_info->de_title;
        $de_price = $product_info->de_price;
        $de_link = $product_info->de_link;  

        $ch_title = $product_info->ch_title;
        $ch_price = $product_info->ch_price;
        $ch_link = $product_info->ch_link;  
        
        $au_title = $product_info->au_title;
        $au_price = $product_info->au_price;
        $au_link = $product_info->au_link;  
        
        $at_title = $product_info->at_title;
        $at_price = $product_info->at_price;
        $at_link = $product_info->at_link;
        
        $ca_title = $product_info->ca_title;
        $ca_price = $product_info->ca_price;
        $ca_link = $product_info->ca_link;
        
        $it_title = $product_info->it_title;
        $it_price = $product_info->it_price;
        $it_link = $product_info->it_link;
        
        $us_title = $product_info->us_title;
        $us_price = $product_info->us_price;
        $us_link = $product_info->us_link;
        
        $ar_title = $product_info->ar_title;
        $ar_price = $product_info->ar_price;
        $ar_link = $product_info->ar_link;
        
        $se_title = $product_info->se_title;
        $se_price = $product_info->se_price;
        $se_link = $product_info->se_link;
        
        $dk_title = $product_info->dk_title;
        $dk_price = $product_info->dk_price;
        $dk_link = $product_info->dk_link;

        $es_title = $product_info->es_title;
        $es_price = $product_info->es_price;
        $es_link = $product_info->es_link;  
        
        $price = $product_info->price;
        $price = trim($price, "£€$");

        $price_strikeout = $product_info->price_strikeout;
        $price_strikeout = trim($price_strikeout, "£€$");


        // SAVE THE IMAGE

        // sometimes we'll need to remove the question mark in a URL, e.g.:
        // https://cdn.shopify.com/s/files/1/0040/7057/2147/products/AQ20_MULTI_ECCENTRIC_GLOVES_1.jpg?v=1565360991
        if (strpos($image, '?') > -1) $image = substr($image, 0, strpos($image, '?'));

        $basename = basename($image);
        $wp_filetype = wp_check_filetype($basename, null );
        if (!$wp_filetype['ext']) $wp_filetype['ext'] = "jpg";
        if (!$wp_filetype['type']) $wp_filetype['type'] = "image/jpeg";
        $extension = '.' . $wp_filetype['ext'];

        // when trying to save a capitalised extension in the steps below, it still saves it as a lower case extension.
        // so here we need to set it explicitly to be lower case, so that when the $filename is saved to the DB it's not
        // storing the capitalised version which returns a missing URL
        $extension = strtolower($extension);

        // if no extension detected
        if ($extension == ".") $extension = ".jpg";
        
        // define upload settings
        $filename = "product_" . $client_id . "_" . $post_id . "_" . $key . "_" . uniqid() . $extension;

        $upload_dir = wp_upload_dir();
        $full_upload_path = $upload_dir['path'] . '/' . $filename;
        
        // get the image at that URL and save it onto our server
        $img = wp_get_image_editor($image);
        if (!is_wp_error($img)) {
            $img->resize(600, NULL, false); // resize width + keep aspect ratio for the height + doo not crop
            $img->set_quality(100);
            $img->save($full_upload_path);
        } else {
            $contents = file_get_contents($image);
            $savefile = fopen($full_upload_path, 'w');
            fwrite($savefile, $contents);
            fclose($savefile);
        }

        // create attachment
        $attachment = array(
            'post_mime_type' => $wp_filetype['type'],
            'post_title' => $filename,
            'post_content' => '',
            'post_status' => 'inherit'
        );

        $attach_id = wp_insert_attachment($attachment, $full_upload_path);
        $imagenew = get_post($attach_id);
        $fullsizepath = get_attached_file($imagenew->ID);
        $attach_data = wp_generate_attachment_metadata($attach_id, $fullsizepath);
        wp_update_attachment_metadata($attach_id, $attach_data);
        
        // add this matched product to our products array
        $mp[] = array(
            "product_id" => $product_id,
            "sku" => $product_sku,
            "product_name" => $name,
            "product_image" => $attach_id,
            "product_price" => $price,
            "product_price_strikeout" => $price_strikeout,
            "product_url" => $url,
            
            "gb_title" => $gb_title,
            "gb_price" => $gb_price,
            "gb_link" => $gb_link,
            
            "fr_title" => $fr_title,
            "fr_price" => $fr_price,
            "fr_link" => $fr_link,
            
            "de_title" => $de_title,
            "de_price" => $de_price,
            "de_link" => $de_link,
            
            "ch_title" => $ch_title,
            "ch_price" => $ch_price,
            "ch_link" => $ch_link,
            
            "au_title" => $au_title,
            "au_price" => $au_price,
            "au_link" => $au_link,
            
            "at_title" => $at_title,
            "at_price" => $at_price,
            "at_link" => $at_link,
            
            "ca_title" => $ca_title,
            "ca_price" => $ca_price,
            "ca_link" => $ca_link,
            
            "it_title" => $it_title,
            "it_price" => $it_price,
            "it_link" => $it_link,
            
            "us_title" => $us_title,
            "us_price" => $us_price,
            "us_link" => $us_link,
            
            "ar_title" => $ar_title,
            "ar_price" => $ar_price,
            "ar_link" => $ar_link,

            "se_title" => $se_title,
            "se_price" => $se_price,
            "se_link" => $se_link,
            
            "dk_title" => $dk_title,
            "dk_price" => $dk_price,
            "dk_link" => $dk_link,

            "es_title" => $es_title,
            "es_price" => $es_price,
            "es_link" => $es_link,
            
            "x" => $x,
            "y" => $y
        );
    }
    $x = update_field('matched_products', $mp, $post_id);
    return $x;
}

// Function to generate a video thumbnail using FFMpeg library
function generate_video_thumbnail($video_url, $acf_field_name, $prefix ,$post_id) {
    // Check if FFMpeg library is available
    if (class_exists('\FFMpeg\FFMpeg')) {

        // Include Composer's autoloader
		// Composer is a dependency manager for PHP, and its autoloader is responsible for automatically
		// loading the required classes and files when they are needed. Including it here ensures that the
		// FFMpeg classes are loaded and available for use
        require_once '/home/bitnami/vendor/autoload.php';

        // Initialize FFMpeg
        $ffmpeg = \FFMpeg\FFMpeg::create([
            'ffmpeg.binaries'  => '/usr/bin/ffmpeg',
            'ffprobe.binaries' => '/usr/bin/ffprobe',
        ]);

        // Create video thumbnail
        $video = $ffmpeg->open($video_url);
        $frame = $video->frame(\FFMpeg\Coordinate\TimeCode::fromSeconds(2)); 
        $filename = $prefix . 'video_thumbnail_' . md5($video_url) . '.jpg';

        // Get the upload directory path
        $upload_dir = wp_upload_dir();
        $thumbnail_path = $upload_dir['path'] . '/' . $filename;

		// save the generated frame (thumbnail) to the specified path
        $frame->save($thumbnail_path);

        // Return the generated thumbnail URL
        return $thumbnail_path;
    }

    // Return null if FFMpeg is not available
    return null;
}











