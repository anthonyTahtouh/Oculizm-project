<?php

// curl
function curl_file($url, $local_file = '', $http_username, $http_password) {

    $file_headers = get_headers($url);

    // check for other HTTP error messages
    if (!$file_headers) echo 'File headrs missing';
    else if (strpos($file_headers[0], '401 Unauthorized') > -1) echo '401 Unauthorized';
    else if (strpos($file_headers[0], '404 Not Found') > -1) {
        oLog($file_headers);
        oLog('404 Not Found');
        return;        
    }

    // begin reading the URL
    $file_pointer = fopen($local_file, 'wb'); 
    $ch = curl_init();
    $userAgent = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)';
    curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_FILE, $file_pointer); 
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_FAILONERROR, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_AUTOREFERER, true);
    curl_setopt( $ch, CURLOPT_ENCODING, "UTF-8" );

    if (isset($http_username) && isset($http_password)) {
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
        curl_setopt($ch, CURLOPT_USERPWD, $http_username . ":" . $http_password);  
    }
    $output = curl_exec($ch);
    curl_close($ch);

    fclose($file_pointer); 
    return $local_file;
}

// convert string to XML
function array_to_xml(&$xml_data, $data, $parent_key = 'item') {
  foreach ($data as $key => $value) {
    if (is_array($value)) {
      if (is_numeric($key)) {
        $key = $parent_key; //dealing with <0/>..<n/> issues
      }
      $subnode = $xml_data->addChild($key);
      array_to_xml($subnode, $value, rtrim($key, "s"));
    } else {
      $xml_data->addChild("$key", htmlspecialchars("$value"));
    }
  }
}

// sanitise a username
function sanitise_username($string) {
    $string = str_replace(' ', '', $string);
    $string = str_replace('"', '', $string);
    $string = str_replace("'", '', $string);
    $string = preg_replace("/[^a-zA-Z0-9]/", "", $string);
    return $string;
}

// sanitise a full name
function sanitise_full_name($string) {
    $string = str_replace('"', '', $string);
    $string = str_replace("'", '', $string);
    $string = trim($string);
    $string = preg_replace("/[^a-zA-Z ]/", "", $string);
    return $string;
}

// sanitise lower case letters
function sanitise_lower_case_letters($string) {
    $string = str_replace('"', '', $string);
    $string = str_replace("'", '', $string);
    $string = trim($string);
    $string = preg_replace("/[^a-z ]/", "", $string);
    return $string;
}

// sanitise positive integer (int or string format)
function sanitise_int($string) {
    if (is_numeric($string)) return $string;
    else return false;
}

// sanitise a price
function sanitise_price($price) {
    $price = preg_replace('~//<!\[CDATA\[\s*|\s*//\]\]>~', '', $price);
    $price = filter_var($price, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION | FILTER_FLAG_ALLOW_THOUSAND);
    $price = floatval($price);
    $price = round($price, 2);
    return $price;
}

// sanitise availability
function sanitise_availability($availability) {
    $availability = preg_replace('~//<!\[CDATA\[\s*|\s*//\]\]>~', '', $availability);
    if ($availability == "preorder") $availability = 2;
    else if ($availability == "out of stock") $availability = 0;
    else $availability = 1;
    return $availability;
}

// sanitise a review content
function sanitise_plain_text($content, $max_length = 10000) {
    // Trim whitespace from the beginning and end
    $content = trim($content);

    // Remove HTML tags
    $content = strip_tags($content);

    // Limit the length of the content (adjust the number as needed)
    $content = mb_substr($content, 0, $max_length, 'UTF-8');

    return $content;
}

// sanitise a supplied product ID
function sanitise_product_id($product_id) {
    // Remove any non-alphanumeric characters except for hyphens and underscores
    $sanitized_id = preg_replace('/[^a-zA-Z0-9-_]/', '', $product_id);
    return $sanitized_id;
}

// generate random string
function generateRandomString($length = 16) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[random_int(0, $charactersLength - 1)];
    }
    return $randomString;
}

// filter an array of products by region
function trim_matched_products_for_region($products, $region) {

    // a post may have multiple products, some which are available in this region, and some which aren't
    $products_for_this_region = [];

    // for each product... (MUTABLE LOOP!)
    foreach ($products as &$product) {

        // we want to show a product (and set the thubmnail) if:
        // there is no specified region, OR
        // the specified region is in the matched product's list of supported regions
        $product_should_be_shown = false;
        // if there is NO region...
        if ($region == "") $product_should_be_shown = true;
        // else, if there is...
        else {
            // but this product has no title for this region...
            if ($product[$region . "_title"] == null || $product[$region . "_title"] == "") continue;
            // else we're good
            else $product_should_be_shown = true;
        }
        if ($product_should_be_shown) {

            // get the product image
            // the get_field() method returns A LOT of info for each product in matched_products
            // we only need the URL, so let's strip out everything else
            if (array_key_exists('product_image', $product)) {
                $product_image = $product['product_image'];
                if (array_key_exists('sizes', $product_image)) {
                    $sizes = $product_image['sizes'];
                    if (array_key_exists('medium', $sizes)) {
                        $medium_size = $sizes['medium'];
                        $product["product_image_url"] = $medium_size;
                    }                               
                }
                // for some really old posts, this is the old way to access the image URL
                else $product["product_image_url"] = $product_image['url'];
            }

            // set the title, price and link variables which will be used by the plugin (the region_ ones aren't used)
            if ($region != "") {
                $product["product_name"] = $product[$region . "_title"];
                $product["product_price"] = $product[$region . "_price"];
                $product["product_url"] = $product[$region . "_link"];

                $product["product_price_strikeout"] = $product["product_price_strikeout"];
            }

            // remove the product_image payload as it's huge and we've extracted all we need from it
            unset($product['product_image']);

            // add to our array of products for this region
            $products_for_this_region[] = $product;
        }
    }
    unset ($product);
    return $products_for_this_region;
}


function kebabCase($str) {
    $str = preg_replace('/[^A-Za-z0-9\s]/', '', $str);
    $str = strtolower(str_replace(' ', '-', $str));
    return $str;
}


