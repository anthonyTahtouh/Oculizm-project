<?php


// get a client's reviews
add_action('wp_ajax_get_reviews', 'get_reviews');
function get_reviews() {
    
    $client_id = get_client_id();

    global $wpdb;

    $result = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE CLIENT_ID = " . $client_id . " ORDER BY created DESC", ARRAY_A);

    echo json_encode($result);
    die();
}

// get a client's reviews summary
add_action('wp_ajax_get_reviews_summary', 'get_reviews_summary');
function get_reviews_summary() {
    
    $client_id = get_client_id();

    global $wpdb;

    // Query to get all reviews for the client
    $reviews = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE CLIENT_ID = $client_id AND status = 'published' ORDER BY created DESC", ARRAY_A);

    // Query to get the count of admin approved reviews
    $admin_approved_count = $wpdb->get_var("SELECT COUNT(*) FROM oculizm_reviews WHERE CLIENT_ID = $client_id AND status = 'new'");

    // Calculate Overall Rating
    $overall_rating = 0;
    $total_reviews = count($reviews);

    foreach ($reviews as $review) {
        $overall_rating += $review['rating'];
    }

    if ($total_reviews > 0) {
        $overall_rating /= $total_reviews;
    }

    // Calculate Overall Site Rating
    $overall_site_rating = 0;
    $site_reviews_count = 0;

    foreach ($reviews as $review) {
        if (!empty($review['product_id'])) {
            continue; // Skip product reviews
        }
        $overall_site_rating += $review['rating'];
        $site_reviews_count++;
    }

    if ($site_reviews_count > 0) {
        $overall_site_rating /= $site_reviews_count;
    }

    // Calculate Overall Product Rating
    $overall_product_rating = 0;
    $product_reviews_count = 0;

    foreach ($reviews as $review) {
        if (empty($review['product_id'])) {
            continue; // Skip site reviews
        }
        $overall_product_rating += $review['rating'];
        $product_reviews_count++;
    }

    if ($product_reviews_count > 0) {
        $overall_product_rating /= $product_reviews_count;
    }


    // Round all values to the nearest integer
    $overall_rating = number_format($overall_rating, 1);
    $overall_site_rating = number_format($overall_site_rating, 1);
    $overall_product_rating = number_format($overall_product_rating, 1);

    // Prepare the response array
    $result = array(
        'reviews' => $reviews,
        'admin_approved_reviews_count' => $admin_approved_count,
        'overall_rating' => $overall_rating,
        'total_reviews' => $total_reviews,
        'overall_site_rating' => $overall_site_rating,
        'overall_product_rating' => $overall_product_rating, 
        'site_reviews_count' => $site_reviews_count,
        'product_reviews_count' => $product_reviews_count
    );

    // Send response as JSON
    echo json_encode($result);
    die();
}



// get a client's min auto publish reviews stars
add_action('wp_ajax_get_min_star_rating', 'get_min_star_rating');
function get_min_star_rating() {
    
    $client_id = get_client_id();
    global $wpdb;

    $client = $wpdb->get_row("SELECT min_auto_publish_reviews_stars FROM oculizm_clients WHERE id = " . $client_id, OBJECT);
    $min_auto_publish_reviews_stars = $client->min_auto_publish_reviews_stars;

    $result['min_auto_publish_reviews_stars'] = $min_auto_publish_reviews_stars;

    echo json_encode($result);
    die();

}



// update review settings
add_action('wp_ajax_update_review_settings', 'update_review_settings');
function update_review_settings() {
    
    $client_id = get_client_id();

    $review_form_title = stripslashes($_REQUEST['reviewFormTitle']);
    $review_form_description = stripslashes($_REQUEST['reviewFormDescription']);
    $hide_reviews_credits = stripslashes($_REQUEST['hideReviewsCredits']);
    $email_required = stripslashes($_REQUEST['emailRequired']);
    // $reviews_css = stripslashes($_REQUEST['reviewsCss']);
    $reviews_css = str_replace('\\"', '"', $_REQUEST['reviewsCss']);


    $min_auto_publish_reviews_stars = stripslashes($_REQUEST['minAutoPublishReviewsStars']);
    
    global $wpdb;

    $result = array();

    $result1 = $wpdb->query($wpdb->prepare("UPDATE oculizm_clients SET review_form_title = %s WHERE id = %s", $review_form_title, $client_id));
    $result2 = $wpdb->query($wpdb->prepare("UPDATE oculizm_clients SET review_form_description = %s WHERE id = %s", $review_form_description, $client_id));
    $result4 = $wpdb->query($wpdb->prepare("UPDATE oculizm_clients SET hide_reviews_credits = %s WHERE id = %s", $hide_reviews_credits, $client_id));
    $result5 = $wpdb->query($wpdb->prepare("UPDATE oculizm_clients SET email_required = %s WHERE id = %s", $email_required, $client_id));
    $result6 = $wpdb->query($wpdb->prepare("UPDATE oculizm_clients SET reviews_custom_css = %s WHERE id = %s", $reviews_css, $client_id));
    $result7 = $wpdb->query($wpdb->prepare("UPDATE oculizm_clients SET min_auto_publish_reviews_stars = %s WHERE id = %s", $min_auto_publish_reviews_stars, $client_id));

    $result['result1'] = $result1;
    $result['result2'] = $result2;
    $result['result4'] = $result4;
    $result['result5'] = $result5;
    $result['result6'] = $result6;
    $result['result7'] = $result7;
    $result['result8'] = publish_client_tags($client_id);
    
    echo json_encode($result);
    oLog(json_encode($result));
    die();
}


