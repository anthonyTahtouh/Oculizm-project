
// define variables
var foundAValidFacebookPageId = false;
var connection_id;
var sister_accounts;
var thereExistsACheckedRowWithoutASelectedAccount = false;
let long_lived_facebook_user_access_token;
let facebook_pages = new Array();
let facebook_pages_2 = new Array();



// Facebook login
function loginWithFacebook() {
	// console.log('loginWithFacebook');

	showFullScreenLoader();

	FB.getLoginStatus(function (response) {
		console.log("FB.getLoginStatus()");
		console.log(response);
		
		if ((response.status === 'connected') && (response.authResponse && response.authResponse.expiresIn !== 0) ) {

			let regular_facebook_user_access_token = response['authResponse']['accessToken'];
			console.log("Regular Facebook User Access Token: ");
			console.log(regular_facebook_user_access_token);

			// exchange regular token for a long lived one
			jQuery.ajax({
				url: ajaxUrl,
				data: {
					'action': 'generate_facebook_long_lived_token',
					'access_token': regular_facebook_user_access_token
				},
				dataType: 'JSON',
				success: function (data) {
					console.log('generate_facebook_long_lived_token()');
					console.log(data);

					long_lived_facebook_user_access_token = JSON.parse(data.body).access_token;
					facebook_user_id = response['authResponse']['userID'];

					console.log('Long lived Facebook User Access Token:');
					console.log(long_lived_facebook_user_access_token);

					console.log("Facebook User ID: ");
					console.log(facebook_user_id);

					console.log('FB.api(facebook_user_id/accounts)');
					FB.api(
						'/' + facebook_user_id + '/accounts',
						'GET',
						{ 'access_token': long_lived_facebook_user_access_token },
						function (response) {
							console.log(response);
						
							// if there are no results...
							if (response.data.length === 0) {

								hideFullScreenLoader();

								// create popup
								var buttons = new Array(
									{ 'action': 'close-popup', 'text': 'Ok' }
								);

								showPopup('Could not find any Facebook pages linked to this account.', buttons);
								return;
							}

							// display the account selection modal
							jQuery('.form-overlay[name=choose-facebook-pages]').fadeIn();
							jQuery('.form-overlay[name=choose-facebook-pages]').scrollTop(0);
							jQuery('body').addClass('no-scroll');

							// if there are sister accounts, hide the CTA until Oculizm accounts are assigned
							if (sister_accounts.length > 0) jQuery('a[data-action=connect-facebook-pages]').hide();

							var results = response.data.map(function (account, index) {
								return new Promise(function (resolve) {

									// get page data
									let pageID = response.data[index].id;
									let pageName = response.data[index].name;
									let longLivedPageAccessToken = response.data[index].access_token; // this is the never expiring page access token

									console.log(pageName + " (" + pageID + ") Page access token:")
									console.log(longLivedPageAccessToken);

									// build the Facebook page object
									var facebook_page = [pageID, pageName, longLivedPageAccessToken];
									
									// add it to our array of Facebook pages
									facebook_pages.push(facebook_page);

									console.log(facebook_page);

									return createFacebookPageOption(account.id, response.data, index, resolve);
								});
							});

							// once we've gone through all returned results...
							Promise.all(results).then(function () {

								if (!foundAValidFacebookPageId) {
									hideFullScreenLoader();

									// create popup
									var buttons = new Array(
										{ 'action': 'close-popup', 'text': 'Ok' }
									);

									showPopup('Could not find any Facebook pages.', buttons);
								} 

								// reset flag in case we're trying to log in with different facebook accounts
								foundAValidFacebookPageId = false;
							});
						}
					);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				},
				complete: function () {}
			});
		}
		else {
			hideFullScreenLoader();
			var buttons = new Array({
				'action': 'close-popup',
				'text': 'Ok'
			});
			showPopup('You need to grant permission to access your Facebook account.', buttons);
		}
	
	});
}

