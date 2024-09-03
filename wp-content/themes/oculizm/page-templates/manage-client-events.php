<?php

/* Template Name: Manage Client Events */

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
        <h2>Client Events</h2>
		<div class="loader"></div>
        <table class='tablesorter' name="manageClientEvents">
            <thead>
                <tr>
					<th>Date</th>
					<th>Post ID</th>
                    <th>Event Type</th>
					<th>HostName</th>
                    <th>Product ID</th>
					<th>SKU</th>
					<th>Session ID</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>


<?php get_footer(); ?>
