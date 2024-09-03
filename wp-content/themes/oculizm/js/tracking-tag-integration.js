(function ($) {
	
	jQuery(document).ready(function() {

		function updateTextarea() {

			var tagUrl = site_url + "/wp-content/uploads/" + clientID + "_tracking.js";
			var tagCode = "<!-- Oculizm tracking tag start -->\n" +
			"<script src='" + tagUrl + "'></script>" +
			"\n<!-- Oculizm tracking tag end -->";
			$('.form-row[name=tracking-tag] textarea').text(tagCode);
		}

		updateTextarea();
	});

 }(jQuery));
 
 
 
 
 
 