// get Facebook acount
function fetchFacebookAccount () {
	// console.log('fetchFacebookAccount');

	// for each connection...
    for (var i = 0; i < connections.length; i++) {
        var c = connections[i];

        // if it's a Facebook connection...
        if (c['social_network'] == "facebook") {

        	// get connection variables
        	var connection_id = c['id'];
        	fb_facebook_access_token = c['facebook_access_token'];
        	fb_instagram_business_id = c['instagram_business_id'];

			// create the item in our connections panel
			var connectionHtml = jQuery('<div class="social-network-account expandable-row row-open" data-connection-id="' + connection_id + '">' +
				'<div class="connection-info">' +
					'<div class="social-network-icon"></div>' +
					'<div class="profile-pic">' +
						'<img>' +
					'</div>' +
				'</div>' +
				'<div class="connection-names">' +
					'<div class="username"></div>' +
					'<div class="screen-name"></div>' +
				'</div>' +
				'<a href="#" class="chevron chevron-up expand-trigger">&nbsp;</a>' +
				'<div class="social-network-subpages">' +
					'<ul>' +
						'<li name="facebook-photos"><a href="/facebook-photos/?username=' + connections[i]['username'] + '">Photos</a></li>' +
						'<li name="facebook-videos"><a href="/facebook-videos/?username=' + connections[i]['username'] + '">Videos</a></li>' +
						'<li name="facebook-reels"><a href="/facebook-reels/?username=' + connections[i]['username'] + '">Reels</a></li>' +

					'</ul>' +
				'</div>' +
				'<div class="expandable-content">' +
					'<div class="post-grid"></div>' +
					'<div class="connection-stats">' +
						'<div class="stat">' +
							'<div class="stat-name">Fans</div>' +
							'<div class="stat-value">0</div>' +
						'</div>' +
						// '<div class="stat">' +
						// 	'<div class="stat-name">Following</div>' +
						// 	'<div class="stat-value">0</div>' +
						// '</div>' +
						'<div class="stat">' +
							'<div class="stat-name">Talking About</div>' +
							'<div class="stat-value">0</div>' +
						'</div>' +
					'</div>' +
					'<div class="connection-actions">' +
						'<a href="#" class="cta-secondary disconnect">Disconnect</a>' +
					'</div>' +
				'</div>' +
			'</div>');

			// update the UI
			jQuery('div[name=social-network-accounts]').append(connectionHtml);
			jQuery('.content-block[name=social-network-accounts]').show();
			jQuery('.content-block[name=offline]').hide();
			// jQuery('.page-header').show();

			// get account info
			FB.api(
				'/' + fb_instagram_business_id,
				'GET',
				{
					'access_token': fb_facebook_access_token,
					"fields": "about,access_token,category,category_list,company_overview,connected_instagram_account,cover,description,engagement,fan_count,featured_video,general_info,is_eligible_for_branded_content,link,name,new_like_count,picture,products,rating_count,talking_about_count,username"
				},
				function (response) {
					console.log(response);
					
					// error handling
					if (response.error) {
						var error = response['error']['message'];

						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup(error, buttons);
					}

					// else
					else {

						// define variables
						var fb_instagram_business_id = response.id;
						var profilePicture = response.picture.data.url;
						var name = response.name;
						var username = response.username;

						// find the connection ID of this connection
			            for (var i = 0; i < connections.length; i++) {
						    var c = connections[i];
						    if (c['instagram_business_id'] == fb_instagram_business_id) connection_id = c['id'];
						}
						var connectionPanel = jQuery('.social-network-account[data-connection-id=' + connection_id + ']');

					    jQuery(connectionPanel).attr('data-instagram-business-id', fb_instagram_business_id);
					    jQuery(connectionPanel).attr('data-username', username);

						// update UI
						jQuery('.profile-pic img', connectionPanel).attr('src', profilePicture);
						jQuery('.username', connectionPanel).html('@' + username);
						jQuery('.screen-name', connectionPanel).html(name);
						if (response.fan_count) jQuery('.connection-stats .stat:nth-of-type(1) .stat-value', connectionPanel).html(prettyInt(response.fan_count));
						if (response.talking_about_count) jQuery('.connection-stats .stat:nth-of-type(2) .stat-value', connectionPanel).html(prettyInt(response.talking_about_count));
					
						// jQuery('.page-header').show();
					}
					hideFullScreenLoader();
				}
			);
		}
	}
}

// show Facebook page options
function createFacebookPageOption(pageId, data, index, resolve) {
	// console.log('createFacebookPageOption');

	if (pageId) {

		foundAValidFacebookPageId = true;

		console.log('FB.api(pageID)');
		// get this Facebook page's details
		FB.api(
			'/' + pageId,
			'GET',
			{ "fields": "picture,name,username" }, // we don't ask for an access token here because it'll be short lived one (expires in 1 hour)
			function (response) {
				console.log(response);

				// generate sister account dropdown HTML
				var sisterAccountsHtml = "";
				if (sister_accounts.length > 0) {
					sisterAccountsHtml += "<select class='sister-client'>";
					sisterAccountsHtml += "<option value=''>Select Oculizm account...</option>";
					for (var i=0; i<sister_accounts.length; i++) {
						sisterAccountsHtml += "<option value='" + sister_accounts[i]['id'] + "'>" + sister_accounts[i]['name'] + "</option>";
					}
					sisterAccountsHtml += "</select>";
				}

				// fill in search term info
				var optionHtml = "<div class='form-row'>" +
								"	<div class='checkbox-option active' data-account-id = '" + pageId + 
								"' 		data-username = '" + response.username + 
								"' 		data-screen-name = '" + response.name + 
								"' 		data-profile-pic-url = '" + response.picture.data.url + 
								"'>" +
								"		<div class='checkbox-button'></div>" +
								"		<div class='checkbox-info'>" +
								"			<div class='checkbox-icon'><img src='" + response.picture.data.url + "'></div>" +
								"			<div class='checkbox-label'>" + response.name + "</div>" +
								sisterAccountsHtml +
								"		</div>" +
								"	</div>" +
								"</div>";

				// close the container div after all the options are populated
				if (data.length - 1 === index) optionHtml += '</div>';

				jQuery('.form-overlay[name=choose-facebook-pages] .content-block-body').append(optionHtml);
				hideFullScreenLoader();

				return resolve();
			}
		);
	} else return resolve();
}

