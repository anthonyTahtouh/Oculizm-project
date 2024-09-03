<?php

/* Template Name: TikTok */

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
			<div class="cta-group">
				<a class="cta-primary tiktok-login-button" href='<?php echo $root; ?>/tiktok-auth-callback/'><i>&nbsp;</i>Sign in with TikTok</a>
			</div>
		</div>
	</div>	

	<div class="content-block" name="social-network-accounts" data-social-network="tiktok">
		<h2>Accounts</h2>
	</div>
</div>



<?php get_footer(); ?>
