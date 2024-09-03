<?php

/* Template Name: Sales */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>


<div class="main">

	<h1><?php the_title(); ?></h1>
	
	<div class="content-block chart-container" name="orders">
		<h2 class="h2-icon"><span></span>Assisted Orders</h2>
		<div class="content-block-description">
			Number of orders where the journey was influenced by user generated content (UGC).
		</div>
		<div class="content-block-body">
			<div class="tabs" name="ordersByRegion">
				<div class="tab-headers"></div>
				<div class="tab-bodies"></div>
			</div>
		</div>
	</div>

	<div class="content-block chart-container" name="revenue">
		<h2 class="h2-icon"><span></span>Assisted Sales</h2>
		<div class="content-block-description">
		Sales value of orders where the journey was influenced by user generated content (UGC).
		</div>
		<div class="content-block-body">
			<div class="tabs" name="revenueByRegion">
				<div class="tab-headers"></div>
				<div class="tab-bodies"></div>
			</div>
		</div>
	</div>
	
</div>

<?php get_footer(); ?>
