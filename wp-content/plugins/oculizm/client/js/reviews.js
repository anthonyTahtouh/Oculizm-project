/*

	reviews.js
	Author & copyright (c) 2023 Oculizm Ltd
	https://oculizm.com
 
	The jQuery plugin for loading Reviews by Oculizm
 
	*/

(function (jQuery) {

	jQuery.fn.init_oculizm_reviews_widget = function (options) {

		// define variables
		var clientID = '{{clientID}}';
		var widget = "#oclzmReviews";
		var numItems = 24;
		var submittingReview = false;
		var carousel = false; //default
		var supplied_product_id; // used to open the review form on a particular product
		var review_form;
		var reviewFormTitle = "/* reviewFormTitle */";
		var reviewFormDescription = "/* reviewFormDescription */";
		var reviews;
		var client_name;
		var price;
		var currency;
		var image_link;
		var pplink;
		var type = ""; // default
		var reviewLightboxClass = ".oculizm-lightbox";
		var lastOpenReview;
		var hidereviewsCredit = "/* hidereviewsCredit */";
		var emailRequired = "/* emailRequired */";
		var oclzmFooter;
		var reviewsProductIds;
		var productAverageRating;
		var siteAverageRating;

		// Function to get the value of a URL parameter by name
		function getURLParameter(name) {
			name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
			var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
			var results = regex.exec(location.search);
			return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
		}

		// Capture the source parameter
		var source = getURLParameter('source');

		// Provide a default source if it's not found
		if (source === null) {
			source = 'unknown';
		}


		// load inline stylesheet
		const inlineStyle = document.createElement('style');
		inlineStyle.textContent = '{{reviewsCss}}';
		document.head.appendChild(inlineStyle);

		// if there's a container supplied in the script, override the default one
		if (options.container && options.container != "") widget = options.container;

		// if there's a type supplied in the script, override the default one
		if (options.type && options.type != "") type = options.type;

		// if there are reviewsProductIds supplied in the options, override the default ones
		if (options.reviewsProductIds && options.reviewsProductIds.length > 0) {
			reviewsProductIds = options.reviewsProductIds;
			// console.log("reviewsProductIds : ", reviewsProductIds);
		}


		// if there's a carousel supplied in the script, override the default one
		if (options.carousel && options.carousel != "" && options.carousel != false && options.carousel != 'false') carousel = true;

		function checkLightboxArrows(reviewId) {
			const $review = jQuery(`[data-review-id=${reviewId}]`);
			jQuery(lightboxNextSelector).show();
			jQuery(lightboxPrevSelector).show();

			if (!$review.parents().eq(0).next().find('.oculizm-review').get(0)) jQuery(lightboxNextSelector).hide();
			if (!$review.parents().eq(0).prev().find('.oculizm-review').get(0)) jQuery(lightboxPrevSelector).hide();
		}

		// lightbox carousel
		var lightboxNext = "data-review-lightbox-next";
		var lightboxPrev = "data-review-lightbox-prev";
		var lightboxNextSelector = `[${lightboxNext}]`;
		var lightboxPrevSelector = `[${lightboxPrev}]`;


		// prev button
		jQuery(document).on('click', lightboxPrevSelector, () => {
			// console.log("lastOpenReview : ", lastOpenReview);
			const prevReview = jQuery(`[data-review-id=${lastOpenReview}]`).parents().eq(0).prev().find('.oculizm-review');
			if (prevReview.get(0)) openViewer(prevReview);
		});

		// next button
		jQuery(document).on('click', lightboxNextSelector, () => {
			// console.log("lastOpenReview : ", lastOpenReview);
			const nextReview = jQuery(`[data-review-id=${lastOpenReview}]`).parents().eq(0).next().find('.oculizm-review');
			if (nextReview.get(0)) openViewer(nextReview);
		});


		var emailInputHtml = '';
		if (emailRequired === '1') {
			emailInputHtml = '<div class="orf-review-email">' +
				'   <div class="orf-label">Email <span class="required">*</span></div>' +
				'   <input type="email" required />' +
				'   <div class="error-message email-error"></div>' +
				'</div>';
		} else {
			emailInputHtml = '<div class="orf-review-email">' +
				'   <div class="orf-label">Email (optional)</div>' +
				'   <input type="email" />' +
				'   <div class="error-message email-error"></div>' +
				'</div>';
		}

		// review form HTML
		var reviewFormHtml = '<div class="oculizm-review-form">' +
			'<div class="orf-container">' +
			'	<div class="orf-header">' +
			'		<div class="orf-title">' + reviewFormTitle + '</div>' +
			'		<div class="orf-description">' + reviewFormDescription + '</div>' +
			'		<div class="orf-product">' +
			'			<div class="orf-image"><img /></div>' +
			'			<div class="orf-product-title"></div>' +
			'		</div>' +
			'	</div>' +
			'	<div class="orf-body">' +
			'		<div class="orf-rating">' +
			'			<div class="orf-stars">' +
			'				<div class="orf-star active"><i/></div>' +
			'				<div class="orf-star active"><i/></div>' +
			'				<div class="orf-star active"><i/></div>' +
			'				<div class="orf-star active"><i/></div>' +
			'				<div class="orf-star active"><i/></div>' +
			'			</div>' +
			'		</div>' +
			'		<div class="orf-reviewer">' +
			'			<div class="orf-label">Full Name <span class="required">*</span></div>' +
			'			<input type="text" />' +
			'			<div class="error-message reviewer-error"></div>' +
			'		</div>' +
			emailInputHtml +
			'		<div class="orf-review-title">' +
			'			<div class="orf-label">Review Title <span class="required">*</span></div>' +
			'			<input type="text" />' +
			'			<div class="error-message title-error"></div>' +
			'		</div>' +
			'		<div class="orf-review-description">' +
			'			<div class="orf-label">Review Detail <span class="required">*</span></div>' +
			'			<textarea></textarea>' +
			'			<div class="error-message description-error"></div>' +
			'		</div>' +
			'		<div class="orf-cta">' +
			'			<a href="#" name="submit-orf">Submit Review</a>' +
			'		</div>' +
			'	</div>' +
			'	<div class="orf-footer">' +
			'		<a class="oculizm-credit" href="https://oculizm.com" target="_blank"><img src="https://app.oculizm.com/static/powered-by-oculizm.png" alt="Oculizm logo"></a>' +
			'	</div>' +
			'</div>' +
			'</div>';


		// lightbox html
		var reviewViewerHtml = '<div class="viewer oculizm-lightbox">' +
			'	<div class="viewer-container" name="review-viewer-container">' +
			'		<div class="review-container">' +
			'<h2>Reviews</h2> ' +
			'		</div>' +
			'		<a href="#" class="close"></a>' +
			'	</div>' + (() => {
				return `
						<div ${lightboxPrev} class="prev-button"></div>
						<div ${lightboxNext} class="next-button"></next
					`;
			})() +
			'</div>';

		if (hidereviewsCredit == "0") {
			oclzmFooter = '	<div class="orl-footer">' +
				'		<a class="oculizm-credit" href="https://oculizm.com" target="_blank"><img src="https://app.oculizm.com/static/powered-by-oculizm.png" alt="Oculizm logo"></a>' +
				'	</div>';
		}
		else {
			oclzmFooter = '	<div class="orl-footer">' +
				'		<a class="oculizm-credit" style="display:none !important; href="https://oculizm.com" target="_blank"><img src="https://app.oculizm.com/static/powered-by-oculizm.png" alt="Oculizm logo"></a>' +
				'	</div>';
		}




		// main function to load reviews on page
		function loadReviews() {
			loader.show();
			var offset = jQuery(widget).find('.review-list').length;
			requesting = true;

			jQuery.ajax({
				url: 'https://app.oculizm.com/api/v1/fetch_oculizm_reviews/',
				dataType: 'json',
				data: {
					requestType: 'reviews',
					clientID: '{{clientID}}',
					count: numItems,
					offset: offset
				},
				success: function (data) {
					data = jQuery.parseJSON(data);
					console.log(data);
					// console.log("type : ", type);

					reviews = data.reviews;
					client_name = data.client_name;
					currency = data.currency;
					price = data.price;
					image_link = data.image_link;
					pplink = data.url;
					productAverageRating = data.productAverageRating;
					siteAverageRating = data.siteAverageRating;
					// console.log("siteAverageRating : " , siteAverageRating);
					// console.log("productAverageRating : " , productAverageRating);


					if (reviews.length < numItems) eof = true;

					// Update JSON-LD for product reviews
					updateProductReviewsJsonLD(reviews, client_name, currency, price, image_link, pplink);

					// Update JSON-LD for site reviews
					updateSiteReviewsJsonLD(reviews, client_name);

					switch (type) {
						case '':
							break;
						case 'site_reviews':
						case 'all_reviews':
							displaySiteReviews(reviews);
							if (type === 'all_reviews') {
								// Check if there are site and product reviews
								const siteReviews = reviews.filter(review => !review.product_id);
								const productReviews = reviews.filter(review => !!review.product_id);
								if (siteReviews.length === 0) {
									jQuery('.review-tab[data-tab="site"]').hide();
								}
								if (productReviews.length === 0) {
									jQuery('.review-tab[data-tab="product"]').hide();
								}
							}
							break;
						case 'product_reviews':
							displayProductReviews(reviews);
							break;
						case 'product_badge':
							displayProductBadge(reviews);
							break;
						case 'site_badge':
							displaySiteBadge(reviews);
							break;
						default:
							// Default action
							break;
					}

					setTimeout(function () {
						if (carousel) {
							/* INIT CAROUSEL CODE */
							jQuery(widget).find('.review-tabs').hide();
							jQuery(widget).css('text-align', 'center');
						}
					}, 100);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
					loader.hide();
					requesting = false;
				}
			});
		}

		function updateProductReviewsJsonLD(reviews, clientName, currency, price, image_link, pplink) {
			const productReviews = reviews.filter(review => review.product_id);
			// const productAverageRating = calculateAverageRating(productReviews);
			const productRatingCount = productReviews.length;
			const productBestRating = Math.max(...productReviews.map(review => parseFloat(review.rating)));
			const productWorstRating = Math.min(...productReviews.map(review => parseFloat(review.rating)));

			// Get the first product review to extract description and sku
			const firstProductReview = productReviews.length > 0 ? productReviews[0] : null;
			const description = firstProductReview ? firstProductReview.description : "Description of your product";
			const sku = firstProductReview ? firstProductReview.product_id : "Your Product SKU";
			// console.log("pplink : ", pplink);

			var productReviewsJsonLD = {
				"@context": "https://schema.org/",
				"image": image_link,
				"url": pplink,
				"@type": "Product",
				"name": productReviews.length > 0 ? productReviews[0].title : "Default Product Name",
				"description": description,
				"sku": sku,
				"aggregateRating": {
					"@type": "AggregateRating",
					"ratingValue": productAverageRating,
					"bestRating": productBestRating.toString(),
					"worstRating": productWorstRating.toString(),
					"ratingCount": productRatingCount
				},
				"offers": {
					"@type": "Offer",
					"priceCurrency": currency,
					"price": price,
					"url": pplink,
					"availability": "available",
					"seller": {
						"@type": "Organization",
						"name": clientName
					}
				},
				"review": productReviews.map(review => ({
					"@type": "Review",
					"reviewRating": {
						"@type": "Rating",
						"ratingValue": review.rating
					},
					"author": {
						"@type": "Person",
						"name": review.reviewer_name
					},
					"reviewBody": review.description,
					"datePublished": review.created,
					"itemReviewed": {
						"@type": "Product",
						"name": productReviews[0].title,
						"sku": sku,
						"image": image_link,
						"offers": {
							"@type": "Offer",
							"priceCurrency": currency,
							"price": price,
							"availability": "available",
							"seller": {
								"@type": "Organization",
								"name": clientName
							}
						}
					}
				}))
			};

			createOrUpdateJsonLDElement('productReviewsJsonLD', productReviewsJsonLD);
		}

		function updateSiteReviewsJsonLD(reviews, clientName) {
			const siteReviews = reviews.filter(review => !review.product_id);
			// const siteAverageRating = calculateAverageRating(siteReviews);
			const siteRatingCount = siteReviews.length;
			const siteBestRating = Math.max(...siteReviews.map(review => parseFloat(review.rating)));
			const siteWorstRating = Math.min(...siteReviews.map(review => parseFloat(review.rating)));

			var siteReviewsJsonLD = {
				"@context": "https://schema.org/",
				"@type": "Product",
				"name": clientName,
				"description": clientName + " site reviews",
				"aggregateRating": {
					"@type": "AggregateRating",
					"ratingValue": siteAverageRating,
					"bestRating": siteBestRating.toString(),
					"worstRating": siteWorstRating.toString(),
					"ratingCount": siteRatingCount
				},
				"review": siteReviews.map(review => ({
					"@type": "Review",
					"reviewRating": {
						"@type": "Rating",
						"ratingValue": review.rating
					},
					"author": {
						"@type": "Person",
						"name": review.reviewer_name
					},
					"reviewBody": review.description,
					"datePublished": review.created
				}))
			};

			createOrUpdateJsonLDElement('siteReviewsJsonLD', siteReviewsJsonLD);
		}


		function createOrUpdateJsonLDElement(id, jsonData) {
			var existingElement = document.getElementById(id);
			if (existingElement) {
				existingElement.textContent = JSON.stringify(jsonData);
			} else {
				var script = document.createElement('script');
				script.type = 'application/ld+json';
				script.id = id;
				script.textContent = JSON.stringify(jsonData);
				document.head.appendChild(script);
			}
		}

		// check the URL params for a specific product ID
		var urlParams = new RegExp('[\?&]oculizm_pid=([^&#]*)').exec(window.location.href);
		if (urlParams) supplied_product_id = urlParams[1] || 0;

		// check the URL params for the review form
		var urlParams = new RegExp('[\?&]oclzm=rc').exec(window.location.href);
		if (urlParams) {
			handleReviewRequest();
		}



		if (type === 'site_reviews' || type === 'product_reviews' || type === 'product_badge' || type === 'site_badge') {
			jQuery(widget).append(jQuery(
				'<div class="oclzm-footer" style="padding:0;">' +
				'	<a class="oculizm-credit" href="https://oculizm.com" target="_blank"><img src="https://app.oculizm.com/static/powered-by-oculizm.png" alt="Oculizm logo"></a>' +
				'</div>'
			));
		}

		if (type === 'all_reviews') {
			jQuery(widget).append(jQuery(
				'<div class="review-tabs">' +
				'<div class="review-tab active" data-tab="site">Site Reviews</div>' +
				' <div class="review-tab" data-tab="product">Product Reviews</div>' +
				'</div>' +
				'<div class="oclzm-footer" style="padding:0;">' +
				'	<a class="oculizm-credit" href="https://oculizm.com" target="_blank"><img src="https://app.oculizm.com/static/powered-by-oculizm.png" alt="Oculizm logo"></a>' +
				'</div>'
			));
		}

		var loader = jQuery(widget).find('.oclzm-loader');


		loadReviews();



		// // Calculate the average rating based on individual review ratings
		// function calculateAverageRating(reviewsNumber) {
		// 	if (reviewsNumber.length === 0) {
		// 		return 0; // No reviews, return 0 as default.
		// 	}

		// 	let totalRating = 0;
		// 	for (let i = 0; i < reviewsNumber.length; i++) {
		// 		totalRating += parseInt(reviewsNumber[i].rating);
		// 	}

		// 	return (totalRating / reviewsNumber.length).toFixed(1); // Calculate and round to one decimal place.
		// }

		// Add badge to the widget
		function reviewsBadge(averageRating, reviewsNumber, badgeType) {
			const averageRatingSection = document.createElement("div");
			averageRatingSection.className = "review-summary"; // Set the class for the section

			// Set the content with the average rating stars and reviews text based on badgeType
			let ratingText = '';
			if (badgeType === 'siteBadge') {
				ratingText = 'Overall Site Rating';
			} else if (badgeType === 'productBadge') {
				ratingText = 'Overall Product Rating';
			}

			const reviewsText = reviewsNumber === 1 ? 'review' : 'reviews';

			// Create a div for the left side (average rating and reviews)
			const ratingDiv = document.createElement("div");
			ratingDiv.setAttribute('vocab', 'https://schema.org/');
			ratingDiv.setAttribute('typeof', 'AggregateRating');
			ratingDiv.className = "rating-section";
			// ratingDiv.innerHTML = `${ratingText}: <span data-star="${averageRating}"></span>${averageRating} based on (${reviewsNumber}) ${reviewsText}`;

			ratingDiv.innerHTML = `${ratingText}: <span data-star="${averageRating}" property="ratingValue" content="${averageRating}"></span>${averageRating} based on <span property="ratingCount">${reviewsNumber}</span> ${reviewsText}`;

			ratingDiv.innerHTML = `${ratingText}: 
				<span data-star="${averageRating}" property="ratingValue" content="${averageRating}"></span>${averageRating} based on 
				<span property="ratingCount">${reviewsNumber}</span> ${reviewsText}
				<div style="display: none;" property="itemReviewed" typeof="Game">
					<span property="name">${client_name}</span>
				</div>`;

			// Create a div for the right side (company logo)
			const logoDiv = document.createElement("div");
			logoDiv.className = "logo-section";
			const logoImg = document.createElement("img");
			logoImg.src = "https://app.oculizm.com/wp-content/themes/oculizm/img/oculizm-logo-white.png";
			logoDiv.appendChild(logoImg);

			// Append the rating and logo sections to the averageRatingSection
			averageRatingSection.appendChild(ratingDiv);
			averageRatingSection.appendChild(logoDiv);

			// Append the average rating section
			const $oclzmReviews = jQuery('#oclzmReviews');
			const $oclzmFooter = $oclzmReviews.find('.oclzm-footer');

			// Use the insertBefore method with the reference node
			$oclzmReviews[0].insertBefore(averageRatingSection, $oclzmFooter[0]);
		}




		// Add a review to the widget
		// function addReview(id, title, client_id, rating, reviewer_name, description, product_id, reviewsNumber, averageRating, reviewType = 'site') {
		// 	// Calculate the star rating (assuming `rating` is an integer from 1 to 5)
		// 	const starRating = parseInt(rating);

		// 	// Split the `reviewer_name` into parts (assuming it's separated by spaces)
		// 	const nameParts = reviewer_name.split(' ');

		// 	// Extract the first name
		// 	const firstName = nameParts[0];

		// 	// Extract the first letter of the last name (if available)
		// 	const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : '';

		// 	// Find the existing "review-list" section based on reviewType
		// 	let existingReviewSection;
		// 	if (reviewType === 'site') {
		// 		existingReviewSection = jQuery('#oclzmReviews .review-list.site');
		// 	} else if (reviewType === 'product') {
		// 		existingReviewSection = jQuery('#oclzmReviews .review-list.product');
		// 	}

		// 	if (existingReviewSection.length === 0) {
		// 		// If the "review-list" section does not exist, create a new section
		// 		existingReviewSection = jQuery('<div class="review-list ' + reviewType + '"></div>'); // Removed h3 here

		// 		// Append the entire "review-list" section to the widget
		// 		var $oclzmReviews = jQuery('#oclzmReviews');
		// 		var $existingReviewSection = jQuery(existingReviewSection);
		// 		var $oclzmFooter = $oclzmReviews.find('.oclzm-footer');

		// 		existingReviewSection.insertBefore($oclzmFooter);
		// 	}

		// 	// Create a div for the review entry
		// 	// let reviewEntryHtml = '<div class="oculizm-review" data-review-id="' + id + '">' +
		// 	// 	'        <div class="avatar-image"></div>' +
		// 	// 	'        <div class="review-details">' +
		// 	// 	'            <div class="reviewer-name">' + firstName + ' ' + lastNameInitial + '</div>' +
		// 	// 	'            <div class="star-ratings">';


		// 	let reviewEntryHtml = '<div vocab="https://schema.org/" typeof="Review" class="oculizm-review">';
		// 	reviewEntryHtml += '   <div class="avatar-image"></div>';
		// 	reviewEntryHtml += '   <div class="review-details">';
		// 	reviewEntryHtml += '      <div class="reviewer-name" property="author" typeof="Person"><span property="name">' + firstName + ' ' + lastNameInitial + '</span></div>';
		// 	reviewEntryHtml += '      <div class="star-ratings" property="reviewRating" typeof="Rating">';
		// 	reviewEntryHtml += '         <span style="display: none;" property="ratingValue">' + starRating + ' </span>';


		// 	// Add actual star ratings
		// 	for (let i = 1; i <= 5; i++) {
		// 		if (i <= starRating) {
		// 			// Add a golden star
		// 			reviewEntryHtml += '<span class="star active">&#9733;</span>';
		// 		} else {
		// 			// Add an inactive star
		// 			reviewEntryHtml += '<span class="star">&#9733;</span>';
		// 		}
		// 	}

		// 	// Close the star-ratings div and add title and description
		// 	// reviewEntryHtml += '            </div>' +
		// 	// 	'            <div class="review-title"><strong>' + title + '</strong></div>' +
		// 	// 	'            <div class="review-description">' + description + '</div>' +
		// 	// 	'        </div>' +
		// 	// 	'    </div>';

		// 	reviewEntryHtml += '      </div>';
		// 	reviewEntryHtml += '      <div class="review-title" property="name"><strong>' + title + '</strong></div>';
		// 	reviewEntryHtml += '      <div class="review-description" property="description">' + description + '</div>';
		// 	reviewEntryHtml += '      <div style="visibility: hidden;" property="itemReviewed" typeof="Game"><span property="name">' + title + '</span></div>';
		// 	reviewEntryHtml += '   </div>';
		// 	reviewEntryHtml += '</div>';






		// 	// Append the review entry to the existing "review-list" section
		// 	existingReviewSection.append(jQuery(reviewEntryHtml));

		// 	// Check if the "review-summary" already exists
		// 	const averageRatingSections = document.getElementsByClassName("review-summary");

		// 	if (averageRatingSections.length === 0) {
		// 		// If it doesn't exist, create and append it
		// 		const newAverageRatingSection = document.createElement("div");
		// 		newAverageRatingSection.className = "review-summary"; // Set the class for the section

		// 		// Set the content with the average rating stars and reviews text
		// 		// const reviewsText = reviewsNumber === 1 ? 'review' : 'reviews';
		// 		// newAverageRatingSection.innerHTML = '<span data-star="' + averageRating + '"></span><br>Overall rating ' + averageRating + ' based on ' + reviewsNumber + ' ' + reviewsText;

		// 		const reviewsText = reviewsNumber === 1 ? 'review' : 'reviews';
		// 		newAverageRatingSection.innerHTML = '<span property="ratingValue" data-star="' + averageRating + '"></span><br>Overall rating ' + averageRating + ' based on ' + reviewsNumber + ' ' + reviewsText;


		// 		// Append the average rating section
		// 		const $widget = jQuery(widget);
		// 		const $reviewTabs = $widget.find('.review-tabs');

		// 		if ($reviewTabs.length > 0) {
		// 			$reviewTabs.before(newAverageRatingSection);
		// 		} else {
		// 			const $oclzmReviews = jQuery('#oclzmReviews');
		// 			$oclzmReviews.prepend(newAverageRatingSection);
		// 		}

		// 		// Always add the "<h3>Reviews (' + reviewsNumber + ')</h3>" as the first child of #oclzmReviews
		// 		// $oclzmReviews.prepend('<h3>Reviews (' + reviewsNumber + ')</h3>');
		// 	} else {
		// 		// If it exists, update it with new values
		// 		const averageRatingSection = averageRatingSections[0];
		// 		const ratingSpan = averageRatingSection.querySelector('span[data-star]');
		// 		if (ratingSpan) {
		// 			ratingSpan.setAttribute('data-star', averageRating);
		// 		}

		// 		// Update the reviews text based on the reviewsNumber
		// 		const reviewsText = reviewsNumber === 1 ? 'review' : 'reviews';
		// 		averageRatingSection.innerHTML = '<span data-star="' + averageRating + '"></span><br>Overall rating ' + averageRating + ' based on ' + reviewsNumber + ' ' + reviewsText;

		// 		// Update the <h3> element in #oclzmReviews
		// 		const $oclzmReviews = jQuery('#oclzmReviews');
		// 		// $oclzmReviews.find('h3').text('Reviews (' + reviewsNumber + ')');
		// 	}
		// }

		function addReview(id, title, client_id, rating, reviewer_name, description, product_id, reviewsNumber, averageRating, reviewType = 'site') {
			// Calculate the star rating (assuming `rating` is an integer from 1 to 5)
			const starRating = parseInt(rating);

			// Split the `reviewer_name` into parts (assuming it's separated by spaces)
			const nameParts = reviewer_name.split(' ');

			// Extract the first name
			const firstName = nameParts[0];

			// Extract the first letter of the last name (if available)
			const lastNameInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : '';

			// Find the existing "review-list" section based on reviewType
			let existingReviewSection;
			if (reviewType === 'site') {
				existingReviewSection = jQuery('#oclzmReviews .review-list.site');
			} else if (reviewType === 'product') {
				existingReviewSection = jQuery('#oclzmReviews .review-list.product');
			}

			if (existingReviewSection.length === 0) {
				// If the "review-list" section does not exist, create a new section
				existingReviewSection = jQuery('<div class="review-list ' + reviewType + '"></div>'); // Removed h3 here

				// Append the entire "review-list" section to the widget
				var $oclzmReviews = jQuery('#oclzmReviews');
				var $existingReviewSection = jQuery(existingReviewSection);
				var $oclzmFooter = $oclzmReviews.find('.oclzm-footer');

				existingReviewSection.insertBefore($oclzmFooter);
			}

			// Create a div for the review entry
			let reviewEntryHtml = '<div vocab="https://schema.org/" typeof="Review" class="oculizm-review">';
			reviewEntryHtml += '   <div class="avatar-image"></div>';
			reviewEntryHtml += '   <div class="review-details">';
			reviewEntryHtml += '      <div class="reviewer-name" property="author" typeof="Person"><span property="name">' + firstName + ' ' + lastNameInitial + '</span></div>';
			reviewEntryHtml += '      <div class="star-ratings" property="reviewRating" typeof="Rating">';
			reviewEntryHtml += '         <span style="display: none;" property="ratingValue">' + starRating + ' </span>';

			// Add actual star ratings
			for (let i = 1; i <= 5; i++) {
				if (i <= starRating) {
					// Add a golden star
					reviewEntryHtml += '<span class="star active">&#9733;</span>';
				} else {
					// Add an inactive star
					reviewEntryHtml += '<span class="star">&#9733;</span>';
				}
			}

			reviewEntryHtml += '      </div>';
			reviewEntryHtml += '      <div class="review-title" property="name"><strong>' + title + '</strong></div>';
			reviewEntryHtml += '      <div class="review-description" property="description">' + description + '</div>';
			reviewEntryHtml += '      <div style="visibility: hidden;" property="itemReviewed" typeof="Game"><span property="name">' + title + '</span></div>';
			reviewEntryHtml += '   </div>';
			reviewEntryHtml += '</div>';

			// Append the review entry to the existing "review-list" section
			existingReviewSection.append(jQuery(reviewEntryHtml));

			// Check if the "review-summary" already exists
			const averageRatingSections = document.getElementsByClassName("review-summary");

			if (averageRatingSections.length === 0) {
				// If it doesn't exist, create and append it
				const newAverageRatingSection = document.createElement("div");
				newAverageRatingSection.className = "review-summary"; // Set the class for the section

				const reviewsText = reviewsNumber === 1 ? 'review' : 'reviews';
				newAverageRatingSection.innerHTML = '<span property="ratingValue" data-star="' + averageRating + '"></span><br>Overall rating ' + averageRating + ' based on ' + reviewsNumber + ' ' + reviewsText;

				// Append the average rating section
				const $oclzmReviews = jQuery('#oclzmReviews');
				$oclzmReviews.prepend(newAverageRatingSection);
			} else {
				// If it exists, update it with new values
				const averageRatingSection = averageRatingSections[0];
				const ratingSpan = averageRatingSection.querySelector('span[data-star]');
				if (ratingSpan) {
					ratingSpan.setAttribute('data-star', averageRating);
				}

				// Update the reviews text based on the reviewsNumber
				const reviewsText = reviewsNumber === 1 ? 'review' : 'reviews';
				averageRatingSection.innerHTML = '<span data-star="' + averageRating + '"></span><br>Overall rating ' + averageRating + ' based on ' + reviewsNumber + ' ' + reviewsText;
			}

			// Insert star rating dropdown for product reviews
			let starFilterDropdown = '';
			if (reviewType === 'product') {
				starFilterDropdown = '<select class="star-rating-select-to-display" style="padding: 15px;box-sizing: border-box;transition: all 0.3s ease;font-size: 16px;font-family: Open Sans, Arial, sans-serif;margin-bottom: 25px;border: 1px solid #eeeeee;border-radius: 10px;width: 200px;float: right;">' +
					'<option value="0">All reviews</option>' +
					'<option value="1">⭐</option>' +
					'<option value="2">⭐⭐</option>' +
					'<option value="3">⭐⭐⭐</option>' +
					'<option value="4">⭐⭐⭐⭐</option>' +
					'<option value="5">⭐⭐⭐⭐⭐</option>' +
					'</select>';

				const $oclzmReviews = jQuery('#oclzmReviews');
				const $reviewSummary = $oclzmReviews.find('.review-summary');
				$reviewSummary.before(starFilterDropdown);

				$oclzmReviews.on('change', 'select.star-rating-select-to-display', function () {
					const selectedRating = parseInt(jQuery(this).val());
					filterReviewsByRating(selectedRating);
				});
			}

			function filterReviewsByRating(selectedRating) {
				let anyVisible = false;

				existingReviewSection.find('.oculizm-review').each(function () {
					const reviewRating = parseInt(jQuery(this).find('[property="ratingValue"]').text().trim());
					if (selectedRating === 0 || reviewRating === selectedRating) {
						jQuery(this).show();
						anyVisible = true;
					} else {
						jQuery(this).hide();
					}
				});

				// If any review is visible, show the border; otherwise, hide it
				const $reviewList = jQuery('.review-list');
				if (anyVisible) {
					$reviewList.css('border', '1px solid #ccc');
				} else {
					$reviewList.css('border', 'none');
				}
			}
		}



		// Function to display site reviews
		function displaySiteReviews(reviews) {
			jQuery('#oclzmReviews .review-list.product').remove(); // Clear existing site reviews
			// Filter and display only site reviews
			const siteReviews = reviews.filter(review => !review.product_id);
			const averageRating = siteAverageRating;
			for (const review of siteReviews) {
				addReview(review.id, review.title, review.client_id, review.rating, review.reviewer_name, review.description, review.product_id, siteReviews.length, averageRating, 'site');
			}
		}

		// Function to display product reviews
		function displayProductReviews(reviews) {
			jQuery('#oclzmReviews .review-list.site').remove(); // Clear existing product reviews

			const productReviews = reviews.filter(review => {
				// Check if review's product_id is in the reviewsProductIds array and return only product id reviews 
				return review.product_id !== "" && review.product_id !== null && reviewsProductIds.includes(review.product_id);

				//return all the product reviews 
				// return review.product_id !== "" && review.product_id !== null;
			});
			const averageRating = productAverageRating;

			for (const review of productReviews) {
				addReview(review.id, review.title, review.client_id, review.rating, review.reviewer_name, review.description, review.product_id, productReviews.length, averageRating, 'product');
			}
		}


		function displayProductBadge(reviews) {
			// Filter product reviews
			const productReviews = reviews.filter(review => !!review.product_id);
			const averageRating = productAverageRating;
			reviewsBadge(averageRating, productReviews.length, 'productBadge');
		}

		function displaySiteBadge(reviews) {
			// Filter site reviews
			const siteReviews = reviews.filter(review => !review.product_id);
			const averageRating = siteAverageRating;
			reviewsBadge(averageRating, siteReviews.length, 'siteBadge');
		}

		// Define a variable to track the active tab (initially set to 'site')
		let activeTab = 'site';

		// Event handler for clicking on tab elements
		jQuery('.review-tab').on('click', function () {
			// Remove the 'active' class from all tabs
			jQuery('.review-tab').removeClass('active');

			// Add the 'active' class to the clicked tab
			jQuery(this).addClass('active');

			// Update the activeTab variable based on the clicked tab's data attribute
			activeTab = jQuery(this).data('tab');

			// Depending on the active tab, call the appropriate function to display reviews
			if (activeTab === 'site') {
				displaySiteReviews(reviews);
				if (carousel) {
					/* INIT CAROUSEL CODE */
				}
			} else if (activeTab === 'product') {
				displayProductReviews(reviews);
				if (carousel) {
					/* INIT CAROUSEL CODE */
				}
			}
		});




		// opacity fix (DO NOT DELETE - this is referenced in gallery-options.php)
		function oculizmCarouselOnChanged() {
			jQuery(widget).find('.oculizm-review').css('opacity', '1');
		}



		// handle review request
		function handleReviewRequest() {

			// request the review form
			jQuery.ajax({
				url: 'https://app.oculizm.com/api/v1/request_review_form/',
				dataType: 'json',
				data: {
					clientID: '{{clientID}}',
					productID: supplied_product_id
				},
				success: function (data) {
					data = jQuery.parseJSON(data);
					console.log(data);

					if (data.errors) {
						console.log(data.errors)
					}

					else {

						// show the form
						jQuery('body').append(jQuery(reviewFormHtml));

						// if a valid product ID was supplied in the original request, disaply it
						if (data.product) {
							jQuery('.orf-product img').attr('src', data.product.image_link);
							jQuery('.orf-product-title').text(data.product.title);
							jQuery('.orf-product').show();
						}
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
					submittingReview = false;
				}
			});
		}


		// rating star click event
		jQuery('body').on('click', '.oculizm-review-form .orf-star', function (e) {
			e.preventDefault();
			var rating = jQuery(this).index() + 1;
			jQuery('.orf-star').removeClass('active');
			for (var i = rating; i >= 0; i--) {
				jQuery('.orf-star:nth-of-type(' + i + ')').addClass('active');
			}
		});

		// submit review event
		jQuery('body').on('click', '.oculizm-review-form a[name=submit-orf]', function (e) {
			e.preventDefault();

			var errors = []; // Store error messages

			var rating = jQuery('.oculizm-review-form .orf-star.active').length;
			var reviewerName = jQuery('.oculizm-review-form .orf-reviewer input').val();
			var reviewTitle = jQuery('.oculizm-review-form .orf-review-title input').val();
			var reviewDescription = jQuery('.oculizm-review-form .orf-review-description textarea').val();
			var email = jQuery('.oculizm-review-form .orf-review-email input').val();
			// var referrerURL = document.referrer;
			// console.log("referrerURL : ", referrerURL);

			// validation 

			if (reviewerName.trim() === "") {
				errors.push('Please enter your full name.');
			}

			if (reviewTitle.trim() === "") {
				errors.push('Please enter a review title.');
			}

			if (reviewDescription.trim() === "") {
				errors.push('Please enter a review description.');
			}

			// Optional Email Validation
			if (emailRequired === '1' && email.trim() === "") {
				errors.push('Please enter your email address.');
			}

			// Optional Email Validation
			if (email.trim() !== "") {
				var emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
				if (!emailRegex.test(email)) {
					errors.push('Please enter a valid email address.');
				}
			}

			// Display accumulated error messages
			if (errors.length > 0) {

				// Clear all error messages
				jQuery('.error-message').text('').css({
					color: 'red',
					display: 'block',
					'text-align': 'left'
				});

				// Assign error messages to their respective fields using unique classes
				if (errors.includes('Please enter your full name.')) {
					jQuery('.reviewer-error').text('Please enter your full name.');
				}
				if (errors.includes('Please enter a review title.')) {
					jQuery('.title-error').text('Please enter a review title.');
				}
				if (errors.includes('Please enter a review description.')) {
					jQuery('.description-error').text('Please enter a review description.');
				}
				if (errors.includes('Please enter your email address.')) {
					jQuery('.email-error').text('Please enter your email address.');
				}
				if (errors.includes('Please enter a valid email address.')) {
					jQuery('.email-error').text('Please enter a valid email address.');
				}

				return;
			}


			else if (!submittingReview) {

				submittingReview = true;

				jQuery('<div class="oclzm-loader"></div>').insertAfter('.orf-header');
				jQuery('.orf-body').remove();

				jQuery.ajax({
					url: 'https://app.oculizm.com/api/v1/add_review/',
					dataType: 'json',
					data: {
						clientID: '{{clientID}}',
						rating: rating,
						reviewerName: reviewerName,
						reviewTitle: reviewTitle,
						reviewDescription: reviewDescription,
						productID: supplied_product_id,
						referrerURL: source
					},
					success: function (data) {
						data = jQuery.parseJSON(data);
						console.log(data);

						if (data.errors) {
							console.log(data.errors)
						}

						else {
							jQuery('.orf-description').text("Thank you, your review has been submitted.");
							jQuery('.orf-container').append('<a href="#" class="close"></a>');
						}

					},
					error: function (jqXHR, textStatus, errorThrown) {
						console.log(errorThrown);
					},
					complete: function () {
						submittingReview = false;
						jQuery('.orf-container').find('.oclzm-loader').remove();
						jQuery('.orf-product').remove();
					}
				});
			}
		});

		jQuery(document).ready(function () {
			// Character limit for reviewerName (32 characters)
			jQuery(document).on('focusout', '.oculizm-review-form .orf-reviewer input', function () {
				var reviewerName = jQuery(this).val();
				var $errorField = jQuery(this).next('.error-message.reviewer-error');

				if (reviewerName.length > 32) {
					jQuery(this).val(reviewerName.substring(0, 32));
					$errorField.text('Reviewer name must be 32 characters or less.')
						.css({
							color: 'red',
							display: 'block',
							'text-align': 'left'
						});
				} else {
					$errorField.text('').css('display', 'none'); // Clear the error message and hide it
				}
			});

			// Character limit for reviewTitle (32 characters)
			jQuery(document).on('focusout', '.oculizm-review-form .orf-review-title input', function () {
				var reviewTitle = jQuery(this).val();
				var $errorField = jQuery(this).next('.error-message.title-error');

				if (reviewTitle.length > 32) {
					jQuery(this).val(reviewTitle.substring(0, 32));
					$errorField.text('Review title must be 32 characters or less.')
						.css({
							color: 'red',
							display: 'block',
							'text-align': 'left'
						});
				} else {
					$errorField.text('').css('display', 'none'); // Clear the error message and hide it
				}
			});

			// Character limit for reviewDescription (500 characters)
			jQuery(document).on('focusout', '.oculizm-review-form .orf-review-description textarea', function () {
				var reviewDescription = (this).val();
				var $errorField = jQuery(this).next('.error-message.description-error');

				if (reviewDescription.length > 500) {
					jQuery(this).val(reviewDescription.substring(0, 500));
					$errorField.text('Review description must be 500 characters or less.')
						.css({
							color: 'red',
							display: 'block',
							'text-align': 'left'
						});
				} else {
					$errorField.text('').css('display', 'none'); // Clear the error message and hide it
				}
			});
		});


		// open viewer
		function openViewer(review) {
			lastOpenReview = review.data("review-id");

			jQuery(reviewLightboxClass).remove();
			jQuery('body').append(jQuery(reviewViewerHtml));

			// Select the review-container within the viewer
			var reviewContainer = jQuery('.viewer .review-container');

			// Get the review-summary element
			var reviewSummary = jQuery('#oclzmReviews .review-summary');

			// Clone the review-summary element and its contents
			var reviewSummaryClone = reviewSummary.clone();

			// Append the cloned review-summary element to the review-container
			reviewContainer.append(reviewSummaryClone);

			// Get the innerHTML of the review and set it in the review-container
			var reviewContent = review.html();
			reviewContainer.append(reviewContent);
			reviewContainer.append(oclzmFooter);

			// open lightbox
			jQuery(reviewLightboxClass).fadeIn('fast');
			checkLightboxArrows(lastOpenReview);
		}


		// close review form
		jQuery(document).on('click', '.orf-container .close', function (e) {
			e.preventDefault();
			jQuery('.oculizm-review-form').fadeOut(300, function () { jQuery(this).remove(); });
		});

		// reviews click event
		jQuery(widget).on('click', ' .owl-item .oculizm-review', function (e) {
			e.preventDefault();
			openViewer(jQuery(this));
		});

		// close lightbox if clicked outside the lightbox
		jQuery(document).on('click', reviewLightboxClass, function (e) {
			if (jQuery(e.target).hasClass('.oculizm-lightbox')) jQuery(reviewLightboxClass + ' .close').click();
		});

		// close lightbox
		jQuery(document).on('click', reviewLightboxClass + ' .close', function (e) {
			e.preventDefault();
			jQuery(reviewLightboxClass).fadeOut(300, function () { jQuery(this).remove(); });
			jQuery(reviewLightboxClass).remove();
		});

		return this; // allows chaining
	};

}(jQuery));