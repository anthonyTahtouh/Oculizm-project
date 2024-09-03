<?php

/* Template Name: Admin Settings */

// stop non-admins viewing this page
if(!current_user_can('manage_options')) {
	echo "Unauthorised.";
	return;
}

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>

	<div class="content-block">	
		<h2>Publish All Client Tags</h2>
		<div class="cta-group">
			<a href="#" name="publish-all-tags" class="cta-primary">Publish All Client Tags</a>
		</div>
	</div>

	<div class="content-block">	
		<h2>Reverse Post Order</h2>
		<div class="content-block-description">
			Reverse the order of all posts for this client.
		</div>
		<div class="cta-group">
			<a href='#' class="cta-primary" name="reverse-post-order">Reverse Post Order</a>
		</div>
	</div>

	<div class="content-block">	
		<h2>Update Product Prices</h2>
		<div class="content-block-description">
			Update prices on all your posts to the latest prices in your product feed(s).
		</div>
		<div class="cta-group">
			<a href='#' class="cta-primary" name="update-prices">Update Prices</a>
		</div>
	</div>
</div>

<?php get_footer(); ?>
