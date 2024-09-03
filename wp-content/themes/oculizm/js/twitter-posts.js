(function ($) {

	jQuery(document).ready(function() {

		// define variables
		var searchTerm;
		var searchTermType;
		var twitterUserId;
		var max_id;
		var headerCreated = false;
		var nextToken;

		// MAIN LOOP TO WAIT FOR CONNECTION PARAMETERS TO BE SET IN MAIN.JS
		function awaitConnection() {
		    if (connections) {
			    console.log(connections);

				// check for a Twitter connection
				var twitterConnectionExists = false;
				for (var i = 0; i < connections.length; i++) {
					if (connections[i]['social_network'] == "twitter") {

						twitterConnectionExists = true;
						searchTerm = connections[i]['twitter_user_id'];

            			if (currentPage === 'twitter-profile') searchTermType = "profile";
            			if (currentPage === 'twitter-mentions') searchTermType = "mentions";

						searchObject = {
							'type': searchTermType, 
							'term': connections[i]['username'], 
							'screen_name': connections[i]['screen_name'], 
							'profile_pic_url': connections[i]['profile_pic_url']
						};
						
						if (currentPage !== 'twitter-user' && currentPage !== 'twitter-hashtag') {
							updateSearchHeader(searchObject);
							getPostsFromTwitter();
						}
						
					}
				}			    
			} else {
				setTimeout(awaitConnection, 100);
			}
		}

		// get posts from Twitter
		function getPostsFromTwitter(paginationToken = null) {

			$('.post-grid-container > .loader').show();
		  
			console.log(searchObject);
		  
			$.ajax({
			  url: ajaxUrl,
			  data: {
				'action': 'get_twitter_posts',
				'search_type': searchTermType,
				'search_term': searchTerm,
				'twitter_user_id': twitterUserId,
				'pagination_token': paginationToken, // Include only if applicable
			  },
			  dataType: 'JSON',
			  success: function(data) {
				console.log(data);
				if (data.meta && data.meta.next_token) {
					nextToken = data.meta.next_token;
				}
				if (data) {
				  if (data.length == 0 || !data.data || data.data.length == 0) {
					$('.load-more').hide();
					$('.post-grid').html('<div class="post-grid-message">No posts found.</div>');
				  } else if (data.data.length > 0) {
					// Display the posts
					buildPostObjects(data);
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

			// X breaks up the post data into separate arrays, one for media, one for users etc.
			let media_array = posts.includes.media; // the media contained in the posts
			let users_array = posts.includes.users; // the authors of the posts
			posts = posts.data; // general post data - this declaration must come AFTER we declare the media and users arrays ;)

			// for each post...
			for (var i = 0; i < posts.length; i++) {

				var post = new Array();

				// get the index of the tweet author in the users array
				var user = searchArrayForID(posts[i].author_id, users_array);
				let username = user.username;
				var user_url = 'http://twitter.com/' + username;

				// get post data	
				var social_id = posts[i].id;
				var post_date = new Date(posts[i].created_at);
				var post_caption = posts[i].text;
				var image_alt_text = posts[i].text;
				var likes = posts[i].public_metrics.like_count;
				var retweets = posts[i].public_metrics.retweet_count;

				// get the post URL
				let post_link = 'http://twitter.com/' + username + "/status/" + posts[i].id;

				if (searchObject.type == 'hashtag') {
					let entities = posts[i].entities;
					let post_link = entities.urls[0].url;
				}

				// build post object
				post['has_album'] = "0";
				post['album_index'] = "";
				post['privacy'] = "";
				post['social_network'] = 'twitter';
				post['username'] = username;
				post['user_url'] = user_url;
				post['social_id'] = social_id;
				post['post_link'] = post_link;
				post['post_caption'] = post_caption;
				post['image_alt_text'] = image_alt_text;
				post['likes'] = likes;
				post['retweets'] = retweets;
				post['post_date'] = post_date;
				post['aspect_ratio'] = (posts[i].width / posts[i].height).toFixed(2);

				// get this post's attached media keys
				if (posts[i].attachments != undefined) {
					var media_keys = posts[i].attachments.media_keys;
					if (media_keys.length > 1) post['has_album'] = "1";

					// now for each media attachment...
					for (var k = 0; k < media_keys.length; k++) {

						// get the index of this image in the media array
						var media = searchArrayForMediaKey(media_keys[k], media_array);

						// image
						var media_type = "image";
						var media_url = media.url;
						post['media_url'] = media_url;

						// video
						if (media.type == "video") {
							media_type = "video";
							media_url = media.preview_image_url;
							var bit_rate = 0;
							for (var j=0; j<media.variants.length; j++) {
								if (media.variants[j].bit_rate > bit_rate) {
									var video_url = media.variants[j].url;
									bit_rate = media.variants[j].bit_rate;
								}
							}
							post['video_url'] = video_url;
						}

						post['media_type'] = media_type;
						displayNetworkPost(post);
					}
				}
			}
			squareImageContainers();
			makeImagesFillContainers();
		}
	
		// load more
		$('body').on('click', '.load-more-button', function(e) {
			e.preventDefault();
	
			$('.post-grid-container > .loader').show();
			$(this).parent().hide();
	
			getPostsFromTwitter(nextToken);
		});
	
		// window resize events
		$(window).resize(function() {
			squareImageContainers();
		});

		// MAIN THREAD
		squareImageContainers();
		awaitConnection();

		if ((currentPage === 'twitter-user') || (currentPage === 'twitter-hashtag')) {
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_search',
					'search_id': search_id
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);

					searchObject = data;
					searchTerm = data.term;
					searchTermType = data.type;
					twitterUserId = data.user_id;

					$('.post-grid-container').attr('data-search-type', searchTermType);

					

					// show the loader
					$('.post-grid-container > .loader').show();

					getPostsFromTwitter();	
					updateSearchHeader(searchObject);				
				},
				error: function (errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
				}
			});
		}
	});
	
}(jQuery));
	
	


	
	
	
	
	
	
	
	