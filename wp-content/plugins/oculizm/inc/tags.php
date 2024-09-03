<?php

use MatthiasMullie\Minify;

// publish all client tags
add_action('wp_ajax_publish_all_client_tags', 'publish_all_client_tags');
function publish_all_client_tags() {
    return publish_all_client_tags_internal();
}

// publish all client tags (internal)
function publish_all_client_tags_internal() {

    global $wpdb;

    $clients = $wpdb->get_results("SELECT id FROM oculizm_clients ", ARRAY_A);

    $results = array();

    foreach ($clients as $client) {
        $client_id = $client['id'];
        $result = publish_client_tags($client_id);
        array_push($results, array('client_id' => $client_id, 'result' => $result));
    }
    return $results;
}

// publish client tags
function publish_client_tags($clientId) {
    
    // get the client ID
    $client_id = get_client_id();
    if (isset($clientId)) $client_id = $clientId;

    $env = get_environment();

    global $wpdb;

    // get client's default region
    $primary_feed_region = "";
    $primary_feed_region_db = $wpdb->get_results("SELECT region FROM oculizm_product_feeds WHERE client_id = " . $client_id, ARRAY_A);
    if (count($primary_feed_region_db) > 0) {
        $primary_feed_region = $primary_feed_region_db[0]['region'];
    }

    // get client options
    $db_client_settings = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);

    // get galleries
    $db_client_galleries = $wpdb->get_results("SELECT * FROM oculizm_galleries WHERE client_id = " . $client_id, ARRAY_A);

    // define variables
    $affiliate_network = $db_client_settings[0]['affiliate_network'];
    $PID = $db_client_settings[0]['PID'];
    $SID = $db_client_settings[0]['SID'];
    $CID = $db_client_settings[0]['CID'];
    $LID = $db_client_settings[0]['LID'];
    $merchant_id = $db_client_settings[0]['merchant_id'];
    $banner_id = $db_client_settings[0]['banner_id'];
    $lightbox_z_index = $db_client_settings[0]['lightbox_z_index'];
    $viewer_title = $db_client_settings[0]['viewer_title'];
    $share_text = $db_client_settings[0]['share_text'];
    $ppg_hotspot_labels = $db_client_settings[0]['ppg_hotspot_labels'] ?? '';
    $ppg_use_carousel = $db_client_settings[0]['ppg_use_carousel'];
    $PPGViewer = $db_client_settings[0]['PPGViewer'] ?? '';
    $ppg_show_products = $db_client_settings[0]['ppg_show_products'];
    $ppg_custom_css = $db_client_settings[0]['ppg_custom_css'];
    $post_viewer = $db_client_settings[0]['post_viewer'] ?? '';
    $hotspot_labels = $db_client_settings[0]['hotspot_labels'] ?? '';
    $hide_credits = $db_client_settings[0]['hide_credits'];
    $review_form_title = $db_client_settings[0]['review_form_title'];
    $review_form_description = $db_client_settings[0]['review_form_description'] ?? '';

    $result = array();

    // load external libraries
    $path = plugin_dir_path(__FILE__) . '../lib';
    require_once $path . '/minify/src/Minify.php';
    require_once $path . '/minify/src/CSS.php';
    require_once $path . '/minify/src/JS.php';
    require_once $path . '/minify/src/Exception.php';
    require_once $path . '/minify/src/Exceptions/BasicException.php';
    require_once $path . '/minify/src/Exceptions/FileImportException.php';
    require_once $path . '/minify/src/Exceptions/IOException.php';
    require_once $path . '/path-converter/src/ConverterInterface.php';
    require_once $path . '/path-converter/src/Converter.php';
    // require_once WP_PLUGIN_DIR . '/javascript-obfuscator/javascript-obfuscator.php';
    $owl_library_js = file_get_contents(plugin_dir_path(__FILE__) . '../client/js/owl.carousel.min.js');
    $owl_library_css_1 = plugin_dir_path(__FILE__) . '../client/css/owl.carousel.min.css';
    $owl_library_css_2 = plugin_dir_path(__FILE__) . '../client/css/owl.theme.default.min.css';

    // load JS files
    $grid_js = file_get_contents(plugin_dir_path(__FILE__) . '../client/js/grid.js');
    $aso_js = file_get_contents(plugin_dir_path(__FILE__) . '../client/js/aso.js'); // NEEDS TO BE BEFORE AFFILIATE LINK ENCODING
    $tracking_js = file_get_contents(plugin_dir_path(__FILE__) . '../client/js/tracking.js');
    $reviews_js = file_get_contents(plugin_dir_path(__FILE__) . '../client/js/reviews.js');

    // load CSS files
    $grid_css = file_get_contents(plugin_dir_path(__FILE__) . '../client/css/grid.css');
    $aso_css = file_get_contents(plugin_dir_path(__FILE__) . '../client/css/aso.css');
    $reviews_css = file_get_contents(plugin_dir_path(__FILE__) . '../client/css/reviews.css');

    // set environment
    $grid_js = str_replace('https://app.oculizm.com', $env, $grid_js);
    $grid_css = str_replace('https://app.oculizm.com', $env, $grid_css);
    $aso_js = str_replace('https://app.oculizm.com', $env, $aso_js);
    $aso_css = str_replace('https://app.oculizm.com', $env, $aso_css);
    $tracking_js = str_replace('https://app.oculizm.com', $env, $tracking_js);
    $reviews_js = str_replace('https://app.oculizm.com', $env, $reviews_js);
    $reviews_css = str_replace('https://app.oculizm.com', $env, $reviews_css);

    // replace client ID
    $grid_js = str_replace('{{clientID}}', $client_id, $grid_js);
    $aso_js = str_replace('{{clientID}}', $client_id, $aso_js);
    $tracking_js = str_replace('{{clientID}}', $client_id, $tracking_js);
    $reviews_js = str_replace('{{clientID}}', $client_id, $reviews_js);


    // CLIENT SPECIFIC options
    $carousel_mobile_items = 1;
    $carousel_infinite = 1;
    $aso_infinite = 0;
    $aso_cols = 3;
    $aso_cols_mobile = 1;
    $carousel_slide_by = 1;
    $product_carousel_items = 3;
    if ($client_id == "71950") $aso_infinite = 1; // FCF
    if ($client_id == "18852") $aso_cols = 6; // Ribble
    if ($client_id == "58520") $carousel_mobile_items = 2; // Johnny Loves Rosie
    if ($client_id == "58520") $aso_cols_mobile = 2; // Johnny Loves Rosie

    // MODA IN PELLE
    if ($client_id == "43862") {
        $carousel_slide_by = "'page'";
    }

    // AFFILIATE NETWORK LINK ENCODING
    $aso_js = encode_affiliate_network_links($aso_js ,$affiliate_network ,$PID ,$SID ,$CID ,$LID ,$merchant_id ,$banner_id);
 
    // get shop link attributes for each region that this client supports
    $regionsShopLinksArray = $wpdb->get_results("SELECT region, shop_link FROM oculizm_product_feeds WHERE client_id = " 
        . $client_id, ARRAY_A);

    // galleries
    foreach ($db_client_galleries as $gallery) {

        if (isset($gallery)) {

            // load files
            $grid_js = file_get_contents(plugin_dir_path(__FILE__) . '../client/js/grid.js');
            $grid_css = file_get_contents(plugin_dir_path(__FILE__) . '../client/css/grid.css');

            // set environment
            $grid_js = str_replace('https://app.oculizm.com', $env, $grid_js);
            $grid_css = str_replace('https://app.oculizm.com', $env, $grid_css);

            // replace client ID
            $grid_js = str_replace('{{clientID}}', $client_id, $grid_js);

            // AFFILIATE NETWORK LINK ENCODING
            $grid_js = encode_affiliate_network_links($grid_js, $affiliate_network, $PID, $SID, $CID, $LID, $merchant_id ,$banner_id);

            // defining variables
            $gallery_id = $gallery['id'];
            $shop_css = $db_client_settings[0]['shop_css'];

            // replacements
            $grid_js = str_replace('{{galleryID}}', $gallery_id, $grid_js);
            $grid_js = str_replace('/* region */', $primary_feed_region, $grid_js);
            $grid_js = str_replace('/* shareText */', $share_text, $grid_js);
            $grid_js = str_replace('/* reviewFormTitle */', $review_form_title, $grid_js);
            $grid_js = str_replace('/* reviewFormDescription */', $review_form_description, $grid_js);
            $grid_js = str_replace('/* postViewer */', $post_viewer, $grid_js);
            $grid_js = str_replace('/* hotspotLabels */', $hotspot_labels, $grid_js);
            $grid_js = str_replace('/* hideOculizmCredit */', $hide_credits, $grid_js);
            $grid_js = str_replace('<div class="product-list-title">Shop the look</div>', '<div class="product-list-title">' . $viewer_title . '</div>', $grid_js);
        
            // grid carousel init
            $grid_post_container_owl_init =     "jQuery('#oclzm .post-grid').addClass('owl-carousel');" .
                "var owl = jQuery('#oclzm .owl-carousel').owlCarousel({" .
                "    loop: 1," .
                "    nav: true," .
                "    margin: 3," .
                "    items: 4," .
                "    lazyLoad: 1," .
                "    slideBy: " . 1 . "," .
                "    responsive: {" .
                "        0: { items: " . 1 . " }," .
                "        600: { items: 3 }," .
                "        768: { items: 4 }" .
                "    }," .
                "    onChanged: oculizmCarouselOnChanged" .
                "});";
            $grid_js = str_replace('/* INIT CAROUSEL CODE */', $grid_post_container_owl_init, $grid_js);

            // product carousel init
            $product_carousel_owl_init =  "productsSection.addClass('owl-carousel');" .
                "productsSection.owlCarousel({" .
                "    loop: false," .
                "    nav: true," .
                "    margin: 10," .
                "    items: " . $product_carousel_items . "," .
                "    responsive: {" .
                "        0: { items: 1 }," .
                "        640: { items: 2 }," .
                "        768: { items: " . $product_carousel_items . " }" .
                "    }" .
                "});";
            $grid_js = str_replace('/* INIT PRODUCT CAROUSEL CODE */', $product_carousel_owl_init, $grid_js);

            // minify CSS
            $minifier = new Minify\CSS($grid_css);
            $minifier->add($owl_library_css_1);
            $minifier->add($owl_library_css_2);
            $minifier->add($shop_css);
            $minifier->add(" .oculizm-lightbox {z-index: $lightbox_z_index !important; }");
            $grid_css_min = null;
            $grid_css_min = $minifier->minify();
        
            // add minified CSS to JS
            $grid_js = str_replace('{{gridCss}}', $grid_css_min, $grid_js);
        
            // add the Owl library to the JS file
            $grid_js = $owl_library_js . $grid_js;
        
            // minify JS
            $minifier = new Minify\JS($grid_js);
            $grid_js_min = $minifier->minify();
            
            // save files to disk
            $grid_js_file = "wp-content/uploads/" . $client_id . "_" . $gallery_id . "_grid.js";
            file_put_contents(ABSPATH . $grid_js_file, $grid_js_min);
            $grid_js_file_raw = "wp-content/uploads/" . $client_id . "_" . $gallery_id . "_grid_raw.js";
            file_put_contents(ABSPATH . $grid_js_file_raw, $grid_js);
            
            // build return payload
            $result['gridJs'] = $grid_js;
            $result['gridJsRaw'] = $grid_js;
            $result['gridScriptURL'] = $env . "/" . $grid_js_file;
        }
    }

     
     
    // * * * * * * * * * * *
    // *                   *
    // *        PPG        *
    // *                   *
    // * * * * * * * * * * *
     
    // using a carousel for the post container?
    if ($ppg_use_carousel) {
        // aso post container Owl init
        $aso_post_container_owl_init = "jQuery('#oclzmAsSeenOn .post-grid, .oclzmAsSeenOn .post-grid').addClass('owl-carousel');" .
            "var owl = jQuery('.owl-carousel').owlCarousel({" .
            "    loop: $aso_infinite," .
            "    margin: 3," .
            "    lazyLoad: 1," .
            "    nav: true," .
            "    items: $aso_cols," .
            "    responsive: {" .
            "        0: { items: $aso_cols_mobile }," .
            "        600: { items: 2 }," .
            "        768: { items: $aso_cols }" .
            "    }," .
            "    onChanged: oculizmCarouselOnChanged" .
            "});";
        $aso_js = str_replace('/* INIT CAROUSEL CODE */', $aso_post_container_owl_init, $aso_js);
    }
 
    // replacements
    $aso_js = str_replace('/* ppg_use_carousel */', $ppg_use_carousel, $aso_js);
    $aso_js = str_replace('/* PPGViewer */', $PPGViewer, $aso_js);
    $aso_js = str_replace('/* region */', $primary_feed_region, $aso_js);
    $aso_js = str_replace('/* ppg_show_products */', $ppg_show_products, $aso_js);
    $aso_js = str_replace('/* asoHotspotLabels */', $ppg_hotspot_labels, $aso_js);
    $aso_js = str_replace('<div class="product-list-title">Shop the look</div>', '<div class="product-list-title">' . $viewer_title . '</div>', $aso_js);
    if ($ppg_use_carousel) $aso_js = str_replace('/* ASO CONTAINER CLASSES */', 'has-oculizm-carousel', $aso_js);
    else $aso_js = str_replace('/* ASO CONTAINER CLASSES */', '', $aso_js);
 
    // product carousel init
    $product_carousel_owl_init =  "productsSection.addClass('owl-carousel');" .
        "productsSection.owlCarousel({" .
        "    loop: false," .
        "    nav: true," .
        "    margin: 10," .
        "    items: " . $product_carousel_items . "," .
        "    responsive: {" .
        "        0: { items: 1 }," .
        "        640: { items: 2 }," .
        "        768: { items: " . $product_carousel_items . " }" .
        "    }" .
        "});";
    $aso_js = str_replace('/* INIT PRODUCT CAROUSEL CODE */', $product_carousel_owl_init, $aso_js);
 
    // css
    $minifier = new Minify\CSS($owl_library_css_1);
    $minifier->add($owl_library_css_2);
    $minifier->add($aso_css);
    $minifier->add(" .oculizm-lightbox {z-index: $lightbox_z_index !important; }");
     
    // minify CSS (again?)
    $minifier->add($ppg_custom_css);
    $asoCssMin = $minifier->minify();
 
    // add minified CSS to JS
    $aso_js = str_replace('{{asSeenOnCss}}', $asoCssMin, $aso_js);
 
    // add the Owl library to the JS file
    $aso_js = $owl_library_js . $aso_js;
     
    // minify JS
    $minifier = new Minify\JS($aso_js);
    $aso_js_min = $minifier->minify();
     
    // save files to disk
    $aso_js_file = "wp-content/uploads/" . $client_id . "_as-seen-on.js";
    file_put_contents(ABSPATH . $aso_js_file, $aso_js_min);
    $aso_js_file_raw = "wp-content/uploads/" . $client_id . "_as-seen-on_raw.js";
    file_put_contents(ABSPATH . $aso_js_file_raw, $aso_js);
     
    // build return payload
    $result['asoJs'] = $aso_js;
    $result['asoJsRaw'] = $aso_js_file_raw;
    $result['asoScriptURL'] = $env."/".$aso_js_file;
     
     



    //  * * * * * * * * *
    //  *               *
    //  *   TRACKING    *
    //  *               *
    //  * * * * * * * * *
     
    // new minifier
    $minifier = new Minify\JS($tracking_js);

    // // Instantiate the WP_JS_OBFUSCATOR class
    // $obfuscator = new WP_JS_OBFUSCATOR();

    // // Obfuscate the tracking.js code
    // $obfuscatedCodeTracking = $obfuscator->run($tracking_js);

    // oLog("obfuscatedCodeTracking : " . $obfuscatedCodeTracking . "...");

    $tracking_js_min = $minifier->minify();
     
    // save files to disk
    $tracking_file = "wp-content/uploads/" . $client_id . "_tracking.js";
    file_put_contents(ABSPATH . $tracking_file, $tracking_js_min);
    $tracking_file_raw = "wp-content/uploads/" . $client_id . "_tracking_raw.js";
    file_put_contents(ABSPATH . $tracking_file_raw, $tracking_js);
     
    // build return payload
    $result['trackingJs'] = $tracking_js;
    $result['trackingCall'] = $env . "/" . $tracking_file;
     





    //  * * * * * * * * *
    //  *               *
    //  *   REVIEWS     *
    //  *               *
    //  * * * * * * * * *
    
    // replacements
    $review_form_title = $db_client_settings[0]['review_form_title'];
    $reviews_js = str_replace('/* reviewFormTitle */', $review_form_title, $reviews_js);
    $review_form_description = $db_client_settings[0]['review_form_description'];
    $reviews_js = str_replace('/* reviewFormDescription */', $review_form_description, $reviews_js);
    $hide_reviews_credits = $db_client_settings[0]['hide_reviews_credits'];
    $reviews_js = str_replace('/* hidereviewsCredit */', $hide_reviews_credits, $reviews_js);
    $email_required = $db_client_settings[0]['email_required'];
    $reviews_js = str_replace('/* emailRequired */', $email_required, $reviews_js);
    $reviews_custom_css = $db_client_settings[0]['reviews_custom_css'];


    // review carousel init
    $oculizm_review_container_owl_init =     "jQuery('#oclzmReviews .review-list').addClass('owl-carousel');" .
    "var owl = jQuery('#oclzmReviews .review-list.owl-carousel').owlCarousel({" .
    "    loop: 1," .
    "    nav: true," .
    "    margin: 3," .
    "    items: 4," .
    "    lazyLoad: 1," .
    "    slideBy: " . $carousel_slide_by . "," .
    "    responsive: {" .
    "        0: { items: " . $carousel_mobile_items . " }," .
    "        600: { items: 3 }," .
    "        768: { items: 4 }" .
    "    }," .
    "    onChanged: oculizmCarouselOnChanged" .
    "});";

    $reviews_js = str_replace('/* INIT CAROUSEL CODE */', $oculizm_review_container_owl_init, $reviews_js);



    // minify CSS
    $minifier = new Minify\CSS($reviews_css);
    $minifier->add($owl_library_css_1);
    $minifier->add($owl_library_css_2);
    $minifier->add($reviews_css);
    $minifier->add($reviews_custom_css);
    $reviews_css_min = null;
    $reviews_css_min = $minifier->minify();

    // add minified CSS to JS
    $reviews_js = str_replace('{{reviewsCss}}', $reviews_css_min, $reviews_js);

    // add the Owl library to the JS file
    $reviews_js = $owl_library_js . $reviews_js;

    // new minifier
    $minifier = new Minify\JS($reviews_js);

    $reviews_js_min = $minifier->minify();
     
    // save files to disk
    $reviews_file = "wp-content/uploads/" . $client_id . "_reviews.js";
    file_put_contents(ABSPATH . $reviews_file, $reviews_js_min);
    $reviews_file_raw = "wp-content/uploads/" . $client_id . "_reviews_raw.js";
    file_put_contents(ABSPATH . $reviews_file_raw, $reviews_js);
     
    // build return payload
    $result['reviewsJs'] = $reviews_js;
    $result['reviewsCall'] = $env . "/" . $reviews_file;
     
    return $result;
}