// delete a review
add_action('wp_ajax_delete_review', 'delete_review');
function delete_review() {
    
    $client_id = get_client_id();
    $review_id = $_REQUEST['review_id'];

    global $wpdb;

    // check that this client actually owns this review
    $review = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE ID = " . $review_id, ARRAY_A);
    if (!isset($review[0]['client_id'])) {
        if ($review[0]['client_id'] !== $client_id) {
            echo json_encode("Invalid client ID");
            die();
        }
    }

    $query = $wpdb->prepare('DELETE FROM oculizm_reviews WHERE ID = %d', $review_id);
    $result = $wpdb->query($query);

    echo json_encode($result);
    die();
}


// update review status
add_action('wp_ajax_update_review_status', 'update_review_status');
function update_review_status() {
    
    $client_id = get_client_id();
    $review_id = $_REQUEST['review_id'];
    $status = $_REQUEST['status'];
    $flag_reason = '';
    $flag_detail = '';
    if ($status == 'flagged') {
        $flag_reason = $_REQUEST['flag_reason'];
        $flag_detail = $_REQUEST['flag_detail'];
    }

    global $wpdb;

    // get the review from the DB
    $result = $wpdb->get_results("SELECT * FROM oculizm_reviews WHERE ID = " . $review_id, ARRAY_A);
    $review = $result[0];
    $rating = $review['rating'];
    $reviewer_name = $review['reviewer_name'];
   
    if (isset($_REQUEST['reviewer_display_name'])) {
        $reviewer_display_name = $_REQUEST['reviewer_display_name'];
        $reviewer_display_name = stripslashes($reviewer_display_name);
    } else {
        $reviewer_display_name = $reviewer_name;
    }
    
    $review_title = $review['title'];
    $review_description = $review['description'];
    $product_id = $review['product_id'];

    // make the update
    $rows_affected = $wpdb->query($wpdb->prepare("UPDATE oculizm_reviews
        SET status = %s,
        flag_reason = %s,
        flag_detail = %s ,
        reviewer_display_name = %s
        WHERE id = %s", $status, $flag_reason, $flag_detail, $reviewer_display_name, $review_id));

    // admin_approved
    if ($status == 'admin_approved') {

        // create email subject
        $client = $wpdb->get_row("SELECT name FROM oculizm_clients WHERE id = " . $client_id, OBJECT);
        $subject = "New review for " .$client->name;

        // create email body
        $rating_html = "";
        $arr = array(1, 2, 3, 4, 5);
        foreach ($arr as $value) {
            if ($rating >= $value) $rating_html = $rating_html . "⭐";
        }
        $message = "Congratulations! " . $client->name . " receieved a new review. Please <a target='_blank' href='https://app.oculizm.com/all-reviews/'>log in</a>
         to moderate your reviews.";
        // $message = "Reviewer name: " . $reviewer_name . "<br>" . 
        //     "Rating: " . $rating_html . "<br>" . 
        //     "Review title: " . $review_title . "<br>" . 
        //     "Review text: " . $review_description . "<br>";
        // if ($product_id) $message = $message . "<br>Product ID: " . $product_id;

        // get this client's users
        $client_users = get_users(
            array(
                'meta_key' => "client_id",
                'meta_value' => $client_id,
                'number' => -1
            )
        );
        
        // send an email to this client's users
        $admin_emails = array('sean@oculizm.com', 'anthony@oculizm.com');
        foreach ($client_users as $u) {
            $user_email = $u->user_email;
            if (!in_array($user_email, $admin_emails)) {
                $email_result = oEmail($user_email, $subject, $message);
            }
        }

        // send admin email
        $email_result = oEmail('sean@oculizm.com', $subject, $message);
        $email_result = oEmail('anthony@oculizm.com', $subject, $message);
    }

    // published
    if ($status == 'published') {

        // create email subject
        $client = $wpdb->get_row("SELECT name FROM oculizm_clients WHERE id = " . $client_id, OBJECT);
        $subject = "Review published by " .$client->name;

        // create email body
        $rating_html = "";
        $arr = array(1, 2, 3, 4, 5);
        foreach ($arr as $value) {
            if ($rating >= $value) $rating_html = $rating_html . "⭐";
        }
        $message = $client->name . " published a review." . "<br><br>" .
            "Reviewer name: " . $reviewer_name . "<br>" . 
            "Rating: " . $rating_html . "<br>" . 
            "Review title: " . $review_title . "<br>" . 
            "Review text: " . $review_description . "<br>";
        if ($product_id) $message = $message . "<br>Product ID: " . $product_id;

        // send email
        $email_result = oEmail('sean@oculizm.com', $subject, $message);
        $email_result = oEmail('anthony@oculizm.com', $subject, $message);
    }

    // flagged
    if ($status == 'flagged') {

        // create email subject
        $client = $wpdb->get_row("SELECT name FROM oculizm_clients WHERE id = " . $client_id, OBJECT);
        $subject = "Review flagged by " . $client->name . " (Client ID " . $client_id . ")";

        // create email body
        $message = "Reviewer ID: " . $review_id . "<br>" . 
            "Flag reason: " . $flag_reason . "<br>" . 
            "Flag detail: " . $flag_detail;

        // send email
        $email_result = oEmail('sean@oculizm.com', $subject, $message);
        $email_result = oEmail('anthony@oculizm.com', $subject, $message);
    }

    // fetch the updated row(s)
    $result = $rows_affected;

    echo json_encode($result);
    die();
}







