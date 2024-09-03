<?php

/* Template Name: Shoppable UGC Widgets */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>
	
	<div class="content-block" name="widgets">	

		<label for="gallery-select">Gallery:</label>
		<select name="gallery-select"></select>
		
		<h2>Homepage Widget</h2>
		<div class="content-block-description">
			This is the carousel (slider) which offers a small selection of shoppable posts on your homepage. This tag only needs to be loaded on your homepage, or wherever you'd like the widget to appear. All tags use JQuery and so must be loaded after your own JQuery library is initialised.
		</div>
		<div class="form-row" name="hw-tag">
			<textarea readonly class="big-textarea"></textarea>
			<a href='#' class="button-copy" ></a>
		</div>

		<h2>Shop Widget</h2>
		<div class="content-block-description">
			This is the main Oculizm tag which displays your shoppable gallery of posts. This tag needs to be loaded on the page where you'd like the shoppable gallery to appear. All tags use JQuery and so must be loaded after your own JQuery library is initialised.
		</div>
		<div class="form-row" name="shoppable-gallery-tag">
			<textarea readonly class="big-textarea"></textarea>
			<a href='#' class="button-copy" ></a>
		</div>

		<h2>Product Page Widget</h2>
		<div class="content-block-description">
			This is the small gallery of social media posts shown on your product detail page (PDP), giving the visitor social proof of the displayed product. This tag only needs to be loaded on the product detail page. The <i>productID</i> field can be replaced with a comma-separated list of Product IDs e.g. <i>productID: 'sku1', 'sku2', 'sku3'</i>. To get the tag for a specific product ID go to <a class="internal-link" href="/all-products">Products</a>. All tags use JQuery and so must be loaded after your own JQuery library is initialised.
		</div>
		<div class="form-row" name="ppg-tag">
			<textarea readonly class="big-textarea"></textarea>
			<a href='#' class="button-copy" ></a>
		</div>
	</div>


</div>

<?php get_footer(); ?>