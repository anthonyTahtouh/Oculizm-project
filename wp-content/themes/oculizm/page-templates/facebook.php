<?php

/* Template Name: Facebook */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="form-overlay" name="choose-facebook-pages">
	<div class="overlay-bg"></div>
	<div class="overlay-content ">
		<div class="content-block">
			<h2>Select which Facebook pages to authenticate</h2>
			<div class="content-block-description">Choose the Oculizm accounts to assign your Facebook pages to.</div>
			<div class="content-block-body"></div>
			<div class="cta-group">
				<a href='#' data-action="connect-facebook-pages" class="cta-primary">Continue</a>
			</div>
		</div>
		<a href="#" class="close"></a>
	</div>
</div>

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
		<div id ='fblogin'>
			<div class="fb-login-button" data-width="" data-size="small" data-button-type="login_with" data-auto-logout-link="false" data-use-continue-as="false" data-scope="email,read_insights,pages_show_list,pages_read_engagement,pages_manage_metadata,pages_read_user_content,pages_manage_posts,instagram_basic,instagram_manage_comments,instagram_manage_insights" data-onlogin="loginWithFacebook()"></div>
		</div>
	</div>
	
	<div class="content-block" name="social-network-accounts" data-social-network="facebook">
		<h2>Accounts</h2>
	</div>
</div>



<?php get_footer(); ?>
