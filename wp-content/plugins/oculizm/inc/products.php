<?php


// internal function for creating a product to be added to the database
function create_product_object($client_id, $region, $feed_id, $id, $sku, $title, $link, $image_link, $price, $price_strikeout, $availability) {

    // sanitise
    $id = preg_replace('~//<!\[CDATA\[\s*|\s*//\]\]>~', '', $id);
    $sku = preg_replace('~//<!\[CDATA\[\s*|\s*//\]\]>~', '', $sku);
    $id_str = $id . "";
    $link = preg_replace('~//<!\[CDATA\[\s*|\s*//\]\]>~', '', $link);
    $image_link = preg_replace('~//<!\[CDATA\[\s*|\s*//\]\]>~', '', $image_link);
    $title = sanitise_title($title, $client_id);
    $price = sanitise_price($price);
    $price_strikeout = sanitise_price($price_strikeout);
    $availability = sanitise_availability($availability);

    // create the product object
    $product = array(
        'client_id' => $client_id,
        'product_id' => $id,
        'sku' => $sku,
        'title' => $title,
        'price' => $price,
        'price_strikeout' => $price_strikeout,
        'link' => $link,
        'image_link' => $image_link,
        'availability' => $availability,
        'feed_id' => $feed_id
    );
    
    // add regional data
    $product[$region . "_TITLE"] = $title;
    $product[$region . "_PRICE"] = $price;
    $product[$region . "_LINK"] = $link;

    return $product;
}


// delete all products
add_action('wp_ajax_delete_all_products', 'delete_all_products');
function delete_all_products() {
    
    $client_id = get_client_id();

    global $wpdb;

    $query = $wpdb->prepare('DELETE FROM oculizm_products WHERE client_id = %d', $client_id);
    $result = $wpdb->query($query);
    sleep(3);

    echo json_encode($result);
    die();
}


// get full product list
add_action('wp_ajax_get_product_names', 'get_product_names');
function get_product_names() {
    
    $client_id = get_client_id();

    global $wpdb;

    $products = $wpdb->get_results("SELECT TITLE, at_title, ch_title, de_title, fr_title, it_title, gb_title, ca_title, us_title, ar_title, au_title, se_title, dk_title, es_title, sku , product_id as productId FROM oculizm_products WHERE CLIENT_ID = " . $client_id . " ORDER BY ID ASC", ARRAY_A);
    echo json_encode($products);
    die;
}


// get all products for a client
add_action('wp_ajax_get_products', 'get_products');
function get_products() {
    
    $client_id = get_client_id();
	$env = get_environment();
	
    global $wpdb;

    $results = array();
    
    // get a full list of this client's products
    $products = $wpdb->get_results("SELECT * FROM oculizm_products WHERE CLIENT_ID = " . $client_id . " ORDER BY ID ASC", ARRAY_A);

    // get this client's supported regions
	$product_feeds = $wpdb->get_results("SELECT * FROM oculizm_product_feeds WHERE CLIENT_ID = " . $client_id . " ORDER BY ID ASC", ARRAY_A);
    if (isset($product_feeds[0]['region'])) {
        $results['region'] = $product_feeds[0]['region'];
    }

    $matchedProductsIds = array();

    // get all this client's posts
    $args = array('meta_key' => 'client_id', 'orderby' => 'publish_date', 'order' => 'DESC', 'meta_value' => $client_id, 'post_type' => 'post', 'posts_per_page' => -1, 'post_status' => 'publish');
	$the_query = new WP_Query($args);

    if ($the_query->have_posts()){
        while ($the_query->have_posts()) {
                            
            $the_query->the_post();
            
            // get the matched products
            $matched_products = get_field('matched_products');

            if (is_array($matched_products) || is_object($matched_products)) {

                for($i = 0; $i <count($matched_products); $i++) {

                    // get the Product IDs of matched products
                    $mpid = array('product_id' => $matched_products[$i]['product_id']);
            
                    // Funky Chunky Furniture matches by SKU
                    if ($client_id == "71950") {
                        $mpid = array('product_id' => $matched_products[$i]['sku']);
                    }
                    array_push($matchedProductsIds, $mpid);
                }
            }
        }
        wp_reset_postdata();
    }

    
    // get the products on this page
    $page = 1;
    if (ISSET($_REQUEST['page'])) $page = $_REQUEST['page'];
    $limit = 96;
    $starting_index = ($page-1) * $limit;
    $products_on_this_page = array_slice($products, $starting_index, $limit);

    // for each product on this page...
    foreach ($products_on_this_page as &$p) {

        $counter = 0;

        $pId = $p['product_id'];

        // Funky Chunky Furniture matches by SKU
        if ($client_id == "71950") {
            $pId = $p['sku'];
        }

        // calculate the number of matching posts for each product
        if (is_array($matchedProductsIds) || is_object($matchedProductsIds)) {				
            foreach ($matchedProductsIds as $key=>$productId) {
                if ($counter < 99) { // max tagged of 99
                    if ($productId["product_id"] == $pId) {
                        $counter++;
                    }  
                }
                else continue;
            }
        }
        else continue;
        
        $p['num_tagged_posts'] = $counter;
    }

    $results['client_id'] = $client_id;
    $results['products'] = $products_on_this_page;
    $results['matchedProductsIds'] = $matchedProductsIds;
    $results['total'] = sizeof($products);
    $results['allClientProducts'] = $products;
    $results['starting_index'] = $starting_index;
    $results['limit'] = $limit;

	
	// aso
    $aso_init_code = 	"jQuery('#oclzmAsSeenOn').oculize({" .
        "   productID: '{{product.id}}'," .
        "   region: ''," .
        "});";
		
    // aso xml feed
	$aso_xml_feed = "$env/api/v1/fetch_oculizm_as_seen_on_posts/?clientID=$client_id&productID=INSERT_PRODUCT_ID&format=xml";
	
    // package up
	$results['asoScriptURL'] = $env . "/wp-content/uploads/".$client_id."_as-seen-on.js";
	$results['asoCall'] = $aso_init_code;
	$results['asSeenOnXMLFeed'] = $aso_xml_feed;

    echo json_encode($results);
    die;
}


