<?php

/* Template Name: Shoppable UGC Settings */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>
	
	<div class="content-block">	
		
		<h2>Shop Widget &amp; Homepage Widget Settings</h2>
		<div class="form-row" name="postViewer">
			<div class="form-label">Post Click Event</div>
			<div class="radio-option" name="lightbox">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">Lightbox</div>
					<div class="radio-description">
						Clicking on a post will open that post in a lightbox.
					</div>
				</div>
			</div>
			<div class="radio-option" name="lightbox_carousel">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">Lightbox with carousel</div>
					<div class="radio-description">
						Clicking on a post will open that post in a lightbox, with the ability to scroll across adjacent posts.
					</div>
				</div>
			</div>
		</div>

		<div class="form-row" name="hotspotLabels">
			
			<div class="form-label">Lightbox Product Markers</div>
			
			<div class="radio-option" name="showLabels">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">Product markers with labels</div>
					<div class="radio-description">
						Show the product labels next to the marker.
					</div>
				</div>
			</div>
			
			<div class="radio-option" name="labelsOnHover">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">Product markers with labels on hover</div>
					<div class="radio-description">
						Show the product label when hovering over the marker.
					</div>
				</div>
			</div>
			
			<div class="radio-option" name="noLabels">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">Product markers without labels</div>
					<div class="radio-description">
						Just show the product marker on the post, without the label.
					</div>
				</div>
			</div>

			<div class="radio-option" name="noHotspots">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">No product markers</div>
					<div class="radio-description">
						No product markers. Matching products will be shown next to the post.
					</div>
				</div>
			</div>
		</div>
		
		<div class="form-row">
			<div class="checkbox-option" name="use-smaller-images">
				<div class="checkbox-button"></div>
				<div class="checkbox-info">
					<div class="checkbox-label">Use smaller images</div>
					<div class="checkbox-description"></div>
				</div>
			</div>
		</div>

		<?php  
		if(current_user_can('administrator')) {
		?>
		<div class="form-row">
			<div class="checkbox-option" name="hide-credits">
				<div class="checkbox-button"></div>
				<div class="checkbox-info">
					<div class="checkbox-label">Hide credits</div>
					<div class="checkbox-description"></div>
				</div>
			</div>
		</div>
		<?php
		}
		?>

		<div class="form-row" name="lightboxZindex">
			<div class="form-label">Lightbox Z-index</div>
			<input min="999" max="100000" value="999" type="number">
		</div>
		<div class="form-row" name="viewerTitle">
			<div class="form-label">Viewer title</div>
			<input type="text" value="Shop the look">
		</div>
		<div class="form-row" name="shareText">
			<div class="form-label">Share text</div>
			<input type="text">
		</div>
		<div class="form-row" name="shop-custom-css">
			<div class="form-label">Custom CSS</div>
			<textarea></textarea>
		</div>
		<div class="cta-group">
			<a href='#' name="save-widget-options" class="cta-primary">Save</a>
		</div>
	</div>

 	<div class="content-block">

		<h2>Product Page Widget Settings</h2>
		<div class="form-row">
			<div class="checkbox-option" name="ppg_show_products">
				<div class="checkbox-button"></div>
				<div class="checkbox-info">
					<div class="checkbox-label">Show products</div>
					<div class="checkbox-description"></div>
				</div>
			</div>
		</div>
		<div class="form-row">
			<div class="checkbox-option" name="ppg_use_carousel">
				<div class="checkbox-button"></div>
				<div class="checkbox-info">
					<div class="checkbox-label">Load posts in a carousel</div>
					<div class="checkbox-description"></div>
				</div>
			</div>
		</div>

		<div class="form-row" name="PPGViewer">
			<div class="form-label">Post Click Event</div>
			<div class="radio-option" name="asoNoLightbox">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">No lightbox</div>
					<div class="radio-description">
						Don't open the lightbox when clicking on a post.
					</div>
				</div>
			</div>
			<div class="radio-option" name="asoLightboxNoCarousel">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">Lightbox</div>
					<div class="radio-description">
						Clicking on a post will open that post in a lightbox.
					</div>
				</div>
			</div>
			<div class="radio-option" name="asoLightboxWithCarousel">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">Lightbox with carousel</div>
					<div class="radio-description">
						Clicking on a post will open that post in a lightbox, with the ability to scroll across adjacent posts.
					</div>
				</div>
			</div>
		</div>

		<div class="form-row" name="aso_hotspotLabels">
			
			<div class="form-label">Lightbox Product Markers</div>
			
			<div class="radio-option" name="aso_showLabels">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">Product markers with labels</div>
					<div class="radio-description">
						Show the product labels next to the marker.
					</div>
				</div>
			</div>
			
			<div class="radio-option" name="aso_labelsOnHover">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">Product markers with labels on hover</div>
					<div class="radio-description">
						Show the product label when hovering over the marker.
					</div>
				</div>
			</div>
			
			<div class="radio-option" name="aso_noLabels">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">Product markers without labels</div>
					<div class="radio-description">
						Just show the product marker on the post, without the label.
					</div>
				</div>
			</div>

			<div class="radio-option" name="aso_noHotspots">
				<div class="radio-button"></div>
				<div class="radio-info">
					<div class="radio-label">No product markers</div>
					<div class="radio-description">
						No product markers. Matching products will be shown next to the post.
					</div>
				</div>
			</div>
		</div>
		<div class="form-row" name="ppg-css">
			<div class="form-label">Custom CSS</div>
			<textarea></textarea>
		</div>
		<div class="cta-group">
			<a href='#' name="save-ppg-settings" class="cta-primary">Save</a>
		</div>
	</div>
 	
	<div class="content-block" name="edit-affiliate-network">	

		<h2>Affiliate Network</h2>
		<div class="content-block-body">
			<div class="form-row" name="affiliateNetwork">
				<div class="form-label">Affiliate Network</div>
				<select name="affiliateNetwork">
					<option value="None" selected>None</option>
					<option value="Adtraction">Adtraction</option>
					<option value="AWIN">AWIN</option>
					<option value="CJ">CJ</option>
					<option value="Impact">Impact</option>
					<option value="Partnerize">Partnerize</option>
					<option value="Rakuten">Rakuten</option>
					<option value="ShareASale">ShareASale</option>
					<option value="TAG">TAG</option>
					<option value="Webgains">Webgains</option>
				</select>
			</div>
			<div class="form-row" name="merchant_id">
				<div class="form-label">Merchant ID</div>
				<input type="text">
			</div>
			<div class="form-row" name="banner_id">
				<div class="form-label">Banner ID</div>
				<input type="text">
			</div>
			<div class="form-row" name="PID">
				<div class="form-label">PID</div>
				<input type="text">
			</div>
			<div class="form-row" name="SID">
				<div class="form-label">SID</div>
				<input type="text">
			</div>
			<div class="form-row" name="CID">
				<div class="form-label">CID</div>
				<input type="text">
			</div>
			<div class="form-row" name="LID">
				<div class="form-label">LID</div>
				<input type="text">
			</div>

			<div class="cta-group">
				<a hre='' name="save-affiliate-network" class="cta-primary">Save</a>
			</div>
		</div>
	</div>


</div>

<?php get_footer(); ?>