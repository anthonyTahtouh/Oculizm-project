<?php
/**
 * @package Oculizm
 * @version 2.1
 */

/*
Plugin Name: Oculizm
Description: Increase conversion with UGC shoppable galleries
Author: London City Media
Author URI: https://londoncitymedia.com
Version: 2.1
*/

// Facebook variables
$GLOBALS['facebook_api_version'] = "v16.0";
$GLOBALS['facebook_app_id'] = "205080146942029";
$GLOBALS['facebook_client_secret'] = "148136b039be576df0f2c21c5f1e781a";
$GLOBALS['facebook_app_id_test'] = "1137555067213366";
$GLOBALS['facebook_client_secret_test'] = "218d9c06d8f3a419f1f9512f7948d1ff";

// Twitter variables
$GLOBALS['twitter_consumer_key'] = 'bqin8FoCaLahdZqRELTRXx9lA';
$GLOBALS['twitter_consumer_secret'] = 'ShRbAlIM1mnh5zGsa5VXORqgspEQyfeV9B7iVj4nBYGLq2yqHs';
$GLOBALS['twitter_client_id'] = "dEs5V0tOb0R1alI1QnJqY2xVVHY6MTpjaQ";
$GLOBALS['twitter_client_secret'] = "JJkTjsY8O-Ac9h077Bfr1Mj5j2V8af9c6ZO4KWtuGCIgnpwbkW";

// hashtags not to index
$GLOBALS['generic_hashtags'] = array(
    // general
    "shop", "shopthelook", "shoplocal", "shoponline", "gift", "gifted", "londonblogger", "luxury", "tattoo", "tattoos", "toy", "toys", "ethical",
     "karaoke", "inspo", "love", "details", "influencer", "motivation", "shopping", "brandambassador", "inspiration", "aesthetic",
     "giftideas", "shopsmall", "brandcollaboration", "comingsoon", "sneakpeek", "tiktok", "valentinesday", "lifestyle", "sponsored", 
     "community", "productphotography", 
    // fashion
    "ootd", "fashion", "style", "outfit", "apparel", "bag", "mensfashion", "outfitoftheday", "shoegram", "slowfashion", "shoes", "boots",
    "jeans", "suit", "shirt", "styleblogger", "accessories", "girl", "boy", "woman", "man", "styleinspo", "fashionista", "model", "model",
    "fashionblogger", "menswear", "londonfashionblogger", "sustainablefashion", "instafashion", "outfitinspiration", "autumnfashion", 
    "ootdfashion", "streetstyle", "bloggerstyle", "autumnoutfit", "autumnstyle", "autumnoutfits", "outfitinspo", "outfitinspiration",
    "lookoftheday", "fallfashion", "instastyle", "americana", "socks", "sock", "fallstyle", "outfitinspo", "summerstyle", "ootdinspo", 
    "springfashion", "summerlooks", "curvygirl", "curvy", "dress", "mystyle", "stylist",
    // furniture / interior
    "furniture", "interiordesign", "interior", "interiors", "garden", "home", "homedecor", "sofa", "bed", "chair", "bedroomdecor",
    "interiorinspo", "handmade", 
    "homesweethome",
    // cosmetics / fragrances
    "makeup", "perfume", "fragrance", "skincareroutine", "cosmetics", "skin", "makeupartist", "mua", "perfumes", "beauty", "scent",
    "fragrances", "scents", 
    // jewellery
    "necklace", "bracelet", "earrings", "earring", "ring", "diamond",
    // fitness
    "workout", "fitness", "gym", "grind", "gains", "weight", "muscle", "workout",
    // travel
    "travel", "travelphotography", "hotel", "holiday", "vacation", "instatravel", "explore", "visitengland", "visitlondon", 
    "explorelondon", "london", "travelblogger", "londonblogger", "sunshine",
    // pets
    "puppy", "puppysofinstagram", "puppiesofinstagram", "dogs", "dogsofinstagram", "dogoftheday", "doglove", "puppylove", "dog", "doglovers",
    // sports
    "sports", "sport", "boxing", "wwe", "cycling", "bike", "bikes", "cyclinglife", "cyclist", "cyclingphotos", "cyclingpics", "bicycle", 
    "gravel", "cycle", 
    // colours
    "red", "gold", "blue", "black", "white", "green", "yellow", "orange", "pink", "purple", "brown", "silver", "grey",
    "lilac", "turquoise", "lime", "fuscia",
    // seasons
    "autum", "winter", "summer", "spring", "fall", "aw22", "ss22", "aw23", "ss23", "aw24", "ss24", "springsummer", "autumnwinter",
    // italian
    "gioielli", "anelli", "oro", "accessori", "collane", "orecchini", "bracciali", "italy", "italia",
    // french
    "bijoux",
    // arabic
    "arab", "arabe", "ramadan"
);

