<?php

/* Template Name: All Posts */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>
<div class="form-overlay" name="post-filters">
	<div class="overlay-bg"></div>
	<div class="overlay-content small-overlay">
		<div class="content-block" name="filters">
			<h2 class="title">Post Filters</h2>
			<div class="content-block-body">
				<h2>Gallery</h2>
				<select name="gallery-select">
					<option value="">---All---</option>
				</select>

				<h2>Status</h2>

				<div class="form-row" name="status">
					<div class="radio-option active" name="all">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">All</div>
						</div>
					</div>

					<div class="radio-option" name="published">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">Published</div>
						</div>
					</div>

					<div class="radio-option" name="future">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">Schedule</div>
						</div>
					</div>

					<div class="radio-option" name="draft">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">Draft</div>
						</div>
					</div>
				</div>


				<h2>Pinned Status</h2>
				<div class="form-row" name="pinned-status">
					<div class="radio-option active" name="all">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">All posts</div>
						</div>
					</div>

					<div class="radio-option" name="pinned">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">Pinned posts only</div>
						</div>
					</div>
				</div>

				<h2>Tagged Products</h2>
				<div class="form-row" name="is-tagged-products">
					<div class="radio-option active" name="all">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">All</div>
						</div>
					</div>

					<div class="radio-option" name="tagged-products">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">With tagged products</div>
						</div>
					</div>

					<div class="radio-option" name="no-tagged-products">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">No tagged products</div>
						</div>
					</div>
				</div>

				<h2>Media Type</h2>
				<div class="form-row" name="media-type">
					<div class="radio-option active" name="images-and-videos">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">Images and videos</div>
						</div>
					</div>

					<div class="radio-option" name="images">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">Images</div>
						</div>
					</div>

					<div class="radio-option" name="videos">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">Videos</div>
						</div>
					</div>
				</div>
				<div class="cta-group">
				<a href='#' name="apply-filters" class="cta-primary">Save</a>
			</div>
			</div>
		</div>
		
		<a href="#" class="close"></a>
	</div>
</div>



<div class="form-overlay" name="gallery-preview">
	<div class="overlay-bg"></div>
	<div class="overlay-content big-overlay">
		<div name="tag-preview-header">
			<h2>Gallery Preview</h2>
			<div class="device-options">
				<img class="active" src="/wp-content/themes/oculizm/img/desktop-icon.png" data-view="desktop">
				<img  src="/wp-content/themes/oculizm/img/mobile-icon.png" data-view="mobile">
			</div>
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
	
	<div class="content-block" name="all-posts">
	<div class="page-header">
		<!-- <input type="text" placeholder="Search posts"> -->
		<p class="header-preview-button"></p>
		<p class="header-filter-button"></p>
	</div>
		<div class="content-block-header"></div>
		<div class="post-grid-container">
			<div class="loader"></div>
			<div class="post-grid"></div>
		</div>
		<div class="content-block-footer"></div>
	</div>
</div>

<?php get_footer(); ?>
