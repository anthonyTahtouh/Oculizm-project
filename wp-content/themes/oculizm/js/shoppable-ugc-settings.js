(function ($) {

	jQuery(document).ready(function () {

		// define variables
		var facebook_access_token;
		var instagram_business_id;
		var feeds;
		var feed;
		var clientStatusContentBlock = $('.content-block[name=client-status]');
		var changeStatusBtn;
		var clientData;


		// change affiliate network
		function ChangeAffiliateNetwork() {

			var affiliateName = $(".form-row[name=affiliateNetwork] option:selected").html();

			// defaults
			$(".content-block[name=edit-affiliate-network] .form-row").hide();
			$(".form-row[name=affiliateNetwork]").show();
			$(".form-row[name=merchant_id]").show();
			$(".form-row[name=merchant_id] .form-label").text('Merchant ID');

			// check and hide if value  is equal to:None,links embedded and Subscription
			if (affiliateName == "None") {
				$(".form-row[name=merchant_id]").hide()
				$(".form-row[name=banner_id]").hide()
				$(".form-row[name=PID]").hide()
				$(".form-row[name=SID]").hide()
				$(".form-row[name=CID]").hide()
				$(".form-row[name=LID]").hide()
			}

			// Adtraction
			if (affiliateName == "Adtraction") {
				$(".form-row[name=merchant_id] .form-label").text('Advertiser ID');
			}

			// AWIN
			if (affiliateName == "AWIN") {}

			// CJ
			if (affiliateName == "CJ") {
				$(".form-row[name=merchant_id]").hide();
			}

			// Impact
			if (affiliateName == "Impact") {
				$(".form-row[name=merchant_id] .form-label").text('Advertiser ID');
				$(".form-row[name=banner_id]").show();
				$(".form-row[name=banner_id] .form-label").text('Campaign ID');
			}

			// Partnerize
			if (affiliateName == "Partnerize") {
				$(".form-row[name=merchant_id] .form-label").text('Campaign Reference');
			}

			// Rakuten
			if (affiliateName == "Rakuten") {}

			// ShareASale
			if (affiliateName == "ShareASale") {
				$(".form-row[name=banner_id]").show();
			}

			// TAG
			if (affiliateName == "TAG") {
				$(".form-row[name=PID]").show();
				$(".form-row[name=SID]").show();
				$(".form-row[name=LID]").show();
				$(".form-row[name=CID]").show();
			}

			// Webgains
			if (affiliateName == "Webgains") {
				$(".form-row[name=merchant_id] .form-label").text('Program ID');
			}
		}

		// show confirm change client status overlay
		$('body').on('click', 'a[name=change-client-status]', function(e) {
			e.preventDefault();

			var btnConfirmMsg = 'Yes, deactivate this client';
			if ($('div.content-block[name=client-status]').attr('data-status') == 'inactive') {
				btnConfirmMsg = 'Yes, activate this client';
			}

			// create popup
			var buttons = new Array(
				{'action': 'change-client-status', 'text': btnConfirmMsg},
				{'action': 'close-popup', 'text': 'Cancel'}
			);
			showPopup('WARNING! Are you sure you want to deactivate this client?', buttons);
		});

		// confirm client status change
		$('body').on('click', '.popup-overlay a[data-action=change-client-status]', function(e) {
			e.preventDefault();

			showFullScreenLoader();

		    $.ajax({
				url: ajaxUrl,
				data:{
					'action':'update_client_status'
				},
				dataType: 'JSON',

				success:function(data) {
					console.log(data);

					if (data) {

						// change UI
						if (clientStatusContentBlock.attr('data-status') == "active") {
							clientStatusContentBlock.attr('data-status', 'inactive');
							clientStatusContentBlock.find('.form-label').text('This client is inactive.');
							$('a[name=change-client-status]').val('Activate client');
							$('a[name=change-client-status]').removeClass('cta-primary-danger');
						}
						else {
							clientStatusContentBlock.attr('data-status', 'active');
							clientStatusContentBlock.find('.form-label').text('This client is active.');
							$('a[name=change-client-status]').val('Dectivate client');
							$('a[name=change-client-status]').addClass('cta-primary-danger');
						}
					}

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

		// update product prices
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

		// save widget options
		$('body').on('click', 'a[name=save-widget-options]', function(e) {
			e.preventDefault();
			showFullScreenLoader();

			// set client data options
			clientData['share_text'] = $('.form-row[name=shareText] input').val().trim();
			clientData['viewer_title'] = $('.form-row[name=viewerTitle] input').val().trim();
			clientData['lightbox_z_index'] = $('.form-row[name=lightboxZindex] input').val().trim();
			clientData['hotspot_labels'] = $('.form-row[name=hotspotLabels] .radio-option.active').attr('name');
			clientData['post_viewer'] = $('.form-row[name=postViewer] .radio-option.active ').attr('name');
			clientData['shop_css'] = $(".form-row[name=shop-custom-css] textarea").val();
			if ($(".checkbox-option[name=use-smaller-images]").hasClass('active')) clientData['use_thumb'] = 1;
			else clientData['use_thumb'] = "0";
			if ($(".checkbox-option[name=hide-credits]").hasClass('active')) clientData['hide_credits'] = 1;
			else clientData['hide_credits'] = "0";
		
			$.ajax({
				url: ajaxUrl,
				data:{
					'action':'update_client_widget_options',
					'client_data': clientData
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
						showPopup('There was an error saving widget options', buttons);
					}

					// else, if it was a success...
					else {
						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup("Widget options saved.Please allow up to an hour for the changes to propagate.", buttons);
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

		// save PPG settings
		$('body').on('click', 'a[name=save-ppg-settings]', function(e) {
			e.preventDefault();
			showFullScreenLoader();

			if ($(".checkbox-option[name=ppg_show_products]").hasClass('active')) ppg_show_products = 1;
			else ppg_show_products = "0";
			if ($(".checkbox-option[name=ppg_use_carousel]").hasClass('active')) ppg_use_carousel = 1;
			else ppg_use_carousel = "0";
			
			// set client data options
			clientData['ppg_show_products'] = ppg_show_products;
			clientData['ppg_use_carousel'] = ppg_use_carousel;
			// clientData['aso_size'] = $(".form-row[name=ppg-num-posts] .slider" ).slider("value");
			clientData['ppg_custom_css'] = $(".form-row[name=ppg-css] textarea").val();
			clientData['PPGViewer'] = $('.form-row[name=PPGViewer] .radio-option.active').attr('name');
			clientData['ppg_hotspot_labels'] = $('.form-row[name=aso_hotspotLabels] .radio-option.active').attr('name');

			$.ajax({
				url: ajaxUrl,
				data:{
					'action':'update_client_aso_options',
					'client_data': clientData
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
						showPopup('There was an error saving aso settings', buttons);
					}

					// else, if it was a success...
					else {
						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup("Product page gallery settings updated.Please allow up to an hour for the changes to propagate.", buttons);
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

		// publish all client tags
		$('body').on('click', 'a[name=publish-all-tags]', function(e) {
			e.preventDefault();

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

		// change affiliate network options
		$('body').on('change', '.form-row[name=affiliateNetwork] select', function(e) {
			ChangeAffiliateNetwork();
		});

		// save affiliate network options
		$('body').on('click', 'a[name=save-affiliate-network]', function(e) {
			e.preventDefault();

			// set client data options
			clientData['affiliate_network'] = $(".form-row[name=affiliateNetwork] option:selected").html();
			clientData['merchant_id'] = $('.form-row[name=merchant_id] input').val().trim();
			clientData['banner_id'] = $('.form-row[name=banner_id] input').val().trim();
			clientData['PID'] = $('.form-row[name=PID] input').val().trim();
			clientData['SID'] = $('.form-row[name=SID] input').val().trim();
			clientData['CID'] = $('.form-row[name=CID] input').val().trim();
			clientData['LID'] = $('.form-row[name=LID] input').val().trim();

			showFullScreenLoader();

				$.ajax({
				url: ajaxUrl,
				data:{
					'action':'update_client_affiliate_network',
					'client_data': clientData
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
						showPopup('There was an error saving affiliate', buttons);
					}

					// else, if it was a success...
					else {
						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup("Affiliate network options saved.Please allow up to an hour for the changes to propagate.", buttons);
						
						// update client data object again
						clientData = data;
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

				// client status
				var isInactive = clientData.inactive;
				if (isInactive == "0") {
					changeStatusBtn = $('<div class="cta-group"><a href="" class="cta-primary cta-primary-danger" name="change-client-status">Deactivate Client</a></div>');
					clientStatusContentBlock.attr('data-status', 'active');
					clientStatusContentBlock.append('<div class="form-row"><div class="form-label">This client is active.</div></div>');
					clientStatusContentBlock.append(changeStatusBtn);
				}
				else {
					changeStatusBtn = $('<div class="cta-group"><a href="" class="cta-primary" name="change-client-status">Activate Client</a></div>');
					clientStatusContentBlock.attr('data-status', 'inactive');
					clientStatusContentBlock.append($('<div class="form-row"><div class="form-label">This client is inactive.</div></div>'));
					clientStatusContentBlock.append(changeStatusBtn);
				}

				// use smaller images
				if (clientData['use_thumb'] == 1) $(".checkbox-option[name=use-smaller-images]").addClass('active');

				// hide credits
				if (clientData['hide_credits'] == 1) $(".checkbox-option[name=hide-credits]").addClass('active');

				// set a radio option
				$(".form-row[name=postViewer] .radio-option").removeClass('active');
				var post_viewer = clientData['post_viewer'];
				if (post_viewer) $(".form-row[name=postViewer] .radio-option[name=" + post_viewer + "]").addClass('active');

				// set a radio option
				$(".form-row[name=hotspotLabels] .radio-option").removeClass('active');
				var hotspot_labels = clientData['hotspot_labels'];
				if (hotspot_labels) $(".form-row[name=hotspotLabels] .radio-option[name=" + hotspot_labels + "]").addClass('active');

				// viewer title
				var viewer_title = clientData['viewer_title'];
				$(".form-row[name=viewerTitle] input").val(viewer_title);

				// lightbox z index
				var lightbox_z_index = clientData['lightbox_z_index'];
				$(".form-row[name=lightboxZindex] input").val(lightbox_z_index);

				// share text
				var share_text = clientData['share_text'];
				$(".form-row[name=shareText] input").val(share_text);

				// PPG options
				if (clientData['ppg_show_products'] == 1) $(".checkbox-option[name=ppg_show_products]").addClass('active');
				if (clientData['ppg_use_carousel'] == 1) $(".checkbox-option[name=ppg_use_carousel]").addClass('active');

				// set a radio option
				$(".form-row[name=PPGViewer] .radio-option").removeClass('active');
				var PPGViewer = clientData['PPGViewer'];
				if (PPGViewer) $(".form-row[name=PPGViewer] .radio-option[name=" + PPGViewer + "]").addClass('active');

				// set a radio option
				$(".form-row[name=aso_hotspotLabels] .radio-option").removeClass('active');
				var aso_hotspotLabels = clientData['ppg_hotspot_labels'];
				if (aso_hotspotLabels) $(".form-row[name=aso_hotspotLabels] .radio-option[name=" + aso_hotspotLabels + "]").addClass('active');

				// ASO custom CSS
				var as_seen_on_custom_css = clientData['ppg_custom_css'];
				if (as_seen_on_custom_css==null || as_seen_on_custom_css=="null") as_seen_on_custom_css = "";
				$(".form-row[name=ppg-css] textarea").val(as_seen_on_custom_css);

				if (clientData['affiliate_network'] != null) {
					$('.form-row[name=affiliateNetwork] option[value="' + clientData['affiliate_network'] + '"]').attr('selected', 'true');
					$(".form-row[name=affiliateNetwork] select").val(clientData['affiliate_network']);
				}

				// affiliate network
				$(".form-row[name=merchant_id] input").val(clientData['merchant_id']);
				$(".form-row[name=banner_id] input").val(clientData['banner_id']);
				$(".form-row[name=PID] input").val(clientData['PID']);
				$(".form-row[name=SID] input").val(clientData['SID']);
				$(".form-row[name=CID] input").val(clientData['CID']);
				$(".form-row[name=LID] input").val(clientData['LID']);

				ChangeAffiliateNetwork();
			}
		});

		// get the galleries
		$.ajax({
			url: ajaxUrl,
			data:{
				'action':'get_client'
			},
			dataType: 'JSON',

			success:function(data) {
				console.log(data);

				if (data) {
					clientData = data;
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

				var shopCss = clientData['shop_css'];
				$(".form-row[name=shop-custom-css] textarea").val(shopCss);	
							
				hideFullScreenLoader();
			}
		});

	});

}(jQuery));











