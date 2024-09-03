<?php

// get all client creators expired images
add_action('wp_ajax_get_expired_content_creators', 'get_expired_content_creators');
function get_expired_content_creators() {
    
    $client_id = get_client_id();
    global $wpdb;

    $expiredCreatorsMedia = array();

     // get all the creators for this client
     $clientCreators = $wpdb->get_results("SELECT * FROM oculizm_content_creators WHERE  CLIENT_ID = $client_id " , ARRAY_A);

     foreach($clientCreators as $creator) {

        // setting the variables
        $creator_media_url = $creator['profile_pic_url'];
        $creator_id = $creator['id'];
        $creator_username = $creator['username'];
        $creator_screen_name = $creator['screen_name'];
        $creator_social_id = $creator['social_network_user_id'];

        //parsing the media url
        parse_str($creator_media_url, $media_url_array);

        //setting default value to media outdated
        $media_outdated = false;

        // or if there is no profile_pic_url at all
        if (empty($creator_media_url))
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

         // OE IS Expired and need to be updated
         if($media_outdated) {

            // build the creator media object
            $expiredCreatorMedia = array(
                'creator_id' => $creator_id,
                'creator_social_id' => $creator_social_id,
                'creator_username' => $creator_username,
                'creator_screen_name' => $creator_screen_name,
                'creator_media_url' => $creator_media_url,
                'creator-media-expiry-date' => gmdate("Y-m-d H:i:s", $oeUnix)
            );
            array_push($expiredCreatorsMedia, $expiredCreatorMedia);
         }


     }
     usort($expiredCreatorsMedia, function($a, $b) {
        $datetime1 = strtotime($a['creator-media-expiry-date']);
        $datetime2 = strtotime($b['creator-media-expiry-date']);
        return $datetime1 - $datetime2;
            });
     echo json_encode($expiredCreatorsMedia);
     die;
}
