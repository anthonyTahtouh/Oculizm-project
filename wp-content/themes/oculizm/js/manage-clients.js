(function ($) {

	jQuery(document).ready(function() {

		// define variables
		var client_id;
		var numOfClients; 

		// get all clients
		function getallclients() {
				// get all clients
				$.ajax({
					url: ajaxUrl,
					type:'get',
					data:{
						'action':'get_all_clients'
					},
					dataType: 'JSON',
		
					success:function(data) {
						console.log(data);
		
						if (data) {
		
							var numGalleries = 0;
							var numProductFeeds = 0;
		
							for (var i=0; i<data.length; i++) {
		
								// build html for social network connection icons
								var connectionsIcons = "";
								var connectionsText = "";
								var connectionsCount = 0;
								for (var j=0; j<data[i]['connections'].length; j++) {
									connectionsIcons += '<div class="mini-icon" data-social-network="' + data[i]['connections'][j]['social_network'] + '"></div>';
									connectionsText += data[i]['connections'][j]['social_network'] + ", ";
									connectionsCount++;
								}
								
								// build main table HTML
								var rowHtml = "<tr data-client-id='" + data[i]['id'] + "'>";
								rowHtml += "<td name='client-id'>" + data[i]['id'] + "</td>";
								rowHtml += "<td>" + data[i]['name'] + "</td>";
								rowHtml += "<td class='num-connections'>" + connectionsCount + connectionsIcons + "</td>";
								rowHtml += "<td class='num-products'>" + data[i]['product_feeds'].length + "</td>";
								rowHtml += "<td class='num-products'>" + commaInt(data[i]['num_products']) + "</td>";
								rowHtml += "<td class='num-posts'>" + commaInt(data[i]['num_posts']) + "</td>";
								rowHtml += "<td class='client-cms'>" + data[i]['cms'] + "</td>";
								rowHtml += "<td class='last-post'>" + data[i]['last_post_date'] + "</td>";
								rowHtml += "<td class='last-login'>" + data[i]['last_login'] + "</td>";
								rowHtml += "<td class='last-event'>" + data[i]['last_event'] + "</td>";
								rowHtml += "<td name='actions'><a href='' name='email-client'>Email</a><a href='' name='delete-client'>Delete</a></td>";
								rowHtml += "</tr>";
								$('table[name=manageClients] tbody').append(rowHtml);
		
								// for each gallery this client has...
								for (var j=0; j<data[i]['galleries'].length; j++) {

									// build galleies table HTML
									var rowHtml = "<tr data-client-id='" + data[i]['id'] + "'>";
									rowHtml += "<td>" + data[i]['name'] + "</td>";
									rowHtml += "<td>" + data[i]['galleries'][j]['name'] + "</td>";
									rowHtml += "</tr>";
									$('table[name=manageGalleries] tbody').append(rowHtml);

									numGalleries++;
								}     
		
								// for each product feed this client has...
								for (var j=0; j<data[i]['product_feeds'].length; j++) {
		
									// get the feed URL
									var httpUrl = data[i]['product_feeds'][j]['http_url'];
									if (!httpUrl) httpUrl = data[i]['product_feeds'][j]['ftp_url'];
		
									// trim the date
									// var last_updated = data[i]['product_feeds'][j]['last_updated'].substring(0, 10);
		
									// build product feeds table HTML
									var rowHtml = "<tr data-client-id='" + data[i]['id'] + "'>";
									rowHtml += "<td>" + data[i]['name'] + "</td>";
									rowHtml += "<td>" + httpUrl + "</td>";
									rowHtml += "<td>" + data[i]['product_feeds'][j]['num_products'] + "</td>";
									rowHtml += "<td>" + data[i]['product_feeds'][j]['format'] + "</td>";
									rowHtml += "<td>" + data[i]['product_feeds'][j]['last_updated'] + "</td>";
									rowHtml += "<td>";
									rowHtml += "	<a target='_blank' href='" + data[i]['product_feeds'][j]['shop_link'] + "'>";
									rowHtml += data[i]['product_feeds'][j]['shop_link'];
									rowHtml += "	</a>";
									rowHtml += "</td>";
									rowHtml += "</tr>";
									$('table[name=manageProductFeeds] tbody').append(rowHtml);

									numProductFeeds++;
								}              	
							}
							$('table[name=manageClients]').tablesorter();
							$('table[name=manageGalleries]').tablesorter();
							$('table[name=manageProductFeeds]').tablesorter();

							numOfClients = data.length;
							$('h2[name=clients]').text("Clients (" + numOfClients + ")");
							$('h2[name=galleries]').text("Galleries (" + numGalleries + ")");
							$('h2[name=productFeeds]').text("Product Feeds (" + numProductFeeds + ")");
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
	
		// email client overlay
		$('body').on('click', 'a[name=email-client]', function(e) {
			e.preventDefault();

			client_id = $(this).closest('tr').find('td[name=client-id]').text();

			$('.form-overlay[name=email-a-client]').fadeIn();
			$('body').addClass('no-scroll');
			$('.form-overlay[name=email-a-client]').scrollTop(0);

			// destroy previous overlay data
			$('table[name=client-users] tbody').empty();

			// get a client's users
			$.ajax({
				url: ajaxUrl,
				type:'get',
				data:{
					'action':'get_client_users',
					'client_id': client_id
				},
				dataType: 'JSON',
	
				success:function(data) {
					console.log(data);

					if (Array.isArray(data)) {

						// build and display the table of users for this client
						for (var i=0; i<data.length; i++) {
							var user = data[i]['data'];
							var u = "<tr data-user-id='" + user['ID'] + "'>" +
							"	<td>" + user['display_name'] + "</td>" +
							"	<td>" + user['user_login'] + "</td>" +
							"	<td>" + user['user_email'] + "</td>" +
							"</tr>";
							$('table[name=client-users] tbody').append(u);
							console.log(u);
						}
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
		});

	    // send client email
		$('body').on('click', 'a[name=send-email]', function(e) {
	        e.preventDefault();

	        $('.form-overlay').fadeOut();
	        var email_subject = $(".form-row[name=email-subject] input").val();
	        var email_message = $(".form-row[name=email-message] textarea").val();

	        showFullScreenLoader();

		    $.ajax({
				url: ajaxUrl,
				data:{
					'action':'send_client_email',
					'client_id': client_id,
					'email_subject': email_subject,
					'email_message': email_message
				},
				dataType: 'JSON',

				success:function(data) {
					console.log(data);
					console.log("I think we get 0 here even if it's successful");

					if (data) {
						showPopup("The email function was executed. Check the console log for any errors.", new Array({'action': 'close-popup', 'text': 'Ok'}));
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
		});

		// show confirm delete client overlay
		$('body').on('click', 'a[name=delete-client]', function(e) {
			e.preventDefault();

			client_id = $(this).closest('tr').find('td[name=client-id]').text();

			// create popup
			var buttons = new Array(
				{'action': 'delete-client', 'text': 'Delete'},
				{'action': 'close-popup', 'text': 'Cancel'}
			);
			showPopup('Are you sure you want to delete this client?', buttons);
		});

		// confirm delete client
		$('body').on('click', '.popup-overlay a[data-action=delete-client]', function(e) {
			e.preventDefault();

			showFullScreenLoader();

		    $.ajax({
				url: ajaxUrl,
				data:{
					'action':'delete_client',
					'client_id': client_id
				},
				dataType: 'JSON',

				success:function(data) {
					console.log(data);

					if (data) {	
					$('tr[data-client-id=' + client_id + ']').remove();
					var newClientsNumber = numOfClients-=1;
					$('h2[name=clients]').text("Clients (" + newClientsNumber + ")");

					// hide overlay
					$('.popup-overlay').fadeOut();
					$('body').removeClass('no-scroll');
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
				$('.form-overlay').fadeOut();
			}
	    });
		});

		// open the add client form overlay
		$('body').on('click', '.button-add-client', function(e) {
			e.preventDefault();

			$('.form-overlay[name=add-client]').fadeIn();
			$('body').addClass('no-scroll');
			$('.form-overlay[name=add-client]').scrollTop(0);
		});


		
	    // add client
		$('body').on('click', 'a[name=add-client]', function(e) {
			e.preventDefault();
	        
	        var business_name = $("input[name=business-name]").val();
	        var first_name = $("input[name=first-name]").val();
	        var last_name = $("input[name=last-name]").val();
	        var client_email = $("input[name=client-email]").val();
	        var client_password = $("input[name=client-password]").val();
			var category = $('select[name=business-category]').val();

	        if (!business_name) {
	        	var buttons = new Array(
						{'action': 'close-popup', 'text': 'Ok'}
					);
				showPopup('Error: Please fill in all fields.', buttons);
	        	return false;
	        }
	        showFullScreenLoader();

		    $.ajax({
				url: ajaxUrl,
				type:'post',
				data:{
					'action':'add_client',
					'name': business_name,
					'first_name': first_name,
					'last_name': last_name,
					'client_email': client_email,
					'client_password': client_password,
					'category': category,
				},
				dataType: 'JSON',

				success:function(data) {
					console.log(data);

					if (data) {
						if (data === "Client Name already exists"){
							showPopup("Client Name already exists.", new Array({'action': 'close-popup', 'text': 'Ok'}));
						}
						else{
							var buttons = new Array(
								{'action': 'close-popup', 'text': 'Ok'}
							);
							var message = $("input[name=business-name]").val() + " has been set up on the system. Please send the following account details " +
								" to the client:<br/><br/>Username: " + data.username + "<br/>Password: " + data.password + "<br/><br/>" +
								"Please note: you will now need to update the feed for this client.";
							showPopup(message, buttons);

							// reset the form
							$('.form-overlay[name=add-client] input').val('');
						}

					} else {
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
					$('.form-overlay[name=add-client]').fadeOut();
				 $('body').removeClass('no-scroll');
				}
		    });
		});

		// MAIN THREAD

		getallclients();


	});
}(jQuery));