// includes
require_once('inc/api-app-auth.php');
require_once('inc/api-app.php');
require_once('inc/api-web.php');
require_once('inc/network_posts.php');
require_once('inc/clients.php');
require_once('inc/connections.php');
require_once('inc/content_creators.php');
require_once('inc/crons.php');
require_once('inc/email.php');
require_once('inc/events.php');
require_once('inc/graphql.php');
require_once('inc/home-summary.php');
require_once('inc/home-sales.php');
require_once('inc/home-orders.php');
require_once('inc/home-content.php');
require_once('inc/galleries.php');
require_once('inc/helpers.php');
require_once('inc/posts.php');
require_once('inc/products.php');
require_once('inc/product_feeds.php');
require_once('inc/product_titles.php');
require_once('inc/reviews.php');
require_once('inc/searches.php');
require_once('inc/support.php');
require_once('inc/system.php');
require_once('inc/tags.php');
require_once('inc/tiktok.php');
require_once('inc/twitter.php');
require_once('inc/users.php');





/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 *                                     *
 *                HOOKS                *
 *                                     *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

function setup_tables() {

    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

    $sql = "CREATE TABLE `oculizm_settings` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `setting_name` tinytext COLLATE utf8mb4_unicode_520_ci,
    `setting_value` tinytext COLLATE utf8mb4_unicode_520_ci,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_clients` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `master_account_id` int(11) DEFAULT '0',
    `package` int(2) DEFAULT '0',
    `name` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `category` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `logo` tinytext COLLATE utf8mb4_unicode_520_ci,
    `cms` tinytext COLLATE utf8mb4_unicode_520_ci,
    `affiliate_network` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `PID` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `SID` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `CID` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `LID` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `banner_id` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `merchant_id` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `use_thumb` int(11) DEFAULT '0',
    `hide_credits` int(11) DEFAULT '0',
    `hotspot_labels` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `post_viewer` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `ppg_hotspot_labels` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `ppg_custom_css` text COLLATE utf8mb4_unicode_520_ci,
    `ppg_show_products` int(11) DEFAULT '0',
    `ppg_use_carousel` int(11) DEFAULT '0',
    `PPGViewer` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `lightbox_z_index` bigint(3) DEFAULT '999',
    `share_text` text COLLATE utf8mb4_unicode_520_ci NULL,
    `viewer_title` text COLLATE utf8mb4_unicode_520_ci NULL,
    `inactive` int(11) DEFAULT '0',
    `shop_css` text COLLATE utf8mb4_unicode_520_ci,
    `review_form_title` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT 'Leave A Review',
    `review_form_description` text COLLATE utf8mb4_unicode_520_ci DEFAULT 'We love hearing your feedback. Please leave us a review using the form below.',
    `auto_approve_reviews` int(1) DEFAULT '0',
    `carousel_reviews` int(1) DEFAULT '0',
    `hide_reviews_credits` int(11) DEFAULT '0',
    `email_required` int(11) DEFAULT '0',
    `reviews_custom_css` text COLLATE utf8mb4_unicode_520_ci,
    `min_auto_publish_reviews_stars` int(11) DEFAULT '0',
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_user_prefs` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `client_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `menu_expanded_analytics` int(11) DEFAULT '1',
    `menu_expanded_posts` int(11) DEFAULT '1',
    `menu_expanded_curate` int(11) DEFAULT '1',
    `menu_expanded_products` int(11) DEFAULT '1',
    `menu_expanded_reviews` int(11) DEFAULT '1',
    `menu_expanded_integration` int(11) DEFAULT '1',
    `menu_expanded_settings` int(11) DEFAULT '1',
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_product_feeds` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `client_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `format` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `http_url` text COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `http_username` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `http_password` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `ftp_url` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `ftp_username` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `ftp_password` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `ftp_path` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `shop_link` text COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `num_products` tinytext COLLATE utf8mb4_unicode_520_ci,
    `region` tinytext COLLATE utf8mb4_unicode_520_ci,
    `last_updated` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_hidden_network_posts` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `client_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
        `network_post_id` tinytext COLLATE utf8mb4_unicode_520_ci,
        PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
        dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_products` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `product_id` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `sku` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `title` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `price` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `price_strikeout` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `link` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `image_link` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `availability` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `gb_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `gb_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `gb_link` text COLLATE utf8mb4_unicode_520_ci,
    `fr_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `fr_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `fr_link` text COLLATE utf8mb4_unicode_520_ci,
    `de_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `de_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `de_link` text COLLATE utf8mb4_unicode_520_ci,
    `ch_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `ch_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `ch_link` text COLLATE utf8mb4_unicode_520_ci,
    `au_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `au_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `au_link` text COLLATE utf8mb4_unicode_520_ci,
    `at_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `at_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `at_link` text COLLATE utf8mb4_unicode_520_ci,
    `ca_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `ca_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `ca_link` text COLLATE utf8mb4_unicode_520_ci,
    `it_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `it_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `it_link` text COLLATE utf8mb4_unicode_520_ci,
    `us_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `us_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `us_link` text COLLATE utf8mb4_unicode_520_ci,
    `ar_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `ar_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `ar_link` text COLLATE utf8mb4_unicode_520_ci,
    `se_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `se_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `se_link` text COLLATE utf8mb4_unicode_520_ci,
    `dk_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `dk_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `dk_link` text COLLATE utf8mb4_unicode_520_ci,
    `es_title` tinytext COLLATE utf8mb4_unicode_520_ci,
    `es_price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `es_link` text COLLATE utf8mb4_unicode_520_ci,
    `client_id` mediumint NOT NULL,
    `feed_id` bigint(22),
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_connections` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `client_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `social_network` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `facebook_access_token` text COLLATE utf8mb4_unicode_520_ci,
    `facebook_page_access_token` text COLLATE utf8mb4_unicode_520_ci,
    `facebook_user_id` tinytext COLLATE utf8mb4_unicode_520_ci,
    `instagram_business_id` tinytext COLLATE utf8mb4_unicode_520_ci,
    `twitter_oauth_access_token` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `twitter_oauth_access_token_secret` text COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `twitter_user_id` tinytext COLLATE utf8mb4_unicode_520_ci,
    `tiktok_csrf` tinytext COLLATE utf8mb4_unicode_520_ci,
    `tiktok_access_token` tinytext COLLATE utf8mb4_unicode_520_ci,
    `tiktok_open_id` tinytext COLLATE utf8mb4_unicode_520_ci,
    `tiktok_display_name` tinytext COLLATE utf8mb4_unicode_520_ci,
    `tiktok_profile_pic_url` tinytext COLLATE utf8mb4_unicode_520_ci,
    `username` tinytext COLLATE utf8mb4_unicode_520_ci,
    `screen_name` tinytext COLLATE utf8mb4_unicode_520_ci,
    `profile_pic_url` text COLLATE utf8mb4_unicode_520_ci,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_searches` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `type` tinytext COLLATE utf8mb4_unicode_520_ci,
    `client_id` mediumint COLLATE utf8mb4_unicode_520_ci,
    `social_network` tinytext COLLATE utf8mb4_unicode_520_ci,
    `term` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `screen_name` text COLLATE utf8mb4_unicode_520_ci,
    `profile_pic_url` text COLLATE utf8mb4_unicode_520_ci,
    `hashtag_id` tinytext COLLATE utf8mb4_unicode_520_ci,
    `user_id` tinytext COLLATE utf8mb4_unicode_520_ci,
    `last_updated` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_cached_instagram_posts` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `client_id` mediumint DEFAULT '0',
    `search_id` bigint(22) DEFAULT '0',
    `social_id` varchar(256) CHARACTER SET latin1 DEFAULT NULL, /* why Latin? */
    `media_type` tinytext COLLATE utf8mb4_unicode_520_ci,
    `media_url` text COLLATE utf8mb4_unicode_520_ci,
    `local_src` text COLLATE utf8mb4_unicode_520_ci,
    `permalink` text COLLATE utf8mb4_unicode_520_ci,
    `comment_count` mediumint COLLATE utf8mb4_unicode_520_ci,
    `like_count` mediumint COLLATE utf8mb4_unicode_520_ci,
    `caption` text COLLATE utf8mb4_unicode_520_ci,
    `created_date` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (id)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_galleries` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `client_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `name` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `shop_css` text COLLATE utf8mb4_unicode_520_ci,
    `custom_ordering` BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_events` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `type` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `created` datetime NOT NULL,
    `post_id` tinytext COLLATE utf8mb4_unicode_520_ci,
    `session_id` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `product_id` tinytext COLLATE utf8mb4_unicode_520_ci,
    `sku` tinytext COLLATE utf8mb4_unicode_520_ci,
    `client_id` mediumint NOT NULL DEFAULT '0',
    `order_id` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `hostname` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `referrer` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_orders` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `session_id` tinytext COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `order_id` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `created` datetime NOT NULL,
    `order_amount` tinytext COLLATE utf8mb4_unicode_520_ci,
    `currency` tinytext COLLATE utf8mb4_unicode_520_ci,
    `region` tinytext COLLATE utf8mb4_unicode_520_ci,
    `client_id` mediumint NOT NULL DEFAULT '0',
    `platform` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `browsername` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `cookieEnabled` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `version` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `payment_method` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_reviews` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `created` datetime NOT NULL,
        `client_id` mediumint NOT NULL DEFAULT 0,
        `status` varchar(32) DEFAULT '',
        `flag_reason` varchar(32) DEFAULT '',
        `flag_detail` tinytext COLLATE utf8mb4_unicode_520_ci,
        `title` tinytext COLLATE utf8mb4_unicode_520_ci,
        `description` LONGTEXT COLLATE utf8mb4_unicode_520_ci,
        `rating` int(2) DEFAULT 0,
        `region` tinytext COLLATE utf8mb4_unicode_520_ci,
        `reviewer_name` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
        `reviewer_display_name` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
        `reviewer_image` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
        `reviewer_email` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
        `reviewer_type` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
        `email_verified` int(1) DEFAULT 0,
        `ip_address` varchar(45) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
        `request_id` int(11) DEFAULT 0,
        `reply` text COLLATE utf8mb4_unicode_520_ci,
        `order_id` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NOT NULL,
        `product_id` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
        `product_image_url` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
        `product_sku` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
        `referrer_url` varchar(256) COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    
    dbDelta($sql);
    

    $sql = "CREATE TABLE `oculizm_review_requests` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `client_id` mediumint NOT NULL DEFAULT '0',
    `request_key` int(11) DEFAULT '0',
    `status` tinytext COLLATE utf8mb4_unicode_520_ci,
    `review_id` int(11) DEFAULT '0',
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_order_items` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `order_id` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `product_id` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `sku` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `name` tinytext COLLATE utf8mb4_unicode_520_ci,
    `price` tinytext COLLATE utf8mb4_unicode_520_ci,
    `quantity` tinytext COLLATE utf8mb4_unicode_520_ci,
    `client_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `created` datetime NOT NULL,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_content_creators` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `client_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `username` tinytext COLLATE utf8mb4_unicode_520_ci,
    `screen_name` tinytext COLLATE utf8mb4_unicode_520_ci,
    `profile_pic_url` text COLLATE utf8mb4_unicode_520_ci,
    `social_network_user_id` tinytext COLLATE utf8mb4_unicode_520_ci,
    `social_network` tinytext COLLATE utf8mb4_unicode_520_ci,
    `last_updated` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_support_tickets` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `client_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `created` datetime NOT NULL,
    `status` tinytext COLLATE utf8mb4_unicode_520_ci,
    `subject` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    `last_updated` datetime,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    $sql = "CREATE TABLE `oculizm_support_ticket_items` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `client_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `created` datetime NOT NULL,
    `ticket_id` mediumint COLLATE utf8mb4_unicode_520_ci NOT NULL,
    `author` tinytext COLLATE utf8mb4_unicode_520_ci,
    `message` text COLLATE utf8mb4_unicode_520_ci DEFAULT NULL,
    PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;";
    dbDelta($sql);

    // KEYS
    $sql = "ALTER TABLE `oculizm_clients` ADD UNIQUE KEY `id` (`id`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_connections`  ADD UNIQUE KEY `id` (`id`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_events`  ADD UNIQUE KEY `id` (`id`),  ADD KEY `created` (`created`),  ADD KEY `client_id` (`client_id`),  ADD KEY `hostname` (`hostname`),  ADD KEY `oculizm_events_idx_id_hostname` (`client_id`,`hostname`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_galleries`   ADD UNIQUE KEY `id` (`id`);";
    dbDelta( $sql );
    $sql="ALTER TABLE `oculizm_cached_instagram_posts` ADD KEY `client_ind` (`client_id`),  ADD KEY `search_ind` (`search_id`),  ADD KEY `social_id` (`social_id`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_orders`  ADD UNIQUE KEY `id` (`id`),  ADD KEY `client_id` (`client_id`),  ADD KEY `created` (`created`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_order_items`  ADD UNIQUE KEY `id` (`id`),  ADD KEY `sku` (`sku`),  ADD KEY `order_id` (`order_id`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_searches`  ADD UNIQUE KEY `id` (`id`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_support_tickets`  ADD UNIQUE KEY `id` (`id`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_support_ticket_items`  ADD UNIQUE KEY `id` (`id`);";
    dbDelta( $sql );

    // INDEXES
    $sql = "ALTER TABLE `oculizm_connections` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_events` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_galleries` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql );
    $sql = "ALTER TABLE `oculizm_cached_instagram_posts` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql ); 
    $sql = "ALTER TABLE `oculizm_orders` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql ); 
    $sql = "ALTER TABLE `oculizm_products` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql ); 
    $sql = "ALTER TABLE `oculizm_product_feeds` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql ); 
    $sql = "ALTER TABLE `oculizm_searches` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql ); 
    $sql = "ALTER TABLE `oculizm_order_items` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql ); 
    $sql = "ALTER TABLE `oculizm_content_creators` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql ); 
    $sql = "ALTER TABLE `oculizm_support_tickets` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql ); 
    $sql = "ALTER TABLE `oculizm_support_ticket_items` ADD INDEX `client_id_index` (`client_id`);";
    dbDelta( $sql ); 
}
register_activation_hook( __FILE__, 'setup_tables' );





