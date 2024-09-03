(function ($) {
	
jQuery(document).ready(function() {

	// get user details
    $.ajax({
		url: ajaxUrl,
		data:{
			'action':'get_oculizm_user'
		},
		dataType: 'JSON',
		success:function(data) {
			console.log(data);
			
			if (data) {

				// populate form
				// $('input[name=username]').val(data.username);
				$('input[name=email]').val(data.email);
				$('input[name=firstName]').val(data.first_name);
				$('input[name=lastName]').val(data.last_name);
				$('.client-name').text(data.client_name);
				$('img[name=clientLogo]').attr('src', data.client_logo);

				for (var i=0; i<data.sites.length; i++) {
					// get the full region data of this currency code
				var extractRegionData = function(item) {
					return item[0] === data.sites[i]['region'];
				}
				var r = regions_array.filter(extractRegionData)[0];

					var rowHtml = "<span name='feed-region'>" + r[2] + "</span>";
					rowHtml += "<a name='sites' href='" + data.sites[i]['domain'] + "' target='_blank' >" + data.sites[i]['domain'] + "</a>";
					$('.site-list').append(rowHtml);
				}
				
			}

			else {
				showPopup("Could not find user details.", new Array({'action': 'close-popup', 'text': 'Ok'}));
			}
		},
		error: function(errorThrown) {
			console.log(errorThrown);
			showPopup(errorThrown.statusText, new Array({'action': 'close-popup', 'text': 'Ok'}));		
		},
		complete: function() {
			hideFullScreenLoader();
		}
    });

    // update account details
	$('body').on('click', 'a[data-action=updateAccount]', function(e) {

		e.preventDefault();

		if (validateForm($(this))) {

			// get form values
			var firstName = $('input[name=firstName]').val().trim();
			var lastName = $('input[name=lastName]').val().trim();
			var email = $('input[name=email]').val().trim();

			showFullScreenLoader();

		    $.ajax({
				url: ajaxUrl,
				data:{
					'action':'update_user',
					'first_name': firstName,
					'last_name': lastName,
					'email': email
				},
				dataType: 'JSON',
				success:function(data) {
					console.log(data);
					
					if (data.ID) {
						var msg = "User details changed successfully.";

						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup(msg, buttons);
					}
				},
				error: function(errorThrown) {
					console.log(errorThrown);
					showPopup(errorThrown.statusText, new Array({'action': 'close-popup', 'text': 'Ok'}));	
				},
				complete: function() {
					hideFullScreenLoader();
				}
		    });			
		}
	});

	// change password
	$('body').on('click', 'a[data-action=changePassword]', function(e) {
		e.preventDefault();

		if (validateForm($(this))) {

			showFullScreenLoader();

			var password1 = $('input[name=password1]').val().trim();

		    $.ajax({
				url: ajaxUrl,
				data:{
					'action':'update_user_password',
					'password': password1
				},
				dataType: 'JSON',

				success:function(data) {
					console.log(data);
					
					if (data.ID) {

						var msg = "Password changed successfully.";

						// create popup
						var buttons = new Array(
							{'action': 'close-popup', 'text': 'Ok'}
						);
						showPopup(msg, buttons);
					}
				},
				error: function(errorThrown) {
					console.log(errorThrown);
					showPopup(errorThrown.statusText, new Array({'action': 'close-popup', 'text': 'Ok'}));		
				},
				complete: function() {
					hideFullScreenLoader();
				}
		    });
		}
	});
});

}(jQuery));



