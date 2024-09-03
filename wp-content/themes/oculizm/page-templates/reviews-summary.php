<?php

/* Template Name: Reviews Summary */

get_header();

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>



<div class="main">
    <h1><?php the_title(); ?></h1>
    <div class="main-row" name="reviews-by-rating-row">
        <div class="metric-box-container">
            <div class="metric-row">
                <div class="metric" name="overall-rating">
                    <div class="metric-inner">
                        <h2>Overall Rating</h2>
                        <div class="metric-body">
                            <p class="metric-highlight">
                                <span class="metric-highlight-value"></span>
                            </p>
                            <p class="metric-description">Based on site reviews and product reviews</p>
                        </div>
                    </div>
                </div>
                <div class="metric" name="overall-site-rating">
                    <div class="metric-inner">
                        <h2>Site Rating</h2>
                        <div class="metric-body">
                            <p class="metric-highlight">
                                <span class="metric-highlight-value"></span>
                            </p>
                            <p class="metric-description">Based on <span class="site-reviews-count"></span> site <span class="site-reviews-text"></span></p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="metric-row">
                <div class="metric" name="total-reviews">
                    <div class="metric-inner">
                        <h2>Total Reviews</h2>
                        <div class="metric-body">
                            <p class="metric-highlight">
                                <span class="metric-highlight-value"></span>
                                <span class="metric-highlight-unit">Reviews</span>
                            </p>
                            <p class="metric-description">Based on published reviews only</p>
                        </div>
                    </div>
                </div>
                <div class="metric" name="overall-product-rating">
                    <div class="metric-inner">
                        <h2>Product Rating</h2>
                        <div class="metric-body">
                            <p class="metric-highlight">
                                <span class="metric-highlight-value"></span>
                            </p>
                            <p class="metric-description">Based on <span class="product-reviews-count"></span> product <span class="product-reviews-text"></span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-block" name="reviews-by-rating">
            <h2>Reviews By Rating</h2>
            <div class="reviews-by-rating-stats">
                <div class="donut-chart-container">
                    <canvas class="reviews-by-rating-chart"></canvas>
                    <div class="total-reviews"></div>
                </div>

                <div class="details">
                    <ul></ul>
                </div>
            </div>
        </div>

    </div>

    <div class="content-block" name="latest-reviews">
        <h2>Latest Reviews</h2>
        <div class="content-block-header"></div>
        <div class="content-block-body hidden">
        </div>
        <div class="content-block-footer"></div>
    </div>

</div>

<?php get_footer(); ?>