// login actions
add_action('wp_login', 'track_user_logins', 10, 2);
function track_user_logins($user_login, $user) {
    if( $login_amount = get_user_meta( $user->ID, 'login_amount', true ) ){
        // They've Logged In Before, increment existing total by 1
        update_user_meta( $user->ID, 'login_amount', ++$login_amount );
                                oLog('Welcome back, it is your ' . $login_amount . 'th login');
    } else {
        // First Login, set it to 1
        update_user_meta( $user->ID, 'login_amount', 1 );
        oLog('Welcome, this is your first time here! inside plugin');
    }
}
// add_shortcode( 'login_content', 'login_content' );
// function login_content( $atts ){
//     if( is_user_logged_in() ){
//         // Get current total amount of logins (should be at least 1)
//         $login_amount = get_user_meta( get_current_user_id(), 'login_amount', true );

//         // return content based on how many times they've logged in.
//         if( $login_amount == 1 ){
//             return 'Welcome, this is your first time here!';
//                                              echo "<script type='text/javascript'>alert('Welcome, this is your first time here!');</script>";
//                                              oLog('1');
//         } else if( $login_amount == 2 ){
//             return 'Welcome back, second timer!';
//                                              echo "<script type='text/javascript'>alert('Welcome back, second timer!');</script>";
//                                              oLog('2');
//         } else if( $login_amount == 3 ){
//             return 'Welcome back, third timer!';
//                                              echo "<script type='text/javascript'>alert('Welcome back, third timer!');</script>";
//                                              oLog('3');
//         } else {
//             return "Geez, you have logged in a lot, $login_amount times in fact...";
//                                              echo "<script type='text/javascript'>alert('Welcome back, multi timer!');</script>";
//                                              oLog('4');
//         }
//     }
// }





