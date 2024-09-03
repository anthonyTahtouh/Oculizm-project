
// define variables
var foundAValidFacebookPageId = false;
var connection_id;
var sister_accounts;
var thereExistsACheckedRowWithoutASelectedAccount = false;
let long_lived_facebook_user_access_token;
let instagram_accounts = new Array();
// let instagram_accounts_2 = new Array();
var selectedSearch;
const socialSearchInput = document.querySelector('.social-search'); // Get the input element

// Facebook login
function loginWithFacebook() {
	// console.log('loginWithFacebook');

	showFullScreenLoader();

	FB.getLoginStatus(function (response) {
		console.log("FB.getLoginStatus()");
		console.log(response);

		if (response.status === 'connected') {

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
							jQuery('.form-overlay[name=choose-instagram-accounts]').fadeIn();
							jQuery('.form-overlay[name=choose-instagram-accounts]').scrollTop(0);
							jQuery('body').addClass('no-scroll');

							// if there are sister accounts, hide the CTA until Oculizm accounts are assigned
							if (sister_accounts.length > 0) jQuery('a[data-action=connect-instagram-accounts]').hide();

							var results = response.data.map(function (account, index) {
								return new Promise(function (resolve) {
									return createInstagramBusinessAccountOption(account.id, response.data, index, resolve);
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

									showPopup('Could not find any Business Instagram accounts.', buttons);
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
			showPopup('You need to grant permission to access your Instagram account.', buttons);
		}

	});
}

// get Instagram account
function fetchInstagramAccount() {
	// console.log('fetchInstagramAccount');

	// for each connection...
	for (var i = 0; i < connections.length; i++) {
		var c = connections[i];

		// if it's an Instagram connection...
		if (c['social_network'] == "instagram") {

			// get connection variables
			var connection_id = c['id'];
			ig_facebook_access_token = c['facebook_access_token'];
			ig_instagram_business_id = c['instagram_business_id'];

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
						'<li name="instagram-profile"><a href="/instagram-profile/?username=' + connections[i]['username'] + '">Profile</a></li>' +
						'<li name="instagram-reels"><a href="/instagram-reels/?username=' + connections[i]['username'] + '">Reels</a></li>' +
						'<li name="instagram-stories"><a href="/instagram-stories/?username=' + connections[i]['username'] + '">Stories</a></li>' +
						'<li name="instagram-tags"><a href="/instagram-tags/?username=' + connections[i]['username'] + '">Tags</a></li>' +
					'</ul>' +
				'</div>' +
				'<div class="expandable-content">' +
					'<div class="post-grid"></div>' +
					'<div class="connection-stats">' +
						'<div class="stat">' +
							'<div class="stat-name">Likes</div>' +
							'<div class="stat-value">0</div>' +
						'</div>' +
						'<div class="stat">' +
							'<div class="stat-name">New Likes</div>' +
							'<div class="stat-value">0</div>' +
						'</div>' +
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
			jQuery('.page-header').show();

			// get account info
			FB.api(
				'/' + ig_instagram_business_id,
				'GET',
				{
					'access_token': ig_facebook_access_token,
					"fields": "followers_count, follows_count, media_count, profile_picture_url,name,username,media{media_type,media_url,username,timestamp,comments_count,like_count,caption,permalink}"
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
						var ig_instagram_business_id = response.id;
						var profilePicture = response.profile_picture_url;
						var name = response.name;
						var username = response.username;

						// find the connection ID of this connection
						for (var i = 0; i < connections.length; i++) {
							var c = connections[i];
							if (c['instagram_business_id'] == ig_instagram_business_id) connection_id = c['id'];
						}
						var connectionPanel = jQuery('.social-network-account[data-connection-id=' + connection_id + ']');

						jQuery(connectionPanel).attr('data-instagram-business-id', ig_instagram_business_id);
						jQuery(connectionPanel).attr('data-username', username);

						// show a few posts next to this connection
						const posts = response.media.data.slice(0, 4);
						if (posts) {
							// Loop through each post
							for (let i = 0; i < posts.length; i++) {
								const post = posts[i];

								// Check the media type and generate the corresponding HTML
								let mediaHtml;
								if (post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM' ) {
									mediaHtml = '	<div class="post-inner">' +
										'		<img class="image-fill" src="' + post.media_url + '">' +
										'	</div>';
								} else {
									mediaHtml = '	<div class="post-inner">' +
										'		<video class="video">' +
										'			<source src="' + post.media_url + '" type="video/mp4">' +
										'			Your browser does not support the video tag.' +
										'		</video>' +
										// '		<div class="video-icon"></div>' + // showing the play icon here is misleading since we can't play it on this page
										'	</div>';
								}

								// generate the post HTML
								const postHtml = '<div class="network-post" ' +
									'data-social-id="' + post.id + '">' +
									mediaHtml +
									'</div>';

								jQuery('.post-grid', connectionPanel).append(postHtml);
							}
							// Get all the .post-inner elements
							const postInners = document.querySelectorAll('.post-inner');

							// Loop through each .post-inner element
							postInners.forEach((postInner) => {
								// Get the current width of the .post-inner element
								const width = postInner.offsetWidth;

								// Set the height of the .post-inner element to match its width
								postInner.style.height = `${width}px`;
							});
						}

						// update UI
						jQuery('.profile-pic img', connectionPanel).attr('src', profilePicture);
						jQuery('.username', connectionPanel).html('@' + username);
						jQuery('.screen-name', connectionPanel).html(name);
						if (response.media_count) jQuery('.connection-stats .stat:nth-of-type(1) .stat-value', connectionPanel).html(prettyInt(response.media_count));
						if (response.follows_count) jQuery('.connection-stats .stat:nth-of-type(2) .stat-value', connectionPanel).html(prettyInt(response.follows_count));
						if (response.followers_count) jQuery('.connection-stats .stat:nth-of-type(3) .stat-value', connectionPanel).html(prettyInt(response.followers_count));

						jQuery('.page-header').show();
					}
					hideFullScreenLoader();
				}
			);
		}
	}
}

// create Instagram account option
function createInstagramBusinessAccountOption(pageId, data, index, resolve) {
	// console.log('createInstagramBusinessAccountOption');

	if (pageId) {

		foundAValidFacebookPageId = true;

		console.log('FB.api(pageID)');
		// get this Facebook page's Instagram business account details
		FB.api(
			'/' + pageId,
			'GET',
			{ "fields": "instagram_business_account" },
			function (response) {
				console.log(response);

				// check this page has an associated Instagram Business account
				if (response.instagram_business_account) {

					var instagramBusinessAccountId = response.instagram_business_account.id;

					// now get the details 
					console.log('FB.api(instagramBusinessAccountId)');
					FB.api(
						'/' + instagramBusinessAccountId,
						'GET',
						{ "fields": "profile_picture_url,name,username" },
						function (response) {
							console.log(response);

							// generate sister account dropdown HTML
							var sisterAccountsHtml = "";
							if (sister_accounts.length > 0) {
								sisterAccountsHtml += "<select class='sister-client'>";
								sisterAccountsHtml += "<option value=''>Select Oculizm account...</option>";
								for (var i = 0; i < sister_accounts.length; i++) {
									sisterAccountsHtml += "<option value='" + sister_accounts[i]['id'] + "'>" + sister_accounts[i]['name'] + "</option>";
								}
								sisterAccountsHtml += "</select>";
							}

							// fill in search term info
							var optionHtml = "<div class='form-row'>" +
								"	<div class='checkbox-option active' data-account-id = '" + instagramBusinessAccountId + "' data-username = '" + response.username + "' data-screen-name = '" + response.name + "' data-profile-pic-url = '" + response.profile_picture_url + "'>" +
								"		<div class='checkbox-button'></div>" +
								"		<div class='checkbox-info'>" +
								"			<div class='checkbox-icon'><img src='" + response.profile_picture_url + "'></div>" +
								"			<div class='checkbox-label'>" + response.name + "</div>" +
								sisterAccountsHtml +
								"		</div>" +
								"	</div>" +
								"</div>";

							// close the container div after all the options are populated
							if (data.length - 1 === index) optionHtml += '</div>';

							jQuery('.form-overlay[name=choose-instagram-accounts] .content-block-body').append(optionHtml);
							hideFullScreenLoader();

							return resolve();
						}
					);
				} else return resolve();
			}
		);
	} else return resolve();
}

// check whether we have Instagram accounts selected and assigned to Oculizm accounts, before we proceed to saving them in the database
function verifyAccountsToBeConnected() {
	console.log('verifyAccountsToBeConnected');

	// hide the CTA to start with
	jQuery('a[data-action=connect-instagram-accounts]').hide();

	// first check if at least one page has been selected
	if (jQuery('.form-overlay[name=choose-instagram-accounts] .checkbox-option.active').length == 0) return;

	// if there are no sister accounts, proceed
	if (sister_accounts.length == 0) {
		jQuery('a[data-action=connect-instagram-accounts]').show();
		return;
	}

	// let's reset the flag
	thereExistsACheckedRowWithoutASelectedAccount = false;

	// now for each selected checkbox, check that an Oculizm account has been assigned
	jQuery('.form-overlay[name=choose-instagram-accounts] .checkbox-option.active').each(function() {
		sister_client_id = jQuery(this).find('.sister-client').find(":selected").val();
		if (!sister_client_id) thereExistsACheckedRowWithoutASelectedAccount = true;
	});

	// show/hide the continue button
	if (!thereExistsACheckedRowWithoutASelectedAccount) jQuery('a[data-action=connect-instagram-accounts]').show();
}

// Instagram account checkbox selection
jQuery(document).on('click', '.form-overlay[name=choose-instagram-accounts] .checkbox-button', function () {
	verifyAccountsToBeConnected();
});

// sister account assignment
jQuery(document).on('change', '.form-overlay[name=choose-instagram-accounts] select.sister-client', function () {
	if (sister_accounts.length > 0) verifyAccountsToBeConnected();
});

// connect Instagram business accounts
jQuery(document).on('click', 'a[data-action=connect-instagram-accounts]', function () {

	// get the array of checked items in the modal
	jQuery('.checkbox-option.active').each(function () {

		// get Instagram account data from this checkbox element
		let accountId = jQuery(this).attr('data-account-id');
		let username = jQuery(this).attr('data-username');
		let screenName = jQuery(this).attr('data-screen-name');
		let profile_pic_url = jQuery(this).attr('data-profile-pic-url');

		// get the sister client, if there is one
		var sister_client_id = "";
		if (sister_accounts.length > 0) {
			sister_client_id = jQuery(this).find('.sister-client').find(":selected").val();
			if (!sister_client_id) thereExistsACheckedRowWithoutASelectedAccount = true;
		}

		var instagram_account = [accountId, username, screenName, profile_pic_url, sister_client_id];
		instagram_accounts.push(instagram_account);
	});

	jQuery('.form-overlay[name=choose-instagram-accounts]').fadeOut();
	jQuery('body').removeClass('no-scroll');

	showFullScreenLoader();

	// if (thereExistsACheckedRowWithoutASelectedAccount) return;

	// save the connections
	jQuery.ajax({
		url: ajaxUrl,
		data: {
			'action': 'setup_instagram',
			'facebook_token': long_lived_facebook_user_access_token,
			'facebook_user_id': facebook_user_id,
			'ig_business_accounts': instagram_accounts
		},
		dataType: 'JSON',
		success: function (data) {
			console.log(data);
			location.reload(true);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(errorThrown);
		},
		complete: function () { }
	});
});

// MAIN THREAD
(function ($) {

	jQuery(document).ready(function () {

		var keyPressTimer;

		// MAIN LOOP TO WAIT FOR CONNECTION PARAMETERS TO BE SET IN MAIN.JS
		function awaitConnection() {
			if (typeof instagram_connection !== "undefined") {
				fetchInstagramAccount();
				getSavedSearches();
			}
			else setTimeout(awaitConnection, 50);
		}

		// social search
		$(".social-search input").on({

			keydown: function(e) {

				var trigger = this;
				var txt = trigger.value;

				// don't allow @ or # after the first character
				var regex = /^[\@\#]+$/;
				if (regex.test(e.key)) {
					if (txt.length > 1) return false;
				}
				else if (e.key == 'Enter') {
					$('.search-result.active').trigger('click');
					return false;
				}
				else if (e.key == 'ArrowLeft') return false;
				else if (e.key == 'ArrowRight') return false;

				// disallow space bar
				if (e.which == 32) return false;

				// escape key
				else if (e.key == 'Escape') {
					$('.results-box .results-list').empty();
					$('.results-box').height(0);
					$(".social-search").css({
						'border-bottom-left-radius': '20px',
						'border-bottom-right-radius': '20px'
					});
					$('.social-search input').val('');
					return false;
				}

				// Instagram username: 1-30 characters. Only letters, numbers, periods and underscores
				// Instagram hashtag: 1-60 (found through testing). Only letters, numbers and underscores. Can start with any of those

				// Twitter username: 1-15 characters. Only letters, numbers and underscores
				// Twitter hashtag: 1-139 characters. Only letters and numbers, and must start with a letter
				var regex = /^[a-zA-Z0-9\@\#\_\.]+$/;
				if (!regex.test(e.key)) return false;
			},

			keyup: function(e) {

				var trigger = this;
				var txt = trigger.value;

				// check for @ or #
				var regex = /^[\@\#]+$/;
				if (regex.test(e.key)) {
					if (txt.length > 1) return false;
				}

				// Alt key being released
				if (e.key == 'Alt') return false;

				// Ctrl key being released
				if (e.key == 'Control') return false;

				// Shift key being released
				if (e.key == 'Shift') return false;

				// up arrow
				if (e.key == 'ArrowUp') return false;

				// right arrow
				if (e.key == 'ArrowDown') return false;

				// left arrow
				if (e.key == 'ArrowLeft') return false;

				// right arrow
				if (e.key == 'ArrowRight') return false;

				var regex = /^[a-zA-Z0-9\@\#\_\.]+$/;
				if (e.key == "Backspace") { }
				else if (!regex.test(e.key)) return false;

				// strip out the @ or the #
				var txtNoPrefix = txt.replace(/[#\@]/ig, '');

				// if enough characters have been typed...
				if (txtNoPrefix.length >= 3) {

					// clear results
					$('.results-box').show();
					$('.results-box .results-list').empty();
					$('.results-box').height(100);
					$('.results-box .loader').show();

					// reset the timer
					if (keyPressTimer) clearTimeout(keyPressTimer);

					keyPressTimer = setTimeout(function() {

						// make it lower case
						txtNoPrefix = txtNoPrefix.toLowerCase();

						// if it's a username 
						if (txt.substring(0, 1) == "@") {

							FB.api(
								'/' + ig_instagram_business_id,
								'GET',
								{
									"fields": "business_discovery.username(" + txtNoPrefix + "){name,profile_picture_url,followers_count,media_count,media{media_type,timestamp,media_url,caption,comments_count,children}}",
									access_token: ig_facebook_access_token
								},
								function (response) {
									console.log(response);

									let searchResultHtml = "";

									// if there was an error...
									if (response.error) {
										searchResultHtml = "<div class='search-result'>" +
											"<div class='error-message'> No results </div>";
										var buttons = new Array(
											{ 'action': 'close-popup', 'text': 'Ok' }
										);
										showPopup('Error: ' + response.error.message + '<br> Check Docs: <a href="https://developers.facebook.com/docs/graph-api/overview/rate-limiting/#applications" > https://developers.facebook.com/docs/graph-api/overview/rate-limiting/#applications </a>', buttons);
									}

									else {
										searchResultHtml = "<div class='search-result success-result' data-user-id='" + response.business_discovery.id + "' data-search-type='user'>" +
											"	<div class='user-image'>" +
											"		<img src='" + response.business_discovery.profile_picture_url + "'>" +
											"	</div>" +
											"	<div class='search-result-text'>" +
											"		<div class='username'>" + txtNoPrefix + "</div>" +
											"		<div class='screen-name'>" + response.business_discovery.name + "</div>" +
											"	</div>";
									}

									// show results
									$('.social-search').find('.results-box .results-list').show();
									$(".social-search").css({
										'border-bottom-left-radius': '0px',
										'border-bottom-right-radius': '0px'
									});
									$('.social-search').find('.results-box .results-list').append(searchResultHtml);
									$('.social-search').find('.results-box').height(64);
									$('.results-box .loader').hide();
								}
							);
						}

						// else if it's a hashtag
						else {

							FB.api(
								'/ig_hashtag_search',
								'GET',
								{
									user_id: ig_instagram_business_id,
									q: txtNoPrefix,
									access_token: ig_facebook_access_token,
									fields: 'id,name'
								},
								function (response) {
									console.log(response);

									var searchResultHtml = "";

									// if there was an error...
									if (response.error) {
										searchResultHtml = "<div class='search-result'>" +
											"<div class='error-message'> No results </div>";
										var buttons = new Array(
											{ 'action': 'close-popup', 'text': 'Ok' }
										);
										showPopup('Error: ' + response.error.message + '<br> Check Docs: <a href="https://developers.facebook.com/docs/graph-api/overview/rate-limiting/#applications" > https://developers.facebook.com/docs/graph-api/overview/rate-limiting/#applications </a>', buttons);
									}

									else {
										var hashtagId = response.data[0].id;
										var hashtagName = response.data[0].name;

										searchResultHtml = "<div class='search-result success-result' data-hashtag-id='" + hashtagId + "' data-search-type='hashtag'>" +
											"	<div class='hashtag-icon'></div>" +
											"	<div class='search-result-text'>" +
											"		<div class='hashtag-text'>" + hashtagName + "</div>" +
											"	</div>";
									}

									// show results
									$('.social-search').find('.results-box .results-list').show();
									$(".social-search").css({
										'border-bottom-left-radius': '0px',
										'border-bottom-right-radius': '0px'
									});
									$('.social-search').find('.results-box .results-list').append(searchResultHtml);
									$('.social-search').find('.results-box').height(64);
									$('.results-box .loader').hide();
								}
							);
						}
					}, 1000);
				}

				// else, not enough characters to perform a search...
				else {
					$('.results-box .results-list').empty();
					$('.results-box').height(0);
					$('.results-box').hide();
					$(".social-search").css({
						'border-bottom-left-radius': '20px',
						'border-bottom-right-radius': '20px'
					});
				}

				e.stopPropagation();
				return;
			}
		});

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
				// console.log(data);

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
