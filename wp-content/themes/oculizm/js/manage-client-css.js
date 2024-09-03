(function ($) {

	jQuery(document).ready(function() {

		// add commas to numbers
		$('.num-products, .num-posts').each(function() {
			$(this).text(commaInt($(this).text()));
		});

		// get every client's PPG custom CSS and shop css
	    $.ajax({
			url: ajaxUrl,
			data:{
				'action':'get_all_clients'
			},
			dataType: 'JSON',

			success:function(data) {
				console.log(data);

				if (data) {

					data.sort(SortByClientID);

					// for each client... shop css
					for (var i=0; i<data.length; i++) {

						var rowHtml = "<tr data-client-id='" + data[i]['id'] + "'>";

						rowHtml += "<td>" + data[i]['name'] + " (" + data[i]['id'] + ")</td>";
						rowHtml += "<td>";
						rowHtml += "	<textarea name='shoppable-gallery-css'>" + data[i]['shop_css'] + "</textarea>";
						rowHtml += "	<div class='cta-group'>";
						rowHtml += "		<a href='' class='cta-primary' data-action='save-shop-css'>Save</a>";
						rowHtml += "	</div>";
						rowHtml += "</td>";
						rowHtml += "</tr>";
						$('table[name=shopCss] tbody').append(rowHtml);
					}

					// for each client... ppg
					for (var i=0; i<data.length; i++) {

						var rowHtml = "<tr data-client-id='" + data[i]['id'] + "'>";

						rowHtml += "<td>" + data[i]['name'] + " (" + data[i]['id'] + ")</td>";
						rowHtml += "<td>";
						rowHtml += "	<textarea name='ppg-css'>" + data[i]['ppg_custom_css'] + "</textarea>";
						rowHtml += "	<div class='cta-group'>";
						rowHtml += "		<a href='' class='cta-primary' data-action='save-ppg-css'>Save</a>";
						rowHtml += "	</div>";
						rowHtml += "</td>";
						rowHtml += "</tr>";
						$('table[name=ppgCss] tbody').append(rowHtml);
					}
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

		// save gallery CSS
		$('body').on('click', 'a[data-action=save-shop-css]', function(e) {
			e.preventDefault();

			var client_id = $(this).closest('tr').attr("data-client-id");
			var shopCss = $(this).closest('tr').find("textarea").val();

			showFullScreenLoader();
			$.ajax({
				url: ajaxUrl,
				data:{
					'action': 'update_gallery_css',
					client_id: client_id,
					gallery_css: shopCss
				},
				dataType: 'JSON',
		
				success: function(data) {
					console.log(data);

					var buttons = new Array(
						{'action': 'close-popup', 'text': 'Ok'}
					);
					showPopup(`CSS saved successfully. *** The gallery needs to be published again for changes to take effect ***`, buttons);
				},
				error: function(errorThrown) {
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


		// save PPG CSS
		$('body').on('click', 'a[data-action=save-ppg-css]', function(e) {
			e.preventDefault();

			var client_id = $(this).closest('tr').attr("data-client-id");
			var asoCss = $(this).closest('tr').find("textarea").val();
			console.log(client_id);
			console.log(asoCss);

			showFullScreenLoader();
			$.ajax({
				url: ajaxUrl,
				data:{
					'action': 'update_client_aso_css',
					client_id: client_id,
					aso_css: asoCss
				},
				dataType: 'JSON',
		
				success: function(data) {
					console.log(data);
					
					var buttons = new Array(
						{'action': 'close-popup', 'text': 'Ok'}
					);
					showPopup(`CSS saved successfully. *** The gallery needs to be published again for changes to take effect ***`, buttons);
				},
				error: function(errorThrown) {
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