<?php

/* Template Name: Product Feeds */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="form-overlay" name="add-feed-modal">
	<div class="overlay-bg"></div>
	<div class="overlay-content">
		<div class="content-block">
			<h2>Add Product Feed</h2>
			<div class="content-block-body">
				<div class="form-row">
					<div class="radio-option active" name="HTTP">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">HTTP</div>
							<div class="form-row-subsection">
								<div class="radio-info">
									<div class="radio-label">HTTP URL:</div>
									<input type="text" class="http-url">
								</div>
								<div class="radio-info">
									<div class="radio-label">HTTP Username:</div>
									<input type="text" class="http-username">
								</div>
								<div class="radio-info">
									<div class="radio-label">HTTP Password:</div>
									<input type="text" class="http-password">
								</div>
							</div>
						</div>
					</div>
					<div class="radio-option" name="FTP">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">FTP</div>
							<div class="form-row-subsection">
								<div class="radio-info">
									<div class="radio-label">FTP Server: </div>
									<input type="text" class="ftp-server">
								</div>
								<div class="radio-info">
									<div class="radio-label">Username: </div>
									<input type="text" class="ftp-username">
								</div>
								<div class="radio-info">
									<div class="radio-label">Password: </div>
									<input type="text" class="ftp-password">
								</div>
								<div class="radio-info">
									<div class="radio-label">Filepath: </div>
									<input type="text" class="ftp-filepath">
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="form-row" name="region">
					<div class="form-label">Region</div>
					<select name="region">
						<option value="">Select...</option>
						<!-- <option value="AF">Afghanistan</option> -->
					</select>
				</div>
				<div class="form-row">
					<div class="form-label">Shop Link</div>
					<input type="text" class="shop-link">
				</div>
				<div class="cta-group">
					<a href="#" class="cta-primary" name="scan-feed">Next</a>
				</div>
			</div>
		</div>
		<a href="#" class="close"></a>
	</div>
</div>

<div class="form-overlay" name="review-feed-modal">
	<div class="overlay-bg"></div>
	<div class="overlay-content">
		<div class="content-block">
			<h2>Review Product Feed</h2>
			<div class="content-block-body">
				<div class="form-row">
					<div class="placeholder"></div>
				</div>
				<div class="form-row">
					<div class="cta-group">
						<a href='#' class='cta-secondary' name='back'>Back</a>
						<a href='#' class='cta-primary' name='import-feed'>Import Feed</a>
					</div>
				</div>
			</div>
		</div>
		<a href="#" class="close"></a>
	</div>
</div>

<div class="form-overlay" name="edit-feed-modal">
	<div class="overlay-bg"></div>
	<div class="overlay-content">
		<div class="content-block">
			<h2>Edit Product Feed</h2>
			<div class="content-block-body">
				<div class="form-row">
					<div class="radio-option active" name="HTTP">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">HTTP</div>
							<div class="form-row-subsection">
								<div class="radio-info">
									<div class="radio-label">HTTP URL:</div>
									<input type="text" class="http-url">
								</div>
								<div class="radio-info">
									<div class="radio-label">HTTP Username:</div>
									<input type="text" class="http-username">
								</div>
								<div class="radio-info">
									<div class="radio-label">HTTP Password:</div>
									<input type="text" class="http-password">
								</div>
							</div>
						</div>
					</div>
					<div class="radio-option" name="FTP">
						<div class="radio-button"></div>
						<div class="radio-info">
							<div class="radio-label">FTP</div>
							<div class="form-row-subsection">
								<div class="radio-info">
									<div class="radio-label">FTP Server: </div>
									<input type="text" class="ftp-server">
								</div>
								<div class="radio-info">
									<div class="radio-label">Username: </div>
									<input type="text" class="ftp-username">
								</div>
								<div class="radio-info">
									<div class="radio-label">Password: </div>
									<input type="text" class="ftp-password">
								</div>
								<div class="radio-info">
									<div class="radio-label">Filepath: </div>
									<input type="text" class="ftp-filepath">
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="form-row" name="region">
					<div class="form-label">Region</div>
					<select name="region">
						<option value="">Select...</option>
						<!-- <option value="AF">Afghanistan</option> -->
					</select>
				</div>
				<div class="form-row">
					<div class="form-label">Shop Link</div>
					<input type="text" class="shop-link">
				</div>
				<div class="cta-group">
					<a href='#' class='cta-primary' name='import-feed'>Import Feed</a>
				</div>
			</div>
		</div>
		<a href="#" class="close"></a>
	</div>
</div>

<div class="main">
	<h1><?php the_title(); ?></h1>
	
	<a href="#" class="header-button" name="add-product-feed">Add Feed</a>
	
	<div class="content-block">	
		<table name="product-feeds">
			<thead>
				<tr>
					<th>Region</th>
					<th>HTTP URL / FTP Server</th>
					<th>Products</th>
					<th>Format</th>
					<th>Shop Link</th>
					<th>Last Updated</th>
					<th></th>
				</tr>
			</thead>
			<tbody></tbody>
		</table>
		<div class="cta-group">
			<a href="#" class="cta-secondary" name="consolidate-products">Consolidate Products</a>
		</div>
		<div class="cta-group">
			<a href="#" class="red" name="delete-all-products">Delete All Products</a>
		</div>
	</div>


</div>

<?php get_footer(); ?>