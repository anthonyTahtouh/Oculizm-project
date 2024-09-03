
// connection variables
var connections;
var facebook_connection;
var fb_facebook_access_token;
var facebook_page_access_token;
var fb_instagram_business_id;
var facebook_user_id;
var facebook_username;
var facebook_screen_name;
var facebook_profile_pic_url;
var facebook_connection_id;
var instagram_connection;
var ig_facebook_access_token;
var ig_instagram_business_id;
var instagram_username;
var instagram_screen_name;
var instagram_profile_pic_url;
var instagram_connection_id
var twitter_connection;
var twitter_oauth_access_token;
var twitter_oauth_access_token_secret;
var tiktok_connection;
var tiktok_access_token;
var tiktok_open_id;

(function($) {

    jQuery(document).ready(function() {

    	if ($('body.logged-in').length) {

            // get connections
            $.ajax({
                url: ajaxUrl,
                data: {
                    'action': 'get_connections'
                },
                dataType: 'JSON',
                success: function(data) {
                    console.log(data);

                    // check we got an array back
                    if (Object.prototype.toString.call(data) === '[object Array]') {

                        // update the connections object
                        connections = data;
                        if (connections) {

                            var num_facebook = 0;
                            var num_instagram = 0;

                            // for each connection...
                            for (var i = 0; i < connections.length; i++) {

                                var c = connections[i];

                                if (c['social_network'] == "facebook") {

                                    fb_facebook_access_token = c['facebook_access_token'];

                                    // create the submenu container
                                    if (num_facebook == 0) {
                                        $('li[data-social-network=facebook]').append('<ul class="social-sub-menu"></ul>');
                                    }
                                    num_facebook++;

                                    // build submenu html
                                    var navHtml =   '<li class="menu-item" name="facebook-photos" data-connection-id="' + c['id'] + '" data-username="' + c['username'] + '">' +
                                                    '   <a href="' + site_url + '/facebook-photos/?username=' + c['username'] + '"">' +
                                                    '       <span class="profile-pic" style="background-image: url(' + "'" + c['profile_pic_url'] + "'" + ');"></span>' +
                                                            'Photos' +
                                                    '   </a>' +
                                                    '<li>' +
                                                    '<li class="menu-item" name="facebook-reels" data-connection-id="' + c['id'] + '" data-username="' + c['username'] + '">' +
                                                    '   <a href="' + site_url + '/facebook-reels/?username=' + c['username'] + '"">' +
                                                    '       <span class="profile-pic" style="background-image: url(' + "'" + c['profile_pic_url'] + "'" + ');"></span>' +
                                                            'Reels' +
                                                    '   </a>' +
                                                    '<li>' +
                                                    '<li class="menu-item" name="facebook-videos" data-connection-id="' + c['id'] + '" data-username="' + c['username'] + '">' +
                                                    '   <a href="' + site_url + '/facebook-videos/?username=' + c['username'] + '"">' +
                                                    '       <span class="profile-pic" style="background-image: url(' + "'" + c['profile_pic_url'] + "'" + ');"></span>' +
                                                            'Videos' +
                                                    '   </a>' +
                                                    '<li>';

                                    // append submenu html
                                    $('li[data-social-network=facebook] ul').append($(navHtml));
                                    $('li[data-social-network=facebook] .social-sub-menu').show();

                                    // if we're on a Facebook search page...
                                    if (
                                        (currentPage === 'facebook-photos') || 
                                        (currentPage === 'facebook-reels') || 
                                        (currentPage === 'facebook-videos')
                                    ) {

                                        // get the username from the URL parameters
                                        const thisFacebookUsername = urlParams.get('username');

                                        // set the profile info global variables
                                        if (c['username'] == thisFacebookUsername) {
                                            fb_instagram_business_id = c['instagram_business_id'];
                                            facebook_username = c['username'];
                                            facebook_user_id = c['facebook_user_id'];
                                            facebook_screen_name = c['screen_name'];
                                            facebook_profile_pic_url = c['profile_pic_url'];
                                            facebook_connection_id = c['id'];
                                            facebook_page_access_token = c['facebook_page_access_token'];
                                        }                                    
                                    }
                                }

                                if (c['social_network'] == "instagram") {

                                    ig_facebook_access_token = c['facebook_access_token'];

                                    // create the submenu container
                                    if (num_instagram == 0) {
                                        $('li[data-social-network=instagram]').append('<ul class="social-sub-menu"></ul>');
                                    }
                                    num_instagram++;

                                    // build submenu html
                                    var navHtml =   '<li class="menu-item" name="instagram-profile" data-connection-id="' + c['id'] + '" data-username="' + c['username'] + '">' +
                                                    '   <a href="' + site_url + '/instagram-profile/?username=' + c['username'] + '"">' +
                                                    '       <span class="profile-pic" style="background-image: url(' + "'" + c['profile_pic_url'] + "'" + ');"></span>' +
                                                            "Profile" +
                                                    '   </a>' +
                                                    '<li>' +
                                                    '<li class="menu-item" name="instagram-reels" data-connection-id="' + c['id'] + '" data-username="' + c['username'] + '">' +
                                                    '   <a href="' + site_url + '/instagram-reels/?username=' + c['username'] + '"">' +
                                                    '       <span class="profile-pic" style="background-image: url(' + "'" + c['profile_pic_url'] + "'" + ');"></span>' +
                                                            "Reels" +
                                                    '   </a>' +
                                                    '<li>' +
                                                    '<li class="menu-item" name="instagram-stories" data-connection-id="' + c['id'] + '" data-username="' + c['username'] + '">' +
                                                    '   <a href="' + site_url + '/instagram-stories/?username=' + c['username'] + '"">' +
                                                    '       <span class="profile-pic" style="background-image: url(' + "'" + c['profile_pic_url'] + "'" + ');"></span>' +
                                                            "Stories" +
                                                    '   </a>' +
                                                    '<li>' +
                                                    '<li class="menu-item" name="instagram-tags" data-connection-id="' + c['id'] + '" data-username="' + c['username'] + '">' +
                                                    '   <a href="' + site_url + '/instagram-tags/?username=' + c['username'] + '"">' +
                                                    '       <span class="profile-pic" style="background-image: url(' + "'" + c['profile_pic_url'] + "'" + ');"></span>' +
                                                            "Tagged" +
                                                    '   </a>' +
                                                    '<li>';

                                    // append submenu html
                                    $('li[data-social-network=instagram] ul').append($(navHtml));
                                    $('li[data-social-network=instagram] .social-sub-menu').show();

                                    // if we're on an Instagram search page...
                                    if (
                                        (currentPage === 'instagram-profile') || 
                                        (currentPage === 'instagram-reels') || 
                                        (currentPage === 'instagram-stories') || 
                                        (currentPage === 'instagram-tags')
                                    ) {

                                        // get the username from the URL parameters
                                        const thisInstagramUsername = urlParams.get('username');

                                        // set the profile info global variables
                                        if (c['username'] == thisInstagramUsername) {
                                            ig_instagram_business_id = c['instagram_business_id'];
                                            instagram_username = c['username'];
                                            instagram_screen_name = c['screen_name'];
                                            instagram_profile_pic_url = c['profile_pic_url'];
                                            instagram_connection_id = c['id'];
                                        }       

                                        // temporary fix for Instagram tags page!
                                        setTimeout(function() {
                                            // $('.search-page-header .profile-pic img').attr('src', instagram_profile_pic_url);
                                        }, 2000);
                                    }
                                    
                                    else {
                                        ig_instagram_business_id = c['instagram_business_id'];
                                        instagram_username = c['username'];
                                        instagram_screen_name = c['screen_name'];
                                        instagram_profile_pic_url = c['profile_pic_url'];
                                        instagram_connection_id = c['id'];                                    
                                    }
                                }

                                if (c['social_network'] == "tiktok") {

                                    tiktok_access_token = c['tiktok_access_token'];
                                    tiktok_open_id = c['tiktok_open_id'];
                                    tiktok_connection = true;

                                    $('li[data-social-network=tiktok] .social-sub-menu').show();
                                }

                                if (c['social_network'] == "twitter") {

                                    twitter_oauth_access_token = c['twitter_oauth_access_token'];
                                    twitter_oauth_access_token_secret = c['twitter_oauth_access_token_secret'];
                                    twitter_connection = true;

                                    $('li[data-social-network=twitter]').append('<ul class="social-sub-menu"></ul>');

                                    // build submenu html
                                    var navHtml =   '<li class="menu-item" name="twitter-profile" data-connection-id="' + c['id'] + '">' +
                                                    '   <a href="' + site_url + '/twitter-profile/">' +
                                                    '       <span class="profile-pic" style="background-image: url(' + "'" + c['profile_pic_url'] + "'" + ');"></span>' +
                                                            "Profile" +
                                                    '   </a>' +
                                                    '<li>' +
                                                    '<li class="menu-item" name="twitter-mentions" data-connection-id="' + c['id'] + '">' +
                                                    '   <a href="' + site_url + '/twitter-mentions/">' +
                                                    '       <span class="profile-pic" style="background-image: url(' + "'" + c['profile_pic_url'] + "'" + ');"></span>' +
                                                            "Mentions" +
                                                    '   </a>' +
                                                    '<li>';

                                    // append submenu html
                                    $('li[data-social-network=twitter] ul').append($(navHtml));
                                    $('li[data-social-network=twitter] .social-sub-menu').show();
                                }
                            }
                            if (num_instagram > 0) instagram_connection = true;
                            if (num_facebook > 0) facebook_connection = true;

                            // if we're on a social media subpage, there could be several accounts so several of each subpage
                            if (
                                currentPage.includes("facebook-") || 
                                currentPage.includes("instagram-")
                            ) {
                                // set active menu item
                                $('.sidebar .menu-item[name=' + currentPage + '][data-username=' + urlParams.get('username') + ']').addClass('active');
                            }                            
                        }
                    }
                },
                error: function(errorThrown) {
                    console.log(errorThrown);
                },
                complete: function() {}
            });

		}
    });

}(jQuery));

