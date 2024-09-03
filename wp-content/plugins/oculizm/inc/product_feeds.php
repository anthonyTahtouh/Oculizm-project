<?php

// get a client's product feeds
add_action('wp_ajax_get_product_feeds', 'get_product_feeds');
function get_product_feeds() {
    
    $client_id = get_client_id();

    global $wpdb;

    $result = $wpdb->get_results("SELECT * FROM oculizm_product_feeds WHERE CLIENT_ID = " . $client_id, ARRAY_A);

    echo json_encode($result);
    die();
}


// add a new product feed - AJAX handler
add_action('wp_ajax_import_product_feed', 'import_product_feed');
function import_product_feed() {
    
    $result = import_product_feed_internal();

    echo json_encode($result);
    die();
}


// import products from a product feed
function import_product_feed_internal() {

    ini_set('memory_limit', '1024M');

    // get the client ID
    $client_id = get_client_id();
    if (isset($_REQUEST['called_by_cron'])) $client_id = $_REQUEST['client_id'];

    // get the client name
    global $wpdb;
    $result = $wpdb->get_results("SELECT name FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
    if (!$result) {
        oLog("Could not find client name!");
        return "Could not find client name!";
    }
    $client_name = $result[0]['name'];
	$original_client_name = $result[0]['name'];
    $client_name = str_replace(" ", "-", $client_name);
    $client_name = preg_replace("/[^A-Za-z0-9-]/", '', $client_name);
    $client_name = strtolower($client_name);

    // get the step
    $step = $_REQUEST['step']; // 1 = PREVIEW, 2 = IMPORT

    // define variables
    $local_file = ABSPATH . "wp-content/uploads/product-feeds/new-feed.temp";
    $results = array();
    $feed_id = "";
    $is_default_shopify_feed = false;
    $format = '';
    $archive_extension = '';
    $num_feeds = 0;

    // if a feed ID was supplied then this is a refresh and we need to get the feed details from the DB
    // and set the $_REQUEST object to be that
    if (isset($_REQUEST['feed_id'])) {
        $feed_id = $_REQUEST['feed_id'];
        $feeds = $wpdb->get_results("SELECT * FROM oculizm_product_feeds WHERE ID = " . $feed_id, ARRAY_A);
        if (!$feeds) {
            oLog("Could not find product feed!");
            return "Could not find product feed!";
        }
        $_REQUEST = $feeds[0];
        $region = $_REQUEST['region'];

        // now, if we're actually importing...
        if ($step == 2) {

            // count the total number of feeds this client has
            $total_feeds = $wpdb->get_results("SELECT * FROM oculizm_product_feeds WHERE CLIENT_ID = " . $client_id, ARRAY_A);
            $num_feeds = sizeof($total_feeds);
            $results['num_feeds'] = $num_feeds;

            // and if there is only one feed for this client...
            if ($num_feeds == 1) { 
                // delete all existing products for this client before importing
                $delete_query = $wpdb->prepare('DELETE FROM oculizm_products WHERE client_id = %d', $client_id);
                $delete_result = $wpdb->query($delete_query);
                $results['delete_products_result'] = $delete_result;
                sleep(3);
            }
        }
    }

    // else, if a new feed was supplied...
    else {

        $region = $_REQUEST['region'];

        // check we don't have a feed with this region already
        $feed_with_this_region = $wpdb->get_results("SELECT ID FROM oculizm_product_feeds WHERE CLIENT_ID = " . $client_id . " AND REGION = '" . $region . "'", ARRAY_A);
        if ($feed_with_this_region) {
            oLog($region . " feed already exists!");
            return $region . " feed already exists!";
        }

        // and if we're actually importing...
        // (we need to add the product feed to the DB here so that we have a feed_id to add to every imported product)
        if ($step == 2) {

            // get request variables
            $http_url = trim($_REQUEST['http_url']);
            $http_username = trim($_REQUEST['http_username']);
            $http_password = $_REQUEST['http_password'];
            $ftp_url = $_REQUEST['ftp_url'];
            $ftp_username = $_REQUEST['ftp_username'];
            $ftp_password = $_REQUEST['ftp_password'];
            $ftp_path = $_REQUEST['ftp_path'];
            $shop_link = $_REQUEST['shop_link'];

            // add this new feed to the database
            $sql = "insert into `oculizm_product_feeds` (
                `client_id`, `http_url`, `http_username`, `http_password`, `ftp_url`, `ftp_username`, `ftp_password`, `ftp_path`, `region`, `shop_link`
            ) values (
                '$client_id', '$http_url', '$http_username', '$http_password', '$ftp_url', '$ftp_username', '$ftp_password', '$ftp_path', '$region', '$shop_link'
            )";

            $results['shop_link'] = $shop_link;

            // run the query
            $wpdb->query($sql);
            $feed_id = $wpdb->insert_id;
            $results['feed_imported'] = $feed_id;
        }
    }

    $results['region'] = $region;




    // SAVE FILE TO LOCAL SERVER, FILTER BY TRANSPORT
    
    // HTTP
    if ($_REQUEST['http_url'] != "") {
        $http_url = trim($_REQUEST['http_url']);
        $http_username = trim($_REQUEST['http_username']);
        $http_password = $_REQUEST['http_password'];
        oLog('Feed transport: HTTP');

        $data = curl_file($http_url, $local_file, $http_username, $http_password);
        if (!$data) {
            oLog("There was an error accessing the URL!");
            return "There was an error accessing the URL!";
        }
        $results['http_url'] = $http_url;

        // inspect the URL
        if (strpos($http_url, ".atom") !== false) $is_default_shopify_feed = true;
    }
    // FTP
    else {
        // get request variables
        $ftp_url = $_REQUEST['ftp_url'];
        $ftp_username = $_REQUEST['ftp_username'];
        $ftp_password = $_REQUEST['ftp_password'];
        $ftp_path = $_REQUEST['ftp_path'];

        // sanitise
        $ftp_url = str_replace('ftp://', '', $ftp_url);
        $ftp_url = trim($ftp_url);
        $ftp_path = trim($ftp_path);

        oLog('Feed transport: FTP');

        // make FTP connection
        $ftpConn = ftp_connect($ftp_url);
        $login = ftp_login($ftpConn, $ftp_username, $ftp_password);
        ftp_pasv($ftpConn, true);
        if ((!$ftpConn) || (!$login)) return 'FTP connection failed.';

        // try to download the file
        if (!ftp_get($ftpConn, $local_file, $ftp_path, FTP_BINARY)) {
            oLog('Failed to download file from FTP server.');
            return 'Failed to download file from FTP server.';
        }

        $results['ftp_url'] = $ftp_url;
    }

    // check the file was downloaded
    if (!file_exists($local_file)) {
        oLog('Could not locate local file.');
        return "Could not locate local file.";
    }






    // HANDLE ARCHIVES

    // get mime type
    $mime_type = mime_content_type($local_file);
    // oLog("Mime type: " . $mime_type);
    $results['mime_type'] = $mime_type;

    // ZIP
    if ($mime_type == "application/zip") {
        $zip = new ZipArchive;
        $unzipped = $zip->open($local_file);
        if ($unzipped === TRUE) {
            $unique_dir = ABSPATH . "wp-content/uploads/product-feeds/unzipped-" . date('Y-m-d H-i-s');

            $zip->extractTo($unique_dir);
            $zip->close();

            // check how many files in dir
            $num_files = count(glob($unique_dir . "*"));
            if ($num_files == 0) {
                oLog("No files found in zip archive.");
                return "No files found in zip archive.";
            }
            else if ($num_files > 1) {
                oLog("Multiple files found in zip archive.");
                return "Multiple files found in zip archive.";
            }

            // if just one file then let's get the mime type of this file and carry on
            else {
                $filename = scandir($unique_dir)[2];
                $local_file = $unique_dir . "/" . $filename;
                $mime_type = mime_content_type($local_file);
            }
            $archive_extension = "zip";
        }
        else {
            oLog("Unable to unzip the file.");
            return "Unable to unzip the file.";
        }
    }

    // get the file contents
    $file_contents = file_get_contents($local_file);

    // check the file isn't empty
    if (!$file_contents) {
        oLog('File is empty.');
        return "File is empty.";
    }

    // GZIP
    if ($mime_type == "application/x-gzip" || $mime_type == "application/gzip") {

        $file_contents = gzdecode($file_contents);

        // now check if the file is CSV or XML and set the mime type for further processing
        if (substr($file_contents, 0, 5) == "<?xml") $mime_type = "text/xml";
        else $mime_type = "text/plain";
        $archive_extension = "gzip";
    }





    // FINAL LOCAL FILE CHECKS

    // sometimes the XML file mime type is text/html. Here we set it artificially
    if (($mime_type == "text/html") && (substr($file_contents, 0, 10) == '<rss versi')) $mime_type = "text/xml";
    // convert to UTF-8
    if (!mb_detect_encoding($file_contents, 'UTF-8', true)) {
        $file_contents = mb_convert_encoding($file_contents, 'UTF-8', 'ISO-8859-1');
    }
    // get the first character
    $first_char = substr($file_contents, 0, 1);
    // oLog("First character: " . $first_char);





    /*************************************************/
    /**                                             **/
    /**                                             **/
    /**              FEED PROCESSING                **/
    /**                                             **/
    /**                                             **/
    /*************************************************/

    // declare key variables
    $key_id;
    $key_sku;
    $key_title;
    $key_price;
    $key_price_strikeout;
    $key_link;
    $key_image_link;
    $key_availability;

    // set up parsing variables
    $products = array();
    $titles = array();
    $products_added = 0;
    $bulk_insert_qty = 500; // insert multiple products at a time


    // JSON
    if (($mime_type == "text/plain") && (($first_char == "[") || ($first_char == "{"))) {

        $format = 'JSON';
        $file_contents = json_decode($file_contents);
        $extension = "json";

        // sometimes the JSON products are inside a master node
        if (count((array)$file_contents) == 1) {
            foreach ($file_contents as $prop) {
                $file_contents = $prop;
            }
        }
    }

    // CSV / TXT
    else if (($mime_type == "text/plain") || ($mime_type == "text/csv")) {

        $format = 'CSV';

        // determine delimiter
        global $delimiter;
        $delimiter = ","; // need to reset the global one here because if we don't then it will be what was set in the last run
        $firstFewChars = substr($file_contents, 0, 25);
        if (strpos($firstFewChars, ";") > 1) $delimiter = ";";
        else if (strpos($firstFewChars, "\t") > 1) $delimiter = "\t";

        $results['delimiter'] = $delimiter;

        // CSV to array
        $csv = array();

        // use the appropriate file opening method
        if ($archive_extension == "gzip") {
            if (($handle = gzopen($local_file, 'r')) !== FALSE) {
                while (($data = fgetcsv($handle, 0, $delimiter)) !== FALSE) { // this gives you a row
                    $csv[] = $data; // copy each line into the new csv array
                }
                fclose($handle);
            }            
        }
        else {
            if (($handle = fopen($local_file, 'r')) !== FALSE) {
                while (($data = fgetcsv($handle, 0, $delimiter)) !== FALSE) { // this gives you a row
                    $csv[] = $data; // copy each line into the new csv array
                }
                fclose($handle);
            }
        }

        // get CSV header
        $csvHeader = $csv[0];
        // (MUTABLE LOOP!)
        foreach ($csvHeader as &$colName) {
            $colName = str_replace('"', '', $colName); // remove quotes
            $colName = strtolower($colName); // make lower case
        }

        // determine keys
        $key_id = array_search('id', $csvHeader);
        if (!is_int($key_id)) { // impossible to check for "0" so we check if it's been set as an integer instead ;)
            $key_id = array_search('sku', $csvHeader);
        }
        if (!is_int($key_id)) { // impossible to check for "0" so we check if it's been set as an integer instead ;)
            $key_id = array_search('product_id', $csvHeader);
        }
        if (!is_int($key_id)) { // impossible to check for "0" so we check if it's been set as an integer instead ;)
            $key_id = array_search('merchant_product_id', $csvHeader); // AWIN
        }
		if (!is_int($key_id)) { // impossible to check for "0" so we check if it's been set as an integer instead ;)
            $key_id = array_search('variant sku', $csvHeader); // baabuk
        }
		if (!is_int($key_id)) { // impossible to check for "0" so we check if it's been set as an integer instead ;)
            $key_id = array_search('handle', $csvHeader); // christopher cloos
        }
        $key_sku = $key_id;
        $key_title = array_search('title', $csvHeader);
        if (!$key_title) $key_title = array_search('name', $csvHeader);
        if (!$key_title) $key_title = array_search('product_name', $csvHeader);
        $key_price = array_search('price', $csvHeader);
        if (!$key_price) $key_price = array_search(' price usd ', $csvHeader);
        if (!$key_price) $key_price = array_search('price (search_price for publishers)', $csvHeader);
        if (!$key_price) $key_price = array_search('search_price', $csvHeader); // AWIN
        if (!$key_price) $key_price = array_search('variant price', $csvHeader); // christopher cloos
        $key_price_strikeout = $key_price;
        $key_link = array_search('link', $csvHeader);
        if (!$key_link) $key_link = array_search('permalink', $csvHeader);
        if (!$key_link) $key_link = array_search('url to product', $csvHeader);
		if (!$key_link) $key_link = array_search('url', $csvHeader); // baabuk
        if (!$key_link) $key_link = array_search('deep_link', $csvHeader);
        if (!$key_link) $key_link = array_search('merchant_deep_link', $csvHeader); // AWIN
        if (!$key_link) $key_link = array_search('handle', $csvHeader); // christopher cloos
        if (!$key_link) $key_link = array_search('product links', $csvHeader); // Caliper
        $key_image_link = array_search('image_link', $csvHeader);
        if (!$key_image_link) $key_image_link = array_search('url to image', $csvHeader);
        if (!$key_image_link) $key_image_link = array_search('image url', $csvHeader);
        if (!$key_image_link) $key_image_link = array_search('image src', $csvHeader); // christopher cloos
        if (!$key_image_link) $key_image_link = array_search('image', $csvHeader);
        if (!$key_image_link) $key_image_link = array_search('image_url', $csvHeader); // AWIN
        if (!$key_image_link) $key_image_link = array_search('merchant_image_url', $csvHeader);
        if (!$key_image_link) $key_image_link = array_search('productimageurl', $csvHeader); // Strond
        if (!$key_image_link) $key_image_link = array_search('image link', $csvHeader); // Apatchy
        $key_availability = array_search('availability', $csvHeader);
        if (!$key_availability) $key_availability = array_search('stock status', $csvHeader);
        if (!$key_availability) $key_availability = array_search('status', $csvHeader);
        if (!$key_availability) $key_availability = array_search('in_stock', $csvHeader);

        // Funky Chunky Furniture
        if ($client_id == "71950") {
            $key_id = array_search('item_group_id', $csvHeader);
            $key_sku = array_search('mpn', $csvHeader);
        }

        $results['key_id'] = $key_id;
        $results['key_sku'] = $key_sku;
        $results['key_title'] = $key_title;
        $results['key_price'] = $key_price;
        $results['key_price_strikeout'] = $key_price_strikeout;
        $results['key_link'] = $key_link;
        $results['key_image_link'] = $key_image_link;
        $results['key_availability'] = $key_availability;

        array_shift($csv); // remove column header
        $file_contents = $csv;
        $extension = "csv";
    }

    // XML
    else if ($mime_type == "text/xml") {

        $format = 'XML';

        libxml_use_internal_errors(true);
        $data = simplexml_load_string($file_contents);
        if (!$data) {
            oLog("No data in file.");
            return "No data in file.";
        }

        // determine product node
        $node = $data->channel->item;
        if (!$node) $node = $data->entry;
        if (!$node) $node = $data->product;
        if (!$node) $node = $data->products->product; // Acumen Collection
        if (!$node) $node = $data->Product; // laroc
        if (!$node) $node = $data->item; // Deuba XXL
        // if (!$node) $node = $data->datafeed->prod; // alloutdoor
        if (!$node) {
            oLog("Could not find XML product node.");
            return "Could not find XML product node.";
        }
        $file_contents = $node;
        $extension = "xml";
        $results['node'] = $node;
    }

    // a webpage (probably not a feed)
    else if ($mime_type == "text/html") {
        oLog("Invalid feed resource.");
        return "Invalid feed resource.";
    }

    $results['format'] = $format;





    /*************************************************/
    /**                                             **/
    /**                                             **/
    /**              FIELD PROCESSING               **/
    /**                                             **/
    /**                                             **/
    /*************************************************/

    foreach ($file_contents as $p) {

        $availability = "1";
        $price = 0;
		$price_strikeout = 0;

        // JSON
        if ($format == 'JSON') {

            $id = $p->id;
            $sku = $p->id;
            $title = $p->name;
            $price = $p->price;
            $price_strikeout = $p->price;
            $link = $p->url;
            $image_link = $p->images[0]->url;
        }

        // CSV / TXT
        else if ($format == 'CSV') {

            // check it's not an empty line
            if (count($p) > 4) {

                $id = $p[$key_id];
                $sku = $p[$key_sku];
                $title = $p[$key_title];
                $price = $p[$key_price];
                $price_strikeout = $p[$key_price];
                $link = $p[$key_link];
                $image_link = $p[$key_image_link];
				
                if ($key_availability) $availability = $p[$key_availability];
                
            } else continue;
        }

        // XML
        else if ($format == 'XML') {

            // determine keys
            $c = $p->children('c', true);
            $g = $p->children('g', true);
            $s = $p->children('s', true);

            // PRODUCT ID
            $id = $p->product_id;
            if (!$id) $id = $g->id;
            if (!$id) $id = $p->merchant_product_id; // AWIN
            if (!$id) $id = $p->pid; // Pearson
            if (!$id) $id = $p->id;
            if (!$id) $id = $p->sku; // WordPress / Woocommerce
            if (!$id) $id = $p['product_id'];
            if (!$id) $id = $p['id'];
            $id = str_replace("shopify_GB_", "", $id);
            $id = str_replace("shopify_US_", "", $id);
            $id = str_replace("https://alaabi.co.uk/products/", "", $id); // Alaabi
            $id = str_replace("https://thefragranceshop.co.uk/products/", "", $id); // thefragranceshop

            // SKU
            $sku = $p->product_id;
            if (!$sku) $sku = $g->id;
            if (!$sku) $sku = $p->pid; // Pearson
            if (!$sku) $sku = $p->id;
            if (!$sku) $sku = $p->sku; // WordPress / Woocommerce
            if (!$sku) $sku = $p['product_id'];
            if (!$sku) $sku = $p['id'];
            if ($sku) $sku = str_replace("shopify_GB_", "", $sku);
            if ($sku) $sku = str_replace("shopify_US_", "", $sku);


            // TITLE
            $title = $p->product_name;
            if (!$title) $title = $p->name;
            if (!$title) $title = $p->title;
            if (!$title) $title = $g->title;
            if (!$title) $title = $p['name'];

            // PRICE
			$price = $p->price->sale;
            if (!$price) $price = $p->price->retail;
            if (!$price) $price = $g->price;
            if (!$price) $price = (string) $p->price->actualp; // Pearson
            if (!$price) $price = $p->price;
			if (!$price) $price = $p->price_with_vat; // Acumen Collection
            if (!$price) $price = $p->product_price; // Deuba XXL
            $price_strikeout = $price;

            // LINK
            $link = $p->deeplink;
            if (!$link) $link = $p->URL->product;
            if (!$link) $link = $p->product_link; // Deuba XXL
            if (!$link) $link = $p->url;
            if (!$link) $link = $p->purl; // laroc
            if (!$link) $link = $g->link;
            if (!$link) $link = (string)$p->link['href'];
            if (strlen($link) == 0) $link = $p->link;

            // IMAGE LINK
            $image_link = $p->image_url;
            if (!$image_link) $image_link = $p->image_link;
            if (!$image_link) $image_link = $p->imgurl;
            if (!$image_link) $image_link = $p->aw_image_url; // Pearson
            if (!$image_link) $image_link = $g->image_link;
            if (!$image_link) $image_link = $p->URL->productImage;
            if (!$image_link) $image_link = $p->image;
            if ($p->images[0]) {
                if (!$image_link) $image_link = $p->images[0]->url; // if empty result will not be false anymore so we put this last!
            }

            // AVAILABILITY
            $availability = $p->in_stock;
            if (!$availability) $availability = $p->stock_level;
            if (!$availability) $availability = $g->availability;
            if (!$availability) $availability = $p->shipping['availability']; // if empty result will not be false anymore so we put this last!
			if (!$availability) {
                if ($p['instock']) {
    				if (strpos($p["instock"], 'no') !== false) $availability = "out of stock";
                    else $availability = 1;
                }
                else $availability = 1;
			}

			// Shopify 
            if ($is_default_shopify_feed) {

                // handle sku and title
                /*
                we commented this out because sometimes there are variants without a sku! and that didn't pass the null check later in the codeg
                $variants = $s->variant;
                foreach ($variants as $v) {
                    // we need to go back to the default namespace to access elements not prefixed with "s:"
                    $no_namespace_items = $v->children("http://www.w3.org/2005/Atom");
                    // get the sku
                    $v_s_items = $v->children('s', true);
                    $variant_id = $v_s_items->sku;
                    $variant_id_array = json_decode(json_encode($variant_id), true);
                    $id = $variant_id_array[0];
                    // get the title
                    $variant_title = $no_namespace_items->title;
                    $variant_title_array = json_decode(json_encode($variant_title), true);
                    $variant_title = $variant_title_array[0];
                    $title = $title . ' ' . $variant_title;
                }
                */

                // handle price and image_link
                $summary = $p->summary;
                if ($summary) {
                    $results['Shopify'] = "true";

                    // remove CDATA
                    $summary = preg_replace('~//<!\[CDATA\[\s*|\s*//\]\]>~', '', $summary);

                    // remove surrounding whitespace
                    $summary = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $summary);
                    $summary = str_replace("\n", "", $summary);
                    $summary = str_replace("  ", "", $summary);

                    // create DOMDocument for HTML parsing:
                    $htmlParser = new DOMDocument();

                    // load the HTML:
                    $htmlParser->loadHTML($summary);

                    // import it into simplexml:
                    $html = simplexml_import_dom($htmlParser);

                    // NOW try to get the table. Remember that the simplexml_import_dom function creates a body node
                    $tr = $html->body->table->tr;

                    $image_link = $tr->td[0]->img['src'];

                    // get the paragraph that has the price
                    $para = (string)$tr->td[1]->p;

                    // now get the price
                    preg_match('/\d+\.?\d*/', $para, $matches);
                    $price = $matches[0];
                    $price_strikeout = $price;
                }
            }

            
            // Acumen Collection
            if ($client_id == "83953") {
                $id = $id;
                $sku = $id;
            }

            // Moda In Pelle
            if ($client_id == "43862") {
                $id = $g->item_group_id;
                $sku = $g->id;
            }

            // Nobody's Child
            if ($client_id == "99828") {
                $id = $g->item_group_id;
                $sku = $g->id;
                $title = $title . " " . $g->color;
                $price = $g->sale_price;
                if (!$price) $price = $g->price;
            }

            // Rattan Direct
            if ($client_id == "22586") {
                $price = $g->sale_price;
                if (!$price) $price = $g->price;
                $price_strikeout = $g->price;
            }

            // Ribble
            if ($client_id == "18852") {
                $id = $g->id;
                $sku = $g->mpn; // same as g:id but they don't hav another identifier in the feed
            }

            // The Fragrance Shop
            // if ($client_id == "20051") {
            //     $id = $p['product_id']; // seems to be just the XML node index
            //     $sku = $p['sku_number'];
            // }

        }
        
        else {
            oLog("Could not determine mime type.");
            return "Could not determine mime type.";
        }
        // oLog("id" . $id . "...");
        // null checks
        if ($id == "") continue;
        if ($title == "") continue;

        // create the product object
        $product = create_product_object($client_id, $region, $feed_id, $id, $sku,  $title, $link, $image_link, $price, $price_strikeout, $availability);

        $results['sample'] = $product;

        // PREVIEW MODE - return after creating a single product object
        if ($step == 1) return $results;
        // ANYTHING BEYOND THIS POINT IS STEP 2

        // skip if we've already processed this title
        if (in_array($product['title'], $titles)) continue;
        $titles[] = $product['title'];

        // add this single product to the list of products we need to process
        $products[] = $product;
        // if we've reached the threshold for bulk insertion add this chunk of products to the database and reset the array
        if (count($products) >= $bulk_insert_qty) {
            sql_bulk_insert("oculizm_products", $products);
            $products_added += count($products);
            $products = array();
        }
    }

    // handle the remainder
    if (count($products)) {
        sql_bulk_insert("oculizm_products", $products);
        $products_added += count($products);
    }
    $results['num_products_added'] = $products_added;

    // Ribble manual product insertion
    if ($client_id == "18852") {
        global $wpdb;
        $result = $wpdb->insert(
            'oculizm_products',
            array(
                'client_id' => $client_id,
                'sku' => "BBCOLOUR100",
                'title' => "Ribble Custom Colour",
                'price' => "299",
                'price_strikeout' => "299",
                'link' => "https://www.ribblecycles.co.uk/bikes/custom-colour-bikes/",
                'gb_title' => "Ribble Custom Colour",
                'gb_price' => "299",
                'gb_link' => "https://www.ribblecycles.co.uk/bikes/custom-colour-bikes/",
                'image_link' => "https://app.oculizm.com/wp-content/uploads/source-product-feeds/ribble_custom_color.png",
                'availability' => "1"
            ),
            array('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')
        );
    }

    // update the feed with num_products and last_updated
    $last_updated = date("Y-m-d H:i:s");
    $results['last_updated'] = $last_updated;
    $wpdb->query($wpdb->prepare("UPDATE oculizm_product_feeds
        SET     num_products = %s, last_updated = %s, format = %s
        WHERE   ID = %s", $products_added, $last_updated, $format, $feed_id)
    );
    $results['feed_updated'] = $feed_id;
    
    // determine filename to save the product feed to
    if ($archive_extension != "") $extension = $archive_extension;
    if (!isset($extension)) $extension = "csv"; // Funky Chunky Furniture FCF fix
    $new_file_name = ABSPATH . "wp-content/uploads/product-feeds/" . $client_name . "-" . $feed_id . "." . $extension;

    // if the file was from a GZIP, we have to extract it again to save the file inside it and not the GZIP
    if ($mime_type == "application/x-gzip" || $mime_type == "application/gzip") {
        $file_contents = file_get_contents($file);
        $file_contents = gzdecode($file_contents);

        if (!file_put_contents($file_contents, $new_file_name)) {
            oLog("*** ERROR: Failed to copy file!");
        }
    }

    // else we rename the temp file
    else {
        if (!copy($local_file, $new_file_name)) {
            oLog("*** ERROR: Failed to copy file!");
        }
    }

    // return the results
    return $results;
}


