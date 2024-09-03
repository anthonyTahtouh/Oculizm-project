(function ($) {
	
	jQuery(document).ready(function() {

		var galleryId;
		let region = ''; // TBC

		function updateTextareas() {

			var tagUrl;
			var tagInit;

			// get the galleryId
            var galleryId = $('select[name=gallery-select]').val();

   			// jquery event listener
			var jqel_start = "document.addEventListener('DOMContentLoaded', function load() {" +
			"if (!window.jQuery) return setTimeout(load, 50);";
			var jqel_end = "}, false);";




            // shop widget
			tagUrl = site_url + "/wp-content/uploads/" + clientID + "_" + galleryId + "_grid.js";
			tagInit =    "jQuery('#oclzm').oculize({" +
			"   region: '" + region + "'" +
			"});";

			// define code
			var tagCode = "<!-- Oculizm shop widget tag start -->\n<script id='oculizm_grid_script'>\n" +
			jqel_start + "\n" +
			"	var OCULIZM_Grid_PARENT=jQuery('script#oculizm_grid_script').parent();\n" +
			"	OCULIZM_Grid_PARENT.append('<div id=\"oclzm\"></div>');\n" +
			"	jQuery.getScript('" + tagUrl + "',function(script,textStatus,jqXHR ){\n" +
			"		if(textStatus==='success') "+ tagInit + " \n" +
			"	});\n" +
			jqel_end + "\n" +
			"</script>\n<!-- Oculizm shop widget tag end -->\n";

			// update textarea
			$('.form-row[name=shoppable-gallery-tag] textarea').text(tagCode);


			// homepage widget
            tagUrl = site_url + "/wp-content/uploads/" + clientID + "_" + galleryId + "_grid.js";
            tagInit =    "jQuery('#oclzm').oculize({" +
            "   region: ''" +
            "});";
            tagInit = tagInit.replace("region: ''", "region: '" + region + "', carousel: 'true'");

            // define code
            var tagCode = "<!-- Oculizm homepage widget tag start -->\n<script id='oculizm_grid_script'>\n" +
            jqel_start + "\n" +
            "	var OCULIZM_Grid_PARENT=jQuery('script#oculizm_grid_script').parent();\n" +
            "	OCULIZM_Grid_PARENT.append('<div id=\"oclzm\"></div>');\n" +
            "	jQuery.getScript('" + tagUrl + "',function(script,textStatus,jqXHR ){\n" +
            "		if(textStatus==='success') "+ tagInit + " \n" +
            "	});\n" +
            jqel_end + "\n" +
            "</script>\n<!-- Oculizm homepage widget tag end -->\n";

            // update textarea
            $('.form-row[name=hw-tag] textarea').text(tagCode);


            // ppg widget
			tagUrl = site_url + "/wp-content/uploads/" + clientID + "_as-seen-on.js";
			tagInit = "jQuery('#oclzmAsSeenOn').oculize({" +
			"   productID: '{{product.id}}'," +
			"   region: '" + region + "'" +
			"});";

			// define code
			var tagCode = "<!-- Oculizm product page widget tag start -->\n<script id='oculizm_aso_script'>\n" +
			jqel_start + "\n" +
			"	var OCULIZM_ASO_PARENT=jQuery('script#oculizm_aso_script').parent();\n" +
			"	OCULIZM_ASO_PARENT.append('<div id=\"oclzmAsSeenOn\"></div>');\n" +
			"	jQuery.getScript('" + tagUrl + "',function(script,textStatus,jqXHR ){\n" +
			"		if(textStatus==='success') " + tagInit + " \n" +
			"	});\n" +
			jqel_end + "\n" +
			"</script>\n<!-- Oculizm product page widget tag end -->\n";

			// update textarea
			$('.form-row[name=ppg-tag] textarea').text(tagCode);

		}

		$('select[name=gallery-select]').on("change", updateTextareas );


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

                    // populate the gallery dropdown
                    let galleryDropdownHtml = "";
                    for (var i=0; i<data.length; i++) {
                        let galleryOption = '<option value="' + data[i]['id'] + '">' + data[i]['name'] + '</option>';
                        galleryDropdownHtml += galleryOption;

                        // set the page's galleryId to be the first one
                        if (i==0) galleryId = data[i]['id'];
                    }
                    $('select[name=gallery-select]').append(galleryDropdownHtml);

					updateTextareas();
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