// get a client's products by supplied IDs
add_action('wp_ajax_get_products_by_id', 'get_products_by_id');
function get_products_by_id() {
    
    $client_id = get_client_id();

    // get the product IDs
    $product_ids = $_REQUEST['product_ids'];

    // convert to string for SQL
    $product_ids = sprintf("'%s'", implode("','", $product_ids));

    global $wpdb;

    // get a full list of all the products matching these product IDs
    $products = $wpdb->get_results("SELECT * FROM oculizm_products WHERE CLIENT_ID = " . $client_id . " AND product_id IN(" . $product_ids . ") ORDER BY ID ASC", ARRAY_A);
    $matchedProductsIds = array();

    // get all this client's posts
     $args = array('meta_key' => 'client_id', 'orderby' => 'publish_date', 'order' => 'DESC', 'meta_value' => $client_id, 'post_type' => 'post', 'posts_per_page' => -1, 'post_status' => 'publish');
    
    $the_query = new WP_Query($args);

    if ($the_query->have_posts()){
        while ($the_query->have_posts()) {
                            
            $the_query->the_post();
            
            // get the matched products
            $matched_products = get_field('matched_products');
            
            if (is_array($matched_products) || is_object($matched_products)) {

                for($i = 0; $i <count($matched_products); $i++) {

                    // get the Product IDs of matched products
                    $mpid = array('product_id' => $matched_products[$i]['product_id']);
            
                    // Funky Chunky Furniture matches by SKU
                    if ($client_id == "71950") {
                        $mpid = array('product_id' => $matched_products[$i]['sku']);
                    }
                    array_push($matchedProductsIds, $mpid);
            
                }
            }
            
        }
        wp_reset_postdata();
    }
    

    // for each product... (this is a MUTABLE loop!)
    foreach ($products as &$p) {

        $counter = 0;
        $pId = $p['product_id'];

        // Funky Chunky Furniture matches by SKU
        if ($client_id == "71950") {
            $pId = $p['sku'];
        }

        // calculate the number of matching posts for each product
        if (is_array($matchedProductsIds) || is_object($matchedProductsIds)) {              
            foreach ($matchedProductsIds as $key=>$productId) {
                if($counter < 99){ //max tagged of 99
                    if ($productId["product_id"] == $pId) {
                        $counter++;
                    }  
                }
                else continue;
            }
        }
        else continue;

        $p['num_tagged_posts'] = $counter;
    }

    echo json_encode($products);
    die;
}



// get a product's image
add_action('wp_ajax_get_product_images', 'get_product_images');
function get_product_images() {
    
    $client_id = get_client_id();

    // get the product IDs
    $product_ids = $_REQUEST['product_ids'];

    // convert to string for SQL
    $product_ids = sprintf("'%s'", implode("','", $product_ids));

    global $wpdb;

    // get a full list of all the products matching these product IDs
    $products = $wpdb->get_results("SELECT product_id, image_link FROM oculizm_products WHERE CLIENT_ID = " . $client_id . " AND product_id IN(" . $product_ids . ")", ARRAY_A);

    echo json_encode($products);
    die;
}


