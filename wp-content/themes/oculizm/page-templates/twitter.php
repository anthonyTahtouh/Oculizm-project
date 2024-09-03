<?php

/* Template Name: Twitter */

/* TWITTER AUTH STEP THREE */
// Twitter redirects the user back to this page supplying 'oauth_token' and 'oauth_verifier' parameters
$oauth_token = get_query_var('oauth_token');
$oauth_verifier = get_query_var('oauth_verifier');
if (ISSET($oauth_token) && ISSET($oauth_verifier)) {
	if (($oauth_token != "") && ($oauth_verifier != "")) {

		global $wpdb;

		// get all connections (all clients)
	    $connections = $wpdb->get_results("SELECT * FROM oculizm_connections", ARRAY_A);

	    // find the client whose oauth_token matches the one we just received
	    foreach ($connections as $c) {
	        if ($c != null) {
	            if ($c['twitter_oauth_access_token'] == $oauth_token) {

				    // send to plugin for final step
				    $twitter_complete = exchange_twitter_token($oauth_token, $oauth_verifier);

				    // SUCCESS
				    if (isset($twitter_complete['oauth_token'])) {}

				    // ERROR
				    else {}

				    break;
				}
	        }
	    }
	}
}

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>
	
	<div class="page-header">
		<div class="social-search">
			<input type="text" class="social-search" placeholder="Type a @username or #hashtag...">
			<div class="results-box">
				<div class="loader"></div>
				<div class="results-list"></div>
			</div>
		</div>
	</div>
	
	<div class="content-block" name="offline">
		<div class="content-block-description">
			No account detected.
		</div>
		<div class="cta-group">
			<a class="twitter-login-button" href="#"><i>&nbsp;</i>Sign in with X</a>
		</div>
	</div>
	
	<div class="content-block" name="social-network-accounts" data-social-network="twitter">
		<h2>Accounts</h2>
	</div>
	
	<div class="content-block" name="saved-searches">
		<h2>Saved Searches</h2>
		<div class="content-block-body"></div>
	</div>
</div>

<?php get_footer(); ?>
