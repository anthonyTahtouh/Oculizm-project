(function ($) {

	jQuery(document).ready(function () {

		var clientData;
		var minStarRatingSelectedValue;

		// update review settings
		$('body').on('click', 'a[name=update-review-settings]', function(e) {
			e.preventDefault();

			// get review options
			clientData['reviewFormTitle'] = $('.form-row[name=review-form-title] input').val();
			clientData['reviewFormDescription'] = $('.form-row[name=review-form-description] textarea').val();
			if ($(".checkbox-option[name=hide-reviews-credits]").hasClass('active')) clientData['hide_reviews_credits'] = 1;
			else clientData['hide_reviews_credits'] = "0";

			if ($(".checkbox-option[name=email-required]").hasClass('active')) clientData['email_required'] = 1;
			else clientData['email_required'] = "0";

			clientData['reviews_custom_css'] = $(".form-row[name=reviews-custom-css] textarea").val();

			minStarRatingSelectedValue = $("select[name=min-star-rating-select]").val();

			showFullScreenLoader();

				$.ajax({
				url: ajaxUrl,
				data:{
					'action':'update_review_settings',
					'reviewFormTitle': clientData['reviewFormTitle'],
					'reviewFormDescription': clientData['reviewFormDescription'],
					'hideReviewsCredits' : clientData['hide_reviews_credits'],
					'emailRequired' : clientData['email_required'],
					'reviewsCss' : clientData['reviews_custom_css'],
					'minAutoPublishReviewsStars' : minStarRatingSelectedValue
				},
				dataType: 'JSON',

				success:function(data) {
					console.log(data);

					// if there was an error...
					if (data.errors) {
						console.log(data);

						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup('There was an error updating the review settings.', buttons);
					}

					// else, if it was a success...
					else {
						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup("Your changes have been saved.", buttons);
						
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
		});


		// MAIN THREAD

	 	// get product feeds
		$.ajax({
			url: ajaxUrl,
			type:'get',
			data:{
				'action':'get_product_feeds'
			},
			dataType: 'JSON',

			success:function(data) {
				console.log(data);

				if (data) {
					const reviewsLink = data[0]['shop_link'] + "?oclzm=rc";
					$('div[name=review-form-link] input').val(reviewsLink);
					$('div[name=review-form-link] input').attr('value', reviewsLink);
				}
			},
			error: function(errorThrown) {
				console.log(errorThrown);

				// create popup
				var buttons = new Array(
					{'action': 'close-popup', 'text': 'Ok'}
				);
				showPopup('Error: ' + errorThrown.statusText, buttons);
			},
			complete: function() {
				hideFullScreenLoader();
			}
		});


		// get client
		$.ajax({
			url: ajaxUrl,
			data: {
				'action': 'get_client'
			},
			dataType: 'JSON',
			success: function (data) {	
				console.log(data);			

				clientData = data;

				// review settings
				clientData['reviewFormTitle'] = data.review_form_title;
				clientData['reviewFormDescription'] = data.review_form_description;
				if (clientData['hide_reviews_credits'] == 1) $(".checkbox-option[name=hide-reviews-credits]").addClass('active');
				if (clientData['email_required'] == 1) $(".checkbox-option[name=email-required]").addClass('active');
				$(".form-row[name=reviews-custom-css] textarea").val(clientData['reviews_custom_css']);

				var minStarRatingSelect = document.querySelector('select[name=min-star-rating-select]');
				minStarRatingSelect.value = clientData['min_auto_publish_reviews_stars'];

				$('.form-row[name=review-form-title] input').val(clientData['reviewFormTitle']);
				$('.form-row[name=review-form-description] textarea').val(clientData['reviewFormDescription']);

			}
		});

	});

}(jQuery));











