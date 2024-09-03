<?php

/* Template Name: Signup */

get_header(); 

// require_once(STYLESHEETPATH . '/inc/site-header.php');
// require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="signup-page">
	<div class="corp-header">
		<div class="corp-header-inner">
			<a href="https://oculizm.com/" class="register-oculizm-logo"></a>
		</div>
	</div>
	<div class="content-block">
	 	<?php echo do_shortcode('[forminator_form id="67693"]'); ?>
	</div>
</div>



<?php get_footer(); ?>
