(function ($) {

	jQuery(document).ready(function () {

		// define variables
		var selectedPost;
		var posts;
		var pageHeading = "All Posts";
		var totalPosts;
		var FilterGallerySelect = document.querySelector('select[name=gallery-select]');
		var selectedGalleryId = FilterGallerySelect.value;
		// $('a[data-action=show-preview]').attr('href', "../gallery-preview/?gallery_id=" + selectedGalleryId);

		// get posts
		function getOculizmPosts(gallery_id, page_num) {

			// FilterGallerySelect = document.querySelector('select[name=gallery-select]');
			// selectedGalleryId = FilterGallerySelect.options[1].value;
			// gallery_id = selectedGalleryId;
			// get posts
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_oculizm_posts',
					'gallery_id': gallery_id,
					'page': page_num
				},
				dataType: 'JSON',
				success: function (data) {

					console.log(data);

					posts = data.posts;

					if (posts.length > 0) {
						// pagination
						var numPages = Math.ceil(data['total'] / data.limit);
						if (numPages > 1) {
							var buttonsHtml = "";
							for (var i = 0; i < numPages; i++) {
								var activeClass = "";
								if (page_num == (i + 1)) activeClass = "active";
								buttonsHtml += "<a href='" + site_url + "/all-posts/?page_num=" + (i + 1) + "' class='page-button " + activeClass + "'>" + (i + 1) + "</a>";
							}
							// check if pagination element exists
							if ($('.pagination').length > 0) {
								// update existing pagination element
								$('.pagination').html(buttonsHtml);
							} else {
								// create new pagination element and append to container
								var paginationHtml = "<div class='pagination'>" + buttonsHtml + "</div>";
								$('.content-block-header, .content-block-footer').append(paginationHtml);
							}
							$('.content-block-header, .content-block-footer').show();
						}

						for (var i = 0; i < posts.length; i++) {
							addPostToGallery('.post-grid', posts[i]);
						}

						squareImageContainers();
						makeImagesFillContainers();
					}
					else {
						$('.main .page-header').hide();
						// var noPostsHtml;
						// noPostsHtml = '	<div class="no-posts-page">' +
						// 	'	<div class="no-post-title">No Posts yet. <a href="' + site_url + '/instagram/">Click here </a> to create your first post.</div>' +
						// 	'	<img class="no-posts-image" src="' + site_url + '/wp-content/themes/oculizm/img/no-posts-icon.png">' +
						// 	'</div>';


						// noDataPlaceholderGenerator(".post-grid", "DivWithTextAndLargeIconAndCTA", "No Posts yet " , "to create your first post." , "no-posts-icon.png" , "Click here" , "instagram");
							
						sampleData(".post-grid" , "all-posts");
						// $('.post-grid').append(placeholderHtml);
						$('.content-block-header, .content-block-footer').hide();
					}

					totalPosts = data['total'];
					updateHeading();
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
					$('.post-grid-container .loader').hide();
				}
			});
		}

		// update page heading
		function updateHeading() {
			$('h1').html(pageHeading + ' (' + totalPosts + ' Posts)');
		}

		// add a post to the grid
		function addPostToGallery(parent, post) {

			// build products icon
			var productsIcon = '';
			if (post.products == null || !Array.isArray(post.products)) { }
			else {
				productsIcon = '<div class="label-icon"><span>' + post.products.length + '</span></div>';
			}

			// build attributes panel
			var attributesHtml = '		<div class="post-attributes-overlay">' +
				'			<div class="post-status-icon"></div>' +
				// '			<div class="social-network-icon"></div>' +
				productsIcon +
				'			<div class="post-pinned-icon"></div>' +
				'		</div>';

			// build actions panel
			var actionsHtml = '		<div class="post-actions-overlay">' +
				'			<a href="#" data-action="push-to-top"></a>' +
				'			<a href="' + site_url + '/edit-post/?post_id=' + post.post_id + '" data-action="edit-post"></a>' +
				'			<a href="#" data-action="delete-post"></a>' +
				'		</div>';

			// image
			var mediaHtml;
			if (!post.video_url) {
				mediaHtml = '	<div class="post-inner">' +
					'		<img class="image-fill" src="' + post.image_url + '">' +
					attributesHtml +
					actionsHtml +
					'	<div class="post-title">' + post.post_title + '</div>' +
					'	</div>' +
					'	<div class="post-caption"><p>' + post.caption + '</p></div>' +
					'	<div class="post-meta">' +
					'		<div class="post-meta-item" name="date">' +
						(post.post_status === 'future' ?
							'will be published in : ' + post.date_diff :
							post.date_diff) +
						'</div>' +
					'		<div class="post-meta-item" name="author">' + post.author_name + '</div>' +
					'	</div>';
			}

			// video
			else {
				mediaHtml = '	<div class="post-inner">' +
					'		<video class="video">' +
					'			<source src="' + post.video_url + '" type="video/mp4">' +
					'			Your browser does not support the video tag.' +
					'		</video>' +
					'		<div class="video-icon"></div>' +
					'	<div class="post-title">' + post.post_title + '</div>' +
					attributesHtml +
					actionsHtml +
					'	</div>' +
					'	<div class="post-caption"><p>' + post.caption + '</p></div>' +
					'	<div class="post-meta">' +
					'		<div class="post-meta-item" name="date">' +
					(post.post_status === 'future' ?
						'will be published in : ' + post.date_diff :
						post.date_diff) +
					'</div>' +
					'		<div class="post-meta-item" name="author">' + post.author_name + '</div>' +
					'	</div>';
			}

			var postHtml = '<div class="saved-post" ' +
				'data-post-id="' + post.post_id + '" ' +
				'data-post-status="' + post.post_status + '" ' +
				'data-social-network="' + post.social_network + '" ' +
				'data-pinned="' + post.pinned_post + '" ' +
				'data-social-id="' + post.social_id + '">' +
				mediaHtml +
				'</div>';

			$(postHtml).hide().appendTo(parent).fadeIn(500);
		}


		// push to top
		$('body').on('click', 'a[data-action=push-to-top]', function (e) {
			e.preventDefault();

			selectedPost = $(this).closest('.saved-post').attr('data-post-id');

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'update_post_publish_date',
					'post_id': selectedPost
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					// hide overlay
					$('.popup-overlay').fadeOut();
					$('body').removeClass('no-scroll');

					// move post to top
					$('.saved-post[data-post-id=' + selectedPost + ']').prependTo('.post-grid');
				},
				error: function (errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
					hideFullScreenLoader();
				}
			});
		});

		// show confirm delete post overlay
		$('body').on('click', '.saved-post a[data-action=delete-post]', function (e) {
			e.preventDefault();

			selectedPost = $(this).closest('.saved-post').attr('data-post-id');

			// create popup
			var buttons = new Array(
				{ 'action': 'confirm-delete-post', 'text': 'Delete' },
				{ 'action': 'close-popup', 'text': 'Cancel' }
			);
			showPopup('Are you sure you want to delete this post?', buttons);
		});

		// confirm delete post
		$('body').on('click', '.popup-overlay a[data-action=confirm-delete-post]', function (e) {
			e.preventDefault();

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'delete_oculizm_post',
					'post_id': selectedPost
				},
				dataType: 'JSON',

				success: function (data) {
					//console.log(data);

					// hide overlay
					$('.popup-overlay').fadeOut();
					$('body').removeClass('no-scroll');

					$('.saved-post[data-post-id=' + selectedPost + ']').remove();

					totalPosts--;
					updateHeading();
				},
				error: function (errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
					hideFullScreenLoader();
				}
			});
		});

		// open the order details overlay
		$('body').on('click', '.header-filter-button', function (e) {

			// open the overlay
			$('.form-overlay[name=post-filters]').fadeIn();
		});

		// open the gallery preview overlay
		$('body').on('click', '.header-preview-button', function (e) {
            // e.preventDefault();

			//clear any previous posts
			$('div[name=tag-preview]').empty();

			//Making the desktop view the default display
			$('div[name=tag-preview] .post-grid-container').removeClass('mobile-view');
			const desktopIcon = document.querySelector('img[data-view="desktop"]');
			const mobileIcon = document.querySelector('img[data-view="mobile"]');
			desktopIcon.classList.add('active');
			mobileIcon.classList.remove('active');

			FilterGallerySelect = document.querySelector('select[name=gallery-select]');
			selectedGalleryId = FilterGallerySelect.value;

			let selectedGalleryName = "";
			if (selectedGalleryId) {
				// Get the selected option element
					const selectedOption = FilterGallerySelect.options[FilterGallerySelect.selectedIndex];

					// Get the text content of the selected option
					selectedGalleryName = selectedOption.text;
			} else {

				// Get the text content of the second option
					selectedGalleryName = FilterGallerySelect.options[1].text;
			}

			if (!selectedGalleryId) {
				selectedGalleryId = FilterGallerySelect.options[1].value;
		}

			var shopTagUrl = site_url + "/wp-content/uploads/" + clientID + "_" + selectedGalleryId + "_grid.js";
			var shopInitCall = "jQuery('#oclzm').oculize({" +
				"   region: ''" +
				"});";
			var shopTag = "<script id='oculizm_grid_script'>\n" +
				"	var OCULIZM_Grid_PARENT=jQuery('script#oculizm_grid_script').parent();\n" +
				"	OCULIZM_Grid_PARENT.append('<div id=\"oclzm\"></div>');\n" +
				"	jQuery.getScript('" + shopTagUrl + "',function(script,textStatus,jqXHR ){\n" +
				"		if(textStatus==='success') { " + shopInitCall + " \n" +
				"	}});\n" +
				"</script>\n";

			$('div[name=tag-preview]').append(shopTag);

			// open the overlay
			$('.form-overlay[name=gallery-preview]').fadeIn();
		});

		// apply filters
		$('body').on('click', '.filter-button, a[name=apply-filters]', function (e) {
			e.preventDefault();

			//show the loader
			$('.post-grid-container .loader').show();

			// Clear existing posts and pagination
			$('.post-grid').empty();
			$('.pagination').empty();

			// close the overlay
			$('.form-overlay[name=post-filters]').fadeOut();

			// Check if the clicked element is a filter button
			if ($(this).hasClass('filter-button')) {

				// Extract the page_num value from the href attribute
				page_num = $(this).attr('href').split('page_num=')[1] ? $(this).attr('href').split('page_num=')[1] : 1;

			}

			// Check if the clicked element is apply-filters button
			if ($(this).attr('name') === 'apply-filters') {

				// set the page number to 1 
				page_num = 1;

			}

			FilterGallerySelect = document.querySelector('select[name=gallery-select]');
			selectedGalleryId = FilterGallerySelect.value;
			// $('a[data-action=show-preview]').attr('href', "../gallery-preview/?gallery_id=" + selectedGalleryId);

			selectedIndex = FilterGallerySelect.selectedIndex;
			console.log("selectedIndex :  ", selectedIndex);


			// Get the selected radio-option for the status form-row
			var status = document.querySelector('div[name="status"] .radio-option.active').getAttribute('name');

			// Get the selected radio-option for the pinned-status form-row
			var pinnedStatus = document.querySelector('div[name="pinned-status"] .radio-option.active').getAttribute('name');
			

			// Get the selected radio-option for the is-tagged-products form-row
			var taggedProducts = document.querySelector('div[name="is-tagged-products"] .radio-option.active').getAttribute('name');

			// Get the selected radio-option for the media-type form-row
			var mediaType = document.querySelector('div[name="media-type"] .radio-option.active').getAttribute('name');

			if (status === 'all' && pinnedStatus === 'all' && taggedProducts === 'all' && mediaType === 'images-and-videos' && selectedIndex == 0) {
				getOculizmPosts(gallery_id, page_num);
				updateHeading();
			}
			
			else {
				// get filtered posts
				$.ajax({
					url: ajaxUrl,
					data: {
						'action': 'get_oculizm_filtered_posts',
						'gallery_id': selectedGalleryId,
						'status': status,
						'mediaType': mediaType,
						'taggedProducts': taggedProducts,
						'pinnedStatus': pinnedStatus,
						'page': page_num
					},
					dataType: 'JSON',
					success: function (data) {
						console.log(data);

						var posts = data.posts;
						var totalNumberOfFilteredPosts = data.totalNumberOfFilteredPosts;

						if (Array.isArray(data.posts) && data.posts.length > 0) {
							// pagination
							var numPages = data.numPages;
							if (numPages > 1) {
								var buttonsHtml = "";
								for (var i = 0; i < numPages; i++) {
									var activeClass = "";
									if (page_num == (i + 1)) activeClass = "active";
									buttonsHtml += "<a href='" + site_url + "/all-posts/?page_num=" + (i + 1) + "' class='page-button filter-button " + activeClass + "'>" + (i + 1) + "</a>";
								}
								// replace existing pagination links
								// $('.pagination').replaceWith($('<div class="pagination">' + buttonsHtml + '</div>'));
								$('.pagination').html(buttonsHtml);
								$('.content-block-header, .content-block-footer').show();
							} else {
								$('.content-block-header, .content-block-footer').hide();
							}
							for (var i = 0; i < posts.length; i++) {
								addPostToGallery('.post-grid', posts[i]);
							}

							squareImageContainers();
							makeImagesFillContainers();
						}
						else {
							// var noPostsHtml;
							// noPostsHtml = '	<div class="no-posts-page">' +
							// 	'	<div class="no-post-title">No posts match for your selected filters.</div>' +
							// 	'	<img class="no-posts-image" src="' + site_url + '/wp-content/themes/oculizm/img/no-posts-icon.png">' +
							// 	'</div>';

							noDataPlaceholderGenerator(".post-grid", "DivWithTextAndLargeIcon", "No posts match for your selected filters." , "" , "no-posts-icon.png" , "" , "");

							// $('.post-grid').append(placeholderHtml);
							$('.content-block-header, .content-block-footer').hide();
						}
						// change the title html
						$('h1').html('Filtered Posts (' + totalNumberOfFilteredPosts + ')');
					},
					error: function (jqXHR, textStatus, errorThrown) {
						console.log(errorThrown);
					},
					complete: function () {
						$('.post-grid-container .loader').hide();
					}
				});

			}
		});

		// window resize events
		$(window).resize(function () {
			squareImageContainers();
			makeImagesFillContainers();
		});


		// MAIN THREAD

        // get the galleries
        $.ajax({
            url: ajaxUrl,
            data:{
                'action':'get_galleries'
            },
            dataType: 'JSON',

            success:function(data) {
                console.log(data);

                if (data) {

                    // populate the gallery dropdown
                    let galleryDropdownHtml = "";
                    for (var i=0; i<data.length; i++) {
                        let galleryOption = '<option value="' + data[i]['id'] + '">' + data[i]['name'] + '</option>';
                        galleryDropdownHtml += galleryOption;
                    }
                    $('select[name=gallery-select]').append(galleryDropdownHtml);
                    console.log($('select[name=gallery-select]'));
                }
            },
            error: function(errorThrown) {
                console.log(errorThrown);

                // create popup
                var buttons = new Array(
                    {'action': 'close-popup', 'text': 'Ok'}
                );
                showPopup(errorThrown.statusText, buttons);
            },
            complete: function() {
                hideFullScreenLoader();
            }
        });

		// get gallery info
		if (gallery_id) {
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_gallery',
					'gallery_id': gallery_id
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					if (data['id']) {
						pageHeading = data['name'];
						updateHeading();
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				},
				complete: function () { }
			});
		}

		function checkOptionRendered() {

			const FilterGallerySelect = document.querySelector('select[name="gallery-select"]');
			if (FilterGallerySelect && FilterGallerySelect.options[1]) {
				gallery_id = FilterGallerySelect.options[1].value;
				getOculizmPosts(gallery_id, page_num);
			} else {
				// Option not yet rendered, retry after a short delay
				setTimeout(checkOptionRendered, 100);
			}
		}
		
		// Start checking for the rendered option
		checkOptionRendered();

	});

}(jQuery));









