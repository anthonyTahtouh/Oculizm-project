
(function ($) {

	jQuery(document).ready(function () {

		// define variables
		var nextPageTop = null;
		var nextPageRecent = null;
		var storedHashtagPosts = new Array();
		var activeTab = $('.tab-header.active').attr('name');
		var recentTabActivated = false;
		var headerCreated = false;

		
		// MAIN LOOP TO WAIT FOR CONNECTION PARAMETERS TO BE SET IN MAIN.JS
		function awaitConnection() {
		    if (typeof instagram_connection !== "undefined") {

		    	// define call parameters
				if (
					(currentPage === 'instagram-profile') || 
					(currentPage === 'instagram-stories') || 
					(currentPage === 'instagram-reels')
				) {
					searchObject = {
						'type': 'profile', 
						'term': instagram_username, 
						'screen_name': instagram_screen_name, 
						'profile_pic_url': ""
					};
					getInstagramPosts();
				}

				if (currentPage === 'instagram-tags') {
					searchObject = {
						'type': 'mentions', 
						'term': instagram_username, 
						'screen_name': instagram_screen_name, 
						'profile_pic_url': ""
					};
					getInstagramPosts();
				}
				
				if (
					(currentPage === 'instagram-hashtag') || 
					(currentPage === 'instagram-user')
				) {

					// get this search record
					$.ajax({
						url: ajaxUrl,
						data: {
							'action': 'get_search',
							'search_id': search_id
						},
						dataType: 'JSON',
						success: function (data) {
							// console.log(data);
							
							searchObject = data;

							getStoredHashtagPosts();
							getInstagramPosts();
						},
						error: function (errorThrown) {
							console.log(errorThrown);
						},
						complete: function () {}
					});
				}
		    }
		    else setTimeout(awaitConnection, 50);
		}
		awaitConnection();


		// get stored hashtag posts
		function getStoredHashtagPosts() {
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_cached_instagram_posts',
					'hashtag_id': searchObject.hashtag_id
				},
				dataType: 'JSON',
				success: function (response) {
					console.log(response);

					if (response) storedHashtagPosts = response;
				},
				error: function (errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {}
			});			
		}


		// get posts
		function getInstagramPosts() {

			$('.load-more').hide();
			$('.post-grid-container > .loader').show();

			// determine API call parameters
			var endpoint = ig_instagram_business_id;
			var fields;

			if (searchObject.type == 'profile') {

				var mediaString = "media";
				if (nextPageTop != null) mediaString = "media.after(" + nextPageTop + ")";

				fields = "fields=" +
					"profile_picture_url," +
					"name," +
					"username," +
					mediaString + "{" +
						"id," +
						"caption," +
						"like_count," +
						"media_type," +
						"media_product_type," +
						"media_url," +
						"permalink," +
						"timestamp," +
						"username," +
						"children{" +
							"id," +
							"media_type," +
							"media_url," +
							"permalink," +
							"timestamp," +
							"username" +
						"}" +
					"}";
			}

			if (searchObject.type == 'stories') {

				endpoint = ig_instagram_business_id + "/stories";
				var mediaString = "";
				if (nextPageTop != null) mediaString = "&after=" + nextPageTop;

				fields = "fields=" +
					"id," +
					"caption," +
					"like_count," +
					"media_type," +
					"media_product_type," +
					"media_url," +
					"permalink," +
					"timestamp," +
					"username," +
					"children{" +
						"id," +
						"media_type," +
						"media_url," +
						"permalink," +
						"timestamp," +
						"username" +
					"}" +
					mediaString;
			}

			if (searchObject.type == 'reels') {

				var mediaString = "media";
				if (nextPageTop != null) mediaString = "media.after(" + nextPageTop + ")";

				fields = "fields=" +
					"profile_picture_url," +
					"name," +
					"username," +
					mediaString + "{" +
						"id," +
						"caption," +
						"like_count," +
						"media_type," +
						"media_product_type," +
						"media_url," +
						"permalink," +
						"timestamp," +
						"username," +
						"children{" +
							"id," +
							"media_type," +
							"media_url," +
							"permalink," +
							"timestamp," +
							"username" +
						"}" +
					"}";
			}

			if (searchObject.type == 'mentions') {

				var mediaString = "tags.order(chronological)";
				if (nextPageTop != null) mediaString = "tags.after(" + nextPageTop + ")";

				fields = "fields=" +
						"id," +
						"caption," +
						"like_count," +
						"media_type," +
						"media_product_type," +
						"media_url," +
						"permalink," +
						"timestamp," +
						"username," +
						"children{" +
							"id," +
							"media_type," +
							"media_url," +
							"permalink," +
							"timestamp" +
						"}";
			}

			if (searchObject.type == 'user') {

				var mediaString = "media";
				if (nextPageTop != null) mediaString = "media.after(" + nextPageTop + ")";

				fields = "fields=" +
					"business_discovery.username(" + searchObject.term + "){" +
						"profile_picture_url," +
						"name," +
						"username," +
						mediaString + "{" +
							"id," +
							"caption," +
							"like_count," +
							"media_type," +
							"media_product_type," +
							"media_url," +
							"permalink," +
							"timestamp," +
							"username," +
							"children{" +
								"media_type," +
								"media_url," +
								"permalink," +
								"timestamp," +
								"username" +
							"}" +
						"}" +
					"}";
			}
				
			if (searchObject.type == 'hashtag') {

				endpoint = searchObject.hashtag_id + '/' + activeTab + '_media';

				fields = "fields=" +
					"id," +
					"caption," +
					"like_count," +
					"comments_count," +
					"media_type," +
					"media_product_type," +
					"media_url," +
					"permalink," +
					"timestamp," +
					"children{" +
						"id," +
						"media_type," +
						"media_url," +
						"permalink," +
						"timestamp" +
					"}" + 
					"&user_id=" + ig_instagram_business_id;
			}


			// determine call parameters
			var domain = "https://graph.facebook.com/";
			var fbApiUrl = 	domain + endpoint + "/?" + fields + "&access_token=" + ig_facebook_access_token;
			$limit_str = "limit=8";

			if (searchObject.type == 'mentions') {
				if (nextPageTop != null) {
					fbApiUrl = domain + endpoint + "/tags?" + $limit_str + "&" + fields + "&access_token=" + ig_facebook_access_token + "&after=" + nextPageTop;
				}
				else {
					fbApiUrl = domain + endpoint + "/tags?" + $limit_str + "&" + fields + "&access_token=" + ig_facebook_access_token;
				}			
			}
			if (searchObject.type == 'hashtag') {
				if (activeTab == "top") {
					if (nextPageTop != null) {
						fbApiUrl = domain + endpoint + "/?" + $limit_str + "&" + fields + "&access_token=" + ig_facebook_access_token + "&after=" + nextPageTop;
					}
					else {
						fbApiUrl = domain + endpoint + "/?" + $limit_str + "&" + fields + "&access_token=" + ig_facebook_access_token;
					}
				}
				if (activeTab == "recent") {
					if (nextPageRecent != null) {
						fbApiUrl = domain + endpoint + "/?" + $limit_str + "&" + fields + "&access_token=" + ig_facebook_access_token + "&after=" + nextPageRecent;
					}
					else {
						fbApiUrl = domain + endpoint + "/?" + $limit_str + "&" + fields + "&access_token=" + ig_facebook_access_token;
					}					
				}
			}


			// MAIN INSTAGRAM API CALL
			$.ajax({
				url: fbApiUrl,
				async:true,
				success:function (response) {
					console.log(response);

					// update header profile pic
					if (searchObject.type == 'profile') {
						searchObject.profile_pic_url = response.profile_picture_url;
					}
					else if (searchObject.type == 'reels') {
						searchObject.profile_pic_url = response.profile_picture_url;
					}
					else if (searchObject.type == 'stories') {
						searchObject.profile_pic_url = response.profile_picture_url;
					}
					else if (searchObject.type == 'user') {
						searchObject.profile_pic_url = response.business_discovery.profile_picture_url;
					}
					updateSearchHeader(searchObject);

					// for tags and user search, the posts are stored in the business_discovery object
					// for the tags endpoint, the response just contains 'data' and 'paging'

					if (response.business_discovery) response = response.business_discovery;

					// get the object where data and paging is stored
					// PROFILE 			media{data,paging}
					// USER SEARCH 		media{data,paging}
					// TAGS 			tags{data,paging} // see above comment, it's now at the root
					// HASHTAG SEARCH 	data,paging
					if (response.media) response = response.media;
					if (response.tags) response = response.tags;

					// pagination
					if (response.paging && response.paging.cursors && response.paging.cursors.after) {

						// decide which pagination URL to define
						if (searchObject.type == 'hashtag' && activeTab == "recent") {
							nextPageRecent = response.paging.cursors.after;
						}
						else {
							nextPageTop = response.paging.cursors.after;
						}
						$('.load-more').show();
					}
					else {
						// decide which pagination URL to clear
						if (searchObject.type == 'hashtag' && activeTab == "recent") {
							nextPageRecent = null;
						}
						else {
							nextPageTop = null;
						}
						$('.load-more').hide();
					}

					// if there are no posts...
					if (response.length == 0 || !response.data || response.data.length == 0) {

						// decide which pagination URL to clear
						if (searchObject.type == 'hashtag' && activeTab == "recent") {
							nextPageRecent = null;
						}

						// add no posts found message for the active tab only in the insta hashtag page if no posts were found
						if (searchObject.type == 'hashtag'){
							$('.post-grid.active').append('<div class="post-grid-message">No posts found.</div>');
						}
						// add no posts found message for the post-grid in the insta pages if no posts were found
						else {
							$('.post-grid').append('<div class="post-grid-message">No posts found.</div>');
							nextPageTop = null;
						}
						$('.load-more').hide();
					}
					
					else {
						// sort the posts by date and display them
						var posts = response.data;

						// if we're on the recent hashtags tab, add in the stored hashtag posts we fetched earlier
						if (searchObject.type == 'hashtag' && activeTab == "recent") {

							posts = posts.concat(storedHashtagPosts);

							// but we only want to do this once so instead of using a flag we'll just empty the array that we add
							storedHashtagPosts = new Array();
						}

						posts.sort(SortByDate);
						buildPostObjects(posts);
					}
				},
				error: function (errorThrown) {
					console.log(errorThrown);

					var responseText = errorThrown.responseText;
					if (responseText) {
						responseText = JSON.parse(responseText).error.message;
						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup(responseText, buttons);
					}
				},
				complete: function () {
					$('.post-grid-container > .loader, .post-grid-container > .tabs > .loader').hide();
				}
			});
		
		}



		// display posts
		function buildPostObjects(posts) {
			
			// for each post...
			for (var i = 0; i < posts.length; i++) {

				// get post fields
				var media_url = posts[i].media_url;
				var username = posts[i].username;
				var local_src = posts[i].local_src;

				// for cached posts, the social ID is stored in our DB colum "social_id"
				var social_id = posts[i].social_id;

				// else it's from a social network API and they tend to use just "id"
				if (social_id == undefined) social_id = posts[i].id;
				
				var user_url = 'http://instagram.com/' + username;
				var post_link = posts[i].permalink;
				var post_date = posts[i].timestamp;
				var post_caption = "";
				var image_alt_text = "";
				if (posts[i].caption != null) post_caption = posts[i].caption;
				if (posts[i].caption != null) image_alt_text = posts[i].caption;
				var likes = posts[i].like_count;
				var hashtag_id = searchObject.hashtag_id;

				// only show reels if on reels page
				if (searchObject.type == 'reels') {
					if (posts[i].media_product_type != "REELS") continue;
				}

				// build the post object
				var post = new Array();
				post['has_album'] = "0";
				post['album_index'] = "";
				post['social_network'] = 'instagram';
				post['username'] = username;
				post['local_src'] = local_src;
				post['user_url'] = user_url;
				post['media_url'] = media_url;
				post['privacy'] = "";
				post['post_link'] = post_link;
				post['post_caption'] = post_caption;
				post['image_alt_text'] = image_alt_text;
				post['likes'] = likes;
				post['social_id'] = social_id;
				post['hashtag_id'] = hashtag_id;
				post['post_date'] = post_date;
				post['aspect_ratio'] = (posts[i].width / posts[i].height).toFixed(2);
				post['media_type'] = posts[i].media_type;
				if (posts[i].media_type == "VIDEO") {
					post['video_url'] = posts[i].media_url;
					post['media_url'] = ""; // Instagram doesn't supply vid thumbnail. Set to empty so we create it at server
					post['media_type'] = 'video';
				}

				// handle album posts
				if (posts[i].children) {
					for (var j = 0; j < posts[i].children.data.length; j++) {

						post['has_album'] = "1";
						post['media_type'] = posts[i].children.data[j].media_type.toLowerCase();
						post['album_index'] = j;
						
						if (posts[i].children.data[j].media_type === 'IMAGE') post['media_url'] = posts[i].children.data[j].media_url;
						else if (posts[i].children.data[j].media_type === 'VIDEO') post['video_url'] = posts[i].children.data[j].media_url;

						displayNetworkPost(post);
					}
				}

				// handle single posts
				else {
					displayNetworkPost(post);
				}
			}
			makeImagesFillContainers();

			// update tabs
			// if ($('.post').length == 0) $('.post-grid.active').append('<div class="post-grid-message">No posts found.</div>');
		}


		// tab switching helper for this page
		$('body').on('click', '.tab-header', function (e) {
			activeTab = $(this).attr('name');
			if ($(this).attr('name') == 'recent') getInstagramPosts();
		});


		// load more
		$('body').on('click', '.load-more-button', function (e) {
			e.preventDefault();
			
			$('.post-grid-container > .loader').show();
			$('.load-more').hide();
			$(this).parent().hide();

			getInstagramPosts();
		});
	});
}(jQuery));