// update client product prices - AJAX handler
add_action('wp_ajax_update_product_prices', 'update_product_prices');
function update_product_prices() {
    $client_id = get_client_id();
    
    $result = update_product_prices_internal($client_id);

    echo json_encode($result);
    die();

}

// update product prices
function update_product_prices_internal($client_id) {

    global $wpdb;

    // This method updates prices in existing posts to match prices of products in the database. So to match to the latest
    // prices, make sure to click "Update Feed" first.

    $result = array();

    // STEP 1: get this client's product IDs with their prices
    global $wpdb;
    $db_products = $wpdb->get_results("SELECT sku, price, us_price, gb_price, de_price, ca_price, at_price, ch_price, fr_price, it_price, ar_price, au_price, se_price, dk_price, es_price FROM oculizm_products WHERE CLIENT_ID = " . $client_id . " ORDER BY ID ASC", ARRAY_A);

    // STEP 2: get all this client's posts
    $args = array(
        'post_type' => 'post',
        'orderby' => 'meta_value',
        'posts_per_page' => -1,
        'meta_query' => array(
            array(
                'key'     => 'client_id',
                'value'   => $client_id,
                'compare' => 'LIKE',
            ),
        ),
    );
    $wp_query = new WP_Query($args);

    // audit
    $num_posts = $wp_query->found_posts;
    $num_matched_products = 0;
    $num_matched_products_with_stale_prices = 0;
    $num_prices_changed = 0;

    // for each post...
    while( $wp_query->have_posts() ) : $wp_query->the_post();
        $post_id = get_the_ID();

        // get its matched products
        $post_products = get_field('matched_products', $post_id);

        // for each matched product...
        if (is_array($post_products) || is_object($post_products)) {
            foreach ($post_products as $key=>$post_product) {

                $num_matched_products++;

                // search the products table for this matched product (WARNING! array_filter returns an array with keys preserved, 
                // so you may get null when you try to access $results[0]. Use array_values() afterwards to reset the array keys 
                // if you don't need them)
                $product_id = $post_product['product_id'];
                $db_matches = array_filter($db_products, function ($db_product) use ($product_id) {
                    return $db_product['sku'] === $product_id;
                });
                $db_matches = array_values($db_matches); // reset the array keys

                // if the product tagged in this post is also in the products table...
                if (sizeof($db_matches) > 0) {
                    if ($db_matches[0]) {
                        $db_product = $db_matches[0];

                        // get the DB price
                        $db_price = $db_product['price'];

                        // get the post price
                        $post_price = $post_product['product_price'];

                        // compare the price of the matched product with the price of the product in the products table
                        // if they're not the same...
                        if ($db_price != $post_price) {

                            $num_matched_products_with_stale_prices++;

                            // update the price in the matched product
                            //
                            // ACF NOTE
                            // ---
                            // When targeting a sub field using a specific row number, please note that row numbers begin from 1 
                            // and not 0. This means that the first row has an index of 1, the second row has an index of 2, and so on.
                            // so we must use $key+1
                            $update = update_sub_field(array('matched_products', ($key+1), 'product_price'), $db_price, $post_id);
                            $result['update'] = $update;
                            if ($update) $num_prices_changed++;
                        }

                        // active regions list eg. gb_, us_ ...
                        $active_regions = array('gb', 'us', 'se', 'dk');

                        // now do regional prices
                        foreach ($active_regions as $r) {
                            if (array_key_exists($r . '_price', $db_product)) {
                                $db_price = $db_product[$r . '_price'];
                                $post_price = "0";
                                if (array_key_exists($r . '_price', $post_product)) $post_price = $post_product[$r . '_price'];
                                if ($db_price != $post_price) {
                                    $num_matched_products_with_stale_prices++;
                                    $update = update_sub_field(array('matched_products', ($key+1), $r . '_price'), $db_price, $post_id);
                                    $result['update'] = $update;
                                    if ($update) $num_prices_changed++;
                                }                            
                            }
                        }
                    }
                }
            }
        }

    endwhile;

    // build result object
    $result['num_posts'] = $num_posts;
    $result['num_matched_products'] = $num_matched_products;
    $result['num_matched_products_with_stale_prices'] = $num_matched_products_with_stale_prices;
    $result['num_prices_changed'] = $num_prices_changed;

    // Return the result array
    return $result;
}


