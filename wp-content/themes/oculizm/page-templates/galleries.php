<?php

/* Template Name: Galleries */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="form-overlay" name="add-gallery">
	<div class="overlay-bg"></div>
	<div class="overlay-content ">
		<div class="content-block">
			<h2>Add Gallery</h2>
			<div class="form-row" name="gallery-name">
				<div class="form-label">Gallery Name:</div>
				<input type="text">
			</div>
			<div class="cta-group">
				<a href='#' name="add-new-gallery" class="cta-primary">Add Gallery</a>
			</div>
		</div>
		<a href="#" class="close"></a>
	</div>
</div>

<div class="form-overlay" name="edit-gallery">
	<div class="overlay-bg"></div>
	<div class="overlay-content ">
		<div class="content-block">
			<h2>Edit Gallery</h2>
			<div class="form-row" name="gallery-id">
				<div class="form-label">Gallery ID:</div>
				<input type="text" readonly>
			</div>
			<div class="form-row" name="gallery-name">
				<div class="form-label">Gallery name:</div>
				<input type="text">
			</div>
			<div class="cta-group">
				<a href='#' name="save-gallery" class="cta-primary">Save</a>
			</div>
		</div>
		<div class="content-block" name="delete-gallery">
			<a data-action="delete-gallery" class="red" href="#">Delete gallery</a>
		</div>
		<a href="#" class="close"></a>
	</div>
</div>

<div class="form-overlay" name="gallery-ordering">
	<div class="overlay-bg"></div>
	<div class="overlay-content" name="draggable-posts-overlay-content">
		<div class="content-block" name="draggable-posts">
		</div>
		<div class="cta-group">
				<a href='#' name="save-order" class="cta-primary" style="display: none;">Save Changes</a>
				<a href='#' name="cancel-order" class="cta-secondary" style="display: none;">Cancel Changes</a>
			</div>
		<a href="#" class="close"></a>
	</div>
</div>

<div class="main">
	<h1><?php the_title(); ?></h1>
	
	<a href='#' class="header-button button-add-gallery">Add Gallery</a>
</div>

<?php get_footer(); ?>
