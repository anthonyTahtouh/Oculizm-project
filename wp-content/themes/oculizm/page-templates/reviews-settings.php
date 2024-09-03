<?php

/* Template Name: Reviews Settings */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
 <h1><?php the_title(); ?></h1>
    
 <div class="content-block">

    <h2>Reviews Settings</h2>

    <div class="form-row">
        <label for="min-star-rating-select" class="form-label" >Minimum rating to auto-publish reviews</label>
        <select name="min-star-rating-select">
        <option value="0">No auto publish</option>
        <option value="1">⭐</option>
        <option value="2">⭐⭐</option>
        <option value="3">⭐⭐⭐</option>
        <option value="4">⭐⭐⭐⭐</option>
        <option value="5">⭐⭐⭐⭐⭐</option>
    </select>
    </div>

    <div class="form-row">
        <div class="checkbox-option" name="hide-reviews-credits">
            <div class="checkbox-button"></div>
            <div class="checkbox-info">
                <div class="checkbox-label">Hide credits</div>
            </div>
        </div>
    </div>

    <div class="form-row">
        <div class="checkbox-option" name="email-required">
            <div class="checkbox-button"></div>
            <div class="checkbox-info">
                <div class="checkbox-label">Require email in review form</div>
            </div>
        </div>
    </div>
    <div class="form-row" name="review-form-title">
        <div class="form-label">Review Form Title</div>
        <input type="text" />
    </div>
    <div class="form-row" name="review-form-description">
        <div class="form-label">Review Form Description</div>
        <textarea></textarea>
    </div>

    <div class="form-row" name="reviews-custom-css">
        <div class="form-label">Custom CSS</div>
        <textarea></textarea>
    </div>
    <div class="cta-group">
        <a href='#' name="update-review-settings" class="cta-primary">Save</a>
    </div>
</div>

<div class="content-block">

    <h2>Review Form Link</h2>

    <div class="form-row" name="review-form-link">
        <input readonly type="text" />
        <a href="#" class="button-copy"></a>
    </div>
</div>

<?php get_footer(); ?>
