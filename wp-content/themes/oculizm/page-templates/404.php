<?php

/* Template Name: 404 */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>

	<div class="content-block">
		<div class="content-block-description">Page not found</div>
		<div class="content-block-body"></div>
    </div>
</div>


<?php get_footer(); ?>
