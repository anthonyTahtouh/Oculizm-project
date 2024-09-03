<?php

/* Template Name: Account */

get_header();

require_once(STYLESHEETPATH . '/inc/site-header.php');
require_once(STYLESHEETPATH . '/inc/sidebar.php');

?>

<div class="main">
	<h1><?php the_title(); ?></h1>

	<div class="content-block">
		<div class="content-block-description">Organisation</div>
		<div class="content-block-body">
			<div class="form-row">
				<div class="col-25">
					<div class="client-logo-container">
						<img name="clientLogo" src="" alt="Client Logo" />
					</div>
				</div>
				<div class="col-75">
					<div class="client-name"></div>
					<div class="client-id">
						<div class="client-id-label">Client ID:</div>
						<input readonly type="text" class="client-id-value" value="<?php echo $client_id; ?>" />
						<a href='#' class="button-copy"></a>
					</div>
				</div>
			</div>
			<div class="form-row">
				<div class="form-label">Sites</div>
				<div class="site-list"></div>
			</div>
		</div>
	</div>

	<div class="content-block">
		<div class="content-block-description">User Details</div>
		<div class="content-block-body">
			<div class="form-row">
				<div class="form-label">Email</div>
				<input name="email" type="email" data-validation-rules="Invalid email">
			</div>
			<div class="form-row">
				<div class="form-label">First Name</div>
				<input name="firstName" type="text" data-validation-rules="Invalid first name">
			</div>
			<div class="form-row">
				<div class="form-label">Last Name</div>
				<input name="lastName" type="text" data-validation-rules="Invalid last name">
			</div>
			<div class="cta-group">
				<a href='#' data-action="updateAccount" class="cta-primary">Save</a>
			</div>
		</div>
	</div>

	<div class="content-block">
		<div class="content-block-description">Change Password</div>
		<div class="content-block-body">
			<div class="form-row">
				<div class="form-label">Password</div>
				<input name="password1" type="password" data-validation-rules="Passwords must be at least 8 characters">
			</div>
			<div class="form-row">
				<div class="form-label">Repeat Password</div>
				<input name="password2" type="password" data-validation-rules="Passwords don't match">
			</div>
			<div class="cta-group">
				<a href='#' data-action="changePassword" class="cta-primary">Save</a>
			</div>
		</div>
	</div>
</div>


<?php get_footer(); ?>