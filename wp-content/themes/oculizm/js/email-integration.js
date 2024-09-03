(function ($) {

	jQuery(document).ready(function() {

		var galleryId;
		var region;

		// update email gallery HTML
		function updateEmailGalleryHtml(region) {

			galleryId = $('select[name=gallery-select]').val();

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data:{
					'action':'get_gallery_email_html',
					'gallery_id': galleryId,
					'region': region,
				},
				dataType: 'JSON',

				success:function(data) {
					console.log(data);

					$(".preview-area").html($(data['email_html']));
					$(".form-row[name=html-email] .tab-body[name=" + data['region'] + "] textarea").val(data['email_html']);
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
		}

		// get the product feeds
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

					productFeeds = data;
					let tabBody;

					// clear all tabs
					$('.tab-headers').empty();
					$('.tab-bodies').empty();

					// for each region...
					for (var i=0; i<productFeeds.length; i++) {

						// get the selected region
						region = productFeeds[i].region.toLowerCase();

						// get the selected gallery
						galleryId = $('select[name=gallery-select]').val();

						// HTML Email
						// add a tab and blank textarea for this region
						tabBody = '<div class="tab-body" name="' + region + '">' +
						'	<div class="form-row">' +
						'		<textarea readonly name="html-email" class="big-textarea"></textarea><a href="" class="button-copy"></a>' +
						'	</div>' +
						'</div>';
						$('.tabs[name=html-email] .tab-bodies').append($(tabBody));
						// populate that textarea for this region
						updateEmailGalleryHtml(region);


						// XML gallery feed
						let feedUrl = site_url + 	"/api/v1/fetch_oculizm_posts/?" +
													"requestType=grid" +
													"&amp;clientID=" + clientID + 
													"&amp;galleryID=" + galleryId + 
													"&amp;region=" + region +
													"&amp;format=xml";

						tabBody = '<div class="tab-body" name="' + region + '">' +
						'	<div class="form-row">' +
						'		<textarea readonly name="gallery-xml-feed">' +
						feedUrl +
						'		</textarea><a href="" class="button-copy"></a>' +
						'	</div>' +
						'</div>';
						$('.tabs[name=gallery-xml-feed] .tab-bodies').append($(tabBody));


						// GraphQL gallery feed
						feedUrl = site_url + 	"/graphql?query=query { posts(first: 32, where: {clientId: \"" + clientID + 
							"\"}) { nodes { clientId databaseId title content featuredImage { node { id sourceUrl } } postFields { fieldGroupName galleries imageAltText isVideo matchedProducts { gbLink gbPrice gbTitle productId productName productPrice productUrl sku x y } socialNetwork sourceUrl } } pageInfo { hasNextPage endCursor hasPreviousPage} } }";

						tabBody = '<div class="tab-body" name="' + region + '">' +
						'	<div class="form-row">' +
						'		<textarea readonly name="gallery-graphql-feed">' +
						feedUrl +
						'		</textarea><a href="" class="button-copy"></a>' +
						'	</div>' +
						'</div>';
						$('.tabs[name=gallery-graphql-feed] .tab-bodies').append($(tabBody));


						// Klaviyo template code
						var klaviyoCode = "<div class='oculizm-post'>" +
						"<a href='{{post.post_shop_link}}&amp;oculizm_src=email' style='width: 97%; position: relative; float: left; text-decoration: none;'>" +
						"  <img style='width: 100%; height: auto;' src='{{post.image_url}}' />" +
						"     <span style='width: 100%; color: #000; font-size: 12px; text-align: center; display: block;'>" +
						"        {{post.title}}" +
						"     </span>" +
						"  </a>" +
						"</div>";

						tabBody = '<div class="tab-body" name="' + region + '">' +
						'	<div class="form-row">' +
						'		<textarea readonly name="klaviyo-code">' +
						klaviyoCode +
						'		</textarea><a href="" class="button-copy"></a>' +
						'	</div>' +
						'</div>';
						$('.tabs[name=klaviyo-code] .tab-bodies').append($(tabBody));


						// get this region's flat file data
						var myf = function(a) {
							return a[0].toLowerCase() === region;
						}
						var r = regions_array.filter(myf)[0];

						// set the tab headers
						var tabHeaader = '<div class="tab-header" name="' + region + '">' + r[2] + '</div>';
						$('.tabs[name=html-email] .tab-headers').append($(tabHeaader));
						$('.tabs[name=gallery-xml-feed] .tab-headers').append($(tabHeaader));
						$('.tabs[name=gallery-graphql-feed] .tab-headers').append($(tabHeaader));
						$('.tabs[name=klaviyo-code] .tab-headers').append($(tabHeaader));
					}

					// select the first tab of each set of tabs on this page
					$('.tabs[name=html-email] .tab-header:nth-of-type(1)').trigger('click');
					$('.tabs[name=gallery-xml-feed] .tab-header:nth-of-type(1)').trigger('click');
					$('.tabs[name=gallery-graphql-feed] .tab-header:nth-of-type(1)').trigger('click');
					$('.tabs[name=klaviyo-code] .tab-header:nth-of-type(1)').trigger('click');

				},
				error: function(errorThrown) {
					console.log(errorThrown);
				},
				complete: function() {
					hideFullScreenLoader();
				}
			});
		}

		// gallery switcher event listener
		$('select[name=gallery-select]').on("change", function() {
			console.log('start');
			getProductFeeds();
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

					// now that we have all the galleries, get the product feeds
					getProductFeeds();

					// populate the gallery dropdown
					let galleryDropdownHtml = "";
					for (var i=0; i<data.length; i++) {
						let galleryOption = '<option value="' + data[i]['id'] + '">' + data[i]['name'] + '</option>';
						galleryDropdownHtml += galleryOption;
					}
					$('select[name=gallery-select]').append(galleryDropdownHtml);
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

}(jQuery));





