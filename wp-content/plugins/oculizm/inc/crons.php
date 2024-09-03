<?php

// update Instagram saved search media url if oe about to expire
function update_instagram_user_search_media() {

    global $wpdb;
    $num_updates = 0;

    // select saved user searches
    $results = $wpdb->get_results("select * from `oculizm_searches`", ARRAY_A);

    foreach($results as $saved_search) {

        $client_id = $saved_search['client_id'];

        // get the current connection info of this client
        $sql = "select `facebook_user_id`,`instagram_business_id`,`facebook_access_token` from `oculizm_connections` where `client_id`='$client_id' and `social_network`='instagram' order by `id` desc";
        $result = $wpdb->get_results($sql, ARRAY_A);

        // get the saved user searches for this client
        $searches = $wpdb->get_results("SELECT * FROM oculizm_searches WHERE CLIENT_ID = " . $client_id, ARRAY_A);

        // for each saved search
        for ($j = 0; $j <count($searches); $j++) {
            if ($searches[$j]['social_network'] == 'instagram') {
                
                // check if the saved search has a type user
                if ($searches[$j]['type'] == "user") {

                    $saved_search_id = $searches[$j]['id'];

                    // getting the DB media url 
                    $db_media_url = $searches[$j]['profile_pic_url'];

                    parse_str($db_media_url, $media_url_array);

                    $media_outdated = false;

                     // or if there is no profile_pic_url at all
                     if (empty($db_media_url)) 
                     {   
                         $media_outdated = true;

                         //Get the current timestamp.
                         $currentTime = time();

                         //The number of hours that you want to subtract from the date and time.
                         $hoursToSubtract = 14;

                         //Convert those hours into seconds so that we can subtract them from our timestamp.
                         $timeToSubtract = ($hoursToSubtract * 60 * 60);

                         //Subtract the hours from our Unix timestamp.
                         $oeUnix = $currentTime - $timeToSubtract;

                     }

                    else {
                        // check if there's an OE parameter
                        if (array_key_exists('oe', $media_url_array)) {
                            $oeHex = $media_url_array['oe'];
                            $oeUnix = hexdec($oeHex);
                            $hours = 12;
                            $timestamp = (new DateTime())->modify("+{$hours} hours")->format('U');
                             // check if OE is more then 12 hours
                             if($oeUnix < $timestamp){
                                $media_outdated = true;
                            }
                            // check if OE is not expired yet
                            else{
                                $media_outdated = false;
                            }
                        }
                    }

                    // checking if object expiry is less then 12 hours (cron time), or if there is no profile_pic_url...
                    if($media_outdated) {

                        //waiting 0.1 sec in between api calls 
                        usleep(1000000);

                        // check there is an Instagram ID available (maybe the client has been logged out)
                        if (array_key_exists(0, $result)) {

                            // build the API URL string to fetch all posts on this search
                            $facebook_access_token = $result[0]['facebook_access_token'];
                            $instagram_business_id = $result[0]['instagram_business_id'];
                            $url = "https://graph.facebook.com/" . "/$instagram_business_id?access_token=$facebook_access_token&fields=business_discovery.username(" . $searches[$j]['term'] . "){name,profile_picture_url}&method=get&pretty=0&sdk=joey&suppress_http_code=1";

                            // curl
                            $data = array();
                            $ch = curl_init();
                            curl_setopt($ch, CURLOPT_HEADER, 0);
                            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Return data inplace of echoing on screen
                            curl_setopt($ch, CURLOPT_URL, $url);
                            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
                            curl_setopt( $ch, CURLOPT_ENCODING, "UTF-8" );
                            $curl_result = curl_exec($ch);
                            curl_close($ch);

                            // if the API returned anything...
                            if ($curl_result) {

                                //Decoding the curl result
                                $decoded_curl_result = json_decode($curl_result,true);

                                if (array_key_exists('business_discovery', $decoded_curl_result)) {

                                    // getting the api media url 
                                    if (isset($decoded_curl_result["business_discovery"]["profile_picture_url"])) {
                                    $api_media_url = $decoded_curl_result["business_discovery"]["profile_picture_url"];
                                    }
            
                                    // update profile pic in the DB
                                    if (isset($decoded_curl_result["business_discovery"]["profile_picture_url"])) {
                                        $sql = $wpdb->prepare("UPDATE oculizm_searches
                                        SET profile_pic_url = %s
                                        WHERE id = %s", $api_media_url, $saved_search_id);
                                    }
                                    
                                   //returning the result 
                                   $queryResult = $wpdb->query($sql);
                                   if ($queryResult == 1) {
                                       $num_updates++;
                                   }
                                }
                            }
                        }
                    } 
                }
            }
        }
    }
    echo json_encode($num_updates);
    die();
}


// fetch new posts from the Instagram API featuring clients' saved hashtag searches
function update_instagram_hashtag_media_url() {
    global $wpdb;
    $num_updates = 0;
    $num_inserts = 0;
    $apiCallsNumber = 0;

    // delete old records - we keep them for 30 days!
    $sql = "DELETE FROM `oculizm_cached_instagram_posts` WHERE `created_date` < NOW() - INTERVAL 30 DAY";
    $wpdb->query($sql);

    // get the time right now
    $now = time();
    $nowHuman = gmdate("Y-m-d H:i:s", $now);

    // select saved hashtag searches
    $sql = "SELECT term, hashtag_id, client_id FROM oculizm_searches WHERE 
            (social_network='instagram' AND type='hashtag' AND last_updated <= NOW() - INTERVAL 6 HOUR) 
            OR (last_updated IS NULL) 
            ORDER BY term ASC";
    $results = $wpdb->get_results($sql, ARRAY_A);

    // for each saved hashtag search which is set to save recent posts...
    foreach ($results as $saved_search) {
        $client_id = $saved_search['client_id'];
        $hashtag_id = $saved_search['hashtag_id'];
        $term = $saved_search['term'];

        if ($apiCallsNumber > 25) {
            $result['num_updates'] = $num_updates;
            $result['num_inserts'] = $num_inserts;
            $res = json_encode($result);
            echo $res;
            die();
        }

        // ignore generic hashtag updates
        if (in_array($term, $GLOBALS['generic_hashtags'])) continue;

        $apiCallsNumber++;

        $sql = $wpdb->prepare("UPDATE oculizm_searches SET last_updated = %s WHERE hashtag_id = %s", $nowHuman, $hashtag_id);
        $updatedHashtagsResult = $wpdb->query($sql);

        // get the current connection info of this client
        $sql = "SELECT `facebook_user_id`, `instagram_business_id`, `facebook_access_token` 
                FROM `oculizm_connections` 
                WHERE `client_id`='$client_id' AND `social_network`='instagram' 
                ORDER BY `id` DESC";
        $result = $wpdb->get_results($sql, ARRAY_A);

        // check that there is one (maybe the client was deleted)
        if (isset($result[0])) {
            // build the API URL string to fetch all posts on this hashtag
            $facebook_access_token = $result[0]['facebook_access_token'];
            $instagram_business_id = $result[0]['instagram_business_id'];
            
            $url = "https://graph.facebook.com/" . $GLOBALS['facebook_api_version'] . "/$hashtag_id/recent_media?access_token=$facebook_access_token&fields=id,media_type,media_url,permalink,comments_count,like_count,caption,children{id,media_type,media_url}&method=get&pretty=0&sdk=joey&suppress_http_code=1&user_id=$instagram_business_id";
            
            // curl
            $data = array();
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Return data instead of echoing on screen
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
            curl_setopt($ch, CURLOPT_ENCODING, "UTF-8");
            $curl_result = curl_exec($ch);
            curl_close($ch);

            // if the API returned anything...
            if ($curl_result) {
                $decoded_curl_result = json_decode($curl_result, true);

                // and if some posts were returned...
                if (isset($decoded_curl_result['data'])) {
                    $decoded_curl_result = $decoded_curl_result['data'];
                    
                    $query_existing_posts = "SELECT `id` FROM `oculizm_cached_instagram_posts` WHERE `search_id`='$hashtag_id' AND `client_id`='$client_id'";

                    // if the number of already saved posts + the number of new posts fetched is more than 250...
                    $existing_posts = $wpdb->get_results($query_existing_posts, ARRAY_A);
                    if (count($existing_posts) + count($decoded_curl_result) > 250) {
                        // remove the oldest ones
                        $num_rows = (count($existing_posts) + count($decoded_curl_result)) - 250;
                        $query_trim = $wpdb->prepare('DELETE FROM oculizm_cached_instagram_posts WHERE search_id = %d AND client_id = %d ORDER BY created_date DESC LIMIT %d', $hashtag_id, $client_id, $num_rows);
                        $wpdb->query($query_trim);
                    }
                    
                    $date = date("Y-m-d H:i");

                    // for each new hashtag post retrieved by the API...
                    foreach ($decoded_curl_result as $api_post) {
                        // define API post variables
                        $social_id = $api_post['id'];
                        $media_type = $api_post['media_type'];
                        $permalink = $api_post['permalink'];
                        $comments_count = $api_post['comments_count'];
                        $like_count = "";
                        if (array_key_exists('like_count', $api_post)) $like_count = $api_post['like_count'];
                        $caption = "";
                        if (array_key_exists('caption', $api_post)) $caption = $api_post['caption'];

                        // if there's a media_url...
                        $media_url = "";
                        $file = "";
                        
                        $sql = "SELECT `search_id`, `social_id`, `media_url` FROM `oculizm_cached_instagram_posts` WHERE `social_id`='$social_id' AND `search_id`='$hashtag_id' AND `client_id`='$client_id'";
                        $db_post_media_url = $wpdb->get_results($sql, ARRAY_A);

                        // if this is a new post
                        if (count($db_post_media_url) == 0) {
                            if (array_key_exists('media_url', $api_post) && !empty($api_post['media_url'])) {
                                if (in_array($media_type, ['IMAGE', 'VIDEO'])) {
                                    // validate the content type
                                    $media_url = $api_post['media_url'];
                                    $headers = get_headers($media_url, 1);
                                    $content_type = $headers["Content-Type"];
                                    
                                    if (strpos($content_type, 'image/') !== false || strpos($content_type, 'video/') !== false) {
                                        require_once(ABSPATH . 'wp-admin/includes/image.php');

                                        $media_data = file_get_contents($media_url);
                                        $filename = "cron_insta_hashtag_" . $client_id . "-" . basename($media_url); 
                                        if (strpos($filename, "?") > 0) $filename = substr($filename, 0, strpos($filename, "?"));
                                        
                                        // Get the upload directory and validate it
                                        $upload_dir = wp_upload_dir();
                                        if (isset($upload_dir['path']) && !empty($upload_dir['path'])) {
                                            $file = $upload_dir['path'] . '/' . $filename;
                                        } else {
                                            $file = $upload_dir['basedir'] . '/' . $filename;
                                        }

                                        // Save media data to file
                                        if (!empty($file)) {
                                            file_put_contents($file, $media_data);

                                            $public_suffix = str_replace("/opt/bitnami/wordpress/wp-content/uploads/", "", $file);

                                            // Insert into the database
                                            $wpdb->insert(
                                                'oculizm_cached_instagram_posts', 
                                                array( 
                                                    'client_id' => $client_id,
                                                    'search_id' => $hashtag_id,
                                                    'social_id' => $social_id,
                                                    'media_type' => $media_type,
                                                    'media_url' => $media_url,
                                                    'permalink' => $permalink,
                                                    'comment_count' => $comments_count,
                                                    'like_count' => $like_count,
                                                    'caption' => $caption,
                                                    'created_date' => $nowHuman,
                                                    'local_src' => $public_suffix
                                                ), 
                                                array( 
                                                    '%s', 
                                                    '%s', 
                                                    '%s', 
                                                    '%s', 
                                                    '%s', 
                                                    '%s', 
                                                    '%s', 
                                                    '%s', 
                                                    '%s', 
                                                    '%s', 
                                                    '%s'
                                                ) 
                                            );
                                            $num_inserts++;
                                        }
                                    }
                                }
                            }
                        } else {
                            $db_media_url = $db_post_media_url[0]['media_url'];

                            // object expiry
                            parse_str($db_media_url, $media_url_array);

                            if (array_key_exists('se', $media_url_array) && ($media_url_array['se'] < time())) {
                                $wpdb->update(
                                    'oculizm_cached_instagram_posts',
                                    array(
                                        'media_url' => $media_url,
                                        'created_date' => $nowHuman
                                    ),
                                    array('search_id' => $hashtag_id, 'social_id' => $social_id),
                                    array('%s', '%s'),
                                    array('%s', '%s')
                                );
                                $num_updates++;
                            }
                        }
                    }
                }
            }
        }
    }

    // Return number of updates and inserts
    $result['num_updates'] = $num_updates;
    $result['num_inserts'] = $num_inserts;
    echo json_encode($result);
    die();
}




// update connections profile picture
function update_social_network_connection_profile_pictures() {

    global $wpdb;
    $num_updates = 0;

    // select connections
    $results = $wpdb->get_results("select * from `oculizm_connections`", ARRAY_A);

    foreach($results as $connection) {

        $client_id = $connection['client_id'];

        // get the connections for this client
        $clientConnections = $wpdb->get_results("SELECT * FROM oculizm_connections WHERE CLIENT_ID = " . $client_id, ARRAY_A);

        // for each connection
        for ($j = 0; $j <count($clientConnections); $j++) {

            if (($clientConnections[$j]['social_network'] == 'facebook') ||($clientConnections[$j]['social_network'] == 'instagram') ) {
                
                $connection_id = $clientConnections[$j]['id'];
                $client_name = $clientConnections[$j]['screen_name'];

                // getting the DB media url 
                $db_media_url = $clientConnections[$j]['profile_pic_url'];
                parse_str($db_media_url, $media_url_array);
                $media_outdated = false;

                // or if there is no profile_pic_url at all
                if (empty($db_media_url)) {   
    
                    $media_outdated = true;

                    //Get the current timestamp.
                    $currentTime = time();

                    //The number of hours that you want to subtract from the date and time.
                    $hoursToSubtract = 14;

                    //Convert those hours into seconds so that we can subtract them from our timestamp.
                    $timeToSubtract = ($hoursToSubtract * 60 * 60);

                    //Subtract the hours from our Unix timestamp.
                    $oeUnix = $currentTime - $timeToSubtract;

                }

                else {
                    // check if there's an OE parameter
                    if (array_key_exists('oe', $media_url_array)) {
                        $oeHex = $media_url_array['oe'];
                        $oeUnix = hexdec($oeHex);
                        $hours = 12;
                        $timestamp = (new DateTime())->modify("+{$hours} hours")->format('U');

                        // check if OE is more then 12 hours
                        if($oeUnix < $timestamp){
                            $media_outdated = true;
                        }
                        // check if OE is not expired yet
                        else{
                            $media_outdated = false;
                        }
                    }
                }

                // checking if object expiry is less then 12 hours (cron time), or if there is no profile_pic_url...
                if($media_outdated) {
    
                    // wait 1 sec in between api calls 
                    usleep(1000000);

                    if ($clientConnections[$j]['social_network'] == 'facebook') {
                    
                        //getting the access token and the business id
                        $facebook_access_token = $clientConnections[$j]['facebook_access_token'];
                        $instagram_business_id = $clientConnections[$j]['instagram_business_id'];

                        // build the API URL string 
                        $url = "https://graph.facebook.com/" . "$instagram_business_id?access_token=$facebook_access_token&fields=name,picture{url}";
                        
                        // curl
                        $data = array();
                        $ch = curl_init();
                        curl_setopt($ch, CURLOPT_HEADER, 0);
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Return data inplace of echoing on screen
                        curl_setopt($ch, CURLOPT_URL, $url);
                        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
                        curl_setopt( $ch, CURLOPT_ENCODING, "UTF-8" );
                        $curl_result = curl_exec($ch);
                        curl_close($ch);

                        // if the API returned anything...
                        if ($curl_result) {

                            //Decoding the curl result
                            $decoded_curl_result = json_decode($curl_result,true);

                                //getting the api media url 
                                if (isset($decoded_curl_result['picture']['data']['url'])) {
                                    $api_media_url = $decoded_curl_result['picture']['data']['url'];

                                    // update profile pic in the DB
                                    $sql = $wpdb->prepare("UPDATE oculizm_connections
                                    SET profile_pic_url = %s
                                    WHERE id = %s", $api_media_url, $connection_id);

                                    //returning the result 
                                    $queryResult = $wpdb->query($sql);
                                    if ($queryResult == 1) {
                                        $num_updates++;
                                    }
                                }
                        }


                    }
    
                    if ($clientConnections[$j]['social_network'] == 'instagram') {
    
                        //getting the access token and the business id
                        $instagram_access_token = $clientConnections[$j]['facebook_access_token'];
                        $instagram_business_id = $clientConnections[$j]['instagram_business_id'];

                        // build the API URL string 
                        $url = "https://graph.facebook.com/" . "/$instagram_business_id?access_token=$instagram_access_token&fields=business_discovery.username(" . $clientConnections[$j]['username'] . "){name,profile_picture_url}&method=get&pretty=0&sdk=joey&suppress_http_code=1";
                         // curl
                        $data = array();
                        $ch = curl_init();
                        curl_setopt($ch, CURLOPT_HEADER, 0);
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Return data inplace of echoing on screen
                        curl_setopt($ch, CURLOPT_URL, $url);
                        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
                        curl_setopt( $ch, CURLOPT_ENCODING, "UTF-8" );
                        $curl_result = curl_exec($ch);
                        curl_close($ch);

                        // if the API returned anything...
                        if ($curl_result) {

                            //Decoding the curl result
                            $decoded_curl_result = json_decode($curl_result,true);
                            
                            if (array_key_exists('business_discovery', $decoded_curl_result)) {

                                // getting the api media url 
                                if (isset($decoded_curl_result["business_discovery"]["profile_picture_url"])) {
                                    $api_media_url = $decoded_curl_result["business_discovery"]["profile_picture_url"];

                                    // update profile pic in the DB
                                    $sql = $wpdb->prepare("UPDATE oculizm_connections
                                    SET profile_pic_url = %s
                                    WHERE id = %s", $api_media_url, $connection_id);

                                    //returning the result 
                                    $queryResult = $wpdb->query($sql);
                                    if ($queryResult == 1) {
                                        $num_updates++;
                                    }
                                }
                            }
                        }
                        
                    }
                   
                } 
            }

            
        }
    }
    echo json_encode($num_updates);
    die();
}


// update exchange rates
function update_exchange_rates() {

    $url = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
    $xml = simplexml_load_file($url);
    $ecb_rates = $xml->Cube->Cube->Cube;
    $result = array();
    $full_rates_table = array();
    $currencyCodes = array();
    $eur_rates = array();

    // quick array traversal to build the list of currency codes AND the EUR array
    foreach($ecb_rates as $item) {

        $currency = $item->attributes()->currency;
        $json_currency = json_decode(json_encode($currency), true);
        $currency = $json_currency['0'];
        array_push($currencyCodes, $currency);

        $rate = $item->attributes()->rate;
        $json_rate = json_decode(json_encode($rate), true);
        $rate = floatval($json_rate['0']); // turn the string into a float
        array_push($eur_rates, $rate);
    }

    // add support for the Lebanese pound (LBP)
    array_push($currencyCodes, "LBP");
    array_push($eur_rates, 96937);

    // add headers to the EUR array
    array_unshift($eur_rates, 1); // insert parity
    array_unshift($eur_rates, 'EUR'); // insert EUR

    // amend the list of currencies (top row)
    array_unshift($currencyCodes, 'EUR'); // insert EUR
    array_unshift($currencyCodes, 'X'); // insert the canton

    array_unshift($full_rates_table, $eur_rates); // insert the EUR rates at the top
    array_unshift($full_rates_table, $currencyCodes); // insert the header at the top

    // build the other rate arrays
    foreach($currencyCodes as $cc) {

        if ($cc == "X") continue; // skip the canton
        if ($cc == "EUR") continue; // EUR is already done

        // get the index of this currency in the EUR rates array
        $this_currency_index = array_search($cc, array_values($currencyCodes));

        // get the EUR rate for this currency
        $this_currency_eur_rate = $full_rates_table[1][$this_currency_index];

        // initialise this currency's rates array
        $this_currency_rates_array = array();

        // now go through each currency rate
        foreach($eur_rates as $r) {

            // Adding this currency code at the array start
            if ($r == "EUR") {
                array_push($this_currency_rates_array, $cc);
            }
            else if ($r == "1") {
                array_push($this_currency_rates_array, $this_currency_eur_rate);
            }
            else {
                $currency_rate = (1/$this_currency_eur_rate)*$r;
                $currency_rate_rounded = round($currency_rate, 6);
                array_push($this_currency_rates_array, $currency_rate_rounded);  
            }
        }

        // add this currency's rates array to the full rates table
        array_push($full_rates_table, $this_currency_rates_array);
    }

    // encode array to json
    $json = json_encode($full_rates_table);

    // save to the Upload directory
    $upload_dir = wp_upload_dir()['basedir'];
    $saved = file_put_contents($upload_dir . '/data/rates.json', $json);

    echo $saved;
    die();
}


// update all client product feeds
function update_product_feeds() {

    // get all clients
    global $wpdb;
    $result = $wpdb->get_results("SELECT id FROM oculizm_clients", ARRAY_A);

    // for each client...
    $clients = array();
    foreach ($result as $c) {

        // get the client ID
        $client_id = $c['id'];

        // delete all this client's products
        $query = $wpdb->prepare('DELETE FROM oculizm_products WHERE client_id = %d', $client_id);
        $wpdb->query($query);
        sleep(5);

        // get this client's feeds
        $feeds = $wpdb->get_results("SELECT * FROM oculizm_product_feeds WHERE client_id = " . $client_id, ARRAY_A);

        if (sizeof($feeds) > 0) {

            // cycle through each feed
            foreach ($feeds as $f) {
                $body = null;
                $_REQUEST['called_by_cron'] = "1"; // keep this line in the foreach, as $_REQUEST gets replaced later
                $_REQUEST['step'] = "2"; // keep this line in the foreach, as $_REQUEST gets replaced later
                $_REQUEST['feed_id'] = $f['id'];
                $_REQUEST['client_id'] = $f['client_id'];

                $result = $wpdb->get_results("SELECT name FROM oculizm_clients WHERE ID = " . $f['client_id'], ARRAY_A);
                if (!$result) {
                    oLog("Could not find client name!");
                    return "Could not find client name!";
                }
                $client_name = $result[0]['name'];
    
                import_product_feed_internal();
                
                sleep(5); // delay in SECONDS
            }
        }

        // consolidate product feeds
        $_REQUEST['called_by_cron'] = "1";
        $_REQUEST['consolidate_client_id'] = $client_id;
        consolidate_product_feeds_internal();

        // sleep between processing each client
        // FYI: consolidating 4 of DEUBA's feeds takes 50s, and they have 6. (15k products down to 5k)
        sleep(100);
    }
}


//update all client product prices 
function update_all_clients_product_prices() {
    // get all clients
    global $wpdb;
    $result = $wpdb->get_results("SELECT id FROM oculizm_clients", ARRAY_A);

    // for each client...
    foreach ($result as $c) {
        // get the client ID
        $client_id = $c['id'];
        update_product_prices_internal($client_id);
    }
}


// update content creators profile picture
function update_content_creators() {

    global $wpdb;
    $num_updates = 0;
    $apiCallsNumber = 0;
    $unauthenticatedConnections = array();

    // get the time right now
    $now = time();
    $nowHuman = gmdate("Y-m-d H:i:s", $now);

    // select creators
    $creators = $wpdb->get_results("select * from `oculizm_content_creators` WHERE ( last_updated <= NOW() - INTERVAL 6 HOUR AND social_network = 'instagram') OR (last_updated IS NULL) ", ARRAY_A);

    // for each creator
    foreach($creators as $creator) {

        $client_id = $creator['client_id'];
        $creator_username = $creator['username'];
        $creator_id = $creator['id'];

        // if($creator_username == "shaylahdevlin"){
        //     oLog('creator_username is ' . $creator_username . '...');
        // }

        // get the current connection info of this client
        $sql = "select `facebook_user_id`,`instagram_business_id`,`facebook_access_token` from `oculizm_connections` where `client_id`='$client_id' and `social_network`='instagram' order by `id` desc";
        $result = $wpdb->get_results($sql, ARRAY_A);

        if (isset($result)) {

            if ((isset($result[0]['facebook_access_token'])) && (isset($result[0]['instagram_business_id']))) {

                // set the connection parameters for this creator and assume that all the values are unique because there is 
                // no possibility  that in the case of two authenticated accounts one of them expires before the other 
                $facebook_access_token = $result[0]['facebook_access_token'];
                $instagram_business_id = $result[0]['instagram_business_id'];

                $sql = $wpdb->prepare("UPDATE oculizm_content_creators
                    SET last_updated = %s
                    WHERE id = %s", $nowHuman, $creator_id);

                $updatedCreatorsResult = $wpdb->query($sql);

                
                if (array_search($instagram_business_id, array_column($unauthenticatedConnections, 'instagram_business_id')) === FALSE) {

                    // getting the DB media url 
                    $db_media_url = $creator['profile_pic_url'];

                    parse_str($db_media_url, $media_url_array);

                    $media_outdated = false;

                    // or if there is no profile_pic_url at all
                    if (empty($db_media_url)) 
                    {   
                        $media_outdated = true;

                        //Get the current timestamp.
                        $currentTime = time();

                        //The number of hours that you want to subtract from the date and time.
                        $hoursToSubtract = 14;

                        //Convert those hours into seconds so that we can subtract them from our timestamp.
                        $timeToSubtract = ($hoursToSubtract * 60 * 60);

                        //Subtract the hours from our Unix timestamp.
                        $oeUnix = $currentTime - $timeToSubtract;

                    }

                    else {
                        // check if there's an OE parameter
                        if (array_key_exists('oe', $media_url_array)) {
                            $oeHex = $media_url_array['oe'];

                            //checking if oe value is  hexadecimal or not 
                            if ( ctype_xdigit($oeHex)) {

                                //oe is hexadecimal let's convert it to decimal
                                $oeUnix = hexdec($oeHex);
                                $hours = 12;
                                $timestamp = (new DateTime())->modify("+{$hours} hours")->format('U');

                                // check if OE is more then 12 hours
                                if($oeUnix < $timestamp){
                                $media_outdated = true;
                                }

                                // oe is hexadecimal but  not expired yet
                                else{
                                    $media_outdated = false;
                                }
                                
                            
                            }
                            // oe is a decimal let's update the profile_pic_url 
                            else {
                                $media_outdated = true;
                            }
                        
                        }
                    }

                    // checking if object expiry is less then 12 hours (cron time), or if there is no profile_pic_url...
                    if($media_outdated) {

                        //waiting 0.1 sec in between api calls 
                        usleep(1000000);

                        $apiCallsNumber++;
                        if($apiCallsNumber > 80){
                            echo json_encode($num_updates);
                            die();
                        }

                        // build the API URL string to fetch creator information
                        $url = "https://graph.facebook.com/" . "/$instagram_business_id?access_token=$facebook_access_token&fields=business_discovery.username(" . $creator['username'] . "){name,profile_picture_url}&method=get&pretty=0&sdk=joey&suppress_http_code=1";
                        // if($creator_username == "shaylahdevlin"){
                        //     oLog('creator shaylahdevlin url is ' . $url . '...');
                        // }
                        // curl
                        $data = array();
                        $ch = curl_init();
                        curl_setopt($ch, CURLOPT_HEADER, 0);
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Return data inplace of echoing on screen
                        curl_setopt($ch, CURLOPT_URL, $url);
                        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
                        curl_setopt( $ch, CURLOPT_ENCODING, "UTF-8" );
                        $curl_result = curl_exec($ch);
                        curl_close($ch);

                        // if the API returned anything...
                        if ($curl_result) {

                            //Decoding the curl result
                            $decoded_curl_result = json_decode($curl_result,true);
                            // if($creator_username == "shaylahdevlin"){
                            //     oLog('this is shaylahdevlin creator decoded_curl_result' . $decoded_curl_result . '...');
                            // }

                            if(array_key_exists('error', $decoded_curl_result)){

                                // getting the error message from the api 
                                $error_message = $decoded_curl_result["error"]["message"];
                                
                                
                                if (strpos($error_message, 'Error validating access token') !== false) {

                                    // build the unauthenticated Connection object
                                    $unauthenticatedConnection = array(
                                    'client_id' => $client_id,
                                    'facebook_access_token' => $facebook_access_token,
                                    'instagram_business_id' => $instagram_business_id
                                );
                                array_push($unauthenticatedConnections, $unauthenticatedConnection);

                                //sending email for Unauthenticated Instagram Connection
                                $subject = 'Unauthenticated Instagram Connection';
                                $message = "Unauthenticated Instagram Connection for the Client ID : " . $client_id . "...<br/><br/>" ;
                                $message .= "facebook access token = " . $facebook_access_token . " , instagram business id = " . $instagram_business_id . "..." ;
                                 oEmail('sean@oculizm.com', $subject, $message);
                                 oEmail('anthony@oculizm.com', $subject, $message);

                                }

                            //if user does not exist anymore or changed his username 
                            if (strpos($error_message, 'Invalid user id') !== false) {

                                    // delete this creator from the creators table
                                    $deletedCreators = $wpdb->query("DELETE FROM oculizm_content_creators WHERE username = '$creator_username'");
                                    if ($deletedCreators == 1) {
                                        // oLog('creator' . $creator_id . '...' . $creator_username . 'has been deleted from the database');
                                    }
                                }
                            }
                            
                            if (array_key_exists('business_discovery', $decoded_curl_result)) {

                                // getting the api media url 
                                if (isset($decoded_curl_result["business_discovery"]["profile_picture_url"])) {
                                    $api_media_url = $decoded_curl_result["business_discovery"]["profile_picture_url"];
                                }
                                    
                                if (isset($decoded_curl_result["business_discovery"]["name"])) {
                                    $api_screen_name = $decoded_curl_result["business_discovery"]["name"];

                                    // update screen name in the DB
                                    $sql = $wpdb->prepare("UPDATE oculizm_content_creators
                                    SET screen_name = %s
                                    WHERE id = %s" , $api_screen_name , $creator_id);
                                }

                                // update profile pic in the DB
                                if (isset($decoded_curl_result["business_discovery"]["profile_picture_url"])) {
                                    $sql = $wpdb->prepare("UPDATE oculizm_content_creators
                                    SET profile_pic_url = %s 
                                    WHERE id = %s", $api_media_url , $creator_id);
                                }
                                
                                //returning the result 
                                $queryResult = $wpdb->query($sql);
                                if ($queryResult == 1) {
                                    $num_updates++;
                                }
                            }
                        }
                    } 
                }
            }
        }
    }
    echo json_encode($num_updates);
    die();
}


// generate review request keys
function generate_review_requests() {

    global $wpdb;

    $results = array();
    $errors = array();
    $allocation = 5;

    // get all clients
    global $wpdb;
    $result = $wpdb->get_results("SELECT id FROM oculizm_clients", ARRAY_A);

    // for each client...
    $clients = array();
    foreach ($result as $c) {

        // get the client ID
        $client_id = $c['id'];

        // count the number of unused review requests for this client
        $num_rrs = $wpdb->get_results("SELECT * FROM oculizm_review_requests WHERE client_id = " . $client_id . " AND $request_id IS NULL", ARRAY_A);

        // generate a 16-digit key
        $request_key = generateRandomString();

    }
}

