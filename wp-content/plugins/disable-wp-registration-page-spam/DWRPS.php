<?php
/**
 * Plugin Name: Disable WP Registration Page Spam
 * Plugin URI: 
 * Text Domain: disable-wp-registration-page-spam
 * Domain Path: /languages
 * Description: Disable default WordPress registration page, remove register link and stop registration spam, without disabling user registration.
 * Version: 1.0.1
 * Author: Subodh Ghulaxe
 * Author URI: http://www.subodhghulaxe.com
 */

add_action('init', 'dwrps_redirect_registration_page');

function dwrps_redirect_registration_page() {
  if (isset($_GET['action']) && $_GET['action'] == 'register') {
    ob_start();
    wp_redirect(wp_login_url());
    ob_clean();
  }
}

add_filter('option_users_can_register', function ($value) {
  $script = basename(parse_url($_SERVER['SCRIPT_NAME'], PHP_URL_PATH));

  if ($script == 'wp-login.php') {
    $value = false;
  }

  if (isset($_GET['action']) && $_GET['action'] == 'register') {
    $value = true;
  }

  return $value;
});
