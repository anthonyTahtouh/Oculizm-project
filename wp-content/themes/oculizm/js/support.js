(function ($) {
	
jQuery(document).ready(function() {

	var supportTicketID;
	var supportTicket;
	var supportTickets;

	// build support ticket table
	function buildSupportTicketsTable() {

		$('table[name=support-tickets] tbody').empty();

		if ($('table[name=support-tickets] tbody tr').length == 0) {

			// create table header
			var tableHeader = "<tr>" +
			"		<th>Last Updated</th>" +
            "   	<th>Subject</th>" +
			"		<th>Status</th>" +
			"		<th></th>" +
			"	</tr>";
			$('table[name=support-tickets] thead').html(tableHeader);

		}

		if (supportTickets.length) {

			// crate table rows
			for (var i=0; i<supportTickets.length; i++) {

				var closeButtonHtml = "";
				if (supportTickets[i]['status'] == "open") closeButtonHtml = "<a href='#' data-action='close-support-ticket'>Close</a>";
				
				let deleteButtonHtml = "<a href='#' data-action='delete-support-ticket'>Delete</a>";

				let statusCaptialised = supportTickets[i]['status'].charAt(0).toUpperCase() + supportTickets[i]['status'].slice(1);

				var rowHtml = "<tr data-support-ticket-id='" + supportTickets[i]['id'] + "'>" +
				"	<td name='date'>" + supportTickets[i]['last_updated'] + "</td>" +
				"	<td name='subject'><a href='#'>" + supportTickets[i]['subject'] + "</a></td>" +
				"	<td name='status'>" +
				"		<span data-status='" + supportTickets[i]['status'] + "'>" + statusCaptialised + "</span>" +
				"	</td>" +
				"	<td name='actions'>" + closeButtonHtml + deleteButtonHtml + "</td>" +
				"</tr>";

				$('table[name=support-tickets] tbody').append(rowHtml);
				$('table[name=support-tickets]').fadeIn();
			}
		}
		else {
			$('table[name=support-tickets]').hide();
			$('.content-block[name=support-tickets] .content-block-body').removeClass('hidden');
		}		
	}

	// open the add support ticket overlay
	$('body').on('click', 'a[data-action=add-support-ticket]', function(e) {
		e.preventDefault();

		$('.form-overlay[name=add-support-ticket]').fadeIn();
		$('body').addClass('no-scroll');
		$('.form-overlay[name=add-support-ticket]').scrollTop(0);

		$('.form-overlay[name=add-support-ticket] input').val('');
		$('.form-overlay[name=add-support-ticket] textarea').val('');
	});

	// add support ticket button click
	$('body').on('click', '.form-overlay[name=add-support-ticket] .cta-primary', function(e) {

		// name
		var subject = $('.form-row[name=support-ticket-subject] input').val().trim();
		subject = subject.replace('<', ''); // do this on the server side
		subject = subject.replace('>', '');; // do this on the server side

		var message = $('.form-overlay[name=add-support-ticket] .form-row[name=support-ticket-message] textarea').val().trim();

		message = message.replace('<', '');; // do this on the server side
		message = message.replace('>', '');; // do this on the server side

		showFullScreenLoader();

	    $.ajax({
			url: ajaxUrl,
			data:{
				'action':'add_support_ticket',
				'subject': subject,
				'message': message
			},
			dataType: 'JSON',

			success:function(data) {
				console.log(data);
				
				if (data['id']) {

					// hide the overlay
					$('.form-overlay[name=add-support-ticket]').fadeOut();
					$('body').removeClass('no-scroll');

					// update the local object
					supportTickets.splice(0, 0, data);

					// refresh the table
					buildSupportTicketsTable();

					// create popup
					var buttons = new Array(
						{'action': 'close-popup', 'text': 'Close'}
					);
					showPopup('Thanks! You can expect to receive a response within 24 hours.', buttons);
				}

				else {
					// create popup
					var buttons = new Array(
						{'action': 'close-popup', 'text': 'Close'}
					);
					showPopup('There was an error submitting your request.', buttons);
				}
			},
			error: function(errorThrown) {
				console.log(errorThrown);

				// create popup
				var buttons = new Array(
					{'action': 'close-popup', 'text': 'Close'}
				);
				showPopup('There was an error submitting your request.', buttons);
			},
			complete: function() {
				hideFullScreenLoader();
			}
	    });
	});

	// update a support ticket
	$('body').on('click', 'a[action=update-support-ticket]', function(e) {
		e.preventDefault();

		var message = $(this).closest('.form-overlay').find('textarea[name=support-ticket-message]').val().trim();
		if (message == "") {

			// create popup
			var buttons = new Array(
				{'action': 'close-popup', 'text': 'Ok'}
			);
			showPopup('Please type a message.', buttons);
			return;
		}

		showFullScreenLoader();

	    $.ajax({
			url: ajaxUrl,
			data:{
				'action':'update_support_ticket',
				'support_ticket_id': supportTicketID,
				'message': message,
			},
			dataType: 'JSON',

			success:function(data) {
				console.log(data);

				if (data['id']) {

					// build the support ticket history
					var stis = data['items'];
					var itemsHtml = $("<table name='support-ticket-items'></table>");
					for (var i = 0; i < stis.length; i++) {
									var row = $("<tr></tr>").attr('data-support-ticket-item-id', stis[i]['id']);
									$("<td></td>").attr('name', 'author').text(stis[i]['author']).appendTo(row);
									$("<td></td>").attr('name', 'date').text(stis[i]['created']).appendTo(row);
									$("<td></td>").attr('name', 'message').text(stis[i]['message']).appendTo(row);
									row.appendTo(itemsHtml);
					}

					// append to the modal
					$('.content-block[name=support-ticket-history] .content-block-body').empty().append(itemsHtml);
					
					$('.form-overlay[name=support-ticket-modal] textarea').val('');

					// update the local object
					var existingTicketIndex = supportTickets.findIndex(ticket => ticket.id === data.id);

					if (existingTicketIndex !== -1) {
									// Update the existing support ticket data
									supportTickets[existingTicketIndex] = data;
					} else {
									// Add the new support ticket data to the beginning of the array
									supportTickets.splice(0, 0, data);
					}

					// refresh the table
					buildSupportTicketsTable();

					// create popup
					var buttons = new Array(
						{'action': 'close-popup', 'text': 'Close'}
					);
					showPopup('Thanks! You can expect to receive a response within 24 hours.', buttons);
				}

				else {

					// create popup
					var buttons = new Array(
						{'action': 'close-popup', 'text': 'Ok'}
					);
					showPopup('There was an error updating the support ticket.', buttons);
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

	// open the support ticket modal
	$('body').on('click', 'td[name=subject] a', function(e) {
		e.preventDefault();

		// get the clicked on support ticket
		supportTicketID = $(this).closest('tr').attr('data-support-ticket-id');
		supportTicket = searchArrayForID(supportTicketID, supportTickets);

		$('.form-overlay[name=support-ticket-modal]').fadeIn();
		$('body').addClass('no-scroll');
		$('.form-overlay[name=support-ticket-modal]').scrollTop(0);

		// set the modal subject
		$('.content-block[name=support-ticket-history] h2').text(supportTicket['subject']);

		// if the ticket is closed don't show the update form
		if (supportTicket['status'] == "closed") $('.form-overlay[name=support-ticket-modal] [name=update-support-ticket]').hide();
		else $('.form-overlay[name=support-ticket-modal] [name=update-support-ticket]').show();

		// build the support ticket history
		var stis = supportTicket['items'];
		var itemsHtml = "<table name='support-ticket-items'>";
		for (var i=0; i<stis.length; i++) {
			itemsHtml += "<tr data-support-ticket-item-id='" + stis[i]['id'] + "'>" +
				"<td name='author'>" + stis[i]['author'] + "</td>" +
				"<td name='date'>" + stis[i]['created'] + "</td>" +
				"<td name='message'>" + stis[i]['message'] + "</td>" +
			"</tr>";
		}
		itemsHtml += "</table";

		// append to the modal
		$('.content-block[name=support-ticket-history] .content-block-body').html($(itemsHtml));
	});

	// open the close support ticket overlay
	$('body').on('click', 'a[data-action=close-support-ticket]', function(e) {
		e.preventDefault();

		// get the clicked on support ticket
		supportTicketID = $(this).closest('tr').attr('data-support-ticket-id');

		// create popup
		var buttons = new Array(
			{'action': 'confirm-close-support-ticket', 'text': 'Close'},
			{'action': 'close-popup', 'text': 'Cancel'}
		);
		showPopup('Are you sure you want to close this support ticket?', buttons);
	});

	// confirm close support ticket
	$('body').on('click', 'a[data-action=confirm-close-support-ticket]', function(e) {
		e.preventDefault();

		showFullScreenLoader();

	    $.ajax({
			url: ajaxUrl,
			data:{
				'action':'close_support_ticket',
				'support_ticket_id': supportTicketID,
			},
			dataType: 'JSON',

			success:function(data) {
				console.log(data);

				if (data) {

					supportTickets = data;

					// refresh the table
					buildSupportTicketsTable();
				}

				else {

					// create popup
					var buttons = new Array(
						{'action': 'close-popup', 'text': 'Ok'}
					);
					showPopup('There was an error closing the support ticket', buttons);
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

                // hide popup
                $('.popup-overlay').fadeOut();
                $('body').removeClass('no-scroll');

				hideFullScreenLoader();
			}
	    });
	});

	// open the delete support ticket overlay
	$('body').on('click', 'a[data-action=delete-support-ticket]', function(e) {
		e.preventDefault();

		// get the clicked on support ticket
		supportTicketID = $(this).closest('tr').attr('data-support-ticket-id');

		// create popup
		var buttons = new Array(
			{'action': 'confirm-delete-support-ticket', 'text': 'Delete'},
			{'action': 'close-popup', 'text': 'Cancel'}
		);
		showPopup('Are you sure you want to close this support ticket?', buttons);
	});

	// confirm delete support ticket
	$('body').on('click', 'a[data-action=confirm-delete-support-ticket]', function(e) {
		e.preventDefault();

		showFullScreenLoader();

	    $.ajax({
			url: ajaxUrl,
			data:{
				'action':'delete_support_ticket',
				'support_ticket_id': supportTicketID,
			},
			dataType: 'JSON',

			success:function(data) {
				console.log(data);

				if (data) {

					supportTickets = data;

					// refresh the table
					buildSupportTicketsTable();
				}

				else {

					// create popup
					var buttons = new Array(
						{'action': 'close-popup', 'text': 'Ok'}
					);
					showPopup('There was an error deleting the support ticket', buttons);
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

                // hide popup
                $('.popup-overlay').fadeOut();
                $('body').removeClass('no-scroll');

				hideFullScreenLoader();
			}
	    });
	});



	// MAIN THREAD
	
 	// get support tickets
	$.ajax({
		url: ajaxUrl,
		type:'get',
		data:{
			'action':'get_support_tickets'
		},
		dataType: 'JSON',

		success:function(data) {
			console.log(data);

			supportTickets = data;
			buildSupportTicketsTable();
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

}(jQuery));









