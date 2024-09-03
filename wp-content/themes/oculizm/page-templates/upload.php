<?php

/* Template Name: Upload */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1>Add Post Manually</h1>
	<div class="content-block" name="add-media">
		<h2>Add media</h2>
		<div class="content-block-description">
			Choose an image or video to add to your new post by dragging it into the dropzone or selecting it manually.
		</div>
		<div class="upload-form">
			<div class="dropzone" name="dropzone"></div>
			<input type="file" name="files[]" class="file-chooser">
			<input type="hidden" name="ajax" value="1">
		</div>
	</div>
	<?php include(STYLESHEETPATH . '/inc/post-form.php'); ?>
</div>

<?php get_footer(); ?>
