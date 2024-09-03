<?php

/* Template Name: Edit Post */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
<?php
    // if this was a gallery page...
	if (isset($referer)) {
    	if (strpos($referer, 'gallery')) echo '<a href="' . $referer . '" class="nav-left"><span class="chevron-left"></span>Back to gallery</a>';
    }
?>
	<h1><?php the_title(); ?></h1>

<?php 
	if (current_user_can('administrator')) {
		echo '<a href="' . site_url() . '/wp-admin/post.php?post=' . $post_id . '&action=edit" class="header-button" data-action="admin-edit-post">Admin Edit</a>';
	}
?>

	<?php include(STYLESHEETPATH . '/inc/post-form.php'); ?>

<?php

    // if this was a gallery page...
	if (isset($referer)) {
		if (strpos($referer, 'gallery')) echo '<a href="' . $referer . '" class="nav-left"><span class="chevron-left"></span>Back to gallery</a>';
	};
?>
</div>

<?php get_footer(); ?>
