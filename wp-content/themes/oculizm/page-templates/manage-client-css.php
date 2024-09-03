<?php

/* Template Name: Manage Client CSS */

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
        <h2>Shoppable Gallery CSS</h2>
        <table class='tablesorter' name="shopCss">
            <thead>
                <tr>
                    <th>Client ID</th>  
                    <th>CSS</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <h2>Product Page Gallery CSS</h2>
        <table class='tablesorter' name="ppgCss">
            <thead>
                <tr>
                    <th>Client ID</th>
                    <th>CSS</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>


<?php get_footer(); ?>
