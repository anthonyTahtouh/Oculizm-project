
<?php ?>

<div class="form-overlay" name="crop-modal">
	<div class="overlay-bg"></div>
	<div class="overlay-content">
        <div class="content-block">
            <div class="cropper-image-container">
                <img name="cropper-image">
            </div>
            <div class="cta-group">
                <a href='' class="cta-secondary" data-cropper-cancel>Cancel</a>
                <a href='' class="cta-primary" data-cropper-submit>Crop</a>
            </div>
        </div>
		<a href="#" class="close"></a>
    </div>
</div>

<div class="content-block" name="preview">
	<div class="post-form-header"></div>
	<h2>Media</h2>
	<div class="media-preview" title="Click on the image to start tagging!">
	<a href='' class="rich-button" name="open-crop-modal">Crop</a>
	<a href='' class="rich-button" name="remove-media">Remove</a>
		<img class="media-background">
		<div class="main-image">
			<div class="hotspot-container">
				<div class="hotspot-map">
					<img class="main-image-actual">
					<div class="hotspot-spots"></div>
				</div>
			</div>
		</div>
		<div class="main-video">
			<video class="video">
				<source type="video/mp4">
			</video>
			<div class="video-icon"></div>
		</div>
	</div>
</div>

<div class="content-block" name="products">
	<h2>Products</h2>		
	<div class="content-block-description">
		No tagged products.
	</div>
	<div class="content-block-body">
		<div class="product-matcher">
			<input class="product-search" type="text" placeholder="Search by name or Product ID...">
			<div class="product-matcher-message"></div>
			<div class="loader"></div>
			<div class="product-search-results"></div>
			<div class="tabs" name="product-matcher">
				<div class="tab-headers"></div>
				<div class="tab-bodies"></div>
			</div>
		</div>
	</div>
</div>

<div class="content-block" name="text">
	<h2>Post Information</h2>
	<div class="content-block-body">
		<div class="form-row" name="post-title">
			<div class="form-label">Post Title:</div>
			<input type="text" value="">
		</div>
		<div class="form-row" name="post-caption">
			<div class="form-label">Post Caption:</div>
			<textarea></textarea>
		</div>
		<div class="form-row" name="image-alt-text">
			<div class="form-label">Image Alt Text:</div>
			<textarea></textarea>
		</div>
		<div class="form-row hidden" name="source-url">
			<div class="form-label">Post Source:</div>
			<div class="form-value">Unknown</div>
		</div>
	</div>
</div>

<div class="content-block" name="galleries">
	<h2>Galleries</h2>
	<div class="content-block-description">
		Choose which galleries this post should appear in.
	</div>
	<div class="content-block-body" name="post-galleries"></div>
</div>

<div class="content-block" name="visibility">
	<h2>Visibility</h2>
	<div class="content-block-description">
		Pin this post to the top of the page?
	</div>
	<div class="content-block-body">
		<div class="form-row" name="visibility">
			<div class="checkbox-option">
				<div class="checkbox-button"></div>
				<div class="checkbox-label">Pin this post</div>
			</div>
		</div>
	</div>
</div>

<div class="content-block" name="status">
	<h2>Publish Options</h2>
	<div class="content-block-description">
		Choose when this post is published.
	</div>
	<div class="content-block zfc" name="publish-options">
		<div class="publish-option col-33" name="draft">
			<div class="eqh">
				<p class="rich-paragraph">Save this post and come back to it whenever you want.</p>
			</div>
			<div class="cta-group">
				<a href="" class="cta-secondary" data-action="draft">Save as draft</a>
			</div>
		</div>
		<div class="publish-option col-33" name="future-publish">
			<div class="eqh">
				<p class="rich-paragraph">Schedule this post to be published later.</p>
				
			</div>
			<div class="cta-group">
				<input type="text" id="scheduled-time" name="scheduled-time" class="datepicker" />
				<a href='' class="cta-secondary" data-action="future">Schedule</a>
			</div>
		</div>
		<div class="publish-option col-33" name="publish">
			<div class="eqh">
				<p class="rich-paragraph">Publish this post immediately.</p>
			</div>
			<div class="cta-group">
				<a href='' class="cta-primary" data-action="publish">Publish Now</a>
			</div>
		</div>
		
	</div>
</div>

<div class="content-block" name="delete-post">
	<a data-action="delete-post" class="red" href="#">Delete post</a>
</div>