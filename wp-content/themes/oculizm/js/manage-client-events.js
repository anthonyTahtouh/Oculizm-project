(function ($) {

	jQuery(document).ready(function() {

		$('.loader').show();

		$.ajax({
			url: ajaxUrl,
			data:{
				'action':'get_events'
			},
			dataType: 'JSON',

			success:function(data) {
				console.log(data);

				if (data) {

					// for each event...
					for (var i=0; i<data.length; i++) {

						var rowHtml = "<tr data-event-id='" + data[i]['event-id'] + "'>";

						// date
						rowHtml += "<td>" + data[i]['created'] + "</td>";

						// post ID
                        rowHtml += "<td>";
                        if (data[i]['post_id'] !== "0") {
							rowHtml += "<a href='" + site_url + '/edit-post/?post_id=' + data[i]['post_id'] + "'>";
							rowHtml += data[i]['post_id'];
							rowHtml += "</a>";
						}
                        rowHtml += "</td>";

						// event type
						if (data[i]['type'] === "order" && data[i]['order_id']) {
							var orders = data[i]['orders'];
							rowHtml += "<td>";
							rowHtml += "<table border='1'>";
							rowHtml += "<tr><td> Order ID: " + data[i]['order_id']  + "</td></tr>";
							for (var o=0; o<orders.length; o++) {
								rowHtml += "<tr><td>" + orders[o]["item_name"] + "</td><td>" + orders[o]["price"] + "</td><td>" + orders[o]["quantity"] + "</td></tr>";
							}
							rowHtml += "</table>";
							rowHtml += "</td>";
						}
						else if (data[i]['type'] === "order") {
							rowHtml += "<td>" + data[i]['type'];
						}
						else {
							rowHtml += "<td>" + data[i]['type'] + "</td>";
						}

						// hostname
						rowHtml += "<td>" + data[i]['hostname'] + "</td>";

						// product ID
                        rowHtml += "<td>";
                        if (data[i]['product_id'] !== undefined) {
	                        rowHtml += "	<a href='" + site_url + "/all-products/?product_id=" + data[i]['product_id'] + "'>";
	                        rowHtml += 			data[i]['product_id'];
	                        rowHtml += "	</a>";
	                    }
                        rowHtml += "</td>";

						// sku
                        rowHtml += "<td>";
                        if (data[i]['sku'] != "null") {
	                        rowHtml += "	<a href='" + site_url + "/all-products/?product_id=" + data[i]['sku'] + "'>";
	                        rowHtml += 			data[i]['sku'];
	                        rowHtml += "	</a>";
	                    }
                        rowHtml += "</td>";

						// session ID
						rowHtml += "<td>" + data[i]['session_id'] + "</td>";

						rowHtml += "</tr>";						
						$('table[name=manageClientEvents] tbody').append(rowHtml);
					}
				}
			},
			error: function(errorThrown) {
				console.log(errorThrown);
				var buttons = new Array(
					{'action': 'close-popup', 'text': 'Ok'}
				);
				showPopup(errorThrown.statusText, buttons);
			},
			complete: function() {
				$('.loader').hide();
			}
		});
	});
}(jQuery));