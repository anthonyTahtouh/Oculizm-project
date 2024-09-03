<?php

/* Template Name: Review Moderation */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<!--
<div class="form-overlay" name="review-modal">
    <div class="overlay-bg"></div>
    <div class="overlay-content ">
        <div class="content-block" name="review-history">
            <h2></h2>
            <div class="content-block-body"></div>
        </div>
        <div class="content-block" name="update-review">
            <h2>Reply to Review</h2>
            <div class="content-block-body">
                <div class="form-row">
                    <div class="form-label">Reply</div>
                    <textarea name="review-message"></textarea>
                </div>
                <div class="cta-group">
                    <a action="update-review" class='cta-primary'>Submit Reply</a>
                </div>
            </div>
        </div>
        <a href="#" class="close"></a>
    </div>
</div>
-->


<div class="form-overlay" name="reviews-filters">
	<div class="overlay-bg"></div>
	<div class="overlay-content small-overlay">
		<div class="content-block" name="filters">
			<h2 class="title">Reviews Filters</h2>
			<div class="content-block-body">
				<h2>Status</h2>
				<div class="form-row" name="allReviewsStatus">
                        <div class="radio-option active" name="all">
                            <div class="radio-button"></div>
                            <div class="radio-info">
                                <div class="radio-label">All</div>
                            </div>
                        </div>
                        <div class="radio-option" name="newReviews">
                            <div class="radio-button"></div>
                            <div class="radio-info">
                                <div class="radio-label">New</div>
                            </div>
                        </div>
                        <div class="radio-option" name="unverifiedReviews">
                            <div class="radio-button"></div>
                            <div class="radio-info">
                                <div class="radio-label">Unverified</div>
                            </div>
                        </div>
                        <div class="radio-option" name="publishedReviews">
                            <div class="radio-button"></div>
                            <div class="radio-info">
                                <div class="radio-label">Published</div>
                            </div>
                        </div>
                        <div class="radio-option" name="flaggedReviews">
                            <div class="radio-button"></div>
                            <div class="radio-info">
                                <div class="radio-label">Flagged</div>
                            </div>
                        </div>
                    </div>
                    
                <h2>Rating</h2>
				<div class="form-row">
                    <label for="star-rating-select" class="form-label" >Star rating</label>
                    <select name="star-rating-select">
                    <option value="0">All Ratings</option>
                    <option value="1">⭐ (1 star)</option>
                    <option value="2">⭐⭐ (2 stars)</option>
                    <option value="3">⭐⭐⭐ (3 stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                    <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                </select>
                </div>

                <h2>Reviews Type</h2>
				<div class="form-row" name="siteOrProductReviews">
                        <div class="radio-option active" name="allReviews">
                            <div class="radio-button"></div>
                            <div class="radio-info">
                                <div class="radio-label">All Reviews</div>
                            </div>
                        </div>
                        <div class="radio-option" name="siteReviews">
                            <div class="radio-button"></div>
                            <div class="radio-info">
                                <div class="radio-label">Site Reviews</div>
                            </div>
                        </div>
                        <div class="radio-option" name="productReviews">
                            <div class="radio-button"></div>
                            <div class="radio-info">
                                <div class="radio-label">Product Reviews</div>
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



<div class="form-overlay" name="flag-review">
    <div class="overlay-bg"></div>
    <div class="overlay-content ">
        <div class="content-block">
            <h2>Flag Review</h2>
            <div class="content-block-description">Please choose a reason for flagging this review.</div>
            <div class="form-row" name="flagReason">
                <div class="radio-option active" name="harmful_illegal">
                    <div class="radio-button"></div>
                    <div class="radio-info">
                        <div class="radio-label">It's harmful or illegal</div>
                        <div class="radio-description">
                            The review contains harmful or illegal content.
                        </div>
                    </div>
                </div>
                <div class="radio-option" name="personal_information">
                    <div class="radio-button"></div>
                    <div class="radio-info">
                        <div class="radio-label">It contains personal information</div>
                        <div class="radio-description">
                            The review contains information which could be used to identify a person.
                        </div>
                    </div>
                </div>
                <div class="radio-option" name="advertising_promotional">
                    <div class="radio-button"></div>
                    <div class="radio-info">
                        <div class="radio-label">It's advertising or promotional</div>
                        <div class="radio-description">
                            The perceived purpose of the review is to promote another business or brand.
                        </div>
                    </div>
                </div>    
                <div class="radio-option" name="not_genuine">
                    <div class="radio-button"></div>
                    <div class="radio-info">
                        <div class="radio-label">It's not based on a genuine experience</div>
                        <div class="radio-description">
                            The review looks like it is not from a person who has had a genuine experience with the business, or is possibly fake.
                        </div>
                    </div>
                </div>                 
                <div class="radio-option" name="different_business">
                    <div class="radio-button"></div>
                    <div class="radio-info">
                        <div class="radio-label">It's about a different business</div>
                        <div class="radio-description">
                            The review doesn't relate to this business or a product associated with this business.
                        </div>
                    </div>
                </div>                
            </div>
            <div class="form-row" name="flagDetail">
                <div class="form-label">Further information</div>
                <textarea></textarea>
            </div>
            <div class="cta-group">
                <a href='#' name="flag-review" class="cta-primary">Submit</a>
            </div>
        </div>
        <a href="#" class="close"></a>
    </div>
</div>

<div class="form-overlay" name="reviews-preview">
    <div class="overlay-bg"></div>
    <div class="overlay-content big-overlay">
        <div name="tag-preview-header">
            <h2>Reviews Preview</h2>
            <div class="device-options">
                <img class="active" src="/wp-content/themes/oculizm/img/desktop-icon.png" data-view="desktop">
                <img  src="/wp-content/themes/oculizm/img/mobile-icon.png" data-view="mobile">
            </div>
            <ul class="display-options">
                <li name="list-reviews">View reviews in a list</li>
                <li name="carousel-reviews">View reviews in a carousel</li>
            </ul>
        </div>
        <div class="content-block">
            <div class="content-block-body">
                <div name="tag-preview"></div>
            </div>
        </div>
        <a href="#" class="close"></a>
    </div>
</div>

<div class="form-overlay" name="reviewer-display-name">
    <div class="overlay-bg"></div>
    <div class="overlay-content small-overlay">
        <div class="content-block">
        <h2 class="title">Approve Review</h2>
            <label>Reviewer Display Name:</label>
            <select name="reviewer-display-name-select">
            </select>

            <div class="cta-group">
                <a href='#' name="update-display-name" data-review-id='' class="cta-primary">Approve</a>
            </div>

        </div>
        <a href="#" class="close"></a>
    </div>
</div>

<div class="form-overlay" name="review-approval-overlay">
    <div class="overlay-bg"></div>
    <div class="overlay-content small-overlay">
        <div class="content-block">
        <h2 class="title">Approve Review</h2>
            <div class= "review-approval-overlay-content" ></div>
            <div class="cta-group">
                <a href='#' name="approve-review"  approval-data-review-status ='' class="cta-primary">Approve</a>
                <a href='#' name="cancel-approval"  class="cta-primary">No</a>
            </div>

        </div>
        <a href="#" class="close"></a>
    </div>
</div>

<div class="main">
	<h1><?php the_title(); ?></h1>

	<div class="content-block" name="all-reviews">	
        <div class="page-header">
            <!-- <input type="text" placeholder="Search reviews"> -->
            <p class="header-preview-button"></p>
		    <p class="header-filter-button"></p>
        </div>
        <div class="content-block-header"></div>
        <div class="content-block-body hidden">
        	<div class="no-data">Nothing to show</div>
        </div>
        <div class="content-block-footer"></div>
	</div>

</div>

<?php get_footer(); ?>
