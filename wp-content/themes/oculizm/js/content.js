(function ($) {

	jQuery(document).ready(function () {

		// fetch client stats
		$.ajax({
			url: ajaxUrl,
			data: {
				'action': 'get_content_stats'
			},
			dataType: 'JSON',

			success: function (data) {
				console.log(data);

				if (data.error) {
					showPopup(data.error, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
				}


				/************************************************
				* 												*
				* 												*
				* 					TOP POSTS 	 				*
				* 												*
				* 												*
				************************************************/

				var top_posts = data.top_posts;
				if (top_posts.length > 0) {

					// for each post, create a clickable column
					for (var i = 0; i < top_posts.length; i++) {
						
						var mediaHtml = "<img class='image-fill' src='" + top_posts[i]['image_url'] + "'>";

						if (top_posts[i]['video_url']) {
							mediaHtml = "<video class='image-fill'>" +
							"				<source src='" + top_posts[i]['video_url'] +"' >" +
							"			</video>";
						}

						var row = "<div class='top-item' data-social-network='" + top_posts[i]['social_network'] + "'>";
						row += "	<a class='post-inner' href='" + site_url + "/edit-post/?post_id=" + top_posts[i]['post_id'] + "'>";
						row += 			mediaHtml;
						row += '		<div class="post-attributes-overlay">';
						row += '			<div class="social-network-icon"></div>';
						row += '		</div>';
						row += '		<div class="thumbnail-overlay">';
						row += '			<span class="thumbnail-title">' + top_posts[i]['count'] + '</span>';
						row += '			<span class="thumbnail-subtitle">Interactions</span>';
						row += '		</div>';
						row += "	</a>";
						row += "</div>";
						$('.content-block[name=top-posts] .post-grid-container').append(row);

						if (i == 3) break;
					}
					
					squareImageContainers();
					makeImagesFillContainers();

					$('.content-block[name=top-posts] .loader').hide();
				}
				else {
					$('.content-block[name=top-posts] .loader').hide();
					// $('.content-block[name=top-posts] .content-block-body').append('<div class="no-data">Nothing to show</div>');

					sampleData(".content-block[name=top-posts] .post-grid-container" , "top-posts");
				}



				/************************************************
				* 												*
				* 												*
				* 			TOP CONTENT CREATORS 	 			*
				* 												*
				* 												*
				************************************************/

				var top_creators = data.top_content_creators;
				var saved_searches = data.saved_searches;
				var count = 0;
				if (Object.keys(top_creators).length > 0) {

					Object.keys(top_creators).forEach(function (key) {

						if (count > 5) return;

						var title = "Post";
						if (top_creators[key]['count'] > 1) title = "Posts";

						// check if this content creator exists as a saved search in the database 
						for (var i = 0; i < saved_searches.length; i++) {

							var searchExist = false;
							if (saved_searches[i]['term'] == top_creators[key]['username']) {
								var savedSearchItem = saved_searches[i];
								searchExist = true;
								break;
							}
						}

						var thumbnailLink = "https://www.instagram.com/" + top_creators[key]['username'];
						var thumbnailSrc = "";
						var imageClasses = "no-image";

						if (top_creators[key]['profile_pic_url']) {
							thumbnailSrc = top_creators[key]['profile_pic_url'];
							imageClasses = "";
						}

						if (searchExist) {
							thumbnailLink = site_url + "/instagram-user/?search_id=" + savedSearchItem['id'];
						}

						var row = "<div class='saved-search' data-social-network='" + top_creators[key]['social_network'] + "'>";
						row += "	<a class='saved-search-inner' href='" + thumbnailLink + "'>";
						row += "		<div class='social-network-icon'></div>";
						row += "		<div class='search-image'>";
						row += "			<img class='" + imageClasses + "' src='" + thumbnailSrc + "'>";
						row += '		</div>';
						row += '		<div class="thumbnail-overlay">';
						row += '			<span class="thumbnail-title"> ' + top_creators[key]['count'] + '</span>';
						row += '			<span class="thumbnail-subtitle"> ' + title + '</span>';
						row += "		</div>";
						row += '		<div class="saved-search-text">';
						row += '			<div class="username"> @' + top_creators[key]['username'] + '</div>';
						row += '			<div class="screen-name"> @' + top_creators[key]['screen_name'] + '</div>';
						row += "		</div>";
						row += "	</a>";
						row += "</div>";
						$('.content-block[name=top-content-creators] .post-grid-container').append(row);
						count++;

						if (!searchExist) {
							var fd = new FormData();
							fd.append('action', 'add_search');
							fd.append('social_network', "instagram");
							fd.append('type', "user");
							fd.append('term', top_creators[key]['username']);
							fd.append('screen_name', top_creators[key]['screen_name']);
							fd.append('profile_pic_url', top_creators[key]['profile_pic_url']);

							// ajax post to insert the top content creator into the DB
							$.ajax({
								type: 'POST',
								url: ajaxUrl,
								data: fd,
								contentType: false,
								processData: false,
								dataType: "json",
								success: function (data) {
									console.log(data);
								},
								error: function (errorThrown) {
									console.log(errorThrown);
								},
								complete: function () {}
							});
						}
					});

					squareImageContainers();
					makeImagesFillContainers();

					$('.content-block[name=top-content-creators] .loader').hide();
				}
				else {
					$('.content-block[name=top-content-creators] .loader').hide();
					// $('.content-block[name=top-content-creators] .content-block-body').append('<div class="no-data">Nothing to show</div>');

					sampleData(".content-block[name=top-content-creators] .post-grid-container" , "top-content-creators");
					
				}






				/************************************************
				* 												*
				* 												*
				* 					TOP HASHTAGS 	 			*
				* 												*
				* 												*
				************************************************/

				var top_hashtags = data.top_hashtags;
				var count = 0;
				if (Object.keys(top_hashtags).length > 0) {

					Object.keys(top_hashtags).forEach(function (key) {

						if (count > 23) return;

						var title = "Post";
						if (top_hashtags[key]['count'] > 1) title = "Posts";

						// check if this hashtag exists as a saved search in the database 
						for (var i = 0; i < saved_searches.length; i++) {

							var searchExist = false;
							if (saved_searches[i]['type'] == "hashtag") {
								if (saved_searches[i]['term'] == top_hashtags[key]['hashtag']) {
									var savedSearchItem = saved_searches[i];
									searchExist = true;
									break;
								}
							}
						}

						var hashtagHref = "javascript:void(0);";
						if (searchExist) hashtagHref = site_url + "/instagram-" + savedSearchItem['type'] + "/?search_id=" + savedSearchItem['id'];

						var row = "<div class='top-hashtag'>";
						row += "<a href='" + hashtagHref + "'>";
						row += " #" + top_hashtags[key]['hashtag'] + " (" + top_hashtags[key]['count'] + ")";
						row += "</a>";
						row += "</div>";
						$('.content-block[name=top-hashtags] .post-grid-container').append(row);
						count++;
					});

					squareImageContainers();
					makeImagesFillContainers();
				}
				else {
					$('.content-block[name=top-hashtags] .loader').hide();
					// $('.content-block[name=top-hashtags] .content-block-body').append('<div class="no-data">Nothing to show</div>');

					sampleData(".content-block[name=top-hashtags] .post-grid-container" , "top-hashtags");
				}

			},
			error: function (errorThrown) {
				console.log(errorThrown);
				showPopup(errorThrown.statusText, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
			},
			complete: function () { 
				$('.content-block[name=top-hashtags] .loader').hide();
			}
		});



		/************************************************
		* 												*
		* 												*
		* 					TOP PRODUCTS 	 			*
		* 												*
		* 												*
		************************************************/

		$.ajax({
			url: ajaxUrl,
			data: {
				'action': 'get_top_products'
			},
			dataType: 'JSON',

			success: function (data) {
				console.log(data);

				if (data.error) {
					showPopup(data.error, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
				}

				var top_products = data.top_products;
				if (top_products && top_products.length > 0) {

					// for each product, create a clickable column
					for (var i = 0; (i <= 3) && (i < top_products.length); i++) { //display max top 4 products

						var ordersLabel = "Order";
						if (top_products[i]['count'] > 1) ordersLabel = "Orders";

						var productIdentifier = top_products[i]['product_id'];
						if (top_products[i]['client_id'] == "71950") productIdentifier = top_products[i]['product_sku'];
							
						var row =   "<div class='top-item'>" +
									"	<a class='product-inner' href='" + site_url + "/all-products/?product_id=" + top_products[i]['product_id'] + "'>" +
									"		<img class='image-fill' src='" + top_products[i]['image_link'] + "'>" +
									'		<div class="thumbnail-overlay">' +
									'			<span class="thumbnail-title">' + top_products[i]['count'] + '</span>' +
									'			<span class="thumbnail-subtitle">' + ordersLabel + '</span>' +
									'		</div>' +
									"		<span class='product-inner-footer'>" + top_products[i]['product_title'] + "</span>" +
									"	</a>" +
									"</div>";

						$('.content-block[name=top-products] .post-grid-container').append(row);
					}
					squareImageContainers();
					makeImagesFillContainers();
				}
				else {
					$('.content-block[name=top-products] .loader').hide();
					// $('.content-block[name=top-products] .content-block-body').append('<div class="no-data">Nothing to show</div>');
					sampleData(".content-block[name=top-products] .post-grid-container" , "top-products");
				}
			},
			error: function (errorThrown) {
				console.log(errorThrown);
				showPopup(errorThrown.statusText, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
			},
			complete: function () { 
				$('.content-block[name=top-products] .loader').hide();
			}
		});


		// add loaders to contents
		$('.content-block-body').append('<div class="loader"></div>');
		$('.content-block-body .loader').show();

		// time period
		$('.content-block, .metric-inner').append("<div class='time-box'>30 Days</div>");
	});

}(jQuery));