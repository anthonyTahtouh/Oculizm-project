<?php

/* Template Name: Support */

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="form-overlay" name="support-ticket-modal">
    <div class="overlay-bg"></div>
    <div class="overlay-content ">
        <div class="content-block" name="support-ticket-history">
            <h2></h2>
            <div class="content-block-body"></div>
        </div>
        <div class="content-block" name="update-support-ticket">
            <h2>Update Ticket</h2>
            <div class="content-block-body">
                <div class="form-row">
                    <div class="form-label">Message</div>
                    <textarea name="support-ticket-message"></textarea>
                </div>
                <div class="cta-group">
                    <a action="update-support-ticket" class='cta-primary'>Update Ticket</a>
                </div>
            </div>
        </div>
        <a href="#" class="close"></a>
    </div>
</div>

<div class="form-overlay" name="add-support-ticket">
    <div class="overlay-bg"></div>
    <div class="overlay-content ">
        <div class="content-block">
            <h2>New Support Ticket</h2>
            <div class="content-block-body">
                <div class="form-row" name="support-ticket-subject">
                    <div class="form-label">Subject</div>
                    <input type="text">
                </div>
                <div class="form-row" name="support-ticket-message">
                    <div class="form-label">Message</div>
                    <textarea></textarea>
                </div>
                <div class="cta-group">
                    <a name="add-client" class='cta-primary'>Create Ticket</a>
                </div>
            </div>
        </div>
        <a href="#" class="close"></a>
    </div>
</div>

<div class="main">
	<h1><?php the_title(); ?></h1>
    
	<a href='#' class="header-button" data-action="add-support-ticket">Create Ticket</a>

	<div class="content-block">	
		<h2>Support Tickets</h2>
        <table name="support-tickets">
            <thead></thead>
            <tbody></tbody>
        </table>
        <div class="content-block-body hidden">
        	<div class="no-data">Nothing to show</div>
        </div>
	</div>

</div>

<?php get_footer(); ?>
