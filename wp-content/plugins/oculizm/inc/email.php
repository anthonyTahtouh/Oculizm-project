<?php


// mailer
function oEmail($to, $subject, $message) {
    $env = get_environment();

    // filter UAT emails
    // if(strpos($env, 'uat') || strpos($env, '3.8.228.192')) return true;

    $client_id = get_client_id();

    // email headers
    $from = 'hello@oculizm.com';
    $headers = 'From: ' . $from . "\r\n" . 'Reply-To: ' . $from . "\r\n" . 'X-Mailer: PHP/' . phpversion();

    // load email header and footer
    $email_header = file_get_contents(plugin_dir_path(__FILE__) . '../email/header.html');
    $email_footer = file_get_contents(plugin_dir_path(__FILE__) . '../email/footer.html');

    $email_subject = '<p style="font-size: 22px; line-height: 150%;">' . $subject . '</p>';
    $email_body = '<p style="font-size: 16px; line-height: 150%; font-weight:400;">' . $message . '<br><br>-<br>The Oculizm Team</p>';

    $html = $email_header . $email_subject . $email_body . $email_footer;

    $result = wp_mail($to, $subject, $html, $headers);
    return $result;
}


// new post mailer
function send_admin_email_new_post($to, $subject, $media_url, $post_title, $description, $matched_products, $url) {
    
    $env = get_environment();
    if(strpos($env, 'uat') || strpos($env, '3.8.228.192')) return true;
        
    $client_id = get_client_id();
    
    // email headers
    $from = 'hello@oculizm.com';
    $headers = 'From: ' . $from . "\r\n" . 'Reply-To: ' . $from . "\r\n" . 'X-Mailer: PHP/' . phpversion();

    // load email header and footer
    $email_header = file_get_contents(plugin_dir_path(__FILE__) . '../email/header.html');
    $email_footer = file_get_contents(plugin_dir_path(__FILE__) . '../email/footer.html');

    // build the html
    $email_body_part1 = "<table border='0' cellpadding='0' cellspacing='0' width='100%'><tbody><tr><td valign='top' width='50%'>
                <img src='$media_url' width='300px' height='auto'><p align='center'> $post_title </p></td>
                <td valign='top' width='50%'><table border='0' cellpadding='0' cellspacing='0' width='100%'>";
    $i = 1;
    $done = false;
    if (isset($matched_products)) {
      foreach($matched_products as $product){
          $done = false;
          if($i % 2 != 0){
              $email_body_part1 .= "<tr>";
          }
          $product_image = $product["product_image"];
          $product_title = $product["product_name"];
          
          $email_body_part1 .= "<td valign='top' width='50%'>";
          $email_body_part1 .= "<img src='$product_image' width='100px' height='auto'>";
          $email_body_part1 .= "<p style='font-size:10px;'>$product_title</p>";
          $email_body_part1 .= "</td>";
          
          if($i % 2 == 0){
              $email_body_part1 .= "</tr><tr><td colspan='3' height='10' style='height: 10px; line-height: 1px'>&nbsp;</td></tr>";
              $done = true;
          }
          $i++;
      }
    }
    
    if(!$done && $i > 1){
        $email_body_part1 .= "</tr><tr><td colspan='3' height='10' style='height: 10px; line-height: 1px'>&nbsp;</td></tr>";
    }                 
    $message_no_products = "";
    if(!$matched_products || count($matched_products) == 0) {
        $message_no_products = "<p style='font-weight: bold;'>NO MATCHED PRODUCTS !</p>";
    }
    $email_body_part2 = "<tr><td colspan='3' height='10' style='height: 10px; line-height: 1px'>&nbsp;</td></tr><tr>
    <td colspan='12' valign='top' style='display: table-cell;'>$message_no_products<p style='font-size: 11px;font-style: italic;'>$description</p><p>Click <a href='$url'>here</a> to edit post</p></td></tr>
    </table></td></tr></tbody></table>";


    $email_body = $email_body_part1 . $email_body_part2;
    $html = $email_header . $email_body . $email_footer;

    $result = wp_mail($to, $subject, $html, $headers);
    return $result;
}


