
var searchObject;

(function ($) {	

	jQuery(document).ready(function() {
	
		// define variables
		var alreadyCuratedNetworkPosts;
		var hiddenNetworkPostsSocialIds;
		var showHiddenPosts ;
		var showAlreadyCuratedPosts = true;

		// get already curated posts' social IDs
		function getAlreadyCuratedNetworkPosts(){
			$.ajax({
				url: ajaxUrl,
				async: false,
				data: {
					'action': 'get_already_curated_network_posts',
					'social_network': socialNetwork
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);
					
					alreadyCuratedNetworkPosts = data.posts;
				},
				error: function (errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {}
			});
		};

		// get hidden network posts
		function getHiddenNetworkPosts(){
			$.ajax({
				url: ajaxUrl,
				async: false,
				data: {
					'action': 'get_hidden_network_posts',
					'social_network': socialNetwork
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);
					
					hiddenNetworkPostsSocialIds = data;
				},
				error: function (errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {}
			});
		};


        // create search page header
        jQuery._updateSearchHeader = function(searchObject) {

            if (!headerCreated) {

                //  user / profile (includes Facebook pages)
                if (
                	(searchObject.type == 'profile') || 
                	(searchObject.type == 'user') || 
                	(searchObject.type == "mentions") || 
                	(searchObject.type == "stories") || 
                	(searchObject.type == "reels") || 
                	(searchObject.type == "photos") || 
                	(searchObject.type == "videos")
                ) {
                    let profile_pic_url = searchObject.profile_pic_url;
                    if (!searchObject.profile_pic_url) profile_pic_url = site_url + "/wp-content/themes/oculizm/img/no-image.png";

					// Decode screen_name and remove backslashes
					let screenName = decodeURIComponent(searchObject.screen_name).replace(/\\/g, '');


                    var termHtml =          "   <div class='social-network-icon' style='background-image:url(" + site_url + "/wp-content/themes/oculizm/img/social/" + socialNetwork.toLowerCase() + ".png)'></div>" + 
                                            "   <div class='profile-pic'>" + 
                                            "       <img src='" + profile_pic_url + "'>" +
                                            "   </div>" +
                                            "   <div class='search-term'>" +
                                            "       <div class='username'>@" + searchObject.term + "</div>" +
                                            "       <div class='screen-name'>" + screenName + "</div>" +
                                            "   </div>";
                }

                // hashtag
                if (searchObject.type == "hashtag") {
                    var termHtml =          "   <div class='social-network-icon'></div>" + 
                                            "   <div class='hashtag-icon'></div>" +
                                            "   <div class='search-term'>" +
                                            "       <div class='hashtag-text'>" + searchObject.term + "</div>" +
                                            "   </div>";
                }

				var filterHtml =          "   <div class='page-header'>" + 
				"   <p class='header-filter-button'></p>" +
				"   </div>";

                $('.search-page-header').html(termHtml);
				$('.search-page-header').html(termHtml + filterHtml);
                headerCreated = true;
            }
        };

		function timeAgo(postDate) {
			// Convert the post date string to a JavaScript Date object
			var postDateObj = new Date(postDate);
			
			// Get the current date
			var currentDate = new Date();
			
			// Calculate the time difference in milliseconds
			var timeDiff = currentDate - postDateObj;
			
			// Convert time difference to seconds
			var secondsDiff = Math.floor(timeDiff / 1000);
		
			// Convert seconds to appropriate format
			if (secondsDiff < 60) {
				return secondsDiff + " seconds ago";
			} else if (secondsDiff < 3600) {
				var mins = Math.floor(secondsDiff / 60);
				return mins + (mins === 1 ? " minute ago" : " minutes ago");
			} else if (secondsDiff < 86400) {
				var hours = Math.floor(secondsDiff / 3600);
				return hours + (hours === 1 ? " hour ago" : " hours ago");
			} else {
				var days = Math.floor(secondsDiff / 86400);
				return commaInt(days) + (days === 1 ? " day ago" : " days ago");
			}
		}


		// add a post to the grid
		jQuery._displayNetworkPost = function(post) {
			// console.log(post);

			// check if this social post has already been curated
			var postStatus = "";
			for (var i = 0, len = alreadyCuratedNetworkPosts.length; i < len; i++) {
				
				// get the album index
				var currentAlbumindex = alreadyCuratedNetworkPosts[i]['album_index'];

				// if this was a single post...
				if (currentAlbumindex == "undefined") {
					// check if the post IDs match
					if (alreadyCuratedNetworkPosts[i]['social_id'] == post['social_id']) {
						postStatus = "publish";
						break; // we found a match, no need to continue searching for one
					}
				}

				// else, if this was an album post...
				else {
					// check if the post IDs match and the album indexes match
					if ((alreadyCuratedNetworkPosts[i]['social_id'] == post['social_id']) && (currentAlbumindex == post['album_index'])) {
						postStatus = "publish";
						break; // we found a match, no need to continue searching for one
					}
				}
			}

			// check if this social post is hidden
			var postHidden = "";
			for (var i = 0, len = hiddenNetworkPostsSocialIds.length; i < len; i++) {
				
				// check if the post IDs match
				if (hiddenNetworkPostsSocialIds[i]['network_post_id'] == post['social_id']) {
					postHidden = "true";
					break; // we found a match, no need to continue searching for one
				}
			}

			// has this post come from our DB cache?
			var media_url = post['media_url'];
			let data_source = "api";
			if (post['local_src']) {
				media_url = site_url + post['local_src'];
				data_source = "cache";
			}

			// post title
			let post_title_html = "";
			let post_date_html = "";
			var postDate = post['post_date'];
			post_date_html = '<div class="post-date">' + timeAgo(postDate) + '</div>';
			if (socialNetwork == "instagram") {
				post_title_html = '<a target="_blank" class="post-title" href="https://www.instagram.com/' + post['username'] + '">' + post['username'] + '</a>';
				if (searchObject['type'] == 'hashtag') post_title_html = "";
			}
			// Faceboook Photos do not have a title but Facebook Videos can (it's optional)
			if (socialNetwork == "facebook") {
				if (post.post_title != undefined) post_title_html = '<div class="post-title">' + post.post_title + '</div>';
			}
			if (socialNetwork == "twitter") post_title_html = '"<a target="_blank" class="post-title" href="' + post['user_url'] + '">' + post['username'] + '</a>';
			if (socialNetwork == "tiktok") post_title_html = '<a target="_blank" class="post-title" href="' + post['user_url'] + '">' + post['username'] + '</a>';

			// actions overlay
			var actionsOverlayHtml = '	<div class="post-actions-overlay">' +
									 '		<div class="post-actions-cta-container">' +
									 '			<a href="#" name="open-add-post-modal">Add to Gallery</a>' +
									 '			<a href="' + post['post_link'] + '" target="_blank" name="view-original-post">View Original Post</a>' +
									 '			<a href="#" name="' + (postHidden ? 'unhide-post-toggle' : 'hide-post-toggle') + '">' + (postHidden ? 'Unhide this Post' : 'Hide this Post') + '</a>' +
									 '		</div>' +
									 '	</div>';

			// media warning
			let data_media_warning = "";

			// media html
			var media_html = '';

			// image
			if (post['media_type'].toLowerCase() == "image") {
				media_html = '<div class="post-inner" href="' + post['post_link'] + '" data-thumbnail="' + post['media_url'] + '">' +
							 '	<img class="image-fill" src="' + media_url + '">';
			}

			// video
			if (post['media_type'] == "video") {

				if (data_source == "cache"){
					media_html = '	<div class="post-inner" href="' + post['post_link'] + '" data-thumbnail="' + post['video_url'] + '">' +
								'	<video class="video" src="' + media_url + '">' +
								'		<source src="' + post['video_url'] + '" type="video/mp4">' +
								'		Your browser does not support the video tag.' +
								'	</video>' +
								'	<div class="video-icon"></div>';
				}
				else if (data_source == "api"){
					media_html = '	<div class="post-inner" href="' + post['post_link'] + '" data-thumbnail="' + post['video_url'] + '">' +
					'	<video class="video" src="' + post['video_url']  + '">' +
					'		<source src="' + post['video_url'] + '" type="video/mp4">' +
					'		Your browser does not support the video tag.' +
					'	</video>' +
					'	<div class="video-icon"></div>';
				}

				
				// media_url = post['video_url'];

				// media warning
				if (post['video_url'] === undefined) {
					actionsOverlayHtml = "<span class='post-warning'>" +
					"<span><img src='" + site_url + "/wp-content/themes/oculizm/img/colour/warning.png'></span>" +
					" Media unavailable, possibly copyrighted</span>";
					data_media_warning = "true";
				}
			}

			// embed
			if (post['media_type'] == "embed") {
				media_html = '<div class="post-inner" href="' + post['post_link'] + '" data-thumbnail="' + post['video_url'] + '">' + 
					post['embed_html'];
			}

			// likes
			let likesHtml = "";
			if (Number.isInteger(parseInt(post['likes']))) likesHtml = '<div class="post-meta-item like-count">' + commaInt(parseInt(post['likes'])) + '</div>';
			
			// build the post HTML
			let post_html = '<div class="network-post"' +
			' data-social-network="' + socialNetwork + '" ' +
			' data-social-id="' + post['social_id'] + '"' +
			' data-post-type="' + post['media_type'] + '"' +
			' data-post-status="' + postStatus + '"' +
			' data-hidden-post="' + postHidden + '"' +
			' data-post-created="' + post['post_date'] + '"' +
			' data-source="' + data_source + '"' +
			' data-href="' + post['post_link'] + '"' +
			' data-album-post="' + post['has_album'] + '"' +
			' data-album-index="' + post['album_index'] + '"' +
			' data-privacy="' + post['privacy'] + '"' +
			' data-media-warning="' + data_media_warning + '"' +
			' data-aspect-ratio="' + post['aspect_ratio'] + '"' +
			'>' +
				media_html +
			'   <div class="post-attributes-overlay">' +
			'       <div class="album-icon"></div>' +
			'       <div class="approved-icon"></div>' +
			'       <div class="hidden-icon"></div>' +
			'       <div class="cache-icon"></div>' +
			'   </div>' +
				actionsOverlayHtml +
			'   </div>' + 
			'   <div class="post-details">' +
					post_title_html +
			'   	<div class="post-caption"><p>' + post['post_caption'] + '</p></div>' +
			'   	<div class="post-meta">' +
						likesHtml +
			'   	</div>' + 
					post_date_html +
			'   </div>' + 
			'</div>';


			// determine target element
			let targetElement = $('.post-grid');
			if ($('.post-grid.active').length > 0) targetElement = $('.post-grid.active');

			// add the post to the DOM
			$(post_html).hide().appendTo(targetElement).fadeIn(250);

			// Check if the data-fetched attribute does not exist before adding it (to prevent duplicated post content)
			if (!targetElement.attr('data-fetched')) {
				targetElement.attr('data-fetched', 'true');
			} 
			
			$('.filter-button, a[name=apply-filters]').trigger('click');
		};


		// open the order details overlay
		$('body').on('click', '.header-filter-button', function (e) {
			// open the overlay
			$('.form-overlay[name=social-network-search-post-filters]').fadeIn();
		});

	    // apply filters
		$('body').on('click', '.filter-button, a[name=apply-filters]', function (e) {
			e.preventDefault();

			// open the overlay
			$('.form-overlay[name=social-network-search-post-filters]').fadeOut();
			
			// Update filter states based on checkbox states
			if ($(".checkbox-option[name=show-hidden-posts]").hasClass('active')) showHiddenPosts = true;
			else showHiddenPosts = false;
			if ($(".checkbox-option[name=show-already-curated-posts]").hasClass('active')) showAlreadyCuratedPosts = true;
			else showAlreadyCuratedPosts = false;

			// Show/hide hidden and published posts based on filter selection
			$('.network-post[data-hidden-post=true]').css('display', showHiddenPosts ? 'inline-block' : 'none');
			$('.network-post[data-post-status=publish]').css('display', showAlreadyCuratedPosts ? 'inline-block' : 'none');
			$('.network-post[data-hidden-post=true] .post-inner').css('min-height', '310px');
			$('.network-post[data-post-status=publish] .post-inner').css('min-height', '310px');

		});

		// hide post button
		$('body').on('click', 'a[name=hide-post-toggle]', function (e) {
			e.preventDefault();

			let networkPostID = $(this).closest('.network-post').attr('data-social-id');

			if (networkPostID) {

				showFullScreenLoader();

				$.ajax({
					url: ajaxUrl,
					data: {
						'action': 'hide_network_post',
						'network_post_id': networkPostID
					},
					dataType: 'JSON',

					success: function (data) {
						console.log(data);

						if (data) {
							$('.network-post[data-social-id="' + networkPostID + '"]').attr('data-hidden-post', 'true');
								$('.network-post[data-social-id="' + networkPostID + '"] .post-actions-overlay a[name=hide-post-toggle]')
								.attr('name', 'unhide-post-toggle')
								.text('Unhide this Post');
							
							if(!showHiddenPosts){
								$('.network-post[data-social-id=' + networkPostID + ']').hide();
							}
							
						}

						else {
							// create popup
							var buttons = new Array(
								{ 'action': 'close-popup', 'text': 'Ok' }
							);
							showPopup('Could not hide post', buttons);
						}
					},
					error: function (errorThrown) {
						console.log(errorThrown);

						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup(errorThrown.statusText, buttons);
					},
					complete: function () {
						hideFullScreenLoader();
					}
				});
			}
		});

		// unhide post button
		$('body').on('click', 'a[name=unhide-post-toggle]', function (e) {
			e.preventDefault();

			let networkPostID = $(this).closest('.network-post').attr('data-social-id');
			console.log(networkPostID);

			if (networkPostID) {

				showFullScreenLoader();

				$.ajax({
					url: ajaxUrl,
					data: {
						'action': 'unhide_network_post',
						'network_post_id': networkPostID
					},
					dataType: 'JSON',

					success: function (data) {
						console.log(data);

						if (data) {
							$('.network-post[data-social-id="' + networkPostID + '"]').attr('data-hidden-post', '');
							$('.network-post[data-social-id="' + networkPostID + '"] .post-actions-overlay a[name=unhide-post-toggle]')
							.attr('name', 'hide-post-toggle')
							.text('Hide this Post');
						}

						else {
							// create popup
							var buttons = new Array(
								{ 'action': 'close-popup', 'text': 'Ok' }
							);
							showPopup('Could not unhide post', buttons);
						}
					},
					error: function (errorThrown) {
						console.log(errorThrown);

						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup(errorThrown.statusText, buttons);
					},
					complete: function () {
						hideFullScreenLoader();
					}
				});
			}
		});


		// MAIN THREAD

        // show tooltips post captions once post is loaded
        checkElement('.network-post').then((selector) => {
            // show tooltips on post captions
            $(".post-caption").each(function(index) {
                $(this).attr('title', $(this).find('p').text());
                $(this).tooltip({
                    tooltipClass: "tooltip",
                    position: { collision: 'none' },
                    hide: false
                });             
            });
        });

		getAlreadyCuratedNetworkPosts();
		getHiddenNetworkPosts();

	});

}(jQuery));
	
	
function displayNetworkPost(post) {
    return jQuery._displayNetworkPost(post);
}


function updateSearchHeader(searchObject) {
    return jQuery._updateSearchHeader(searchObject);
}


	
	
	
	
	
	
	
	