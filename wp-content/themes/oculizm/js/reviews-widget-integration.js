(function ($) {
	
	jQuery(document).ready(function() {

		let region = ''; // TBC

		function updateTextarea() {

            // var galleryId = gallerySelect.options[gallerySelect.selectedIndex].value;
			var tagUrl = site_url + "/wp-content/uploads/" + clientID + "_reviews.js";
			var tagInit =    "jQuery('#oclzmReviews').init_oculizm_reviews_widget({" +
			"   region: '" + region + "'" +
			"});";


			// jquery event listener
			var jqel_start = "document.addEventListener('DOMContentLoaded', function load() {" +
			"if (!window.jQuery) return setTimeout(load, 50);";
			var jqel_end = "}, false);";

			// define code
			var tagCode = "<!-- Oculizm reviews widget tag start -->\n<script id='oculizm_reviews_script'>\n" +
			jqel_start + "\n" +
			"	var OCULIZM_Reviews_PARENT=jQuery('script#oculizm_reviews_script').parent();\n" +
			"	OCULIZM_Reviews_PARENT.append('<div id=\"oclzmReviews\"></div>');\n" +
			"	jQuery.getScript('" + tagUrl + "',function(script,textStatus,jqXHR ){\n" +
			"		if(textStatus==='success') "+ tagInit + " \n" +
			"	});\n" +
			jqel_end + "\n" +
			"</script>\n<!-- Oculizm reviews widget tag end -->\n";

			// update textarea
			$('.form-row[name=reviews-tag] textarea').text(tagCode);
		}

		updateTextarea();
	});

}(jQuery));





