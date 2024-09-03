(function ($) {
	
	jQuery(document).ready(function() {

		// MAIN LOOP TO WAIT FOR CONNECTION PARAMETERS TO BE SET IN MAIN.JS
		function awaitConnection() {
		    if (typeof tiktok_connection !== "undefined") {
				fetchTikTokUserInfo();
		    }
		    else setTimeout(awaitConnection, 50);
		}

		// get TikTok user info
		function fetchTikTokUserInfo() {

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_tiktok_user_info'
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);

					if (data.api_response.data.user) {

			        	var connection_id = data.connection.id;
			        	var display_name = data.api_response.data.user.display_name;
			        	var profile_pic_url = data.api_response.data.user.avatar_url;

						// create the item in our connections panel
						var connectionHtml = $('<div class="social-network-account" data-connection-id="' + connection_id + '">' +
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
							'<div class="connection-stats">' +
								'<div class="stat">' +
									'<div class="stat-name">Likes</div>' +
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
						'</div>');

						// update the UI
						$('div[name=social-network-accounts]').append(connectionHtml);
						$('.content-block[name=social-network-accounts]').show();
						$('.content-block[name=offline]').hide();

						$('.content-block[name=search]').show();
						$('.content-block[name=saved-searches]').show();
						// jQuery('.page-header').show();

						// populate fields
						$('.social-network-account .profile-pic img').attr('src', data.api_response.data.user.avatar_url);
						// $('.social-network-account .username').html('@' + data.api_response.screen_name);
						$('.social-network-account .screen-name').html(data.api_response.data.user.display_name);
						$('.social-network-account .stat:nth-of-type(1) .stat-value').html(prettyInt(data.api_response.data.user.likes_count));
						$('.social-network-account .stat:nth-of-type(2) .stat-value').html(prettyInt(data.api_response.data.user.following_count));
						$('.social-network-account .stat:nth-of-type(3) .stat-value').html(prettyInt(data.api_response.data.user.follower_count));
					}

					else {
						var error = data.api_response.error.message;
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup(error, buttons);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				},
				complete: function() {
					$('.social-network-account .loader').hide();
				}
			});
		}

		// MAIN THREAD
		awaitConnection();

	});

}(jQuery));









