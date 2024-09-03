<?php

/* Template Name: Content */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>


<div class="main">

	<h1><?php the_title(); ?></h1>
	
	<div class="content-block" name="top-products">
		<h2 class="h2-icon"><span></span>Top Products</h2>
		<div class="content-block-description">
	 		Most shopped products in your shoppable gallery.
		</div>
		<div class="content-block-body">
			<div class="post-grid-container"></div>
		</div>
	</div>
	
	<div class="content-block" name="top-posts">
		<h2 class="h2-icon"><span></span>Top Posts</h2>
		<div class="content-block-description">
			Most popular posts in your shoppable gallery.
		</div>
		<div class="content-block-body">
			<div class="post-grid-container"></div>
		</div>
	</div>
	
	<div class="content-block" name="top-content-creators">
		<h2 class="h2-icon"><span></span>Top Content Creators</h2>
		<div class="content-block-description">
			Most prominent content creators in your shoppable gallery.
		</div>
		<div class="content-block-body">
			<div class="post-grid-container"></div>
		</div>
	</div>
	
	<div class="content-block" name="top-hashtags">
		<h2 class="h2-icon"><span></span>Top Hashtags</h2>
		<div class="content-block-description">
			Most popular hashtags used in your posts.
		</div>
		<div class="content-block-body">
			<div class="post-grid-container"></div>
		</div>
	</div>
	
</div>

<?php get_footer(); ?>
