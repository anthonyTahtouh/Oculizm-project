
var savedSearches;

(function ($) {
	
	jQuery(document).ready(function() {
		
		// define variables
		var connection_id;

		// get saved searches
		jQuery._getSavedSearches = function() {

			jQuery.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_searches'
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					var savedSearches = data.reverse();

					// show the saved searches
					for (var i = 0; i < savedSearches.length; i++) {

						// if we have credentials for this social network...
						if (savedSearches[i].social_network == socialNetwork) {

							// show the Saved Searches section
							jQuery('.content-block[name=saved-searches]').show();
							var searchHtml = createSavedSearchHtml(savedSearches[i]);
							if (searchHtml) jQuery('.content-block[name=saved-searches] .content-block-body').append(searchHtml);
						}
					}
				},
				error: function (errorThrown) {
					console.log(errorThrown);
				},
				complete: function () { }
			});
		}

        // create saved search HTML
        function createSavedSearchHtml(ss) {

            // populate search term HTML
            var searchTermHtml;
            if (ss.type == "user") {
                searchTermHtml =    "<div class='search-image'>" +
                                    "   <img src='" + ss.profile_pic_url + "'>" +
                                    "</div>" +
                                    "<div class='saved-search-text'>" +
                                    "   <div class='username'>" + ss.term + "</div>" +
                                    "   <div class='screen-name'>" + decodeURI(ss.screen_name) + "</div>" +
                                    "</div>";
            }
            else if (ss.type == "hashtag") {
                searchTermHtml =    "<div class='search-image'>" +
                                    "   <img src='" + site_url + "/wp-content/themes/oculizm/img/hashtag.png'>" +
                                    "</div>" +
                                    "<div class='hashtag-text'>#" + ss.term + "</div>";
            }

            // populate search HTML
            var searchHtml = "<div class='saved-search' data-search-id='" + ss.id + "' data-search-type='" + ss.type + "' data-social-network='" + ss.social_network + "'>" +
                "<a class='saved-search-inner' href='" + site_url + "/" + ss.social_network + "-" + ss.type + "/?search_id=" + ss.id + "'>" +
                "   <div class='social-network-icon'></div>" +
                    searchTermHtml +
                "</a>" +
                "<a href='#' data-action='delete-saved-search'></a>" +
                "</div>";

                return searchHtml;
        }

		// add a search
		function addOculizmSearch(searchObject) {
			console.log(searchObject);

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'add_search',
					'social_network': searchObject['social_network'],
					'type': searchObject['type'],
					'term': searchObject['term'],
					'username': searchObject['username'],
					'screen_name': searchObject['screen_name'],
					'profile_pic_url': searchObject['profile_pic_url'],
					'hashtag_id': searchObject['hashtag_id'],
					'user_id': searchObject['user_id']
				},
				dataType: 'JSON',

				success: function (data) {
					console.log(data);

					searchObject = data;

					if (data.error == "Search already exists") {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Close' }
						);
						showPopup('Search already exists', buttons);
					}

					else {
						var searchHtml = createSavedSearchHtml(searchObject);
						$('.content-block[name=saved-searches] .content-block-body').append(searchHtml);

						// Retrieve the dynamically created element and its href value
						var dynamicLink = $('.content-block[name=saved-searches] .content-block-body .saved-search-inner').last();
						var href = dynamicLink.attr('href');

						// Navigate to the specified location
						window.location.href = href;
						$('.content-block[name=saved-searches] h2').show();
					}

				},
				error: function (errorThrown) {
					console.log(errorThrown);
				},
				complete: function () {

					hideFullScreenLoader();

					// clear the form
					$('.search-result').remove();
				}
			});
		}

		// fade out content-blocks if clicking on search bar
		$('body').on('click', '.social-search', function (e) {
			$(".content-block[name=social-network-accounts], .content-block[name=saved-searches]").fadeTo("fast", 0.5, function () { });
		});

		// search result click
		$('body').on('click', '.results-box .success-result', function(e) {

			e.stopPropagation();

			// remove the opacity dimming on other elements
			$(".content-block[name=social-network-accounts], .content-block[name=saved-searches]").fadeTo("fast", 1.0, function () { });

			var searchObject = new Array();

			// build the search terms
			var userId = $(this).attr('data-user-id');
			var username = $(this).find('.username').text();
			var screenName = $(this).find('.screen-name').text();
			var profile_pic_url = $(this).find('.user-image img').attr('src');
			var hashtagId = $(this).attr('data-hashtag-id');
			var hashtagName = $(this).find('.hashtag-text').text();

			// user
			if (userId) {
				searchObject['social_network'] = socialNetwork;
				searchObject['type'] = "user";
				searchObject['term'] = username;
				searchObject['screen_name'] = screenName;
				searchObject['profile_pic_url'] = profile_pic_url;
				searchObject['user_id'] = userId;
			}
			// hashtag
			else {
				searchObject['social_network'] = socialNetwork;
				searchObject['type'] = "hashtag";
				searchObject['term'] = hashtagName;
				searchObject['hashtag_id'] = hashtagId;
			}

			// hide results
			$('.results-box .results-list').empty();
			$('.results-box').hide();
			$(".social-search").css({
				'border-bottom-left-radius': '20px',
				'border-bottom-right-radius': '20px'
			});
			$('.social-search input').val('');

			showFullScreenLoader();

			// show the Saved Searches section
			$('.content-block[name=saved-searches]').show();

			addOculizmSearch(searchObject);
			$('.wrapper').trigger('click');
		});

		// close search box if clicked outside of search results
		$('body').on('click', '.wrapper', function (e) {

			// don't worry if it's the input box that's clicked
			if ($(e.target).parent().hasClass('social-search') || $(e.target).hasClass('error-message') || $(e.target).hasClass('search-result')) return;

			// if social search is visible
			if ($('.social-search').is(':visible')) {

				// close results list
				$('.results-box .results-list').empty();
				$('.results-box').hide();
				$(".social-search").css({
					'border-bottom-left-radius': '20px',
					'border-bottom-right-radius': '20px'
				});

				// fade background elements back to full opacity
				$(".content-block[name=social-network-accounts], .content-block[name=saved-searches]").fadeTo("fast", 1.0, function () { });
			}
		});

		// show confirm delete search overlay
		$('body').on('click', '.saved-search a[data-action="delete-saved-search"]', function(e) {
			e.preventDefault();
			e.stopPropagation();

			selectedSearch = $(this).closest('.saved-search').attr('data-search-id');

			// create popup
			var buttons = new Array(
				{'action': 'delete-search', 'text': 'Delete'},
				{'action': 'close-popup', 'text': 'Cancel'}
			);
			showPopup('Are you sure you want to delete this search?', buttons);
		});

		// confirm delete search
		$('body').on('click', '.popup-overlay a[data-action=delete-search]', function(e) {
			e.preventDefault();

			showFullScreenLoader();

		    $.ajax({
				url: ajaxUrl,
				data:{
					'action':'delete_search',
					'search_id': selectedSearch
				},
				dataType: 'JSON',

				success:function(data) {
					//console.log(data);

					$(".saved-search[data-search-id=" + selectedSearch + "]").remove();

					$('.search-count').text($('.search-count').text()-1);
					
					if ($(".saved-search").length == 0) $('.content-block[name=saved-searches]').hide();

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
					$('body').removeClass('no-scroll');
				}
		    });
		});

		// disconnect prompt
		$('body').on('click', '.disconnect', function (e) {

			e.preventDefault();

			connection_id = $(this).closest('.social-network-account').attr('data-connection-id');

			// create popup
			var buttons = new Array(
				{ 'action': 'confirm-disconnect', 'text': 'Disconnect' },
				{ 'action': 'close-popup', 'text': 'Cancel' }
			);
			showPopup('Are you sure you want to disconnect this account?', buttons);
		});

		// confirm disconnect
		$('body').on('click', 'a[data-action=confirm-disconnect]', function (e) {

			e.preventDefault();

			showFullScreenLoader();

			$.ajax({
				url: ajaxUrl,
				data: {
					'action': 'delete_connection',
					'connection_id': connection_id
				},
				dataType: 'JSON',
				success: function (data) {

					// hide overlay
					$('.popup-overlay').fadeOut();
					$('body').removeClass('no-scroll');

					if (data >= 0) {

						// remove this connection from the display
						$('.social-network-account[data-connection-id=' + connection_id + ']').remove();
						$('.menu-item[data-connection-id=' + connection_id + ']').remove();

						// if there are no more connected accounts displayed...
						if ($('.social-network-account').length == 0) {

							$('.content-block[name=offline]').show();
							$('#fblogin').show();
							$('.content-block[name=social-network-accounts]').hide();
							$('.menu-item[name=' + socialNetwork + '] .social-sub-menu').remove();

							// hide search area
							$('.page-header').hide();
							$('.content-block[name=saved-searches]').hide();
							$('.saved-searches').children().remove();
						}
					}

					else {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Close' }
						);
						showPopup('There was a problem attempting to disconnect.', buttons);
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


		// MAIN THREAD

		// hide the page header until we're connected
		$('.page-header').hide();

	});

}(jQuery));


function getSavedSearches() {
    return jQuery._getSavedSearches();
}
