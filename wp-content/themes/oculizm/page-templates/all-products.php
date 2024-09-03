<?php

/* Template Name: All Products */

get_header();

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="form-overlay" name="product-details">
	<div class="overlay-bg"></div>
	<div class="overlay-content ">
		<div class="content-block">
			<h2>Product Details</h2>
		</div>
		<div class="content-block zfc">
			<div class="col-50">
				<div class="product-image">
					<img>
				</div>
			</div>
			<div class="col-50">
				<div class="tabs" name="product-regions">
					<div class="tab-headers"></div>
					<div class="tab-bodies"></div>
				</div>
				<div name="availability"></div>
			</div>
		</div>
		<div class="content-block">

			<div class="content-block-body">
				<h3>Tagged Posts</h3>
				<div class="form-row" name="no-data">
					<div class="form-label">
						No tagged posts.
					</div>
				</div>
				<div class="form-row" name="ppg-preview">
					<div class="preview-area"></div>
				</div>
			</div>

			<div class="content-block-body">
				<h3>Product Page Gallery Tag</h3>
				<p>
					Display a dynamic gallery of posts tagged with this product on a Product Detail Page (PDP) or Category page, providing social proof to aid the buying decision. The <i>productID</i> field can be replaced with a comma-separated list of Product IDs e.g. <i>productID: 'sku1', 'sku2', 'sku3'</i>.
				</p>
				<div class="form-row" name="ppg-tag">
					<textarea readonly></textarea>
					<a href='#' class="button-copy" ></a>
				</div>
				<div class="form-row" name="ppg-preview-button">
					<a target="_blank" href="#" class="external-link" data-action="show-preview">Preview Gallery</a>
				</div>
			</div>
				
			<div class="content-block-body">
				<h3>Product Page Gallery XML Feed</h3>
				<p>
					Integrate a dynamic XML feed of posts tagged with this product into your email marketing or CRM.
				</p>
				<div class="form-row" name="ppg-xml-feed">
					<textarea readonly></textarea>
					<a href='#' class="button-copy" ></a>
				</div>
			</div>

			<div class="content-block-body">
				<h3>Product Page Gallery GraphQL Feed</h3>
				<p>
					Integrate a dynamic GraphQL feed of posts tagged with this product into your email marketing or CRM.
				</p>
				<div class="form-row" name="ppg-graphql-feed">
					<textarea readonly></textarea>
					<a href='#' class="button-copy" ></a>
				</div>
			</div>

			<div class="content-block-body">
			    <h3>Product Review Link</h3>
				<p>
					Share a link for your customers to review this product.
				</p>
			    <div class="form-row" name="product-review-form-link">
			        <input readonly type="text" />
			        <a href="#" class="button-copy"></a>
			    </div>
			</div>

		</div>
		<a href="#" class="close"></a>
	</div>
</div>

<div class="form-overlay" name="ppg-preview">
	<div class="overlay-bg"></div>
	<div class="overlay-content big-overlay">
		<div name="tag-preview-header">
			<h2>Product Widget Preview</h2>
			<div class="device-options">
				<img class="active" src="/wp-content/themes/oculizm/img/desktop-icon.png" data-view="desktop">
				<img  src="/wp-content/themes/oculizm/img/mobile-icon.png" data-view="mobile">
			</div>
			<h3></h3>
		</div>
		<div class="content-block">
			<div class="content-block-body">
				<div name="tag-preview"></div>
			</div>
		</div>
		<a href="#" class="close"></a>
	</div>
</div>

<div class="main">
	<h1><?php the_title(); ?></h1>

	<div class="page-header">
			<div class="product-matcher">
				<input type="text" class="product-search" placeholder="Search by name or Product ID...">
			</div>
		</div>

	<div class="content-block" name="all-products">
		<div class="content-block-header">
				<div class="product-matcher-message"></div>
				<div class="loader"></div>
				<div class="product-search-results"></div>
		</div>

		<div class="post-grid-container">
			<div class="loader"></div>
			<div class="post-grid"></div>
		</div>
		<div class="content-block-footer"></div>
	</div>
</div>

<?php get_footer(); ?>