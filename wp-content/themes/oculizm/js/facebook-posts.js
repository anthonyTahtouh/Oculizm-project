
(function ($) {

	jQuery(document).ready(function () {

		// define variables
		var nextPageUploaded = null;
		var nextPageTagged = null;
		var paginationUrl = null;
		var endpoint;
		var activeTab = $('.tab-header.active').attr('name');
		var recentTabActivated = false;
		var headerCreated = false;

		// MAIN LOOP TO WAIT FOR CONNECTION PARAMETERS TO BE SET IN MAIN.JS
		function awaitConnection() {
		    if (typeof facebook_connection !== "undefined") {

		    	let searchType;
		    	if (currentPage === 'facebook-photos') searchType = "photos";
		    	if (currentPage === 'facebook-reels') searchType = "reels";
		    	if (currentPage === 'facebook-videos') searchType = "videos";

				// create a searchObject so we can call the universal function updateSearchHeader()
				searchObject = {
					'type': searchType, 
					'term': facebook_username,
					'screen_name': facebook_screen_name,
					'profile_pic_url': facebook_profile_pic_url
				};

				updateSearchHeader(searchObject);
				getFacebookPosts();
		    }
		    else setTimeout(awaitConnection, 50);
		}
		awaitConnection();


		// get posts
		function getFacebookPosts() {
			
			$('.load-more').hide();
			$('.post-grid-container > .loader').show();

			var fbApiUrl = paginationUrl;

	    	// define call parameters
			if (searchObject.type == 'photos') {
				endpoint = 'photos?type=uploaded&fields=id,name,picture.type(large),images,updated_time,link,album,from,icon,likes.summary(true),page_story_id,subattachments';
			}
			if (searchObject.type == 'reels') {
				endpoint = 'video_reels?fields=id,title,description,picture.type(large),format,images,updated_time,link,embed_html,permalink_url,source,likes.summary(true),from,is_crosspost_video,privacy';
			}
			if (searchObject.type == 'videos') {
				endpoint = 'videos?type=uploaded&fields=id,title,description,picture.type(large),format,images,updated_time,link,embed_html,permalink_url,source,likes.summary(true),from,is_crosspost_video,privacy';
			}

			if (paginationUrl == null) fbApiUrl = "https://graph.facebook.com/" + fb_instagram_business_id + "/" + endpoint + "&access_token=" + facebook_page_access_token;

			if (searchObject.type == 'videos') {

				endpoint = 'videos?type=' + activeTab + '&fields=id,title,description,picture.type(large),format,images,updated_time,link,embed_html,permalink_url,source,likes.summary(true),from,is_crosspost_video,privacy';

				if (activeTab == "uploaded") {
					if (nextPageUploaded != null) {
						fbApiUrl = "https://graph.facebook.com/" + fb_instagram_business_id + "/" + endpoint + "&access_token=" + facebook_page_access_token + "&after=" + nextPageUploaded;
					}
					else {
						fbApiUrl = "https://graph.facebook.com/" + fb_instagram_business_id + "/" + endpoint + "&access_token=" + facebook_page_access_token;
					}
				}
				if (activeTab == "tagged") {
					if (nextPageTagged != null) {
						fbApiUrl = "https://graph.facebook.com/" + fb_instagram_business_id + "/" + endpoint + "&access_token=" + facebook_page_access_token + "&after=" + nextPageTagged;
					}
					else {
						fbApiUrl = "https://graph.facebook.com/" + fb_instagram_business_id + "/" + endpoint + "&access_token=" + facebook_page_access_token;
					}					
				}
			}

			// MAIN FACEBOOK API CALL
			$.ajax({
				url: fbApiUrl,
				async:true,
				success:function (response) {
					console.log(response);
					
					// error handling
					if (response.length == 0 || !response.data || response.data.length == 0) {

						// add no posts found message for the active tab only in the fab videos page if no posts were found
						if (searchObject.type == 'videos') {
							$('.post-grid.active').append('<div class="post-grid-message">No posts found.</div>');
						} else {

							// add no posts found message for the post-grid in the facebook pages if no posts were found
							$('.post-grid').append('<div class="post-grid-message">No posts found.</div>');
						}
						$('.post-grid-container > .loader').hide();
						return;
					}

					// add all the posts into one large array then display them
					var posts = new Array();
					for (var i = 0; i < response.data.length; i++) {
						posts = posts.concat(response.data[i]);
					}
					buildPostObjects(posts);

					// pagination
					if (response.paging && response.paging.next) {
						paginationUrl = response.paging.next;
						$('.load-more').show();

						if (searchObject.type == 'videos') {
							if (activeTab == "uploaded") {
								nextPageUploaded = response.paging.cursors.after;
							}
							else {
								nextPageTagged = response.paging.cursors.after;
							}
						}		
					}
					else {
						paginationUrl = null;
						$('.load-more').hide();

						if (searchObject.type == 'videos') {
							if (activeTab == "uploaded") {
								nextPageUploaded = null;
							}
							else {
								nextPageTagged = null;
							}
						}						
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
				var social_id = posts[i]['id'];
				var media_type = "image";
				var video_url;
				var media_url;
				var post_title = '';
				var post_link;
				var post_caption = '';
				var image_alt_text = '';
				var	post_date = posts[i]['updated_time'];
				var privacy = "";
				if (posts[i]['privacy']) privacy = posts[i]['privacy']['description'];
				var likes = posts[i]['likes'];
				if (likes) likes = likes['summary']['total_count'];

				// Post caption for Facebook Photos is in the 'name' attribute
				// Post caption for Facebook Videos is in the 'description' attribute
				// Faceboook Videos can additionally also have a post title
				// All these fields are optional!

				if (searchObject.type == 'photos') {
					post_link = posts[i]['link'];
					if (posts[i]['name']) post_caption = posts[i]['name'];
					if (posts[i]['name']) image_alt_text = posts[i]['name'];
					if (posts[i]['images'][4]) media_url = posts[i]['images'][4]['source'];
					if (posts[i]['images'][3]) media_url = posts[i]['images'][3]['source'];
					if (posts[i]['images'][2]) media_url = posts[i]['images'][2]['source'];
					if (posts[i]['images'][1]) media_url = posts[i]['images'][1]['source'];
					else media_url = posts[i]['images'][0]['source'];
				}

				if (
					(searchObject.type == 'reels') || 
					(searchObject.type == 'videos')
				) {
					post_link = "https://www.facebook.com" + posts[i]['permalink_url'];
					if (posts[i]['title']) post_title = posts[i]['title'];
					if (posts[i].description) post_caption = posts[i]['description'];
					if (posts[i].description) image_alt_text = posts[i]['description'];
					if (posts[i]['format'][2]) media_url = posts[i]['format'][2]['picture'];
					else media_url = posts[i]['format'][1]['picture'];
					media_type = "video";
					video_url = posts[i]['source'];
				}
				
				// build the post object
				var post = new Array();
				post['has_album'] = "0";
				post['album_index'] = "";
				// post['user_url'] = '';
				post['media_url'] = media_url;
				post['social_id'] = social_id;
				post['post_link'] = post_link;
				post['post_caption'] = post_caption;
				post['image_alt_text'] = image_alt_text;
				post['post_title'] = post_title;
				post['media_type'] = media_type;
				post['post_date'] = post_date;
				post['video_url'] = video_url;
				post['likes'] = likes;
				post['privacy'] = privacy;
				post['aspect_ratio'] = (posts[i].width / posts[i].height).toFixed(2);

				displayNetworkPost(post);
			}
			makeImagesFillContainers();
			squareImageContainers();
			
			$('.post-grid-container > .loader').hide();

			// // update tabs
			// if ($('.post').length == 0) {
				
			// 	$('.post-grid.active').append('<div class="post-grid-message">No posts found.</div>');
			// }
			
			
		}

		// tab switching helper for this page
		$('body').on('click', '.tab-header', function (e) {
			activeTab = $(this).attr('name');
			let targetElement = $('.post-grid.active');

			// Check if the data-fetched attribute does not exist before adding it (to prevent duplicated post content) and getFacebookPosts only if data-fetched does not exist 
			if (!targetElement.attr('data-fetched')) {
				targetElement.attr('data-fetched', 'true');
				getFacebookPosts();
			} 
		});


		// load more
		$('body').on('click', '.load-more-button', function (e) {
			e.preventDefault();
			
			$('.post-grid-container > .loader').show();
			$('.load-more').hide();
			$(this).parent().hide();

			getFacebookPosts();
		});
	});
}(jQuery));













