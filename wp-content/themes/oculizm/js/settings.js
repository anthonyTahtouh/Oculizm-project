(function ($) {

	jQuery(document).ready(function () {

		// update post prices
		$('body').on('click', 'a[name=update-prices]', function (e) {
			e.preventDefault();

	        // create popup
	        var buttons = new Array({ 'action': 'confirm-update-post-prices', 'text': 'Update Post Prices' }, { 'action': 'close-popup', 'text': 'Cancel' });
	        showPopup('Are you sure you want to update the prices of tagged products in all posts?', buttons);
	    });

		// confirm update product prices
		$('body').on('click', 'a[data-action=confirm-update-post-prices]', function (e) {
			e.preventDefault();

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'update_product_prices'
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);

					if (data == "0") {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Close' }
						);
						showPopup('Nothing updated.', buttons);
						return;
					}

					var msg = 	"Total number of posts: " + data['num_posts'] + "<br>" +
								"Matched products: " + data['num_matched_products'] + "<br>" +
								"Products with stale prices: " + data['num_matched_products_with_stale_prices'] + "<br>" +
								"Total prices updated: " + data['num_prices_changed'] + "<br>";

					// create popup
					var buttons = new Array(
						{ 'action': 'close-popup', 'text': 'Close' }
					);
					showPopup(msg, buttons);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
					hideFullScreenLoader();
				}
			});
		});

		// reverse post order
		$('body').on('click', 'a[name=reverse-post-order]', function (e) {
			e.preventDefault();

	        // create popup
	        var buttons = new Array({ 'action': 'confirm-reverse-post-order', 'text': 'Reverse Post Order' }, { 'action': 'close-popup', 'text': 'Cancel' });
	        showPopup('Are you sure you want to reverse the order of all posts?', buttons);
	    });

		// confirm reverse post order
		$('body').on('click', 'a[data-action=confirm-reverse-post-order]', function (e) {
			e.preventDefault();

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'reverse_post_order'
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);

					if (data == "0") {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Close' }
						);
						showPopup('Nothing updated.', buttons);
						return;
					}

					else {

						var msg = data['num_updates'] + " out of " + data['posts'].length + " posts updated.";

						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Close' }
						);
						showPopup(msg, buttons);
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {
					hideFullScreenLoader();
				}
			});
		});

		// publish all client tags
		$('body').on('click', 'a[name=publish-all-tags]', function(e) {
			e.preventDefault();
			console.log("publish-all-tags click function entered");

			showFullScreenLoader();

				$.ajax({
				url: ajaxUrl,
				data:{
					'action':'publish_all_client_tags'
				},
				dataType: 'JSON',

				success:function(data) {

					// if there was an error...
					if (data.errors) {
						console.log(data);

						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup('There was an error publishing the tags', buttons);
					}

					// else, if it was a success...
					else {
						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup("All tags updated. Please allow up to an hour for the changes to propagate.", buttons);
					
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

	});

}(jQuery));











