<?php

/* 404 page template */

wp_redirect(home_url());

get_header(); 

	require_once(STYLESHEETPATH . '/inc/site-header.php');
	require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1>Page not found!</h1>
	<div>Please select a page from the menu on the left.</div>

</div>

<?php get_footer(); ?>