// edit product feed
add_action('wp_ajax_update_product_feed', 'update_product_feed');
function update_product_feed() {
    global $wpdb;

    $client_id = get_client_id();
    
    $curent_feed_id = $_POST['id'];

    $productFeedUrl = "";
    if (isset($_POST['http_url'])) {
        if ($_POST['http_url'] != null) $productFeedUrl = $_POST['http_url'];
    }
    $http_username = "";
    if (isset($_POST['http_username'])) {
        if ($_POST['http_username'] != null) $http_username = $_POST['http_username'];
    }
    $http_password = "";
    if (isset($_POST['http_password'])) {
        if ($_POST['http_password'] != null) $http_password = $_POST['http_password'];
    }
    $ftp_url = "";
    if (isset($_POST['ftp_url'])) {
        if ($_POST['ftp_url'] != null) $ftp_url = $_POST['ftp_url'];
    }
    $ftp_username = "";
    if (isset($_POST['ftp_username'])) {
        if ($_POST['ftp_username'] != null) $ftp_username = $_POST['ftp_username'];
    }
    $ftp_password = "";
    if (isset($_POST['ftp_password'])) {
        if ($_POST['ftp_password'] != null) $ftp_password = $_POST['ftp_password'];
    }
    $ftp_path = "";
    if (isset($_POST['ftp_path'])) {
        if ($_POST['ftp_path'] != null) $ftp_path = $_POST['ftp_path'];
    }
    $region = "";
    if (isset($_POST['region'])) {
        if ($_POST['region'] != null) $region = $_POST['region'];
    }
    $shop_link = "";
    if (isset($_POST['shop_link'])) {
        if ($_POST['shop_link'] != null) $shop_link = $_POST['shop_link'];
    }
    

    // build Product feed array
    $my_post = array(
        'ID'    => $curent_feed_id,
        'http_url'    => $productFeedUrl,
        'http_username'    => $http_username,
        'http_password'  => $http_password,
        'ftp_url' => $ftp_url, 
        'ftp_username' => $ftp_username,
        'ftp_password' => $ftp_password,
        'ftp_path' => $ftp_path,
        'region' => $region,
        'shop_link' => $shop_link
    );
    
     // updating the Product Feed
    $sql = $wpdb->prepare("UPDATE oculizm_product_feeds
        SET http_url = %s, http_username = %s, http_password = %s, ftp_url=%s, ftp_username=%s, ftp_password=%s , ftp_path=%s , region=%s ,  shop_link=%s 
        WHERE ID = %s", $productFeedUrl, $http_username, $http_password, $ftp_url, $ftp_username, $ftp_password , $ftp_path , $region, $shop_link ,$curent_feed_id);

     $result = $wpdb->query($sql);
    
    // debug
    if (is_wp_error($result)) {
        $errors = $result->get_error_messages();
        foreach ($errors as $error) {
            oEmail('sean@oculizm.com', "Error!", $error);
            oEmail('anthony@oculizm.com', "Error!", $error);
        }
    }
    
    echo json_encode($result);
    die;
}


// consolidate products - AJAX handler
add_action('wp_ajax_consolidate_product_feeds', 'consolidate_product_feeds');
function consolidate_product_feeds() {
    
    $result = consolidate_product_feeds_internal();

    echo json_encode($result);
    die();

}


// consolidate products
function consolidate_product_feeds_internal() {

    global $wpdb;

    $client_id = get_client_id();
    if (isset($_REQUEST['called_by_cron'])) $client_id = $_REQUEST['consolidate_client_id'];

    $results = array();
    $errors = array();
    $unique_products = array();

    // get this client's feeds
    $feeds = $wpdb->get_results("SELECT * FROM oculizm_product_feeds WHERE client_id = " . $client_id, ARRAY_A);
    $results['feeds'] = $feeds;



    // cycle through each feed
    foreach ($feeds as $f) {
        
        // if the feed' s region is set...
        $region = $f['region'];
        if (isset($region) && ($region != null) && ($region != "")) {

            // define regional variables
            $regional_title_field = $region . "_TITLE";
            $regional_price_field = $region . "_PRICE";
            $regional_link_field =  $region . "_LINK";
            $product_ids_to_delete = array();
            $num_new_products_found = 0;

            // get all products imported with this feed
            $products = $wpdb->get_results("SELECT id, sku, title, price, link FROM oculizm_products WHERE client_id = " . $client_id . " AND feed_id = " . $f['id'], ARRAY_A);

            // for each product...
            foreach ($products as $p) {

                // if this sku exists in our list of unique skus...
                // $unique_products is a list of unique products. Here, we add every product into it, and ONLY process it if this 
                // is NOT the first time we're encountering it
                $key = array_search($p['sku'], $unique_products);
                if ($key) {

                    // update the product's regional values
                    $title = $p['title'];
                    $price = $p['price'];
                    $link = $p['link'];
                    $sql = $wpdb->prepare("UPDATE oculizm_products
                        SET $regional_title_field = %s, $regional_price_field = %s, $regional_link_field = %s
                        WHERE   ID = %s", $title, $price, $link, $key);
                    $update = $wpdb->query($sql);

                    // now add this product to the list to be deleted
                    $product_ids_to_delete[] = $p['id'];
                }

                // else, add this product to the list of unique products
                else {
                    $unique_products[$p['id']] = $p['sku'];
                    $num_new_products_found++;
                }
            } // end foreach

            $results['num_products_in_' . $region . '_region'] = $num_new_products_found;

            // if this client only has one feed
            if (sizeof($feeds) == 1) {

                // then the list of unique products IS the list of products we need to process!

                // for each product...
                foreach ($products as $p) {

                    // update the product's regional values
                    $title = $p['title'];
                    $price = $p['price'];
                    $link = $p['link'];
                    $sql = $wpdb->prepare("UPDATE oculizm_products
                        SET $regional_title_field = %s, $regional_price_field = %s, $regional_link_field = %s
                        WHERE   ID = %s", $title, $price, $link, $key);
                    $update = $wpdb->query($sql);
                }
            }

            // else...
            else {

                // now delete the products whose regional values we copied...
                $bucket_size = 100;
                while (sizeof($product_ids_to_delete) > 0) {

                    // the remainder
                    if (sizeof($product_ids_to_delete) <= $bucket_size) {

                        // delete statement
                        $str = implode("','", $product_ids_to_delete);
                        $deleted = $wpdb->query("DELETE FROM oculizm_products WHERE id IN ('" . $str . "')");
                    
                        break;
                    }

                    else {
                        // get the first bucket load
                        $slice_to_delete = array_slice($product_ids_to_delete, 0, $bucket_size);

                        // delete statement
                        $str = implode("','", $slice_to_delete);
                        $deleted = $wpdb->query("DELETE FROM oculizm_products WHERE id IN ('" . $str . "')");

                        // chop the array
                        $product_ids_to_delete = array_slice($product_ids_to_delete, $bucket_size);
                    }
                }
            }
        }
        else $errors['feed_region_null'] = "No region  set for feed ID " . $f['id'];
    }

    $results['errors'] = $errors;
    return $results;
}


// delete a feed
add_action('wp_ajax_delete_product_feed', 'delete_product_feed');
function delete_product_feed() {
    
    $client_id = get_client_id();

    $feed_id = $_REQUEST['feed_id'];

    global $wpdb;
    
    // check that this client actually owns this feed
    $g = $wpdb->get_results("SELECT * FROM oculizm_product_feeds WHERE ID = " . $feed_id, ARRAY_A);
    if ($g[0]['client_id'] != $client_id) {
        echo json_encode("Invalid client ID");
        die();
    }

    // delete the feed
    $query = $wpdb->prepare('DELETE FROM oculizm_product_feeds WHERE id = %d', $feed_id);
    $result = $wpdb->query($query);

    echo json_encode($result);
    die();
}


