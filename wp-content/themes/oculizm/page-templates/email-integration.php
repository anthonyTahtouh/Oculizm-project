<?php

/* Template Name: Email Integration */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>

	<div class="content-block">
		<!-- <h2>Email Options</h2> -->
		<label for="gallery-select">Gallery:</label>
		<select name="gallery-select"></select>
		<div class="content-block-body">
			<div class="form-row">
				<h3>Email Preview</h3>
				<p>Here is how your shoppable gallery might look when included in an email.</p>
				<div class="preview-area" name="html-email"></div>
			</div>
			<div class="form-row" name="html-email">
				<h3>HTML Email</h3>
				<p>Use this code to display a preview of your shoppable gallery in an email. The Shop Now button links to your default regional shop.</p>
				<div class="tabs" name="html-email">
					<div class="tab-headers"></div>
					<div class="tab-bodies"></div>
				</div>
			</div>
			<div class="form-row" name="gallery-xml-feed">
				<h3>XML Feed</h3>
				<p>Get a feed of your posts in XML format to use with your own website component or app or email marketing campaign.</p>
				<div class="tabs" name="gallery-xml-feed">
					<div class="tab-headers"></div>
					<div class="tab-bodies"></div>
				</div>
			</div>
			<div class="form-row" name="gallery-graphql-feed">
				<h3>GraphQL Feed</h3>
				<p>Get a feed of your posts in GraphQL format to use with your own website component or app or email marketing campaign.</p>
				<div class="tabs" name="gallery-graphql-feed">
					<div class="tab-headers"></div>
					<div class="tab-bodies"></div>
				</div>
			</div>
			<div class="form-row">
				<h3>Klaviyo Tag</h3>
				<p>Use this code to display a preview of your shoppable gallery inside your Klaviyo email template. Full implementation instructions for Klaviyo integration are available in the Implementation Guide.</p>
				<div class="tabs" name="klaviyo-code">
					<div class="tab-headers"></div>
					<div class="tab-bodies"></div>
				</div>
			</div>
		</div>
	</div>


</div>

<?php get_footer(); ?>