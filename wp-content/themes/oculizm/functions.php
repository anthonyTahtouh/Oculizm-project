<?php

// enqueue scripts and styles
function my_enqueue_scripts() {

	$theme_dir = get_stylesheet_directory_uri();
	$plugin_dir = plugins_url() . '/oculizm';
	$version = "2.4";

	// CSS components
	wp_register_style( 'admin-menu-css', $theme_dir . '/css/components/admin-menu.css', array(), $version, 'all');
	wp_enqueue_style( 'admin-menu-css' );
	wp_register_style( 'notifications-menu-css', $theme_dir . '/css/components/notifications-menu.css', array(), $version, 'all');
	wp_enqueue_style( 'notifications-menu-css' );
	wp_register_style( 'user-menu-css', $theme_dir . '/css/components/user-menu.css', array(), $version, 'all');
	wp_enqueue_style( 'user-menu-css' );
	wp_register_style( 'sidebar-css', $theme_dir . '/css/components/sidebar.css', array(), $version, 'all');
	wp_enqueue_style( 'sidebar-css' );
	wp_register_style( 'modal-css', $theme_dir . '/css/components/modal.css', array(), $version, 'all');
	wp_enqueue_style( 'modal-css' );
	wp_register_style( 'post-css', $theme_dir . '/css/components/post.css', array(), $version, 'all');
	wp_enqueue_style( 'post-css' );
	wp_register_style( 'pages-css', $theme_dir . '/css/pages.css', array(), $version, 'all');
	wp_enqueue_style( 'pages-css' );

	// JS components

	// Register and enqueue helpers-js script
	wp_register_script( 'helpers-js', $theme_dir . '/js/helpers.js', array('jquery'), false, false );
	wp_enqueue_script( 'helpers-js' );

	// Register and enqueue main-js script with helpers-js as dependency
	wp_register_script( 'main-js', $theme_dir . '/js/main.js', array('jquery', 'helpers-js'), false, false );
	wp_enqueue_script( 'main-js' );

	// Register and enqueue chart-drwaing-js script with helpers-js as dependency
	wp_register_script( 'chart-drwaing-js', $theme_dir . '/js/chart-drwaing.js', array('jquery', 'main-js'), false, false );
	wp_enqueue_script( 'chart-drwaing-js' );

	// Register and enqueue placeholder-js script with main-js as dependency
	wp_register_script( 'chart-js', $theme_dir . '/js/lib/chart.js', array('jquery', 'main-js'), false, true );
	wp_enqueue_script( 'chart-js' );
	wp_register_script( 'placeholder-js', $theme_dir . '/js/placeholder.js', array('jquery','main-js'), false, false );
	wp_enqueue_script( 'placeholder-js' );

	wp_register_script( 'ua-parser-js', $theme_dir . '/js/lib/ua-parser.min.js', array('jquery', 'main-js'), false, true );
	wp_enqueue_script( 'ua-parser-js' );



	wp_register_script( 'connections-js', $theme_dir . '/js/connections.js', array('jquery', 'helpers-js'), false, false );
	wp_enqueue_script( 'connections-js' );
	wp_register_script( 'form-validation-js', $theme_dir . '/js/form-validation.js', array('jquery'), false, false );
	wp_enqueue_script( 'form-validation-js' );

	

	// adblock
	wp_register_script( 'prebid-ads-js', $theme_dir . '/js/lib/adblock.js', array('jquery'), false, false );
	wp_enqueue_script( 'prebid-ads-js' );

	// date time picker
	wp_register_style( 'datetimepicker-css', $theme_dir . '/css/lib/jquery/jquery.datetimepicker.css', array(), $version, 'all');
	wp_enqueue_style( 'datetimepicker-css' );
	wp_register_script( 'datetimepicker-js', $theme_dir . '/js/lib/jquery.datetimepicker.full.min.js', array('jquery'), false, true );
	wp_enqueue_script( 'datetimepicker-js' );

	// moment
	wp_register_script( 'moment-js', $theme_dir . '/js/lib/moment.js', array('jquery', 'main-js'), false, true );
	wp_enqueue_script( 'moment-js' );

	// JQuery UI
	wp_register_script( 'jquery-ui-js', $theme_dir . '/js/lib/jquery-ui.min.js', array('jquery', 'main-js'), false, true );
	wp_enqueue_script( 'jquery-ui-js' ); 
	wp_register_style( 'jquery-ui-css', $theme_dir . '/css/lib/jquery/jquery-ui.min.css', array(), $version, 'all');
	wp_enqueue_style( 'jquery-ui-css' );

	// cropper
	wp_register_style( 'cropper-css', $theme_dir . '/css/lib/cropperjs.min.css', array(), $version, 'all' );
	wp_enqueue_style( 'cropper-css' );
	wp_register_script( 'cropper-js', $theme_dir . '/js/lib/cropperjs.min.js', array(), false, true );
	wp_enqueue_script( 'cropper-js' );
	wp_register_script( 'cropper-component-js', $theme_dir . '/js/cropper.js', array('jquery', 'main-js'), false, true );
	wp_enqueue_script( 'cropper-component-js' );

	// highlight in textaera
	// wp_register_style( 'hit-css', $theme_dir . '/js/lib/highlight-in-textarea/highlight-in-textarea.css', array(), $version, 'all');
	// wp_enqueue_style( 'hit-css' );
	// wp_register_script( 'hit-js', $theme_dir . '/js/lib/highlight-in-textarea/highlight-in-textarea.js', array(), false, true );
	// wp_enqueue_script( 'hit-js' );
	







	// Summary
	if (is_page('summary')) {
		wp_register_script( 'touch-punch-js', $theme_dir . '/js/lib/jquery-ui-touch-punch.min.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'touch-punch-js' );
		wp_register_script( 'charts-js', 'https://www.gstatic.com/charts/loader.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'charts-js' );
		wp_register_script( 'summary-js', $theme_dir . '/js/summary.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'summary-js' );
	}

	// Sales
	if (is_page('sales')) {
		wp_register_script( 'touch-punch-js', $theme_dir . '/js/lib/jquery-ui-touch-punch.min.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'touch-punch-js' );
		wp_register_script( 'charts-js', 'https://www.gstatic.com/charts/loader.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'charts-js' );
		wp_register_script( 'sales-js', $theme_dir . '/js/sales.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'sales-js' );
	}

	// Content
	if (is_page('content')) {
		wp_register_script( 'touch-punch-js', $theme_dir . '/js/lib/jquery-ui-touch-punch.min.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'touch-punch-js' );
		wp_register_script( 'content-js', $theme_dir . '/js/content.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'content-js' );
	}

	// Orders
	if (is_page('orders')) {
		wp_register_script( 'touch-punch-js', $theme_dir . '/js/lib/jquery-ui-touch-punch.min.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'touch-punch-js' );
		wp_register_script( 'orders-js', $theme_dir . '/js/orders.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'orders-js' );
	}





	// All Posts
	if (is_page('all-posts')) {
		wp_register_script( 'all-posts-js', $theme_dir . '/js/all-posts.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'all-posts-js' );
	}

	// Galleries
	if (is_page('galleries')) {
		wp_register_script( 'sortable-js', 'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.14.0/Sortable.min.js', array(), false, true );
    	wp_enqueue_script( 'sortable-js' );

		wp_register_script( 'galleries-js', $theme_dir . '/js/galleries.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'galleries-js' );
	}







	// Instagram
	if (is_page('instagram')) {
		wp_register_script( 'instagram-js', $theme_dir . '/js/instagram.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'instagram-js' );
		wp_register_script( 'social-network-js', $theme_dir . '/js/social-network.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'social-network-js' );
	}

	// Instagram subpages
	if (is_page('instagram-profile') ||
		is_page('instagram-tags') ||
		is_page('instagram-reels') ||
		is_page('instagram-stories') ||
		is_page('instagram-user') ||
		is_page('instagram-hashtag')) {
		wp_register_script( 'product-matcher-js', $theme_dir . '/js/product-matcher.js', array('jquery'), false, true );
		wp_enqueue_script( 'product-matcher-js' );
		wp_register_script( 'post-js', $theme_dir . '/js/post.js', array('jquery', 'main-js', 'product-matcher-js'), false, true );
		wp_enqueue_script( 'post-js' );
		wp_register_script( 'network-posts-js', $theme_dir . '/js/network-posts.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'network-posts-js' );
		wp_register_script( 'instagram-posts-js', $theme_dir . '/js/instagram-posts.js', array('jquery', 'main-js', 'network-posts-js'), false, true );
		wp_enqueue_script( 'instagram-posts-js' );
	}

	// Facebook
	if (is_page('facebook')) {
	    wp_register_script( 'facebook-js', $theme_dir . '/js/facebook.js', array('jquery', 'main-js'), false, true );
	    wp_enqueue_script( 'facebook-js' );
		wp_register_script( 'social-network-js', $theme_dir . '/js/social-network.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'social-network-js' );
	}
	// Facebook subpages
	if (is_page('facebook-photos') ||
		is_page('facebook-videos') ||
		is_page('facebook-reels')) {
		wp_register_script( 'product-matcher-js', $theme_dir . '/js/product-matcher.js', array('jquery'), false, true );
		wp_enqueue_script( 'product-matcher-js' );
		wp_register_script( 'post-js', $theme_dir . '/js/post.js', array('jquery', 'main-js', 'product-matcher-js'), false, true );
		wp_enqueue_script( 'post-js' );
		wp_register_script( 'network-posts-js', $theme_dir . '/js/network-posts.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'network-posts-js' );
	    wp_register_script( 'facebook-posts-js', $theme_dir . '/js/facebook-posts.js', array('jquery', 'main-js'), false, true );
	    wp_enqueue_script( 'facebook-posts-js' );
	}

	// X
	if (is_page('twitter')) {
		wp_register_script( 'twitter-js', $theme_dir . '/js/twitter.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'twitter-js' );
		wp_register_script( 'social-network-js', $theme_dir . '/js/social-network.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'social-network-js' );
	}
	// X subpages
	if (is_page('twitter-profile') || is_page('twitter-mentions') || is_page('twitter-user') || is_page('twitter-hashtag')) {
		wp_register_script( 'product-matcher-js', $theme_dir . '/js/product-matcher.js', array('jquery'), false, true );
		wp_enqueue_script( 'product-matcher-js' );
		wp_register_script( 'post-js', $theme_dir . '/js/post.js', array('jquery', 'main-js', 'product-matcher-js'), false, true );
		wp_enqueue_script( 'post-js' );
		wp_register_script( 'network-posts-js', $theme_dir . '/js/network-posts.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'network-posts-js' );
		wp_register_script( 'twitter-posts-js', $theme_dir . '/js/twitter-posts.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'twitter-posts-js' );
	}

	// TikTok
	if (is_page('tiktok')) {
		wp_register_script( 'tiktok-js', $theme_dir . '/js/tiktok.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'tiktok-js' );
		wp_register_script( 'social-network-js', $theme_dir . '/js/social-network.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'social-network-js' );
	}
	// TikTok subpages
	if (is_page('tiktok-profile')) {
		wp_register_script( 'network-posts-js', $theme_dir . '/js/network-posts.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'network-posts-js' );
		wp_register_script( 'tiktok-posts-js', $theme_dir . '/js/tiktok-posts.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'tiktok-posts-js' );
		wp_register_script( 'post-js', $theme_dir . '/js/post.js', array('jquery', 'main-js', 'product-matcher-js'), false, true );
		wp_enqueue_script( 'post-js' );
	}

	// Upload
	if (is_page('upload')) {
		wp_register_script( 'upload-js', $theme_dir . '/js/upload.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'upload-js' );
		wp_register_script( 'product-matcher-js', $theme_dir . '/js/product-matcher.js', array('jquery'), false, true );
		wp_enqueue_script( 'product-matcher-js' );
	}





	// All Products
	if (is_page('all-products')) {
		wp_register_script( 'all-products-js', $theme_dir . '/js/all-products.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'all-products-js' );
		wp_register_script( 'product-matcher-js', $theme_dir . '/js/product-matcher.js', array('jquery'), false, true );
		wp_enqueue_script( 'product-matcher-js' );
	}

	// Product Feeds
	if (is_page('product-feeds')) {
		wp_register_script( 'product-feeds-js', $theme_dir . '/js/product-feeds.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'product-feeds-js' );
	}






	// Review Moderation
	if (is_page('review-moderation')) {
		wp_register_script( 'review-moderation-js', $theme_dir . '/js/review-moderation.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'review-moderation-js' );
	}

	// Reviews Summary
	if (is_page('reviews-summary')) {
		// wp_register_script( 'chart-js', $theme_dir . '/js/lib/chart.js', array('jquery', 'main-js'), false, true );
	    // wp_enqueue_script( 'chart-js' );
		wp_register_script( 'reviews-summary-js', $theme_dir . '/js/reviews-summary.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'reviews-summary-js' );
	}
	






	
	// Shoppable UGC Widgets
	if (is_page('shoppable-ugc-widgets')) {
		wp_register_script( 'shoppable-ugc-widgets-js', $theme_dir . '/js/shoppable-ugc-widgets.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'shoppable-ugc-widgets-js' );
	}

	// Reviews Widget Integration page
	if (is_page('reviews-widget-integration')) {
		wp_register_script( 'reviews-tag-js', $theme_dir . '/js/reviews-widget-integration.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'reviews-tag-js' );
	}

	// Tracking Tag Integration page
	if (is_page('tracking-tag-integration')) {
		wp_register_script( 'tracking-tag-js', $theme_dir . '/js/tracking-tag-integration.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'tracking-tag-js' );
	}

	// Email Integration page
	if (is_page('email-integration')) {
		wp_register_script( 'email-integration-js', $theme_dir . '/js/email-integration.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'email-integration-js' );
	}






	// Shoppable UGC Settings
	if (is_page('shoppable-ugc-settings')) {
		wp_register_script( 'shoppable-ugc-settings-js', $theme_dir . '/js/shoppable-ugc-settings.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'shoppable-ugc-settings-js' );
	}

	// Reviews Settings
	if (is_page('reviews-settings')) {
		wp_register_script( 'reviews-settings-js', $theme_dir . '/js/reviews-settings.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'reviews-settings-js' );
	}




	// Account
	if (is_page('account')) {
		wp_register_script( 'account-js', $theme_dir . '/js/account.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'account-js' );
	}

	// Support
	if (is_page('support')) {
		wp_register_script( 'support-js', $theme_dir . '/js/support.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'support-js' );
	}
	
	// Manage Clients
	if (is_page('manage-clients')) {
		wp_register_style( 'tablesorter-css', $theme_dir . '/css/lib/jquery/jquery.tablesorter.css', array(), $version, 'all');
		wp_enqueue_style( 'tablesorter-css' );
	    wp_register_script( 'tablesorter-js', $theme_dir . '/js/lib/jquery.tablesorter.js', array('jquery', 'main-js'), false, true );
	    wp_enqueue_script( 'tablesorter-js' );
	    wp_register_script( 'manage-clients-js', $theme_dir . '/js/manage-clients.js', array('jquery', 'main-js'), false, true );
	    wp_enqueue_script( 'manage-clients-js' );
	}
	
	// Manage Client CSS
	if (is_page('manage-client-css')) {
		wp_register_style( 'tablesorter-css', $theme_dir . '/css/lib/jquery/jquery.tablesorter.css', array(), $version, 'all');
		wp_enqueue_style( 'tablesorter-css' );
	    wp_register_script( 'tablesorter-js', $theme_dir . '/js/lib/jquery.tablesorter.js', array('jquery', 'main-js'), false, true );
	    wp_enqueue_script( 'tablesorter-js' );
	    wp_register_script( 'manage-client-css-js', $theme_dir . '/js/manage-client-css.js', array('jquery', 'main-js'), false, true );
	    wp_enqueue_script( 'manage-client-css-js' );
	}
	
	// Manage Client Events
	if (is_page('manage-client-events')) {
		wp_register_style( 'tablesorter-css', $theme_dir . '/css/lib/jquery/jquery.tablesorter.css', array(), $version, 'all');
		wp_enqueue_style( 'tablesorter-css' );
	    wp_register_script( 'tablesorter-js', $theme_dir . '/js/lib/jquery.tablesorter.js', array('jquery', 'main-js'), false, true );
	    wp_enqueue_script( 'tablesorter-js' );
	    wp_register_script( 'manage-client-events-js', $theme_dir . '/js/manage-client-events.js', array('jquery', 'main-js'), false, true );
	    wp_enqueue_script( 'manage-client-events-js' );
	}

	// Logs
	if (is_page('logs')) {
		wp_register_script( 'logs-js', $theme_dir . '/js/logs.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'logs-js' );
	}
	
	// Settings
	if (is_page('admin-settings')) {
		wp_register_script( 'settings-js', $theme_dir . '/js/settings.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'settings-js' );
	}








	// Edit Post
	if (is_page('edit-post')) {
		wp_register_script( 'product-matcher-js', $theme_dir . '/js/product-matcher.js', array('jquery'), null, true );
		wp_enqueue_script( 'product-matcher-js' );
		wp_register_script( 'post-js', $theme_dir . '/js/post.js', array('jquery', 'main-js', 'product-matcher-js'), false, true );
		wp_enqueue_script( 'post-js' );
	}

	// Signup
	if (is_page('signup')) {
		wp_register_style( 'signup-css', $theme_dir . '/css/signup.css', array(), $version, 'all');
		wp_enqueue_style( 'signup-css' );
		wp_register_script( 'signup-js', $theme_dir . '/js/signup.js', array('jquery'), null, true );
		wp_enqueue_script( 'signup-js' );
	}

	// Test
	if (is_page('test')) {
		wp_register_script( 'test-js', $theme_dir . '/js/test.js', array('jquery', 'main-js'), false, true );
		wp_enqueue_script( 'test-js' );
	}








	// stylesheets
	wp_enqueue_style( 'default', get_stylesheet_uri() );
	wp_register_style( 'reset', $theme_dir . '/css/reset.css', array(), $version, 'all');
	wp_enqueue_style( 'reset' );
	wp_register_style( 'main', $theme_dir . '/css/main.css', array(), null, 'all');
	wp_enqueue_style( 'main' );
	wp_register_style( 'icons', $theme_dir . '/css/icons.css', array(), $version, 'all');
	wp_enqueue_style( 'icons' );
	wp_register_style( 'admin-css', $theme_dir . '/css/admin.css', array(), $version, 'all');
	wp_enqueue_style( 'admin-css' );
	wp_register_style( 'social-networks-css', $theme_dir . '/css/social-networks.css', array(), $version, 'all');
	wp_enqueue_style( 'social-networks-css' );
	// wp_register_style( 'responsive', $theme_dir . '/css/responsive.css', array(), $version, 'all');
	// wp_enqueue_style( 'responsive' );
}
add_action('wp_enqueue_scripts', 'my_enqueue_scripts');












// add title tag to wp_header output
add_theme_support( 'title-tag' );

// add post thumbnail support
add_theme_support( 'post-thumbnails' );

// add menus support
add_theme_support( 'menus' );

// handle CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
	$http_origin = $_SERVER['HTTP_ORIGIN'];
    header("Access-Control-Allow-Origin: $http_origin");
    header("Access-Control-Allow-Credentials: true");
}

// set the API URL prefix
add_filter('rest_url_prefix', 'rest_url_prefix');
function rest_url_prefix( ) {
	return 'api';
}

// disable paragraph tag wrapping
function filter_ptags_on_images($content) {
    return preg_replace('/<p>\\s*?(<a .*?><img.*?><\\/a>|<img.*?>)?\\s*<\\/p>/s', '\1', $content);
}
add_filter('the_content', 'filter_ptags_on_images');


// attach a class to linked images' parent anchors
function give_linked_images_class($html, $id, $caption, $title, $align, $url, $size, $alt = '' ){
  $classes = 'lightbox-link'; // separated by spaces, e.g. 'img image-link'

  // check if there are already classes assigned to the anchor
  if ( preg_match('/<a.*? class=".*?">/', $html) ) {
    $html = preg_replace('/(<a.*? class=".*?)(".*?>)/', '$1 ' . $classes . '$2', $html);
  } else {
    $html = preg_replace('/(<a.*?)>/', '$1 class="' . $classes . '" >', $html);
  }
  return $html;
}
add_filter('image_send_to_editor','give_linked_images_class',10,8);


// set max content width
if (!isset($content_width)) $content_width = 900;

// remove the admin bar
add_action( 'admin_print_scripts-profile.php', 'hide_admin_bar_prefs' );
function hide_admin_bar_prefs() { 
	?>
		<style type="text/css">
			.show-admin-bar {display: none;}
		</style>
	<?php
}
add_filter('show_admin_bar', '__return_false');

// get user role - to add to body class later
function get_user_role() {
    global $current_user;
    $user_roles = $current_user->roles;
    $user_role = array_shift($user_roles);
    return $user_role;
}
add_filter('body_class','my_class_names');
function my_class_names($classes) {
    $classes[] = get_user_role();
    return $classes;
}

/* set image sizes */
update_option( 'thumbnail_size_w', 300 );
update_option( 'thumbnail_size_h', 300 );
update_option( 'medium_size_w', 600 );
update_option( 'medium_size_h', 600 );
update_option( 'large_size_w', 1024 );
update_option( 'large_size_h', 1024 );


add_action('admin_head', 'my_custom_fonts');
function my_custom_fonts() {
	echo 	'<style>' .
			'	.edit-post-meta-boxes-area .postbox { max-width: 800px; overflow-x: scroll; }' .
			'</style>';
}


// enqueue login page stylesheet
function custom_admin_css() {
    wp_enqueue_style( 'login_css', get_template_directory_uri() . '/css/login.css', array(), filemtime( get_template_directory() . '/css/login.css' ) );
}
add_action( 'login_enqueue_scripts', 'custom_admin_css', 10 );


// record last login time
function set_last_login($login) {
	$user = get_user_by('login', $login);
	$curent_login_time = get_user_meta(	$user->ID , 'current_login', true);
	if (!empty($curent_login_time)){
		update_user_meta( $user->ID, 'last_login', $curent_login_time );
		update_user_meta( $user->ID, 'current_login', current_time('mysql') );
	} else {
		update_user_meta( $user->ID, 'current_login', current_time('mysql') );
		update_user_meta( $user->ID, 'last_login', current_time('mysql') );
	}
}
add_action('wp_login', 'set_last_login');


// restrict admin access for non-admin users
add_action('admin_init', function () {
    if (wp_doing_ajax() || ! is_user_logged_in()) {
        return;
    }
    $roles = (array) wp_get_current_user()->roles;
    if (!in_array( 'administrator', $roles ) ) {
        wp_die('Illegal access request');
    }
});


// fixes title tag for custom homepage
add_filter( 'wp_title', 'set_my_title' );
function set_my_title( $title ) {
	if (empty($title)) return $title . get_bloginfo( 'name' );
	else if (is_home()) return "Home | " . get_bloginfo( 'name' );
	return $title . get_bloginfo( 'name' );
}


// redirect user on successful login
function my_login_redirect($redirect_to, $request, $user) {
	return site_url('/summary/');
}
add_filter('login_redirect', 'my_login_redirect', 10, 3 );


// extend WP_Query filter functionality (see https://gist.github.com/keesiemeijer/4643765)
function add_new_query_vars($public_query_vars) {
	$public_query_vars[] = 'posts_fields';
	$public_query_vars[] = 'posts_join';
	$public_query_vars[] = 'posts_where';
	$public_query_vars[] = 'posts_orderby';
	$public_query_vars[] = 'page_num'; // We're now using this instead of "page" but it doesn't appear we need any of these!
	$public_query_vars[] = 'post_id'; // need this for the Edit Post page
	$public_query_vars[] = 'gallery_id'; // need this for the Gallery page
	$public_query_vars[] = 'product_id'; // need this for the Product Widget Preview page
	$public_query_vars[] = 'search_id'; // need this for the Search / Search Single page
	$public_query_vars[] = 'code'; // need this for the Instagram authentication process
	$public_query_vars[] = 'oauth_token'; // need this for the Twitter authentication process
	$public_query_vars[] = 'oauth_verifier'; // need this for the Twitter authentication process
	$public_query_vars[] = 'username'; // social network submenu pages
	return $public_query_vars;
}
function new_posts_fields ($fields) {
	// Make sure there is a leading comma
	$new_fields = get_query_var('posts_fields');
	if ($new_fields) $fields .= (preg_match('/^(\s+)?,/', $new_fields)) ? $new_fields : ", $new_fields";
	return $fields;
}
function new_posts_join ($join) {
	$new_join = get_query_var('posts_join');
	if ($new_join) $join .= ' ' . $new_join;
	return $join;
}
function new_posts_where ($where) {
	$new_where = get_query_var('posts_where');
	if ($new_where) $where .= ' ' . $new_where;
	return $where;
}
function new_posts_orderby ($orderby) {
	$new_orderby = get_query_var('posts_orderby');
	if ($new_orderby) $orderby = $new_orderby;
	return $orderby;
}
add_filter('query_vars', 'add_new_query_vars');
add_filter('posts_fields','new_posts_fields');
add_filter('posts_join','new_posts_join');
add_filter('posts_where','new_posts_where');
add_filter('posts_orderby','new_posts_orderby');


add_action('user_register', 'create_client_after_user_registration', 10, 1);
function create_client_after_user_registration($user_id) {

    // Check if the user registration is associated with the desired form
    if (isset($_POST['form_id']) && $_POST['form_id'] === '67693') {
        // Retrieve the user data
        $user = get_userdata($user_id);
        
        // Extract necessary user details
        $username = $user->user_login;
        $first_name = $user->first_name;
        $last_name = $user->last_name;
        $email = $user->user_email;
        $user_id = $user->ID;
        
        // // Create a new client using the user details from registration page
        $client_id = create_client($username, $first_name, $last_name, $email ,$user_id);
    }
}

function create_client($username, $first_name, $last_name, $email, $user_id) {
	
    global $wpdb;

    // check if we have the same client name in the database
    $Client_name_check = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE name = '$username'", ARRAY_A);
    if ($Client_name_check) {
        echo json_encode("Client Name already exists");
        die();
    }

    // generate a new client ID that doesn't match an existing client ID
    do {
        $id = rand(10000, 99999);
        $res = $wpdb->get_results("SELECT id FROM oculizm_clients WHERE id = '$id'");
    } while (count($res) > 0);

    // add the new client
    $wpdb->query("INSERT INTO oculizm_clients (`id`,`name`) VALUES ('$id','$username');");
    $client_id = $wpdb->insert_id;

	if ($client_id) {

		// set client ID
		add_user_meta($user_id, 'client_id', $client_id, false );

		// add gallery
		$gallery_name = stripcslashes($username);
		$gallery_description = "";
		add_gallery_internal($client_id, $gallery_name);
	}

    // Return the client ID or any relevant information
    return $client_id;
}






