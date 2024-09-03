(function ($) {

	jQuery(document).ready(function () {

		// define variables
		var feeds;
		var feed;
		var current_feed_id;
		// variables for adding a new feed
		var http_url, http_username, http_password, ftp_url, ftp_username, ftp_password, ftp_file_path, feed_id, region, shop_link;

	 	// get product feeds
		function getProductFeeds() {
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

						$('table[name=product-feeds] tbody tr').remove();
						feeds = data;
						for (var i=0; i<data.length; i++) {
							var rowHtml = "<tr data-feed-id='" + data[i]['id'] + "'>";
	
							var feedUrl = data[i]['http_url'];
							if (!feedUrl) feedUrl = data[i]['ftp_url'];

							if (feedUrl.startsWith('http')) feedUrl = "<a target='_blank' href='" + feedUrl + "'>" + feedUrl + "</a>";
	
							// get the full region data of this currency code
							var extractRegionData = function(item) {
								return item[0] === data[i]['region'];
							}
							var r = regions_array.filter(extractRegionData)[0];

							rowHtml += "<td name='feed-region'>" + r[2] + "</td>";
							rowHtml += "<td name='feed-url'>" + feedUrl + "</td>";
							rowHtml += "<td name='num-products'>" + data[i]['num_products'] + "</td>";
							rowHtml += "<td name='feed-format'>" + data[i]['format'] + "</td>";
							rowHtml += "<td name='shop-link'><a target='_blank' href='" + data[i]['shop_link'] + "'>" + data[i]['shop_link'] + "</a></td>";
							rowHtml += "<td name='last-updated'>" + data[i]['last_updated'] + "</td>";
							rowHtml += "<td name='actions'><a href='' name='edit-feed'>Edit</a><a href='' name='refresh-feed'>Update</a><a href='' name='delete-feed'>Delete</a></td>";
							rowHtml += "</tr>";
							$('table[name=product-feeds] tbody').append(rowHtml);
						}
						if (data.length > 1) $('a[name=consolidate-products]').show();
					}
	
					else {
						showPopup("No response.", new Array({'action': 'close-popup', 'text': 'Ok'}));
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
		};

		// region setup
		function waitForRegions() {
			if (regions_array.length == 0) {
			    setTimeout(waitForRegions, 50);
			    return;
			}
			var options = "";
			$.each(regions_array, function(key, val) {
				options += "<option value='" + val[0] + "''>" + val[1] + "</option>";
			});
			$('select[name=region]').append($(options));
		}

		// open the add feed modal
		$('body').on('click', 'a[name=add-product-feed]', function(e) {
			e.preventDefault();

			// IMPORTANT! Unset the active feed so we don't send a feed ID to the server
			$('table[name=product-feeds] tr').removeClass('active');
			feed_id = undefined;

			$('.form-overlay[name=add-feed-modal]').fadeIn();
			$('body').addClass('no-scroll');
			$('.form-overlay').scrollTop(0);
		});

		// open the edit feed modal
		$('body').on('click', 'a[name=edit-feed]', function(e) {
			e.preventDefault();
			$('.form-overlay[name=edit-feed-modal]').fadeIn();
			$('body').addClass('no-scroll');
			$('.form-overlay').scrollTop(0);

			// get the clicked feed
			feed_id = $(this).closest('tr').attr('data-feed-id');
			current_feed_id = feed_id;
			var clicked_feed_item = feeds.find(x => x.id === current_feed_id);

			// set page variables
			http_url = clicked_feed_item['http_url'];
			http_username = clicked_feed_item['http_username'];
			http_password = clicked_feed_item['http_password'];
			ftp_url = clicked_feed_item['ftp_url'];
			ftp_username = clicked_feed_item['ftp_username'];
			ftp_password = clicked_feed_item['ftp_password'];
			ftp_file_path = clicked_feed_item['ftp_path'];
			shop_link = clicked_feed_item['shop_link'];
			region = clicked_feed_item['region'];

			// populate form elements
			$(".http-url").val(http_url);
			$(".http-username").val(http_username);
			$(".http-password").val(http_password);
			$(".ftp-server").val(ftp_url);
			$(".ftp-username").val(ftp_username);
			$(".ftp-password").val(ftp_password);
			$(".ftp-filepath").val(ftp_file_path);
			$(".shop-link").val(shop_link);
			$('select[name=region] option[value="' + region + '"]').prop('selected', 'selected').change();
		});

		// refresh feed
		$('body').on('click', 'a[name=refresh-feed]', function(e) {
			e.preventDefault();

			// get the feed that was clicked
			feed_id = $(this).closest('tr').attr('data-feed-id');
			feed = searchArrayForID(feed_id, feeds);

			// set an active status on that feed in the feed table
			$(this).closest('table').find('tr').removeClass('active');
			$(this).closest('tr').addClass('active');

			$('a[name=scan-feed]').trigger('click');			
		});

		// scan feed
		$('body').on('click', 'a[name=scan-feed]', function (e) {

			// if this is an existing feed we need to refresh...
			if ($('table[name=product-feeds] tr.active').length != 0) {

				http_url = feed['http_url'];
				http_username = feed['http_username'];
				http_password = feed['http_password'];
				ftp_url = feed['ftp_url'];
				ftp_username = feed['ftp_username'];
				ftp_password = feed['ftp_password'];
				ftp_file_path = feed['ftp_path'];
				shop_link = feed['shop_link'];
				region = feed['region'];
			}

			// else this is a new feed, grab the values from the modal
			else {
				http_url = $('.http-url').val();
				http_username = $('.http-username').val();
				http_password = $('.http-password').val();
				ftp_url = $('.ftp-server').val();
				ftp_username = $('.ftp-username').val();
				ftp_password = $('.ftp-password').val();
				ftp_file_path = $('.ftp-filepath').val();
				shop_link = $('.shop-link').val();
				region = $("select[name=region]").val();
			}

			// form validation
			if (!region) {
				// create popup
				var buttons = new Array(
					{ 'action': 'close-popup', 'text': 'Close' }
				);
				showPopup('Please specify the region of this feed.', buttons);
				return;		
			}
			if (!shop_link) {
				// create popup
				var buttons = new Array(
					{ 'action': 'close-popup', 'text': 'Close' }
				);
				showPopup('Please specify the Shop Link of this client.', buttons);
				return;		
			}

			showFullScreenLoader();
console.log('Sending feed ID: ' + feed_id);
			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'import_product_feed',
					'feed_id':feed_id,
					'http_url': http_url,
					'http_username': http_username,
					'http_password': http_password,
					'ftp_url':ftp_url,
					'ftp_username':ftp_username,
					'ftp_password':ftp_password,
					'ftp_path':ftp_file_path,
					'shop_link':shop_link,
					'region':region,
					'step': 1
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);

					if (data.sample) {

						// show overlay
						$('body').addClass('no-scroll');
						$('.form-overlay').scrollTop(0);
						$('.form-overlay[name=add-feed-modal]').hide();
						$('.form-overlay[name=review-feed-modal]').show();

						var importResults = "<table name='review-feed' class='stripes'>";

						for (var key in data) {

							var resultValue = data[key];

							importResults += "<tr>";
							importResults += "	<td>" + key + "</td>";

							// handle nested values
							if (typeof resultValue == "object") {

								// open a new table
								importResults += "<td><table>";

								var counter = 0;
								for (var childKey in data[key]) {

									var resultValue = data[key][childKey];
									if (childKey == "image_link") resultValue = "<img src='" + data[key][childKey] + "'>";

									importResults += "<tr>";
									importResults += "	<td>" + childKey + "</td>";
									importResults += "	<td>" + resultValue + "</td>";
									importResults += "</tr>";		

									counter++;							
								}
								
								// close that table
								importResults += "</table></td>";
							}

							else {
								importResults += "	<td>" + resultValue + "</td>";
							}

							importResults += "</tr>";	
						}
				
						importResults += "</table>";

						$('.form-overlay[name=review-feed-modal] .placeholder').html($(importResults));
					}

					// no sample data
					else {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Close' }
						);
						showPopup('There was an error importing the product feed.', buttons);
						return;
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				},
				complete: function () {
					hideFullScreenLoader();
				}
			});
		});

		// import feed
		$('body').on('click', 'a[name=import-feed]', function (e) {

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'import_product_feed',
					'feed_id': feed_id,
					'http_url': http_url,
					'http_username': http_username,
					'http_password': http_password,
					'ftp_url':ftp_url,
					'ftp_username':ftp_username,
					'ftp_password':ftp_password,
					'ftp_path':ftp_file_path,
					'shop_link':shop_link,
					'region':region,
					'step': 2
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);

					if (data.num_products_added) {

	      				$('.form-overlay').fadeOut();
						$('body').removeClass('no-scroll');

						getProductFeeds();
					}

					else {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Close' }
						);
						showPopup('There was an error importing the product feed.', buttons);
						return;
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				},
				complete: function () {
					hideFullScreenLoader();
				}
			});
		});

		// consolidate products
		$('body').on('click', 'a[name=consolidate-products]', function (e) {

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'consolidate_product_feeds'
				},
				dataType: 'JSON',
				success: function (data) {
					console.log(data);

					if (data) {

					}

					else {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Close' }
						);
						showPopup('There was an error consolidating the products.', buttons);
						return;
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(jqXHR);
					console.log(textStatus);
					console.log(errorThrown);
				},
				complete: function () {
					hideFullScreenLoader();
				}
			});
		});

		// add product feed - back button
		$('body').on('click', 'a[name=back]', function (e) {
			$('.form-overlay[name=add-feed-modal]').show();
			$('.form-overlay[name=review-feed-modal]').hide();
		});

		// show confirm delete feed overlay
		$('body').on('click', 'a[name=delete-feed]', function(e) {
			e.preventDefault();

			feed_id = $(this).closest('tr').attr('data-feed-id');

			// create popup
			var buttons = new Array(
				{'action': 'delete-feed', 'text': 'Delete'},
				{'action': 'close-popup', 'text': 'Cancel'}
			);
			showPopup('Are you sure you want to delete this feed? This will not delete any products.', buttons);
		});

		// confirm delete feed
		$('body').on('click', '.popup-overlay a[data-action=delete-feed]', function(e) {
			e.preventDefault();

			showFullScreenLoader();

		    $.ajax({
				url: ajaxUrl,
				data:{
					'action':'delete_product_feed',
					'feed_id': feed_id
				},
				dataType: 'JSON',

				success:function(data) {
					console.log(data);

					if (data == true) $('tr[data-feed-id=' + feed_id + ']').remove();

					// show/hide consolidate button
			      	if ($('table[name=product-feeds] tr').length > 2) $('a[name=consolidate-products]').show();
			      	else $('a[name=consolidate-products]').hide();

					// hide overlay
					$('.popup-overlay').fadeOut();
					$('body').removeClass('no-scroll');
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
					$('.form-overlay').fadeOut();
				}
		    });
		});

		// show confirm delete all products overlay
		$('body').on('click', 'a[name=delete-all-products]', function(e) {
			e.preventDefault();

			// create popup
			var buttons = new Array(
				{'action': 'delete-all-products', 'text': 'Delete'},
				{'action': 'close-popup', 'text': 'Cancel'}
			);
			showPopup('Are you sure you want to delete all products belonging to this client?', buttons);
		});

		// confirm delete all products
		$('body').on('click', '.popup-overlay a[data-action=delete-all-products]', function(e) {
			e.preventDefault();

			showFullScreenLoader();

		    $.ajax({
				url: ajaxUrl,
				data:{
					'action':'delete_all_products',
					'feed_id': feed_id
				},
				dataType: 'JSON',

				success:function(data) {
					console.log(data);

					// hide overlay
					$('.popup-overlay').fadeOut();
					$('body').removeClass('no-scroll');
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

		getProductFeeds();
		waitForRegions();
	 
	});

}(jQuery));











