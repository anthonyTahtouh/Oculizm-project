<?php

/* Template Name: Manage Clients */

// stop non-admins viewing this page
if(!current_user_can('manage_options')) {
    echo "Unauthorised.";
    return;
}

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>


<div class="form-overlay" name="add-client">
    <div class="overlay-bg"></div>
    <div class="overlay-content ">
        <div class="content-block">
            <h2>Add Client</h2>
            <div class="content-block-body">
                <div class="form-row">
                    <div class="form-label">Business Name</div>
                    <input type="text" name="business-name">
                </div>
                <div class="form-row">
                    <div class="form-label">Business Category</div>
                    <select name="business-category">
                        <option value="apparel">Apparel</option>
                        <option value="beautyAndCosmetics">Beauty & Cosmetics</option>
                        <option value="cycles">Cycles</option>
                        <option value="electronics">Electronics</option>
                        <option value="foodAndDrink">Food & Drink</option>
                        <option value="homeAndGarden">Home & Garden</option>
                        <option value="jewellery">Jewellery</option>
                        <option value="toysAndGames">Toys & Games</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-label">First Name</div>
                    <input type="text" name="first-name">
                </div>
                <div class="form-row">
                    <div class="form-label">Last Name</div>
                    <input type="text" name="last-name">
                </div>
                <div class="form-row">
                    <div class="form-label">Email Address</div>
                    <input type="text" name="client-email">
                </div>
                <div class="form-row">
                    <div class="form-label">Password</div>
                    <input type="text" name="client-password">
                </div>
                <div class="cta-group">
                    <a name="add-client" class='cta-primary'>Add Client</a>
                </div>
            </div>
        </div>
        <a href="#" class="close"></a>
    </div>
</div>

<div class="form-overlay" name="email-a-client">
    <div class="overlay-bg"></div>
    <div class="overlay-content ">
        <div class="content-block">
            <h2>Email A Client</h2>
            <div class="content-block-description">
                This form enables an email to be sent to every user registered with this client.
            </div>
            <div class="content-block-body">
                <h3>Client User List</h3>
                <table name='client-users'>
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th>Username</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
                <h3>Email Form</h3>
                <div class="form-row" name="email-subject">
                    <div class="form-label">Email Subject</div>
                    <input type="text">
                </div>
                <div class="form-row" name="email-message">
                    <div class="form-label">Email Message</div>
                    <textarea></textarea>
                </div>
                <div class="cta-group">
                    <a href='#' name="send-email" class="cta-primary">Send</a>
                </div>
            </div>
        </div>
        <a href="#" class="close"></a>
    </div>
</div>

<div class="main">


<?php


/*

// This function displays the latest video posts

echo "<h1>Display Latest Video Posts</h1>";

$date = strtotime('2021-12-31 00:00:00');

// get all posts, ordered by date
$args = array(
    'post_type' => 'post', 
    'orderby' => 'publish_date', 
    'post_status' => 'publish', 
    'order' => 'DESC', 
    'posts_per_page' => 2500, // any more than this and the query gets slow
    'paged' => 1,
    'date_query' => array('before' => date('c', $date)),
);
$the_query = new WP_Query($args);
if ($the_query->have_posts()) :
    while ($the_query->have_posts()) : $the_query->the_post();

        $img_url = get_the_post_thumbnail_url();

        // if the post's featured image is the "no-image" placeholder (i.e. it's a video post)
        if (strpos($img_url, 'no-image') !== false) { 

            // define variables
            $post_id = get_the_ID();
            $thumbnail_id = get_post_thumbnail_id($post_id);
            $video_id = get_post_meta($thumbnail_id, '_thumbnail_id', true);
            $video_url = wp_get_attachment_url($video_id);
            $video_url_components = explode('/', $video_url);
            $filename = end($video_url_components);
            
            // print the useful info
            echo "<div class='item'>";
            echo get_the_date();
            echo " <b>" . get_client_name_from_id(get_field('client_id')) . "</b> ";
            echo $filename;
            echo " <a href='" . "https://app.oculizm.com/wp-admin/post.php?post=" . $post_id . "&action=edit" . "'>Admin Edit</a>";
            echo " <a href='" . "https://app.oculizm.com/edit-post/?post_id=" . $post_id . "'>Edit</a>";
            // echo "<input style='display: inline-block; width: 100px; padding: 0;' type=text>"; // useful for making notes on the screen
            echo "</div>";
        }

    endwhile;
endif;
echo "<br><br>";
wp_reset_postdata();
wp_reset_query();
*/