// check whether we have Facebook pages selected and assigned to Oculizm accounts, before we proceed to saving them in the database
function verifyAccountsToBeConnected() {
	console.log('verifyAccountsToBeConnected');

	// hide the CTA to start with
	jQuery('a[data-action=connect-facebook-pages]').hide();

	// first check if at least one page has been selected
	if (jQuery('.form-overlay[name=choose-facebook-pages] .checkbox-option.active').length == 0) return;

	// if there are no sister accounts, proceed
	if (sister_accounts.length == 0) {
		jQuery('a[data-action=connect-facebook-pages]').show();
		return;
	}

	// let's reset the flag
	thereExistsACheckedRowWithoutASelectedAccount = false;

	// now for each selected checkbox, check that an Oculizm account has been assigned
	jQuery('.form-overlay[name=choose-facebook-pages] .checkbox-option.active').each(function() {
		sister_client_id = jQuery(this).find('.sister-client').find(":selected").val();
		if (!sister_client_id) thereExistsACheckedRowWithoutASelectedAccount = true;
	});

	// show/hide the continue button
	if (!thereExistsACheckedRowWithoutASelectedAccount) jQuery('a[data-action=connect-facebook-pages]').show();
}

// Facebook page checkbox selection
jQuery(document).on('click', '.form-overlay[name=choose-facebook-pages] .checkbox-button', function () {
	verifyAccountsToBeConnected();
});

// sister account assignment
jQuery(document).on('change', '.form-overlay[name=choose-facebook-pages] select.sister-client', function () {
	if (sister_accounts.length > 0) verifyAccountsToBeConnected();
});

// connect Facebook pages
jQuery(document).on('click', 'a[data-action=connect-facebook-pages]', function () {

	// get the array of checked items in the modal
	jQuery('.checkbox-option.active').each( function() {

		// get Facebook page data from this checkbox element
		let account_id = jQuery(this).attr('data-account-id');
		let username = jQuery(this).attr('data-username');
		let screen_name = jQuery(this).attr('data-screen-name');
		let profile_pic_url = jQuery(this).attr('data-profile-pic-url');

		// get the sister client, if there is one
		var sister_client_id = "";
		if (sister_accounts.length > 0) {
			sister_client_id = jQuery(this).find('.sister-client').find(":selected").val();
			if (!sister_client_id) thereExistsACheckedRowWithoutASelectedAccount = true;
		}

		// merge data with existing page data array
		for (var i=0; i<facebook_pages.length; i++) {

			let p = facebook_pages[i];

			if (account_id == facebook_pages[i][0]) {
				p.push(profile_pic_url);
				p.push(username);
				p.push(sister_client_id);
				facebook_pages_2.push(p);
			}
		}
	});

	jQuery('.form-overlay[name=choose-facebook-pages]').fadeOut();
	jQuery('body').removeClass('no-scroll');

	showFullScreenLoader();

	// save the connections
	jQuery.ajax({
		url: ajaxUrl,
		data: {
			'action': 'setup_facebook',
			'facebook_token': long_lived_facebook_user_access_token,
			'facebook_user_id': facebook_user_id,
			'facebook_pages': facebook_pages_2
		},
		dataType: 'JSON',
		success: function (data) {
			console.log(data);
			location.reload(true);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(errorThrown);
		},
		complete: function () {}
	});
});

// MAIN THREAD
(function ($) {

	jQuery(document).ready(function () {

		// MAIN LOOP TO WAIT FOR CONNECTION PARAMETERS TO BE SET IN MAIN.JS
		function awaitConnection() {
		    if (fb_loaded) {
			    if (typeof facebook_connection !== "undefined") {
					fetchFacebookAccount();
			    } else setTimeout(awaitConnection, 100);
			} else setTimeout(awaitConnection, 100);
		}

		// MAIN THREAD
		awaitConnection();
		
		// check for sister accounts
		$.ajax({
			url: ajaxUrl,
			data: {
				'action': 'get_sister_accounts',
			},
			dataType: 'JSON',
			success: function (data) {
				console.log(data);

				sister_accounts = data;
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(errorThrown);
			},
			complete: function () {
				hideFullScreenLoader();
			}
		});
		
	});
}(jQuery));
