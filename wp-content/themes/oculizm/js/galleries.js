(function ($) {

	jQuery(document).ready(function () {

		var numOfGalleries;
		var productFeeds = new Array();
		var allPosts, galleryId, galleryName, galleryData,customOrderGalleryId;
		var customreordering = false;
		var lastOpenedGalleryId;
		var initialPostsOrder = [];
		var galleryTemplate = '<div class="content-block">' +
							'   <div class="content-block-menu">' +
							'       <a href="#" class="reorder-posts-button" data-action="">Reorder</a>' +
							'       <a href="#" class="header-button" data-action="edit-gallery">Edit</a>' +
							'   </div>' +
							'   <h2><span class="gallery-name"></span> (<span class="gallery-count">0</span>)</h2>' +
							'   <div class="post-grid"></div>' +
							'</div>';


		// window resize events
		$(window).resize(function () {
			squareImageContainers();
			makeImagesFillContainers();
		});

		// add gallery
		$('body').on('click', 'a[name=add-new-gallery]', function (e) {
			e.preventDefault();

			galleryName = $('.form-overlay[name=add-gallery] .form-row[name=gallery-name] input').val().trim();
			if (galleryName == "") {

				// create popup
				var buttons = new Array(
					{ 'action': 'close-popup', 'text': 'Ok' }
				);
				showPopup('Please choose a name for the new gallery.', buttons);
				return;
			}

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'add_gallery',
					'gallery_name': galleryName,
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					if (data && data.id) {

						$('.form-overlay[name=add-gallery]').fadeOut();
						$('body').removeClass('no-scroll');

						//set the new gallery number after adding the new gallery
						var newNumOfGalleries = numOfGalleries += 1;
						$('.gallery-header span').text("(" + newNumOfGalleries + ")");

						// add newly created gallery to galleryData
						galleryData.push(data);

						// clear the form
						$('.form-overlay[name=add-gallery] .form-row[name=gallery-name] input').val('');

						// insert it into view
						var newGalleryHtml = '<div class="content-block hidden" data-gallery-id="' + data.id + '">' +
							'	<div class="content-block-menu">' +
							'		<a href="#" class="header-button" data-action="edit-gallery">Edit</a>' +
							'	</div>' +
							'	<h2><span class="gallery-name">' + galleryName + '</span> (<span class="gallery-count">0</span>)</h2>' +
							'	<div class="post-grid"></div>' +
							'</div>';

						// create gallery HTML
						var g = $(galleryTemplate);
						g.attr('data-gallery-id', data.id);
						g.find('.gallery-name').text(galleryName);
						g.find('.switch').attr('data-status', 'false');

						$('.main').append($(g));
						g.slideDown().removeClass('hidden');
					}

					else {
						console.log(data);

						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup('There was an error creating the gallery.', buttons);
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
		});

		// open the add gallery form overlay
		$('body').on('click', '.button-add-gallery', function (e) {
			e.preventDefault();

			$('.form-overlay[name=add-gallery]').fadeIn();
			$('body').addClass('no-scroll');
			$('.form-overlay[name=add-gallery]').scrollTop(0);
		});

		// open the edit gallery form overlay
		$('body').on('click', 'a[data-action=edit-gallery]', function (e) {
			e.preventDefault();

			galleryId = $(this).closest('.content-block').attr('data-gallery-id');
			galleryName = $(this).closest('.content-block').find('.gallery-name').text();

			//get the number of galleries in the galleries page
			var numberOfGalleries = document.querySelectorAll('[data-gallery-id]').length;

			//if client have 1 gallery hide the delete gallery button
			if (numberOfGalleries <= 1) {
				var deleteGalleryElement = document.querySelector('.content-block[name="delete-gallery"]');
				if (deleteGalleryElement) {
					deleteGalleryElement.style.display = 'none';
				}
			}

			$('.form-overlay .form-row[name=gallery-id] input').val(galleryId);
			$('.form-overlay .form-row[name=gallery-name] input').val(galleryName);

			$('.form-overlay[name=edit-gallery]').fadeIn();
			$('body').addClass('no-scroll');
			$('.form-overlay[name=edit-gallery]').scrollTop(0);
		});

		// Custom Reordering switch
		$('body').on('click', '.switch[name=custom-ordering] .switch-track', function (e) {
			e.preventDefault();
		
			var theSwitch = $(this).parent();
		
			// set the element attribute
			var newStatus = theSwitch.attr('data-status') === "true" ? "false" : "true";
		
			theSwitch.attr('data-status', newStatus);
		
			showFullScreenLoader();
		
			// get the new attribute value
			var customReorderingValue = newStatus === "true" ? 1 : 0;
			var customOrderGalleryId = theSwitch.closest('.form-overlay').attr('data-gallery-id');
		
			// Update description
			var switchDescriptionText = newStatus === "true" ?
				'Custom ordering is enabled. Posts can be moved around using the drag and drop interface below' :
				'Custom ordering is disabled. Posts will be displayed chronologically';
			theSwitch.find('.switch-description').text(switchDescriptionText);
		
			// Toggle drag-and-drop functionality
			var draggableContainer = $('.form-overlay[name=gallery-ordering] .content-block[name=draggable-posts]')[0];
			if (newStatus === "true") {
				// Initialize Sortable
				new Sortable(draggableContainer, {
					animation: 150,
					ghostClass: 'sortable-ghost',
					onEnd: function (/**Event*/evt) {
						// Show "Save Changes" and "Cancel Changes" buttons when items are reordered
						$('a[name=save-order]').show();
						$('a[name=cancel-order]').show();
					}
				});
				// Remove opacity if custom ordering is enabled
				$('.draggable-post').removeClass('disabled');
			} else {
				// Destroy Sortable
				var sortableInstance = Sortable.get(draggableContainer);
				if (sortableInstance) {
					sortableInstance.destroy();
				}
				// Add opacity if custom ordering is disabled
				$('.draggable-post').addClass('disabled');
		
				// Reset posts order to the initial state when switching off custom ordering
				resetPostsOrder(initialPostsOrder);
			}
		
			// Hide buttons if custom ordering is disabled
			if (newStatus === "false") {
				$('a[name=save-order]').hide();
				$('a[name=cancel-order]').hide();
			}
		
			// send it to the back end
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'set_custom_ordering',
					'custom_ordering_value': customReorderingValue,
					'gallery_id': customOrderGalleryId
				},
				dataType: 'JSON',
		
				success: function (data) {
					console.log(data);
		
					if (data == "1") {
						// Success handling
					} else {
						console.log('Nothing changed');
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
					hideFullScreenLoader();
					fetchPosts(customOrderGalleryId);
				}
			});
		});

		// Function to reset posts to initial order
		function resetPostsOrder(initialPostsOrder) {
			$('.form-overlay[name=gallery-ordering] .content-block[name=draggable-posts]').empty();
			for (var i = 0; i < initialPostsOrder.length; i++) {
				var post = initialPostsOrder[i];
				var image_url = post['image_url'];
				var video_url = post['video_url'];
				var postId = post['post_id']; // Get the post ID
		
				var postHtml = '<div class="draggable-post" data-post-id="' + postId + '">'; // Add data-post-id attribute
				// Image
				if (!video_url) {
					postHtml += '<div class="draggable-post-inner">' +
						'   <img class="image-fill" src="' + image_url + '">' +
						'</div>';
				}
				// Video
				else {
					postHtml += '<div class="draggable-post-inner">' +
						'   <video class="video">' +
						'       <source src="' + video_url + '">' +
						'       Your browser does not support the video tag.' +
						'   </video>' +
						'</div>';
				}
				postHtml += '</div>';
				$('.form-overlay[name=gallery-ordering] .content-block[name=draggable-posts]').append($(postHtml));
			}
			$('.draggable-post').addClass('disabled'); // Ensure posts are disabled
			$('a[name=save-order]').hide();
			$('a[name=cancel-order]').hide();
		}

		// Open the custom post ordering form overlay
		$('body').on('click', '.reorder-posts-button', function (e) {
			e.preventDefault();

			var galleryId = $(this).closest('.content-block').attr('data-gallery-id');
			var galleryName = $(this).closest('.content-block').find('.gallery-name').text();
			var customOrderingStatus = $(this).closest('.content-block').attr('data-custom-ordering');
			console.log("galleryName : ", galleryName);
			showFullScreenLoader();

			// Set the data-gallery-id attribute on the form overlay
			$('.form-overlay[name=gallery-ordering]').attr('data-gallery-id', galleryId);

			// Clear previous posts and headers
			$('.form-overlay[name=gallery-ordering] .content-block[name=draggable-posts]').empty();
			$('.form-overlay[name=gallery-ordering] h2').remove();
			$('.form-overlay[name=gallery-ordering] .switch').remove();

			// Get this gallery's posts and custom ordering status
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_oculizm_posts',
					'gallery_id': galleryId
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					var posts = data.posts;
					initialPostsOrder = [...posts]; // Store the initial order of posts
					var switchDescriptionText = customOrderingStatus === 'true' ?
						'Custom ordering is enabled. Posts can be moved around using the drag and drop interface below' :
						'Custom ordering is disabled. Posts will be displayed chronologically';

					if (posts) {
						// Add gallery title
						var galleryTitleHtml = '<h2 style="text-align: center;margin-bottom: 30px;">Gallery Ordering</h2>';
						$('.form-overlay[name=gallery-ordering] .content-block[name=draggable-posts]').before($(galleryTitleHtml));

						// Add switch for custom ordering with description inside switch-label
						var switchHtml = '<div class="switch" name="custom-ordering" data-status="' + customOrderingStatus + '">' +
							'<div class="switch-track">' +
							'<div class="switch-lever"></div>' +
							'</div>' +
							'<div class="switch-label">Custom Ordering <span class="switch-description">' + switchDescriptionText + '</span></div>' +
							'</div>';
						$('.form-overlay[name=gallery-ordering] .content-block[name=draggable-posts]').before($(switchHtml));

						// Add posts with data-post-id attribute
						for (var i = 0; i < posts.length; i++) {
							// Get media URLs
							var image_url = posts[i]['image_url'];
							var video_url = posts[i]['video_url'];
							var postId = posts[i]['post_id']; // Get the post ID

							var postHtml = '<div class="draggable-post" data-post-id="' + postId + '">'; // Add data-post-id attribute
							// Image
							if (!video_url) {
								postHtml += '<div class="draggable-post-inner">' +
									'   <img class="image-fill" src="' + image_url + '">' +
									'</div>';
							}
							// Video
							else {
								postHtml += '<div class="draggable-post-inner">' +
									'   <video class="video">' +
									'       <source src="' + video_url + '">' +
									'       Your browser does not support the video tag.' +
									'   </video>' +
									'</div>';
							}
							postHtml += '</div>';
							$('.form-overlay[name=gallery-ordering] .content-block[name=draggable-posts]').append($(postHtml));
						}

						// Conditionally initialize or destroy Sortable based on customOrderingStatus
						var draggableContainer = $('.form-overlay[name=gallery-ordering] .content-block[name=draggable-posts]')[0];
						if (customOrderingStatus === 'true') {
							new Sortable(draggableContainer, {
								animation: 150,
								ghostClass: 'sortable-ghost',
								onEnd: function (/**Event*/evt) {
									// Show "Save Changes" and "Cancel Changes" buttons when items are reordered
									$('a[name=save-order]').show();
									$('a[name=cancel-order]').show();
								}
							});
							// Remove opacity if custom ordering is enabled
							$('.draggable-post').removeClass('disabled');
						} else {
							var sortableInstance = Sortable.get(draggableContainer);
							if (sortableInstance) {
								sortableInstance.destroy();
							}
							// Add opacity if custom ordering is disabled
							$('.draggable-post').addClass('disabled');
						}

						// Show or hide the "Save Changes" and "Cancel Changes" buttons based on customOrderingStatus
						if (customOrderingStatus === 'true') {
							$('a[name=save-order]').hide(); // Initially hidden, will show on changes
							$('a[name=cancel-order]').hide(); // Initially hidden, will show on changes
						} else {
							$('a[name=save-order]').hide(); // Always hidden if custom ordering is off
							$('a[name=cancel-order]').hide(); // Always hidden if custom ordering is off
						}

						// Trigger resize so thumbnails are resized
						setTimeout(function () {
							window.dispatchEvent(new Event('resize'));
							squareImageContainers();
							makeImagesFillContainers();
						}, 100);
					}
				},
				error: function (errorThrown) {
					console.log(errorThrown);

					// Create popup
					var buttons = new Array(
						{ 'action': 'close-popup', 'text': 'Ok' }
					);
					showPopup(errorThrown.statusText, buttons);
				},
				complete: function () {
					hideFullScreenLoader();
					lastOpenedGalleryId = galleryId;
				}
			});

			$('.form-overlay[name=gallery-ordering]').fadeIn();
			$('body').addClass('no-scroll');
			$('.form-overlay[name=gallery-ordering]').scrollTop(0);
		});

		// Reset changes on "Cancel Changes" button click
		$('body').on('click', 'a[name=cancel-order]', function (e) {
			e.preventDefault();
			var galleryId = $('.form-overlay[name=gallery-ordering]').attr('data-gallery-id');
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_oculizm_posts',
					'gallery_id': galleryId
				},
				dataType: 'JSON',
				success: function (data) {
					resetPostsOrder(data.posts); // Reset posts order to the initial state
					$('.draggable-post').removeClass('disabled');
				},
				error: function (errorThrown) {
					console.log(errorThrown);
				}
			});
			$('a[name=save-order]').hide();
			$('a[name=cancel-order]').hide();
		});


		// Add event listener for the save order button
		$('body').on('click', '[name="save-order"]', function(e) {
			e.preventDefault(); // Prevent the default action

			showFullScreenLoader();

			// Get the gallery ID
			var galleryId = lastOpenedGalleryId;

			// Get the ordered post IDs
			var orderedPostIds = $('.form-overlay[name=gallery-ordering] .content-block[name=draggable-posts] .draggable-post').map(function() {
				return $(this).data('post-id');
			}).get().join(',');

			// Send the order to the server
			$.ajax({
				url: ajaxUrl,
				method: 'POST',
				data: {
					action: 'save_oculizm_posts_order',
					gallery_id: galleryId,
					custom_order: orderedPostIds
				},
				success: function(response) {
					if (response.success) {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup('Posts order saved successfully!', buttons);
					} else {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup('Failed to save posts order!', buttons);
					}
				},
				complete: function () {
					hideFullScreenLoader();
					$('.form-overlay[name=gallery-ordering]').fadeOut();
					$('body').removeClass('no-scroll');
					fetchPosts(galleryId);
				}
			});

		});


		// edit gallery
		$('body').on('click', 'a[name=save-gallery]', function (e) {
			e.preventDefault();

			galleryName = $(this).closest('.form-overlay').find('.form-row[name=gallery-name] input').val().trim();
			if (galleryName == "") {

				// create popup
				var buttons = new Array(
					{ 'action': 'close-popup', 'text': 'Ok' }
				);
				showPopup('Please choose a valid name for the gallery.', buttons);
				return;
			}

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'update_gallery',
					'gallery_id': galleryId,
					'gallery_name': galleryName,
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					// if there was an error...
					if (data.errors) {

						console.log(data);

						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup('There was an error editing the gallery.', buttons);
					}

					// else, if it was a success...
					else {
						$('.content-block[data-gallery-id=' + galleryId + '] .gallery-name').text(galleryName);

						// hide overlay
						$('.form-overlay').fadeOut();
						$('body').removeClass('no-scroll');
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
		});

		// show confirm delete gallery overlay
		$('body').on('click', 'a[data-action=delete-gallery]', function (e) {
			e.preventDefault();

			// create popup
			var buttons = new Array(
				{ 'action': 'delete-gallery', 'text': 'Delete' },
				{ 'action': 'close-popup', 'text': 'Cancel' }
			);
			showPopup('Are you sure you want to delete this gallery? All media in the gallery will still appear in the All Media.', buttons);
		});

		// confirm delete gallery
		$('body').on('click', '.popup-overlay a[data-action=delete-gallery]', function (e) {
			e.preventDefault();

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'delete_gallery',
					'gallery_id': galleryId
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					// if (data === "Cannot delete last gallery.") {
					// 	// Display error message using showPopup
					// 	var buttons = [
					// 		{ 'action': 'last-gallery-close-popup', 'text': 'Ok' }
					// 	];
					// 	showPopup(data, buttons);
					// 	$('body').on('click', '.popup-overlay a[data-action=last-gallery-close-popup]', function (e) {
					// 		// hide overlay
					// 		$('.popup-overlay').fadeOut();
					// 		$('body').removeClass('no-scroll');

					// 	});
					// } else if (data === true) {
					// 	$('.content-block[data-gallery-id=' + galleryId + ']').slideUp();

					// 	//set the new gallery number after deleting the gallery
					// 	var newNumOfGalleries = numOfGalleries -= 1;
					// 	$('.gallery-header span').text("(" + newNumOfGalleries + ")");
					// 	// hide overlay
					// 	$('.popup-overlay').fadeOut();
					// 	$('body').removeClass('no-scroll');
					// }
					if (data === true) {
						$('.content-block[data-gallery-id=' + galleryId + ']').slideUp();

						//set the new gallery number after deleting the gallery
						var newNumOfGalleries = numOfGalleries -= 1;
						$('.gallery-header span').text("(" + newNumOfGalleries + ")");
						// hide overlay
						$('.popup-overlay').fadeOut();
						$('body').removeClass('no-scroll');
					}


				},
				error: function (errorThrown) {
					console.log(errorThrown);

					// create popup
					var buttons = [
						{ 'action': 'close-popup', 'text': 'Ok' }
					];
					showPopup(errorThrown.statusText, buttons);
				},
				complete: function () {
					hideFullScreenLoader();
					$('.form-overlay').fadeOut();
				}
			});
		});



		// MAIN THREAD

		// get the galleries
		$.ajax({
			url: ajaxUrl,
			data: {
				'action': 'get_galleries'
			},
			dataType: 'JSON',

			success: function (data) {
				console.log(data);

				if (data) {
					galleryData = data;

					//get the number of galleries and append to the html
					numOfGalleries = data.length;
					var numOfGalleriesHtml = '	<span>(' + numOfGalleries + ')</span>';
					$('.gallery-header').append($(numOfGalleriesHtml));

					// for each gallery...
					for (var i = 0; i < data.length; i++) {

						var galleryId = data[i]['id'];
						var customOrdering = data[i]['custom_ordering'] == 1 ? 'true' : 'false';
						

						// create gallery HTML
						var g = $(galleryTemplate);
						g.attr('data-gallery-id', galleryId);
						g.attr('data-custom-ordering', customOrdering);
						g.find('.gallery-name').text(data[i]['name']);
						g.find('.switch').attr('data-status', customOrdering);

						// Show the button if customOrdering is true
						if (customOrdering === 'true') {
							g.find('.reorder-posts-button').css('display', 'block');
						}

						$('.main').append(g);

						// Fetch posts for this gallery
						fetchPosts(galleryId);
					}
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

		function fetchPosts(galleryId) {
			// get this gallery's posts
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_oculizm_posts',
					'gallery_id': galleryId
				},
				'galleryId': galleryId,
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					posts = data.posts;

					if (posts) {

						$('.content-block[data-gallery-id=' + this.galleryId + '] .gallery-count').text(commaInt(data['total']));
						$('.content-block[data-gallery-id=' + this.galleryId + '] .post-grid').empty();

						// add posts
						var loopMax = Math.min(posts.length, 4);
						for (var i = 0; i < loopMax; i++) {

							// get media URLs
							var image_url = posts[i]['image_url'];
							var video_url = posts[i]['video_url'];

							var postHtml = '<div class="saved-post">';

							// image
							if (!video_url) {
								postHtml += '<div class="post-inner">' +
									'	<img class="image-fill" src="' + image_url + '">' +
									'</div>';
							}

							// video
							else {
								postHtml += '<div class="post-inner">' +
									'	<video class="video">' +
									'		<source src="' + video_url + '">' +
									'		Your browser does not support the video tag.' +
									'	</video>' +
									'</div>';
							}
							postHtml += '</div>';
							$('.content-block[data-gallery-id=' + this.galleryId + '] .post-grid').append($(postHtml));
						}
						// trigger resize so thumbnails are resized
						setTimeout(function () {
							window.dispatchEvent(new Event('resize'));
							squareImageContainers();
							makeImagesFillContainers();
						}, 100);

						// show gallery link
						$('.content-block[data-gallery-id=' + this.galleryId + '] .cta-group').show();
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

		squareImageContainers();
		makeImagesFillContainers();

	});

}(jQuery));





