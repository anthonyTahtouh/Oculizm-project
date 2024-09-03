<?php

/* Template Name: Summary */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">

	<h1><?php the_title(); ?></h1>
	
	<!-- <div class="content-block" name="next-steps">
		<h2>Next Steps</h2>
		<div class="content-block-description"></div>
		<div class="cta-group">
			<a href="<?php echo $root; ?>" class="cta-secondary"></a>
		</div>
	</div> -->

	<div class="metric-box-container" name="summary">

		<div class="metric" name="assisted-orders">
			<div class="metric-inner">
			<h2>Assisted Orders</h2>
			<div class="metric-body">
				<p class="metric-highlight">
					<span class="metric-highlight-value"></span>
					<span class="metric-highlight-unit">Orders</span>
				</p>
				<p class="metric-description">Total number of orders assisted by shoppable content, including shoppable gallery views and lightbox interactions</p>
			</div>
			</div>
		</div>

		<div class="metric" name="assisted-sales">
			<div class="metric-inner">
				<h2>Assisted Sales</h2>
				<div class="metric-body">
					<p class="metric-highlight">
							<span class="metric-highlight-unit"></span>
							<span class="metric-highlight-value"></span>
					</p>
					<p class="metric-description">Total number of sales assisted by shoppable content, including shoppable gallery views and lightbox interactions</p>
				</div>
			</div>
		</div>

		<div class="metric" name="average-order-value">
			<div class="metric-inner">
				<h2>Average Order Value</h2>
				<div class="metric-body">
					<p class="metric-highlight">
							<span class="metric-highlight-unit"></span>
							<span class="metric-highlight-value"></span>
					</p>
					<p class="metric-description">Average value of an order assisted by shoppable content</p>
				</div>
			</div>
		</div>

		<div class="metric" name="total-shoppable-sessions">
			<div class="metric-inner">
				<h2>Total Shoppable Sessions</h2>
				<div class="metric-body">
					<p class="metric-highlight">
						<span class="metric-highlight-value"></span>
						<span class="metric-highlight-unit">Sessions</span>
					</p>
					<p class="metric-description">Total number of sessions interacting with shoppable content</p>
				</div>
			</div>
		</div>
		
		
		<div class="metric" name="hw-conversion-rate">
			<div class="metric-inner">
				<h2>Homepage Widget Conversion</h2>
				<div class="metric-body">
					<p class="metric-highlight">
						<span class="metric-highlight-value"></span>
						<span class="metric-highlight-unit">%</span>
					</p>
					<p class="metric-description">Conversion rate if there was interaction with the homepage widget</p>
				</div>
			</div>
		</div>

		<div class="metric" name="sg-conversion-rate">
			<div class="metric-inner">
					<h2>Shoppable Gallery Conversion</h2>
					<div class="metric-body">
						<p class="metric-highlight">
							<span class="metric-highlight-value-sg_visited"></span>
							<span class="metric-highlight-unit">%</span>
						</p>
						<p class="metric-description">Conversion rate if the shoppable gallery page was visited</p>
						<p class="metric-highlight">
							<span class="metric-highlight-value-sg_interact"></span>
							<span class="metric-highlight-unit">%</span>
						</p>
						<p class="metric-description">Conversion rate if there was interaction with the shoppable gallery page</p>
					</div>
			</div>
		</div>

		<div class="metric" name="ppg-conversion-rate">
			<div class="metric-inner">
				<h2>Product Page Widget Conversion</h2>
				<div class="metric-body">
					<p class="metric-highlight">
						<span class="metric-highlight-value"></span>
						<span class="metric-highlight-unit">%</span>
					</p>
					<p class="metric-description">Conversion rate if there was interaction with the product page gallery</p>
				</div>
			</div>
		</div>

		<div class="metric" name="email-conversion-rate">
			<div class="metric-inner">
				<h2>Email Conversion</h2>
				<div class="metric-body">
					<p class="metric-highlight">
						<span class="metric-highlight-value"></span>
						<span class="metric-highlight-unit">%</span>
					</p>
					<p class="metric-description">Conversion rate if a shoppable gallery link was clicked in an email</p>
				</div>
			</div>
		</div>



	
		<!-- <div class="metric" name="touchpoints">
		  <div class="metric-inner">
					<h2>Touchpoints</h2>
					<div class="metric-body">
							<p class="metric-highlight"><span class="metric-highlight-value shopViews"></span><span class="metric-highlight-unit">Shop Views</span></p>
							<p class="metric-highlight"><span class="metric-highlight-value lightboxViews"></span><span class="metric-highlight-unit">Lightbox Views</span></p>
							<p class="metric-highlight"><span class="metric-highlight-value productLinkClicked"></span><span class="metric-highlight-unit">Product Links Clicked</span></p>
					</div>
				</div>
		</div> -->

		
		
	</div>
	
	<div class="content-block chart-container" name="views">
		<h2 class="h2-icon"><span></span>Shoppable Gallery Views</h2>
		<div class="content-block-description">
			Number of visits to the Shoppable Gallery.
		</div>
		<div class="content-block-body">
			<div class="chart" name="views"></div>
		</div>
	</div>
	<div class="content-block chart-container" name="interactions">
		<h2 class="h2-icon"><span></span>Interactions</h2>
		<div class="content-block-description">
			Number of lightbox views, product clicks and email clicks.
		</div>
		<div class="content-block-body">
			<div class="chart" name="interactions"></div>
		</div>
	</div>
	
</div>

<?php get_footer(); ?>
