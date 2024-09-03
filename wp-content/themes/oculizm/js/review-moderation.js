(function ($) {

	jQuery(document).ready(function () {

		var reviewID;
		var review;
		var reviews;
		var reviewStatus;
		var min_auto_publish_reviews_stars;
		var reviewRating;
		var approveViewertext;
		var approveCtaText;

		// get reviews
		function displayReviewsByStatusAndRating(status, selectedRating, reviewType) {
			$.ajax({
				url: ajaxUrl,
				type: 'get',
				data: {
					'action': 'get_reviews'
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);

					reviews = data;

					var reviewsFound = false;

					if (reviews.length > 0) {

						var reviewsHtml = '';

						// for each review...
						for (var i = 0; i < reviews.length; i++) {
							var matchingRating = selectedRating === '0' || reviews[i]['rating'] == selectedRating; // Adjusted the comparison here
							var matchingReviewType = reviewType === 'allReviews' || (reviewType === 'siteReviews' ? !reviews[i]['product_id'] : !!reviews[i]['product_id']);

							if ((status === 'all' || reviews[i]['status'] === status) && matchingRating && matchingReviewType) {
								// format date
								var date = new Date(reviews[i]['created']);
								var dateStr = date.getDate() + " " + monthNames[date.getMonth()].substring(0, 3) + " "
									+ (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

								// create rating HTML
								var ratingHtml = "";
								for (var j = 0; j < 5; j++) {
									var starHtml = '<div class="rating-star"><i></i></div>';
									if (j < reviews[i]['rating']) starHtml = '<div class="rating-star active"><i></i></div>';
									ratingHtml += starHtml;
								}

								// create review HTML
								reviewsHtml = "<div class='review' data-review-id='" + reviews[i]['id'] + "'" +
									"			data-product-id='" + reviews[i]['product_id'] + "'" +
									"			data-rating='" + reviews[i]['rating'] + "'" +
									"			data-review-status='" + reviews[i]['status'] + "'>" +
									"	<div class='reviewed-product'></div>" +
									"	<div class='review-detail'>" +
									"		<div class='rating'><div class='review-stars'>" + ratingHtml + "</div></div>" +
									"		<div class='review-title'>" + reviews[i]['title'] + "</div>" +
									"		<div class='review-description'>" + reviews[i]['description'] + "</div>" +
									"	</div>" +
									"	<div class='review-actions'>" +
									"		<div class='review-status'>" + reviews[i]['status'] + "</div>" +
									"		<div class='cta-group'>" +
									"			<a class='cta-primary' data-action='update-review-status' data-intent='admin_approved'>Approve</a>" +
									"			<a class='cta-secondary' data-action='delete-review'>Delete</a>" +
									"			<a class='cta-primary' data-action='update-review-status' data-intent='published'>Approve</a>" +
									"			<a class='cta-secondary' data-action='update-review-status' data-intent='flagged'>Flag</a>" +
									"		</div>" +
									"	</div>" +
									"	<div class='review-meta'>" +
									"		<div class='review-meta-item' name='date-diff'>" + dateStr + "</div>" +
									"		<div class='review-meta-item' name='reviewer'>" + reviews[i]['reviewer_name'] + "</div>" +
									"	</div>" +
									"</tr>";

								// append
								$('.content-block[name=all-reviews] .content-block-body').append(reviewsHtml);
								$('.content-block[name=all-reviews] .content-block-body').removeClass('hidden');
								$('.content-block[name=all-reviews] .no-data').hide();
								reviewsFound = true;
							}
						}

						if (!reviewsFound) {
							// Show no-data element and hide reviews header
							// $('.content-block[name=all-reviews] .no-data').show();
							$('.reviews-header').hide();
						}

						// fetch product images
						getProductImages();
					} else {
						// Show no-data element and hide reviews header
						$('.content-block[name=all-reviews] .no-data').hide();
						$('.main .page-header').hide();
						$('.content-block[name=all-reviews] .content-block-body').removeClass('hidden');
						sampleData(".content-block[name=all-reviews] .content-block-body" , "all-reviews");
						$('.reviews-header').hide();
					}
				},
				error: function (errorThrown) {
					console.log(errorThrown);

					// create popup
					var buttons = new Array(
						{ 'action': 'close-popup', 'text': 'Ok' }
					);
					showPopup('Error: ' + errorThrown.statusText, buttons);
				},
				complete: function () {
					hideFullScreenLoader();
				}
			});
		}

		// update review status
		function updateReviewStatus(status, reviewID) {
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'update_review_status',
					'status': status,
					'review_id': reviewID
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					if (data) {
						$('.review[data-review-id=' + reviewID + ']').attr('data-review-status', status);
						$('.review[data-review-id=' + reviewID + '] .review-status').text(status);
					}

					else {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup('There was an error changing the review status', buttons);
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

		// get product images
		function getProductImages() {

			// get product IDs we need thumbnails for
			var productIDs = $(".content-block[name=all-reviews] .review").map(function () {
				return $(this).attr('data-product-id');
			}).get();

			// make the array unique
			var productIDsUnique = productIDs.filter(uniqueArray);

			if (productIDs.length > 0) {
				$.ajax({
					url: ajaxUrl,
					async: false,
					data: {
						'action': 'get_product_images',
						'product_ids': productIDs
					},
					dataType: 'JSON',
					success: function (data) {
						console.log(data);

						if (data) {
							for (var i = 0; i < data.length; i++) {
								var productHtml = "<img src='" + data[i]['image_link'] + "' />";
								$('.review[data-product-id=' + data[i]['product_id'] + '] .reviewed-product').append(productHtml);
							}
						}
					},
					error: function (errorThrown) {
						console.log(errorThrown);
					},
					complete: function () { }
				});
			}
		}
		


		// update review
		// $('body').on('click', 'a[action=update-review]', function (e) {
		// 	e.preventDefault();

		// 	var message = $(this).closest('.form-overlay').find('textarea[review-message]').val().trim();
		// 	if (message == "") {

		// 		// create popup
		// 		var buttons = new Array(
		// 			{ 'action': 'close-popup', 'text': 'Ok' }
		// 		);
		// 		showPopup('Please type a message.', buttons);
		// 		return;
		// 	}

		// 	showFullScreenLoader();

		// 	$.ajax({
		// 		url: ajaxUrl,
		// 		data: {
		// 			'action': 'update_review',
		// 			'review_id': reviewID,
		// 			'message': message,
		// 		},
		// 		dataType: 'JSON',

		// 		success: function (data) {
		// 			console.log(data);

		// 			if (data['id']) {

		// 				// create popup
		// 				var buttons = new Array(
		// 					{ 'action': 'close-popup', 'text': 'Close' }
		// 				);
		// 				showPopup('Reply submitted.', buttons);
		// 			}

		// 			else {

		// 				// create popup
		// 				var buttons = new Array(
		// 					{ 'action': 'close-popup', 'text': 'Ok' }
		// 				);
		// 				showPopup('There was an error submitting your reply.', buttons);
		// 			}
		// 		},
		// 		error: function (errorThrown) {
		// 			console.log(errorThrown);

		// 			// create popup
		// 			var buttons = new Array(
		// 				{ 'action': 'close-popup', 'text': 'Ok' }
		// 			);
		// 			showPopup(errorThrown.statusText, buttons);
		// 		},
		// 		complete: function () {
		// 			hideFullScreenLoader();
		// 		}
		// 	});
		// });

		// open the review reply modal
		// $('body').on('click', 'td[name=title] a', function (e) {
		// 	e.preventDefault();

		// 	// get the clicked on review
		// 	reviewID = $(this).closest('tr').attr('data-rview-id');
		// 	review = searchArrayForID(reviewID, reviews);

		// 	$('.form-overlay[name=review-modal]').fadeIn();
		// 	$('body').addClass('no-scroll');
		// 	$('.form-overlay[name=review-modal]').scrollTop(0);

		// 	// set the modal subject
		// 	$('.content-block[name=review-history] h2').text(review['title']);

		// 	// if the review already has a reply don't show the update form
		// 	if (false) $('.form-overlay[name=review-modal] [name=update-review]').hide();
		// 	else $('.form-overlay[name=review-modal] [name=update-review]').show();
		// });

		// delete a review
		$('body').on('click', 'a[data-action=delete-review]', function (e) {
			e.preventDefault();

			// get the clicked on review
			reviewID = $(this).closest('.review').attr('data-review-id');

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'delete_review',
					'review_id': reviewID
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					if (data) {
						$('.review[data-review-id=' + reviewID + ']').remove();
					}

					else {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup('There was an error deleting the review', buttons);
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

		$('body').on('click', 'a[name=update-display-name]', function (e) {
			e.preventDefault();

			// get the clicked on review
			reviewID = $(this).attr('data-review-id');
			reviewStatus = 'published';
			var selectedReviewerName = $('select[name=reviewer-display-name-select]').val();

			$('.form-overlay[name=reviewer-display-name]').fadeOut();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'update_review_status',
					'status': reviewStatus,
					'review_id': reviewID,
					'reviewer_display_name': selectedReviewerName
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					if (data) {
						$('.review[data-review-id=' + reviewID + ']').attr('data-review-status', reviewStatus);
						$('.review[data-review-id=' + reviewID + '] .review-status').text(reviewStatus);
					}

					else {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup('There was an error changing the review status', buttons);
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

		// set review status (admin_approved)
		$('body').on('click', 'a[data-intent=admin_approved]', function (e) {
			e.preventDefault();

			// get the clicked on review
			reviewID = $(this).closest('.review').attr('data-review-id');

			// get the clicked on review rating
			reviewRating = $(this).closest('.review').attr('data-rating');

			// get the proposed status
			reviewStatus = $(this).attr('data-intent');

			showFullScreenLoader();

			// get min star rating
			$.ajax({
				url: ajaxUrl,
				type: 'get',
				data: {
					'action': 'get_min_star_rating'
				},
				dataType: 'JSON',

				success: function (data) {

					min_auto_publish_reviews_stars = data.min_auto_publish_reviews_stars;

					//if auto publish is not activated
					if (min_auto_publish_reviews_stars === "0") {
						approveViewertext = '<div class="approve-viewer-text"> ' +
							'Are you sure you want to continue ?'
						'</div>';
						approveCtaText = "Yes";

						$('.form-overlay[name=review-approval-overlay] .review-approval-overlay-content').html(approveViewertext);
						$('.form-overlay[name=review-approval-overlay] a[name=approve-review]').text(approveCtaText);
						$('.form-overlay[name=review-approval-overlay] a[name=approve-review]').attr('approval-data-review-status', 'admin_approved');

						$('.form-overlay[name=review-approval-overlay]').fadeIn();

						hideFullScreenLoader();
					}
					//if auto publish is activated
					else {
						//if auto publish is activated and review rating is equal or higher than min_auto_publish_reviews_stars
						if (reviewRating >= min_auto_publish_reviews_stars) {

							approveViewertext = '<div class="approve-viewer-text"> ' +
								'This client have the auto approval on with minimum auto publish reviews stars: ' + min_auto_publish_reviews_stars +
								'<br/>Are you sure you want to continue ?'
							'</div>';
							approveCtaText = "Publish";
							$('.form-overlay[name=review-approval-overlay] .review-approval-overlay-content').html(approveViewertext);
							$('.form-overlay[name=review-approval-overlay] a[name=approve-review]').text(approveCtaText);
							$('.form-overlay[name=review-approval-overlay] a[name=approve-review]').attr('approval-data-review-status', 'published');

							$('.form-overlay[name=review-approval-overlay]').fadeIn();
							hideFullScreenLoader();
						}
						//if auto publish is activated and review rating is  lower than min_auto_publish_reviews_stars
						else {
							approveViewertext = '<div class="approve-viewer-text"> ' +
								'This client have the auto approval on with minimum auto publish reviews stars: ' + min_auto_publish_reviews_stars +
								'<br/>Are you sure you want to continue ?'
							'</div>';
							approveCtaText = "Yes";

							$('.form-overlay[name=review-approval-overlay] .review-approval-overlay-content').html(approveViewertext);
							$('.form-overlay[name=review-approval-overlay] a[name=approve-review]').text(approveCtaText);
							$('.form-overlay[name=review-approval-overlay] a[name=approve-review]').attr('approval-data-review-status', 'admin_approved');

							$('.form-overlay[name=review-approval-overlay]').fadeIn();
							hideFullScreenLoader();
						}
					}

				},
				error: function (errorThrown) {
					console.log(errorThrown);

					// create popup
					var buttons = new Array(
						{ 'action': 'close-popup', 'text': 'Ok' }
					);
					showPopup('Error: ' + errorThrown.statusText, buttons);
				},
				complete: function () {

				}
			});
		});

		// yes button in the review approval overlay
		$('body').on('click', 'a[approval-data-review-status=admin_approved]', function (e) {
			e.preventDefault();
			updateReviewStatus(reviewStatus, reviewID);
			$('.form-overlay[name=review-approval-overlay]').fadeOut();
		});

		// publish button in the review approval overlay
		$('body').on('click', 'a[approval-data-review-status=published]', function (e) {
			e.preventDefault();
			updateReviewStatus("published", reviewID);
			$('.form-overlay[name=review-approval-overlay]').fadeOut();
		});

		// cancel button in the review approval overlay
		$('body').on('click', '.form-overlay[name=review-approval-overlay] a[name=cancel-approval]', function (e) {
			e.preventDefault();
			$('.form-overlay[name=review-approval-overlay]').fadeOut();
		});

		

		// set review status (published)
		$('body').on('click', 'a[data-intent=published]', function (e) {
			e.preventDefault();

			// get the clicked on review
			var reviewElement = $(this).closest('.review');
			reviewID = reviewElement.attr('data-review-id');

			// find the reviewer name within the review element
			var reviewerName = reviewElement.find('.reviewer').text().trim();

			// Generate options based on reviewerName
			var option1 = ucwords(reviewerName);
			var option2 = ucwords(reviewerName.split(' ')[0]);
			var option3 = (reviewerName.split(' ').length > 1) ?
				ucwords(reviewerName.split(' ')[0] + ' ' + reviewerName.split(' ')[1][0]) :
				option2;
			var option4 = "Anonymous";

			// Create a set to store unique options
			var uniqueOptions = new Set();

			// Add options to the set, ensuring uniqueness
			uniqueOptions.add(option1);
			uniqueOptions.add(option2);
			uniqueOptions.add(option3);
			uniqueOptions.add(option4);

			// Clear any existing options
			var selectElement = $('select[name="reviewer-display-name-select"]');
			selectElement.empty();

			// Add unique options to the select element
			uniqueOptions.forEach(function (option) {
				selectElement.append($('<option>', { value: option, text: option }));
			});

			// Update the data-review-id attribute
			var anchorElement = $('a[name="update-display-name"]');
			anchorElement.attr('data-review-id', reviewID);

			// Show the options and update the data-review-id attribute
			$('.form-overlay[name=reviewer-display-name]').fadeIn();
		});

		// Helper function to capitalize the first letter of each word
		function ucwords(str) {
			return str.toLowerCase().replace(/(^|\s)\S/g, function (l) { return l.toUpperCase(); });
		}



		// show confirm flag review overlay
		$('body').on('click', 'a[data-intent=flagged]', function (e) {
			e.preventDefault();

			// get the clicked on review
			reviewID = $(this).closest('.review').attr('data-review-id');

			$('.form-overlay[name=flag-review]').fadeIn();
			$('body').addClass('no-scroll');
			$('.form-overlay[name=flag-review]').scrollTop(0);
		});

		// flag a review
		$('body').on('click', 'a[name=flag-review]', function (e) {
			e.preventDefault();

			var flagReason = $('.form-row[name=flagReason] .radio-option.active').attr('name');
			var flagDetail = $('.form-row[name=flagDetail] textarea').val();

			console.log(reviewID);

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'update_review_status',
					'review_id': reviewID,
					'status': 'flagged',
					'flag_reason': flagReason,
					'flag_detail': flagDetail
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					console.log(reviewID);
					if (data) {

						$('.form-overlay[name=flag-review]').fadeOut();

						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup('You have successfully flagged this review.', buttons);

						$('.review[data-review-id=' + reviewID + ']').attr('data-review-status', 'flagged');
						$('.review[data-review-id=' + reviewID + '] .review-status').text('flagged');
					}

					else {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup('There was an error changing the review status', buttons);
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

		// open the reviews preview overlay
		$('body').on('click', '.header-preview-button', function (e) {
            // e.preventDefault();
            
			// clear any previous reviews
			$('div[name=tag-preview]').empty();

			// Making the desktop view the default display
			const desktopIcon = document.querySelector('img[data-view="desktop"]');
			const mobileIcon = document.querySelector('img[data-view="mobile"]');
			desktopIcon.classList.add('active');
			mobileIcon.classList.remove('active');

			// Define the initial carousel flag
			var carouselFlag = false;

			// Function to load reviews based on the carouselFlag
			function loadReviews() {
				var reviewsTagUrl = site_url + "/wp-content/uploads/" + clientID + "_reviews.js";

				var reviewsInitCall = "jQuery('#oclzmReviews').init_oculizm_reviews_widget({" +
					"   region: ''," +
					"   type: 'all_reviews'," +
					"   carousel: '" + carouselFlag + "'" + // Use carouselFlag here
					"});";

				var reviewsTag = "<script id='oculizm_reviews_script'>\n" +
					"	var OCULIZM_Reviews_PARENT=jQuery('script#oculizm_reviews_script').parent();\n" +
					"	OCULIZM_Reviews_PARENT.append('<div id=\"oclzmReviews\"></div>');\n" +
					"	jQuery.getScript('" + reviewsTagUrl + "', function (script, textStatus, jqXHR) {\n" +
					"		if (textStatus === 'success') { " + reviewsInitCall + " \n" +
					"	}});\n" +
					"</script>\n";

				$('div[name=tag-preview]').append(reviewsTag);
			}

			// Add click event handlers for the list and carousel tabs
			$('li[name=list-reviews]').click(function () {
				// Clear the content of #oclzmReviews
				$('#oclzmReviews').empty();
				carouselFlag = false;
				loadReviews();

				// Add the 'active' class to the clicked tab and remove it from the other tab
				$(this).addClass('active');
				$('li[name=carousel-reviews]').removeClass('active');
			});

			$('li[name=carousel-reviews]').click(function () {
				// Clear the content of #oclzmReviews
				$('#oclzmReviews').empty();
				carouselFlag = true;
				loadReviews();

				// Add the 'active' class to the clicked tab and remove it from the other tab
				$(this).addClass('active');
				$('li[name=list-reviews]').removeClass('active');
			});

			// click the list-reviews tab by default and add the 'active' class to it
			$('li[name=list-reviews]').trigger('click');

			// open the overlay
			$('.form-overlay[name=reviews-preview]').fadeIn();
		});

		// open the reviews filter overlay
		$('body').on('click', '.header-filter-button', function (e) {

			// open the overlay
			$('.form-overlay[name=reviews-filters]').fadeIn();
		});

		// apply filters
		$('body').on('click', 'a[name=apply-filters]', function (e) {
			e.preventDefault();

			$('.review').remove();
			$('.reviews-header').remove();

			// close the overlay
			$('.form-overlay[name=reviews-filters]').fadeOut();

			// Get the selected radio-option for the status form-row
			var reviewStatus = document.querySelector('div[name="allReviewsStatus"] .radio-option.active').getAttribute('name');

			// Get the selected rating from the dropdown
			var selectedRating = $('select[name=star-rating-select]').val();

			// Get the selected site or product review option
			var reviewType = document.querySelector('div[name="siteOrProductReviews"] .radio-option.active').getAttribute('name');

			if (reviewStatus === 'all') {
				displayReviewsByStatusAndRating('all', selectedRating, reviewType); // Fetch and display all reviews
			}
			if (reviewStatus === 'newReviews') {
				displayReviewsByStatusAndRating('new', selectedRating, reviewType); // Fetch and display new reviews only
			}
			if (reviewStatus === 'unverifiedReviews') {
				displayReviewsByStatusAndRating('admin_approved', selectedRating, reviewType); // Fetch and display unverified reviews only
			}
			if (reviewStatus === 'publishedReviews') {
				displayReviewsByStatusAndRating('published', selectedRating, reviewType); // Fetch and display published reviews only
			}
			if (reviewStatus === 'flaggedReviews') {
				displayReviewsByStatusAndRating('flagged', selectedRating, reviewType); // Fetch and display flagged reviews only
			}
		});


		// MAIN THREAD

		displayReviewsByStatusAndRating('all', '0' , 'allReviews');

	});

}(jQuery));









