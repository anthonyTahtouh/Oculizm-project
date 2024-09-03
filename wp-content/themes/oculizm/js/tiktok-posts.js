(function ($) {	

	jQuery(document).ready(function() {
	
		// define variables
		var searchTerm;
		var searchTermType;
		var max_id;
		var headerCreated = false;

		// window resize events
		$(window).resize(function() {
			squareImageContainers();
		});
		squareImageContainers();


		// MAIN LOOP TO WAIT FOR CONNECTION PARAMETERS TO BE SET IN MAIN.JS
		function awaitConnection() {
		    if (connections) {
			    console.log(connections);

				// check for a TikTok connection
				var tiktokConnectionExists = false;
				for (var i = 0; i < connections.length; i++) {
					if (connections[i]['social_network'] == "tiktok") {

						tiktokConnectionExists = true;

						searchTerm = connections[i]['open_id'];
						searchTermType = "profile";

						fetchTikTokUserInfo();
						getPostsFromTikTok();
					}
				}			    
			} else {
				setTimeout(awaitConnection, 100);
			}
		}
		awaitConnection();


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

						searchObject = {
							'type': 'user', 
							'term': '', 
							'screen_name': data.api_response.data.user.display_name, 
							'profile_pic_url': data.api_response.data.user.avatar_url
						};

						updateSearchHeader(searchObject);
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


		function getPostsFromTikTok() {

			$('.post-grid-container > .loader').show();
			
		    $.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_tiktoks',
					'search_type': searchTermType,
					'search_term': searchTerm
				},
				dataType: 'JSON',
				success: function(data) {
					console.log(data);

					if (data) {

						if (data.length == 0) {
							$('.load-more').hide();
							$('.post-grid').html('<div class="post-grid-message">No posts found.</div>');
						}
						else {

							// display the posts
							buildPostObjects(data.data.videos);

		               		$('.post-grid-container').find('.load-more').fadeIn();
		               	}
		            }
				},
				error: function(errorThrown) {
					console.log(errorThrown);
				},
				complete: function() {
					$('.post-grid-container > .loader').hide();
				}
		    });
		}


		// display posts
		function buildPostObjects(posts) {

			// for each post...
			for (var i = 0; i < posts.length; i++) {
	
				// get post fields
				var username = "me";
				var user_url = 'http://tiktok.com/' + "username";
				var media_type = "embed";
				var media_url = posts[i].cover_image_url;
				var video_url = "";
				var social_id = posts[i].id;
				var post_date = new Date(posts[i].created_time);
				var post_link = posts[i].share_url;
				var post_caption = posts[i].video_description;
				var image_alt_text = posts[i].video_description;
				var likes = posts[i].like_count;
				var embed_html = posts[i].embed_html;

				var post = new Array();
				post['social_network'] = 'tiktok';
				post['username'] = username;
				post['user_url'] = user_url;
				post['privacy'] = "";
				post['media_url'] = media_url;
				post['social_id'] = social_id;
				post['post_link'] = post_link;
				post['album_index'] = "";
				post['post_caption'] = post_caption;
				post['image_alt_text'] = image_alt_text;
				post['likes'] = likes;
				post['post_date'] = post_date;
				post['media_type'] = media_type;
				post['video_url'] = video_url;
				post['embed_html'] = embed_html;
				post['aspect_ratio'] = (posts[i].width / posts[i].height).toFixed(2);

				displayNetworkPost(post);
			}
			squareImageContainers();
			makeImagesFillContainers();
		}
	
		// load more
		$('body').on('click', '.load-more-button', function(e) {
			e.preventDefault();
	
			$('.post-grid-container > .loader').show();
			$(this).parent().hide();
	
			getPostsFromTikTok();
		});
	
	});
	
}(jQuery));
	
	


	
	
	
	
	
	
	
	