<?php

/* Template Name: Orders */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="form-overlay" name="order-details">
	<div class="overlay-bg"></div>
	<div class="overlay-content">
		<div class="content-block" name="order-items">
			<h2>Order Details</h2>
			<div class="content-block-body">
				<h3 class="h3-icon" name="bag">Basket</h3>
				<table name="order-items">
					<tbody></tbody>
				</table>
			</div>
		</div>
		<div class="content-block zfc" name="session-information">
			<div class="content-block-body col-50">
				<h3 class="h3-icon" name="user-journey">User Journey</h3>
				<table name="user-journey">
					<tbody></tbody>
				</table>
			</div>
			<div class="content-block-body col-50">
				<div class="pad-25-0">
					<div name="session">
						<h3>Session Information</h3>
						<div class="placeholder"></div>
					</div>
				</div>
			</div>
		</div>
		<a href="#" class="close"></a>
	</div>
	<div class="prev-button"></div>
	<div class="next-button"></div>
</div>


<div class="form-overlay" name="order-filters">
	<div class="overlay-bg"></div>
	<div class="overlay-content small-overlay">
		<div class="content-block" name="filters">
			<h2 class="title">Order Filters</h2>
			<div class="content-block-body">
				<h2>Interaction Level</h2>
				<div class="form-row" name="interaction-level">
					<div class="radio-option active" name="all">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">All</div>
						</div>
					</div>
					<div class="radio-option" name="deepInteractionOnly">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">Deep Interaction Only</div>
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

	<div class="content-block" name="orders-list">
		<div class="page-header">
			<p class="header-filter-button"></p>
		</div>
		<h2 class="h2-icon"><span></span>Assisted Orders</h2>
		<div class="content-block-description">
			Orders where the journey was influenced by user generated content (UGC).
		</div>
		<div class="content-block-body">
			<table name="orders">
				<thead>
					<tr>
						<th>Date</th>
						<th>Order ID</th>
						<th>Basket Items</th>
						<th>Order Total</th>
						<th></th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
		</div>
	</div>
	
</div>

<?php get_footer(); ?>
