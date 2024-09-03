
<?php $root = site_url(); ?>

	<div class="sidebar">
		<div class="menu-container">
			<ul class="menu">
				<li class="menu-item" name="analytics">
					<span class="menu-item-group-name">Analytics</span>
					<ul>
						<li name="summary">
							<a href="<?php echo $root; ?>">Summary</a>
						</li>
						<li name="sales">
							<a href="<?php echo $root; ?>/sales/">Sales</a>
						</li>
						<li name="orders">
							<a href="<?php echo $root; ?>/orders/">Orders</a>
						</li>
						<li name="content">
							<a href="<?php echo $root; ?>/content/">Content</a>
						</li>
					</ul>
				</li>

				<li class="menu-item" name="posts">
					<span class="menu-item-group-name">Posts</span>
					<ul>
						<li name="all-posts">
							<a href="<?php echo $root; ?>/all-posts/">All posts</a>
						</li>
						<li name="galleries">
							<a href="<?php echo $root; ?>/galleries/">Galleries</a>
						</li>
					</ul>
				</li>

				<li class="menu-item" name="curate">
					<span class="menu-item-group-name">Curate</span>
					<ul>
						<li class="menu-item" data-social-network="facebook" name="facebook">
							<a href="<?php echo $root; ?>/facebook/">Facebook</a>
						</li>
						<li class="menu-item" data-social-network="instagram" name="instagram">
							<a href="<?php echo $root; ?>/instagram/">Instagram</a>
						</li>
<?php if (current_user_can('administrator')) { ?>
 						<li class="menu-item" data-social-network="tiktok" name="tiktok">
							<a href="<?php echo $root; ?>/tiktok/">TikTok</a>
							<ul class="social-sub-menu">
								<li name="tiktok-profile">
									<a href="<?php echo $root; ?>/tiktok-profile/">Profile</a>
								</li>
							</ul>
						</li>
<?php } ?>
						<li class="menu-item" data-social-network="twitter" name="twitter">
							<a href="<?php echo $root; ?>/twitter/">X</a>
						</li> 
						<li class="menu-item" name="upload">
							<a href="<?php echo $root; ?>/upload/">Upload</a>
						</li>
					</ul>
				</li>

				<li class="menu-item" name="products">
					<span class="menu-item-group-name">Products</span>
					<ul>
						<li name="all-products">
							<a href="<?php echo $root; ?>/all-products/">All Products</a>
						</li>

						<li name="product-feeds">
							<a href="<?php echo $root; ?>/product-feeds/">Product Feeds</a>
						</li>
					</ul>
				</li>
<?php if (current_user_can('administrator') || ($client_id == "77974")) { ?>
				<li class="menu-item" name="reviews">
					<span class="menu-item-group-name">Reviews</span>
					<ul>
						<li name="reviews-summary">
							<a href="<?php echo $root; ?>/reviews-summary/">
							Reviews Summary
							</a>
						</li>
						<li name="review-moderation">
							<a href="<?php echo $root; ?>/review-moderation/">
								<!-- <div class="label-new">NEW</div> -->
								Review Moderation
							</a>
						</li>
					</ul>
				</li>
<?php } ?>
				<li class="menu-item" name="integration">
					<span class="menu-item-group-name">Integration</span>
					<ul>
						<li name="shoppable-ugc-widgets">
							<a href="<?php echo $root; ?>/shoppable-ugc-widgets/">Shoppable UGC Widgets</a>
						</li>
<?php if (current_user_can('administrator')) { ?>
						<li name="reviews-widget-integration">
							<a href="<?php echo $root; ?>/reviews-widget-integration/">Reviews Widget</a>
						</li>
<?php } ?>
						<li name="tracking-tag-integration">
							<a href="<?php echo $root; ?>/tracking-tag-integration/">Tracking Tag</a>
						</li>
						<li name="email-integration">
							<a href="<?php echo $root; ?>/email-integration/">Email Integration</a>
						</li>
					</ul>
				</li>

				<li class="menu-item" name="settings">
					<span class="menu-item-group-name">Settings</span>
					<ul>
						<li name="shoppable-ugc-settings">
							<a href="<?php echo $root; ?>/shoppable-ugc-settings/">Shoppable UGC Settings</a>
						</li>
<?php if (current_user_can('administrator') || ($client_id == "77974")) { ?>
						<li name="reviews-settings">
							<a href="<?php echo $root; ?>/reviews-settings/">Reviews Settings</a>
						</li>
<?php } ?>
					</ul>
				</li>
			</ul>
		</div>

		<div class="sidebar-footer">
			<div class="copyright">&copy; 2024 Soreto</div>
		</div>
	</div>

