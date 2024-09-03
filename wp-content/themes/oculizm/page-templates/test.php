<?php

/* Template Name: Test */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>
	
	<div class="content-block">
	</div>
</div>

<?php get_footer(); ?>