/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 *                                     *
 *                FILTERS              *
 *                                     *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

// disable creation of certain image sizes
function unset_image_sizes($sizes) {

    // WordPress core image sizes
    // - - - - - - - - - - - - - -
    // Thumbnail        (Size based on Media settings) (usually 300)
    // Medium           (Size based on Media settings) (usually 600)
    // Large            (Size based on Media settings) (usually 1024)
    // Medium Large     768px
    // 2x Medium Large  1536px
    // 2x Large         2048px
    // Scaled           2560px

    unset($sizes['768-768']);
    unset($sizes['medium_large']);
    unset($sizes['1536x1536']);
    unset($sizes['2048x2048']);
    unset($sizes['scaled']);
    
    return $sizes;
}
add_filter('intermediate_image_sizes_advanced', 'unset_image_sizes');

// custom cron schedules
function modify_cron_schedules($schedules) {
    $schedules['every_six_hours'] = array(
        'interval' => 21600, 'display'  => __( 'Every 6 hours' ),
    );
    return $schedules;
}
add_filter( 'cron_schedules', 'modify_cron_schedules' );

// HTML email filter
function set_email_content_type() {
    return "text/html";
}
add_filter('wp_mail_content_type','set_email_content_type');

// password reset email
function set_retrieve_password_message($message, $key, $user_login, $user_data) {

    // load email header and footer
    $email_header = file_get_contents(plugin_dir_path(__FILE__) . 'email/header.html');
    $email_footer = file_get_contents(plugin_dir_path(__FILE__) . 'email/footer.html');

    $link = network_site_url("wp-login.php?action=rp&key=$key&login=" . rawurlencode($user_login), 'login');

    // build the html
    $email_body = "<table border='0' cellpadding='0' cellspacing='0' width='100%'>
        <tbody>
            <tr>
                <td>
                    <br>
                    You have received a request to change your Oculizm password. <a href='" . $link ."&wp_lang=en_GB'>Click here</a> to reset your password.
                    <br>
                </td>
            </tr>
        </tbody>
    </table>";

    $html = $email_header . $email_body . $email_footer;

    return $html;
}
add_filter( 'retrieve_password_message', 'set_retrieve_password_message', 10, 4);









