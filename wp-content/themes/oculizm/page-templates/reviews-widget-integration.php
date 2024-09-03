<?php

/* Template Name: Reviews Widget Integration */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>
	
	<div class="content-block" name="widgets">	
		<div class="content-block-description">
			This is the tag which displays the reviews that have been collected for your site and products. This tag needs to be loaded on the page where you'd like the reviews to appear. All tags use JQuery and so must be loaded after your own JQuery library is initialised.
		</div>
		<div class="form-row" name="reviews-tag">
			<textarea readonly class="big-textarea"></textarea>
			<a href='#' class="button-copy" ></a>
		</div>
	</div>


</div>

<?php get_footer(); ?>