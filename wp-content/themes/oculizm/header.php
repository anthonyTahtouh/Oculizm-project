<?php 

global $current_user;

// $login_page  = home_url('/login/');
// if (!is_user_logged_in()) wp_redirect($login_page);

if (!is_user_logged_in()) {
    if (
        !empty($_SERVER['HTTPS']) &&
        $_SERVER['HTTPS'] === 'on' &&
        (
            $_SERVER['REQUEST_URI'] === '/signup/' ||
            $_SERVER['REQUEST_URI'] === '/signup'
        )
    ) {
        // Don't redirect
    } else {
        auth_redirect();
    }
}

?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,600,700,800' rel='stylesheet' type='text/css'>
<title><?php wp_title('|', true, 'right'); ?></title>
<?php wp_head(); ?>

<?php
    // we have to rewrite the get_client_id() function here because plugin functions aren't available in header.php
    global $current_user;
    wp_get_current_user();
    $user_id = $current_user->ID; 
    if ($user_id !== null) $client_id = get_field('client_id', 'user_' . $user_id);

    // global variables
    global $template;
    $page_template = basename($template); // returns e.g. instagram-tags.php
    $referer = wp_get_referer();
    $post_id = get_query_var('post_id');
?>

</head>

<body <?php body_class(get_user_role());?> data-client-id="<?php echo $client_id; ?>">

    <div id="fb-root"></div>

    <script>

        // Facebook variables
        var facebook_api_version = "<?php echo $GLOBALS['facebook_api_version']; ?>";
        var facebook_app_id = "<?php echo $GLOBALS['facebook_app_id']; ?>";
        var fb_loaded = false;

        // Use the Facebook test app if this is the Facebook Reviewer client
        // <?php if ($client_id == "71948") { ?>
        // var facebook_app_id = "<?php echo $GLOBALS['facebook_app_id_test']; ?>";
        // <?php } ?>

        // init Facebook SDK
        window.fbAsyncInit = function() {
            FB.init({
                appId: facebook_app_id,
                cookie: true,
                xfbml: true,
                version: facebook_api_version
            });
            fb_loaded = true;
        };

        // load Facebook SDK asynchronously
        (function(d){
         var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
         if (d.getElementById(id)) {return;}
         js = d.createElement('script'); js.id = id; js.async = true;
         js.src = "//connect.facebook.net/en_US/all.js";
         ref.parentNode.insertBefore(js, ref);
        }(document));
    </script>

    <script>
        // global variables
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ];

        // session variables
        var site_url = "<?php echo site_url(); ?>";
        var ajaxUrl = "<?php echo admin_url('admin-ajax.php'); ?>";
        var clientID = "<?php echo $client_id; ?>";

        // page variables
        var referer = "<?php echo wp_get_referer(); ?>";
        var page_template = "<?php echo $page_template; ?>";

        // query variables
        var post_id = "<?php echo get_query_var('post_id'); ?>";
        var gallery_id = "<?php echo get_query_var('gallery_id'); ?>";
        var page_num = "<?php echo get_query_var('page_num'); ?>";
        if (!page_num) page_num = 1;
        var search_id = "<?php echo get_query_var('search_id'); ?>";
    </script>

<?php
if (str_starts_with($page_template, "facebook-videos") || str_starts_with($page_template, "instagram-hashtag") || str_starts_with($page_template, "social-network-search")) {
?>
    <div class="form-overlay" name="post-form-overlay">
        <div class="overlay-bg"></div>
        <div class="overlay-content">
            <?php include(STYLESHEETPATH . '/inc/post-form.php'); ?>
            <a href="#" class="close"></a>
        </div>
    </div>
<?php
}
?>
    <div class="wrapper">

        <div class="popup-overlay">
            <div class="overlay-bg"></div>
            <div class="overlay-content">
                <div class="popup-text"></div>
                <div class="cta-group"></div>
            </div>
        </div>

        <div class="loading-overlay">
            <div class="overlay-bg"></div>
            <div class="overlay-content">
                <div class="loader"></div>
            </div>
        </div>