/* * * * * * * * * * * * * * * * * * * *
 *                                     *
 *                                     *
 *              CRON JOBS              *
 *                                     *
 *                                     *
 * * * * * * * * * * * * * * * * * * * */

// Usage: add_action(hook_name, function_to_be_called)
// Add new cron: https://app.oculizm.com/wp-admin/tools.php?page=crontrol_admin_manage_page
add_action('oculizm_hook_update_exchange_rates', 'update_exchange_rates');
add_action('oculizm_hook_update_social_network_connection_profile_pictures', 'update_social_network_connection_profile_pictures');
add_action('oculizm_hook_update_product_feeds', 'update_product_feeds');
add_action('oculizm_hook_update_all_clients_product_prices', 'update_all_clients_product_prices');
add_action('oculizm_hook_update_instagram_hashtag_media_url', 'update_instagram_hashtag_media_url');
add_action('oculizm_hook_update_content_creators', 'update_content_creators');
add_action('oculizm_hook_update_instagram_user_search_media', 'update_instagram_user_search_media');






// nopriv
add_action('wp_ajax_nopriv_get_system_options', 'get_system_options');
add_action('wp_ajax_nopriv_get_top_products', 'get_top_products');
add_action('wp_ajax_nopriv_get_all_clients', 'get_all_clients');
add_action('wp_ajax_nopriv_get_content_stats', 'get_content_stats');











/* don't leave any whitespace after the following closing PHP tag */
?>