<?php

/* Template Name: Logs */

// stop non-admins viewing this page
if(!current_user_can('manage_options')) {
    echo "Unauthorised.";
    return;
}

get_header(); 

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>
    
    <div class="content-block"> 
        <div class="tabs" name="logs">
            <div class="tab-headers">
                <div class="tab-header active" name="debug">WordPress debug.log <span class="log-file-size"></span></div>
                <div class="tab-header" name="error">Apache error_log <span class="log-file-size"></span></div>
            </div>
            <div class="tab-bodies">
                <div class="tab-body active" name="debug">
                    <div class="log-file-actions">
                        <a href="#" name="download-log-file">Download</a>
                        <a href="#" name="clear-log-file">Clear</a>
                    </div>
                    <textarea class="hit"></textarea>
                </div>
                <div class="tab-body" name="error">
                    <div class="log-file-actions">
                        <a href="#" name="download-log-file">Download</a>
                        <a href="#" name="clear-log-file">Clear</a>
                    </div>
                    <textarea class="hit"></textarea>
                </div>
            </div>
        </div>
    </div>
</div>


<?php get_footer(); ?>
