<?php

/* Template Name: Facebook Videos */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>
<div class="form-overlay" name="social-network-search-post-filters">
	<div class="overlay-bg"></div>
	<div class="overlay-content small-overlay">
		<div class="content-block" name="filters">
			<h2 class="title">Filters</h2>
			<div class="content-block-body">

				<div class="form-row">
				   <div class="checkbox-option" name="show-hidden-posts">
						<div class="checkbox-button"></div>
							<div class="checkbox-info">
							<div class="checkbox-label">Show hidden posts</div>
						</div>
					</div>
				</div>

				<div class="form-row">
				   <div class="checkbox-option active" name="show-already-curated-posts">
						<div class="checkbox-button"></div>
							<div class="checkbox-info">
							<div class="checkbox-label">Show already curated posts</div>
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

<div class="main">
	<h1><?php the_title(); ?></h1>
	
	<div class="post-grid-container">
		<div class="search-page-header"></div>
		<div class="tabs simple-tabs">
			<div class='tab-headers'>
				<div class='tab-header active' name='uploaded'>Uploaded</div>
				<div class='tab-header' name='tagged'>Tagged</div>
			</div>
			<div class="tab-bodies">
				<div class="tab-body post-grid active" name="uploaded"></div>
				<div class="tab-body post-grid" name="tagged"></div>
			</div>
		</div>
		<div class="loader"></div>
		<div class="load-more">
			<a href="#" class="load-more-button chevron chevron-down"></a>
		</div>
	</div>
</div>

<?php get_footer(); ?>