// get email HTML for a gallery
add_action('wp_ajax_get_gallery_email_html', 'get_gallery_email_html');
function get_gallery_email_html() {

    global $wpdb;
    
    $client_id = get_client_id();

    // get gallery
    $gallery_id = $_REQUEST['gallery_id'];

     // check if region was supplied
    $region = "";
    if (isset($_REQUEST['region']) && !empty($_REQUEST['region']) &&  $_REQUEST['region'] != null) {
        $region = strtolower($_REQUEST['region']);
    }
    $region = sanitise_lower_case_letters($region);

    // get this client's product feeds
    $product_feeds = $wpdb->get_results("SELECT region, shop_link FROM oculizm_product_feeds WHERE client_id=$client_id", ARRAY_A);

    // get the shop link
    $shop_link = "";
    if (sizeof($product_feeds) == 0) {} // no feeds? no shop link
    else if (sizeof($product_feeds) == 1) $shop_link = $product_feeds[0]['shop_link']; // single region
    else if (sizeof($product_feeds) > 1) { // multi region
        foreach ($product_feeds as $pf) {
            if ($region == strtolower($pf['region'])) $shop_link = $pf['shop_link'];
        }
    }

    // surrounding HTML
    $html_email_table_start = "<table align='center' border='0' cellpadding='0' cellspacing='0' style='border-collapse:collapse' width='600'><tbody><tr><td><table align='center' border='0' cellpadding='0' cellspacing='0' style='border-collapse:collapse'><tbody><tr>";

    $button_html = "<table width='100%' align='center' border='0' cellpadding='0' cellspacing='0' style='border-collapse:collapse'><tbody><tr><td><center style='padding:20px;'><a href='$shop_link' style='cursor: pointer; background: black; padding: 10px 25px; text-decoration: none; color: white; text-transform: uppercase; border: 1px solid #000; font-size: 12px; border-radius: 3px;'>Shop Now </a></center></td></tr></tbody></table>";

    $html_email_table_end = "</tr><tbody></table></td></tr><tbody></table>";

    $script_html =  $html_email_table_start;
    $num_posts_to_show = 3;
    $counter = 0;
    $result = array();
        
    $args = array(
        'meta_key' => 'client_id', 
        'meta_value' => $client_id, 
        'orderby' => 'publish_date', 
        'order' => 'DESC', 
        'post_type' => 'post',
        'paged' => 1, 
        'posts_per_page' => 250,  // hopefully this provides at least 4 posts after region filtering
        'post_status' => array('publish')
    );
    
    $the_query = new WP_Query($args);

    if ($the_query->have_posts()) {

        while ($the_query->have_posts()) {
            $the_query->the_post();

            $post_id = get_the_ID();
            $title = get_the_title();

            // get the post's galleries
            $pg_string = get_field('galleries');
            
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
            
            // get the post's matched products
            $products = get_field('matched_products');

            // build a region-specific products list
            if (is_array($products) || is_object($products)) {
                $products = trim_matched_products_for_region($products, $region);
            }

            // get the featured image
            $tn_id = get_post_meta(get_the_ID(), '_thumbnail_id', true);
            $image_url = wp_get_attachment_image_src( $tn_id, 'thumbnail' )[0];

            $vid_id = get_post_meta($tn_id, '_thumbnail_id', true);
            $video_url = wp_get_attachment_url($vid_id);

            if ($image_url != null) {
                $image_url = str_replace("http:", "https:", $image_url);
                $image_url = str_replace("https://localhost", "http://localhost", $image_url);
            }

             // video 
             else{
                $image_url = wp_get_attachment_url($tn_id);
                $video_url = $image_url;
            } 
            
                  
            if ($video_url) continue; // skip video posts
            if (get_post_status() == "draft") continue; // skip drafts
                        
            // increment the counter
            $counter++;

            // if we're on the last item, exit
            if ($counter > $num_posts_to_show) continue;
      
            $script_html .= "
                <td valign='top' style='padding-bottom:9px' width='194'>
                    <table border='0' cellpadding='0' cellspacing='0' width='100%' style='border-collapse:collapse'>
                        <tbody>
                            <tr>
                                <td valign='top'>
                                    <table border='0' cellpadding='0' cellspacing='0' width='100%' style='border-collapse:collapse'>
                                        <tbody>
                                            <tr>
                                                <td valign='top' style='padding:9px'>
                                                    <table align='left' border='0' cellpadding='0' cellspacing='0' style='border-collapse:collapse'>
                                                        <tbody>
                                                            <tr>
                                                                <td align='center' valign='top' style='padding:0 9px 9px 9px; text-align: center'>
                                                                    <a target='_blank' href='$shop_link?oculizm_post_id=$post_id&oculizm_src=email'>
                                                                        <img alt='' src='$image_url' width='158' style='max-width:230px;border:0;height:auto;outline:none;text-decoration:none;vertical-align:bottom'>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td valign='top' style='padding:0 9px 0 9px;word-break:break-word;color:#101010;font-family:Helvetica;font-size:16px;line-height:150%;text-align:center' width='158'>
                                                                    <a target='_blank' href='$shop_link?oculizm_post_id=$post_id&oculizm_src=email'>
                                                                        <span style='color:#a9a9a9'>
                                                                            <b>$title</b> 
                                                                        </span>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>";
        }

        // add the Shop Now button
        $script_html .= $button_html;

        // HTML email end
        $script_html .= $html_email_table_end;
    }

    $result['email_html'] = $script_html;
    $result['region'] = $region;
    
    echo json_encode($result);
    die();
}


// send a client's users an email
add_action('wp_ajax_send_client_email', 'send_client_email');
function send_client_email() {

    // define variables
    $client_id = $_REQUEST['client_id'];
    $subject = stripslashes($_REQUEST['email_subject']);
    $email_message = stripslashes($_REQUEST['email_message']);

    // convert line breaks to HTML
    $email_message = preg_replace("/\r\n|\r|\n/", '<br/>', $email_message);

    // add email signature
    $email_message = $email_message . "<br /><br />Oculizm Support<br /><a href='https://app.oculizm.com'>app.oculizm.com</a>";

    // email headers
    $from = 'hello@oculizm.com';
    $headers = 'From: ' . $from . "\r\n" . 'Reply-To: ' . $from . "\r\n" . 'X-Mailer: PHP/' . phpversion();

    // HTML header and footer
    $email_header = file_get_contents(plugin_dir_path(__FILE__) . '../email/header.html');
    $email_footer = file_get_contents(plugin_dir_path(__FILE__) . '../email/footer.html');

    // determine who to send the email to
    global $wpdb;
    $result = get_users(
        array(
            'meta_key' => "client_id",
            'meta_value' => $client_id,
            'number' => -1
        )
    );
    foreach ($result as $user) {

        $user_data = $user->data;
        $to = $user_data->user_email;

        $user_meta = get_userdata($user_data->ID);
        $first_name = $user_meta->first_name;

        // add first line addressing recipient by first name
        $email_message = "Hi " . $first_name . ",<br /><br />" . $email_message;

        // construct the HTML email
        $html = $email_header . $email_message . $email_footer;

        // send it
        $result = wp_mail($to, $subject, $html, $headers);
    }

    return $result;
}

