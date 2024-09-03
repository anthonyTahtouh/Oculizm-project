(function ($) {

	jQuery(document).ready(function () {

		// get reviews summary
		$.ajax({
			url: ajaxUrl,
			type: 'get',
			data: {
				'action': 'get_reviews_summary'
			},
			dataType: 'JSON',
			success: function (data) {
				console.log(data);

				var adminApprovedCount = parseInt(data.admin_approved_reviews_count); // Parse count from response

				var overallRating = data.overall_rating;
				var totalReviews = data.total_reviews;
				var overallSiteRating = data.overall_site_rating;
				var overallProductRating = data.overall_product_rating;
				var siteReviewsCount = data.site_reviews_count;
				var productReviewsCount = data.product_reviews_count;
				var reviews = data.reviews;

				if (reviews.length > 0) {
					// Initialize an array to store the count of reviews for each rating
					const ratingsCount = [0, 0, 0, 0, 0];

					// Count the reviews for each rating
					reviews.forEach((review) => {
						// Increment the count for the corresponding rating
						ratingsCount[parseInt(review.rating) - 1]++;
					});

					// Update chart data
					const chartData = {
						labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
						data: ratingsCount,
					};

					// Create the chart
					createChart(chartData);

					// Determine whether to use "Review" or "Reviews" based on the total number of reviews
					const reviewsText = (data.total_reviews === 1) ? 'Review' : 'Reviews';

					const siteReviewsText = (siteReviewsCount === 1) ? 'review' : 'reviews';

					const productReviewsText = (productReviewsCount === 1) ? 'review' : 'reviews';

					// Update the total reviews HTML with the total number of reviews and the appropriate text
					$('.total-reviews').html(`<span class="total-reviews-number">${data.total_reviews}</span><span class="reviews-text">${reviewsText}</span>`);

					// Update Overall Rating
					$('[name="overall-rating"] .metric-highlight-value').text(overallRating);

					// Update Total Reviews
					$('[name="total-reviews"] .metric-highlight-value').text(totalReviews);

					// Update Site Rating
					$('[name="overall-site-rating"] .metric-highlight-value').text(overallSiteRating);

					// Update Product Rating
					$('[name="overall-product-rating"] .metric-highlight-value').text(overallProductRating);

					// Update site reviews number
					$('[name="overall-site-rating"] .site-reviews-count').text(siteReviewsCount);

					// Update product reviews number
					$('[name="overall-product-rating"] .product-reviews-count').text(productReviewsCount);


					// Update site reviews text
					$('[name="overall-site-rating"] .site-reviews-text').text(siteReviewsText);

					// Update product reviews text
					$('[name="overall-product-rating"] .product-reviews-text').text(productReviewsText);

					// Check if there are admin approved reviews
					if (adminApprovedCount > 0) {
						// Create the reviews warning block HTML
						var warningBlock = "<div class='content-block' name='reviews-warning'>" +
							"   <h2 class='h2-icon'>" + adminApprovedCount + " New Review</h2>" +
							"   <div class='content-block-description'>You have " + adminApprovedCount + " review" + (adminApprovedCount > 1 ? "s" : "") + " which still require moderation. Visit <a href='https://app.oculizm.com/review-moderation/'>Review Moderation</a> to approve or reject reviews.</div>" +
							"   <a href='#' class='close'></a>" +
							"   </div>";
						// Prepend the reviews warning block to the main container
						$('.main').prepend($(warningBlock));
					}

					displayLatestReviews(reviews);

				}
				else {

					sampleData('[name="overall-rating"] .metric-highlight-value' , "reviews-summary-overall-rating");
					sampleData('[name="total-reviews"] .metric-highlight-value' , "reviews-summary-total-reviews");
					sampleData('[name="overall-site-rating"] .metric-highlight-value' , "reviews-summary-site-rating");
					sampleData('[name="overall-product-rating"] .metric-highlight-value' , "reviews-summary-product-rating");
					sampleData(".content-block[name=latest-reviews] .content-block-body" , "latest-reviews");
					$('.content-block[name=latest-reviews] .content-block-body').removeClass('hidden');

				}


			},
			error: function (errorThrown) {
				console.log(errorThrown);

				// create popup
				var buttons = [
					{ 'action': 'close-popup', 'text': 'Ok' }
				];
				showPopup('Error: ' + errorThrown.statusText, buttons);
			},
			complete: function () {
				hideFullScreenLoader();
			}
		});


		// Function to create the chart
		const createChart = (chartData) => {
			const myChart = new Chart(document.querySelector(".reviews-by-rating-chart"), {
				type: 'doughnut',
				data: {
					labels: chartData.labels,
					datasets: [{
						data: chartData.data
					}]
				},
				options: {
					borderWidth: 10,
					borderRadius: 2,
					hoverBorderWidth: 0,
					plugins: {
						legend: {
							display: false,
						},
					},
				}
			});

			// Populate the details
			populateUl(myChart, chartData);
		};

		// Function to populate the details
		const populateUl = (myChart, chartData) => {
			const ul = document.querySelector(".reviews-by-rating-stats .details ul");

			chartData.labels.forEach((label, i) => {
				let li = document.createElement("li");
				li.innerHTML = `${label} - <span class='percentage'>${chartData.data[i]}</span>`;
				li.classList.add(`star${i + 1}`);
				ul.appendChild(li);
			});

			// Loop through each segment and set the color dynamically
			myChart.data.labels.forEach((label, i) => {
				const color = myChart.data.datasets[0].backgroundColor[i];
				const bullet = document.querySelector(`.star${i + 1}`);
				bullet.style.setProperty('--bullet-color', color);
			});
		};

		// Function to populate latest reviews
		const displayLatestReviews = (reviews) => {
			// Display the latest 4 published reviews
			for (let i = 0; i < Math.min(reviews.length, 4); i++) {
				const review = reviews[i];
				if (review.status === 'published') {
					const date = new Date(review.created);
					const dateStr = date.getDate() + " " + monthNames[date.getMonth()].substring(0, 3) + " " +
						(date.getHours() < 10 ? '0' : '') + date.getHours() + ":" +
						(date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

					let ratingHtml = "";
					for (let j = 0; j < 5; j++) {
						let starHtml = '<div class="rating-star"><i></i></div>';
						if (j < review.rating) starHtml = '<div class="rating-star active"><i></i></div>';
						ratingHtml += starHtml;
					}

					const reviewHtml = `<div class='review' data-review-id='${review.id}' 
					data-product-id='${review.product_id}' 
					data-rating='${review.rating}' 
					data-review-status='${review.status}'>
					<div class='review-detail'>
						<div class='rating'>${ratingHtml}</div>
						<div class='review-title'>${review.title}</div>
						<div class='review-description'>${review.description}</div>
					</div>
					<div class='review-actions'>
						<div class='review-status'>${review.status}</div>
						<div class='cta-group'>
							<a class='cta-primary' data-action='update-review-status' data-intent='admin_approved'>Approve</a>
							<a class='cta-secondary' data-action='delete-review'>Delete</a>
							<a class='cta-primary' data-action='update-review-status' data-intent='published'>Approve</a>
							<a class='cta-secondary' data-action='update-review-status' data-intent='flagged'>Flag</a>
						</div>
					</div>
					<div class='review-meta'>
						<div class='review-meta-item' name='date-diff'>${dateStr}</div>
						<div class='review-meta-item' name='reviewer'>${review.reviewer_name}</div>
					</div>
					</div>`;

					// Append the review to the container
					$('.content-block[name=latest-reviews] .content-block-body').append(reviewHtml);
					$('.content-block[name=latest-reviews] .content-block-body').removeClass('hidden');
				}
			}
		}


		 // review warning close button
		 $('body').on('click', '.close', function(e) {
            e.preventDefault();
			console.log("clicked");
            $('.content-block[name="reviews-warning"]').hide();
        });

	});

}(jQuery));









