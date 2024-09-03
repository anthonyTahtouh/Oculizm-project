<?php

/* Template Name: Tracking Tag Integration */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>
	
	<div class="content-block" name="widgets">	
		<div class="content-block-description">
			This sends event information back to Ocuilzm, so you can view performance metrics of the shoppable gallery. It only tracks Oculizm related events. This tag needs to be loaded on every page of your website. If you're using Oculizm for eCommerce,this tag needs to be integrated with your order confirmation process. This tag does not require JQuery.
		</div>
		<div class="form-row" name="tracking-tag">
			<textarea readonly></textarea>
			<a href='#' class="button-copy" ></a>
		</div>
	</div>

</div>

<?php get_footer(); ?>