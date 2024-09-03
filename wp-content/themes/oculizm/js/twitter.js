
// define variables
var selectedSearch;
const socialSearchInput = document.querySelector('.social-search'); // Get the input element





(function ($) {
	
	jQuery(document).ready(function() {
		
		var keyPressTimer;
					
		// MAIN LOOP TO WAIT FOR CONNECTION PARAMETERS TO BE SET IN MAIN.JS
		function awaitConnection() {
		    if (typeof twitter_connection !== "undefined") {
				getTwitterUserInfo();
		    }
		    else setTimeout(awaitConnection, 50);
		}

		// get Twitter user info
		function getTwitterUserInfo() {
			console.log('getTwitterUserInfo');

			// validate connection
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_twitter_user'
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);

					if (data.api_response) {
		
						var connection_id;
						if (data.api_response.errors) {
							var error = data.api_response.errors[0].message;
							var buttons = new Array(
								{'action': 'close-popup', 'text': 'Ok'}
							);
							showPopup(error, buttons);

							connection_id = data.connection.id;
						}

						else if (data.api_response.data) {

				        	// get connection variables
				        	connection_id = data.connection.id;

							let profile_image_url = data.api_response.data.profile_image_url;
				        	profile_image_url = profile_image_url.replace('_normal', '');

							// create the item in our connections panel
							var connectionHtml = $('<div class="social-network-account expandable-row row-open" data-connection-id="' + connection_id + '">' +
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
										'<li name="twitter-profile"><a href="/twitter-profile/">Profile</a></li>' +
										'<li name="twitter-mentions"><a href="/twitter-mentions/">Mentions</a></li>' +
									'</ul>' +
								'</div>' +
								'<div class="expandable-content">' +
									'<div class="post-grid"></div>' +
									'<div class="connection-stats">' +
										'<div class="stat">' +
											'<div class="stat-name">Tweets</div>' +
											'<div class="stat-value">0</div>' +
										'</div>' +
										'<div class="stat">' +
											'<div class="stat-name">Following</div>' +
											'<div class="stat-value">0</div>' +
										'</div>' +
										'<div class="stat">' +
											'<div class="stat-name">Followers</div>' +
											'<div class="stat-value">0</div>' +
										'</div>' +
									'</div>' +
									'<div class="connection-actions">' +
										'<a href="#" class="cta-secondary disconnect">Disconnect</a>' +
									'</div>' +
								'</div>' +
							'</div>');

							// update the UI
							$('div[name=social-network-accounts]').append(connectionHtml);
							$('.content-block[name=social-network-accounts]').show();
							$('.content-block[name=offline]').hide();

							$('.content-block[name=search]').show();
							$('.content-block[name=saved-searches]').show();
							jQuery('.page-header').show();

							// populate fields
							$('.social-network-account .profile-pic img').attr('src', profile_image_url);
							$('.menu-item[name=twitter] .menu-item a span').css('background-image', 'url("' + profile_image_url + '")');
							$('.social-network-account .username').html('@' + data.api_response.data.username);
							$('.social-network-account .screen-name').html(data.api_response.data.name);
							$('.social-network-account .stat:nth-of-type(1) .stat-value').html(prettyInt(data.api_response.data.public_metrics.tweet_count));
							$('.social-network-account .stat:nth-of-type(2) .stat-value').html(prettyInt(data.api_response.data.public_metrics.following_count));
							$('.social-network-account .stat:nth-of-type(3) .stat-value').html(prettyInt(data.api_response.data.public_metrics.followers_count));
						}
					}

					getSavedSearches();
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				},
				complete: function() {
					$('.social-network-account .loader').hide();
				}
			});
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
				var regex = /^[a-zA-Z0-9\@\#\_]+$/;
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

				var regex = /^[a-zA-Z0-9\@\#\_]+$/;
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

							// get Twitter user info
						    $.ajax({
								url: ajaxUrl,
								data:{
									'action':'get_twitter_users',
									'username': txtNoPrefix
								},
								dataType: 'JSON',
					            success: function(data) {
					                console.log(data);
									
					                data = data.data;
					                console.log(data);

					                let searchResultHtml = "";

					                if (data.length > 0) {

						                // build result HTML
						                for (var i=0; i<5 && i<data.length; i++) {

											var id = data[i].id;
											var username = data[i].username;
											var full_name = data[i].name;
											let profile_image_url = data[i].profile_image_url;
								        	profile_image_url = profile_image_url.replace('_normal', '');

						                	searchResultHtml = searchResultHtml +
						                		"<div class='search-result success-result' data-user-id='" + id + "' data-search-type='user'>" +
						                		"	<div class='user-image'>" +
						                		"		<img src='" + profile_image_url + "'>" +
						                		"	</div>" +
						                		"	<div class='search-result-text'>" +
						                		"		<div class='username'>" + username + "</div>" +
						                		"		<div class='screen-name'>" + full_name + "</div>" +
						                		"	</div>" +
						                		"</div>";
						                }
									}

									else {
										searchResultHtml = "<div class='error-message'>No results</div>";
									}

					                // show results
					                $('.results-box .results-list').append(searchResultHtml);
									$(".social-search").css({
										'border-bottom-left-radius': '0px',
										'border-bottom-right-radius': '0px'
									});
					                $('.results-box').height(64*i);
									$('.results-box .loader').hide();
									$('.results-box').show();	
					            },
					            error: function(jqXHR, textStatus, errorThrown) {
					                console.log(errorThrown);
					            }
						    });
						}
						
						// else if it's a hashtag
						else {

							// Twitter API doesn't let us search for trending hashtags so just show the typed out hashtag
			                var tagHtml = "" +
			                		"<div class='search-result success-result' data-search-type='hashtag'>" +
			                		"	<div class='hashtag-icon'></div>" +
			                		"	<div class='search-result-text'>" +
			                		"		<div class='hashtag-text'>" + txtNoPrefix + "</div>" +
			                		"	</div>" +
			                		"</div>";

			                // show results
			                $('.results-box .results-list').append(tagHtml);
							$(".social-search").css({
								'border-bottom-left-radius': '0px',
								'border-bottom-right-radius': '0px'
							});
			                $('.results-box').height(64);
							$('.results-box .loader').hide();
							$('.results-box').show();	
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

		// connect (Twitter auth step one and two)
		$('body').on('click', '.twitter-login-button', function (e) {
			console.log('Connect to Twitter');

			e.preventDefault();

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'request_twitter_token'
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);

					// redirect to the auth URL if it's a Twitter URL
					if (data) {
						if (data.indexOf("twitter.com") !== -1) window.location.href = data;
					}
				},
				error: function (errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
				}
			});
		});

		// MAIN THREAD
		awaitConnection();
			
	});

}(jQuery));