/*

// new case: Johnny Loves Rosie (JLR):
// currently we imported the 'id' column for both product ID and SKU. They all begin with sohpify_gb_...
// we implemented the Product Widget and it didn't work, as {{product.id}} in Liquid code was transmitting an integer
// after checking their product feed we realised it's transmitting the item group id
// so we need the product id in oculizm_products to hold that, and the product id in matched products too
// so what's the first step? import the item group id into oculizm_products->product_id or oculizm_products->sku?
// THAT IS THE QUESTION!
// I think what we need to do is import it into the product id colulm. That will
//      a) bypass the first update function below (as it will no longer find a match for product IDs in the form of 'shopify_gb_...')
//      b) the second update function checks that a matched product's Product ID matches the oculizm_products->sku (this will be
//         still take the form of 'shopify_gb_...')
// So, first thing to do is to reimport the product feed, having set the product_id as the item group node in the feed
// Then, set $num_updates to 1 and test it worked for a single product
// Then gradually increase the number of updates
// then afterwards, maybe set the SKU to be the MPN? Do this by importing it first into oculizm_products->sku
// then run the first update function below

// This function iterates through a client's posts, finding any tagged products with Product ID *NOT IN* the oculizm_products table.
// We then search the SKU column of oculizm_products for this invalid Product ID, and then update the Product ID inside the 
// matched_products ACF field of the post, to be the product_id of the matched item in oculizm_products.
// For this to work, we have to have set the product importer for this client to popuplate the SKU field with whatever (incorrect/stale)
// data that is currently in the Prdouct ID ACF field in the stale posts.
// Read and understand EVERY LINE of this function before running it.
// How to use this function: set the following parameters, and keep refreshing until all updates are done. There might be some posts
// that can't be updated because:
// - there are no products attached to this post
// - there are no STALE products attached to this post
// - there are stale products attached to this post but we can't find a match in the oculizm_products table
// so you may have to manually retag those posts

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
// WARNING! THIS CODE IS SET TO RUN ON PAGE LOAD, WHICH MEANS IF YOU'RE EDITING IT AND ANOTHER ADMIN VISITS THIS PAGE, YOUR CODE WILL RUN!
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

// $client_id = 57345; // Apatchy
// $client_id = 90211; // Cheaney
$client_id = 58520; // Johnny Loves Rosie
$num_posts = 25; // number of posts to fetch at a time
$num_updates = 1; // number of updates to perform at a time


echo "<h1>Display/Update Stale Products</h1>";

// get this client's products
global $wpdb;
$products = $wpdb->get_results("SELECT product_id,sku FROM oculizm_products WHERE CLIENT_ID = " . $client_id . " ORDER BY ID ASC", ARRAY_A);

// get this client's posts
$posts = get_posts(array(
    'posts_per_page'    => $num_posts, 
    'post_type'         => 'post',
    'meta_key' => 'client_id',
    'meta_value' => $client_id,
));

// function to check if a product ID exists in the product table
function checkValidProductID($products, $key, $id) {
    foreach ($products as $p) {
        if ($p[$key] === $id) return $p;
    }
    return false;
}

$counter = 0;

// for each post...
if ($posts) {
    foreach ($posts as $post) {
        
        // set up post data
        setup_postdata($post);
        $post_id = get_the_ID();
        $img_url = get_the_post_thumbnail_url();
        $matched_products = get_field('matched_products', $post_id);

        // print out the post daata
        echo "<div class='item'>";
        echo "  <a href='https://app.oculizm.com/edit-post/?post_id=" . $post_id . "' style='display:inline-block;vertical-align:middle;margin-right:10px'>";
        echo "      <div style='display:inline-block'><img src='" . $img_url . "' style='width:100px;height:auto'></div>";
        echo "  </a>";
        echo '  <div class="products" style="display:inline-block;vertical-align:middle">';
        echo "<a href='https://app.oculizm.com/edit-post/?post_id=" . $post_id . "'>Post " . $post_id . '</a><br> ';

        // if there are products tagged in the post...
        if ($matched_products) {

            // for each product tagged in the post...
            foreach ($matched_products as $key => $mp) {

                $product_id = $mp['product_id'];
                $product_sku = $mp['sku'];

                echo "<br><b>Product </b>";
                echo $product_id . "/" . $product_sku;

                // check if this product ID exists in the oculizm_products table
                $product_in_products_table = checkValidProductID($products, 'product_id', $product_id);

                // if this product ID exists in the oculizm_products table (as a product ID)...
                if ($product_in_products_table) {

                    // get its sku
                    $new_product_id = $product_in_products_table['sku']; // MUST BE LOWERCASE!
                    echo " <b>found in oculizm_products table:</b> " . $product_in_products_table['product_id'] . "/" . $new_product_id;

                    // safety limit
                    if ($counter < $num_updates) {

                        // * * *
                        // use this funciton if the product IDs in tagged posts are fine, but we need the SKUs updated
                        // * * *

                        // set the sku of this tagged product to be the sku from oculizm_products
                        // Note: this function does check if the skus already match - it makes the update anyway

                        // $update = update_sub_field(array('matched_products', ++$key, 'sku'), $new_product_id, $post_id);
                        // echo " <span style='background-color:#ddffdd'>Updated</span> ";
                        // $counter++;
                    }
                }

                // else...
                else {
                    echo " <span style='background-color:#ffff00'>Stale product ID!</span> ";

                    // now check if there is a product in oculizm_products with SKU matching this tagged product's product ID...
                    $product_in_products_table2 = checkValidProductID($products, 'sku', $product_id);
                    if ($product_in_products_table2) {

                        // get its Product ID
                        $new_product_id = $product_in_products_table2['product_id']; // MUST BE LOWERCASE!
                        echo $new_product_id;

                        // safety limit
                        if ($counter < $num_updates) {

                            // * * *
                            // use this function to update stale product IDs in posts (having matched on a temporary value in the SKU column of the oculizm_products table)
                            // * * *

                            // set the product ID of this tagged product to be that product ID

                            // $update = update_sub_field(array('matched_products', ++$key, 'product_id'), $new_product_id, $post_id);
                            // echo " <span style='background-color:#ddffdd'>Updated</span> ";
                            // $counter++;
                        }
                    }
                    else echo " <span style='background-color:#ffdd00'>Stale SKU!</span> ";
                }
            }
        }
        else echo " <span style='background-color:#ffbb00'>No products found!</span> ";
        echo '  </div>';
        echo "</div>";
    }
    wp_reset_postdata();
}

*/




?>


	<h1><?php the_title(); ?></h1>
    
    <a href='#' class="header-button button-add-client">Add Client</a>

    <div class="content-block"> 
        <h2 name='clients'>Clients</h2>
        <table class='tablesorter' name="manageClients">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Connections</th>
                    <th>Product Feeds</th>
                    <th>Products</th>
                    <th>Posts</th>
					<th>CMS</th>
                    <th>Last Post</th>
                    <th>Last Login</th>
					<th>Last Event</th>
                    <th></th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>

    <div class="content-block"> 
        <h2 name='galleries'>Galleries</h2>
        <table class='tablesorter' name="manageGalleries">
            <thead>
                <tr>
                    <th>Client</th>
                    <th>Gallery Name</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>

    <div class="content-block"> 
        <h2 name='productFeeds'>Product Feeds</h2>
        <table class='tablesorter' name="manageProductFeeds">
            <thead>
                <tr>
                    <th>Client</th>
                    <th>Product Feed</th>
                    <th>Products</th>
                    <th>Format</th>
                    <th>Last Updated</th>
                    <th>Shop Link</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>

</div>


<?php get_footer(); ?>