// encode affiliate network links
function encode_affiliate_network_links($str , $affiliate_network , $PID , $SID , $CID , $LID ,  $merchant_id ,$banner_id) {
    
    if ($affiliate_network == 'Adtraction') {
        // https://track.adtraction.com/t/t?a=1480142207&as=1435292187&t=2&tk=1&url=https://www.gymwear.co.uk/
        $product_url = "'https://track.adtraction.com/t/t?a=" . $merchant_id . "&as=1435292187&t=2&tk=1&url=' + productUrl";
    }
    else if ($affiliate_network == 'AWIN') {
        // https://www.awin1.com/awclick.php?mid=15873&id=576245&clickref=Natural%20Bella%20Linen%20Blend%20Crop%20Top&p=https://www.nobodyschild.com/natural-bella-linen-blend-crop-top.html?utm_source=google_shopping%26oculizm_product_name%3DNatural%20Bella%20Linen%20Blend%20Crop%20Top
        $product_url = "'https://www.awin1.com/awclick.php?mid=" . $merchant_id . "&id=576245&clickref=&p=' + productUrl";
    }
    else if ($affiliate_network == 'CJ') {
        // https://www.anrdoezrs.net/links/9216539/type/dlg/https://www.modernbathroom.com/bathroom-faucets/tourno-tall-single-hole-bathroom-faucet__wc-f105.aspx
        $product_url = "'https://www.anrdoezrs.net/links/9216539/type/dlg/' + productUrl";
    }
    else if ($affiliate_network == 'Impact') {
        //                              /ourID  / advID/cmpgnID
        // https://simply-argan.pxf.io/c/2074014/349693/5181
        $product_url = "'https://simply-argan.pxf.io/c/2074014/" . $merchant_id . "/" . $banner_id . "?u=' + productUrl";
    }
    else if ($affiliate_network == 'Partnerize') {
        // https://prf.hn/click/camref:1100l99ZC/destination:https%3A%2F%2Fwww.danielfootwear.com%2Fmen-c4%2Fcranmore-tan-leather-suede-brogues-p93447
        $product_url = "'https://prf.hn/click/camref:" . $merchant_id . "/destination:' + productUrl";
    }
    else if ($affiliate_network == 'Pepperjam') {
        // https://www.pntrac.com/t/TUJGRU5KSUJHRUxKRk5CRklGRUdM?url=https%3A%2F%2Fwww.goaliemonkey.com%2F%3Faffiliate_id%3D43737%26click_id%3D3169664143%26utm_source%3Dpepperjam%26utm_medium%3Daffiliate%26source%3Dpepperjam%26publisher%3D43737%26click%3D3169664143
        // TO DO
    }
    else if ($affiliate_network == 'Rakuten') {
        // https://click.linksynergy.com/deeplink?id=Wp2gydkZZlI&mid=24513&murl=https%3A%2F%2Fwww.merchant.com%2Fdeals.htm
        $product_url = "'https://click.linksynergy.com/deeplink?id=Wp2gydkZZlI&mid=" . $merchant_id . "&murl=' + productUrl";
    }
    else if ($affiliate_network == 'ShareASale') {
        // https://shareasale.com/r.cfm?b=BANNERID&u=AFFILIATEID&m=MERCHANTID&urllink=DESIREDLANDINGPAGE&afftrack=YOURTRACKINGINFO
        $product_url = "'https://shareasale.com/r.cfm?b=" . $banner_id . "&u=2240647&m=" . $merchant_id . "&urllink=' + productUrl";
    }
    else if ($affiliate_network == 'TAG') {
        // https://www.tagserve.com/clickServlet?AID=2250&MID=510&PID=731&SID=2774&CID=2040&LID=1323&SUBID=&TARGETURL=https://uk.diamantine.com/collections/womans-jumpsuits/products/jumpsuit-anicet-in-khaki
        $product_url = "'https://www.tagserve.com/clickServlet?AID=2250&MID=" . $merchant_id . "&PID=" . $PID . "&SID=" . $SID . "&CID=" . $CID . "&LID=" . $LID . "&TARGETURL=' + productUrl";
    }
    else if ($affiliate_network == 'Webgains') {
        // https://track.webgains.com/click.html?wgcampaignid=1372995&wgprogramid=269525&wgtarget=https://www.lifestylefurniture.co.uk/monroe-silver-mirrored-bedside-table-with-3-drawers.html%3Foculizm_product_name%3DMonroe%20Silver%20Mirrored%20Bedside%20Table%20with%203%20Drawers
        $product_url = "'https://track.webgains.com/click.html?wgcampaignid=1372995&wgprogramid=" . $merchant_id . "&wgtarget=' + productUrl";
    }
    else {
        $product_url = 'productUrl';
    }

    $str = str_replace('{{productUrl}}', $product_url, $str);
    return $str;
}
