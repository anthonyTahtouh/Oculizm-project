(function ($) {
	
	jQuery(document).ready(function() {

		let logFileName = "debug"; // default log to fetch
		let logFileData;
		let hit;

		// get the debug log
		function get_log_file() {

			// clear the active textarea
			$('.tab-body[name="' + logFileName +'"] textarea').text('');

		    $.ajax({
				url: ajaxUrl,
				data: {
					'action': 'get_log_file',
					'log_file_name': logFileName
				},
				dataType: 'JSON',

				success: function(data) {
					console.log("Log file size: " + data.length);

					logFileData = data;
					if (data) {
					
						// determine log file size
						let logFileSize = data.length;
						let logFileSizeUnit = "B";
						if ((data.length >= 1024) && (data.length < 1048576)) {
							logFileSize = (logFileSize / 1024).toFixed(2);
							logFileSizeUnit = "K";
						}
						else if (data.length >= 1048576) {
							logFileSize = (logFileSize / 1048576).toFixed(2);
							logFileSizeUnit = "MB";
						}
						jQuery('.tab-header.active .log-file-size').text("(" + logFileSize + " " + logFileSizeUnit + ")");

						// load the log data
						var log_viewer = $('.tab-body[name="' + logFileName + '"] textarea');
						log_viewer.text(data);
						log_viewer.css("height", $(window).height()-300 + "px").scrollTop(log_viewer[0].scrollHeight);

						// reload HIT
						// if (hit != undefined) hit.destroy();
						// hit = new HighlightInTextarea('.hit', {
						// 	highlight: [
						// 	  {
						// 	    highlight: 'error',
						// 	    className: 'red',
						// 	  },
						// 	  {
						// 	    highlight: 'cleared',
						// 	    className: 'blue',
						// 	  },
						// 	  {
						// 	    highlight: '0',
						// 	    className: 'yellow',
						// 	  },
						// 	],
						// });
					}
				},
				error: function(errorThrown) {
					console.log(errorThrown);
				},
				complete: function() {
					hideFullScreenLoader();
				}
			});
		}

		// download log file
		function saveTextAsFile(textToWrite, fileNameToSaveAs) {
			var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'}); 
			var downloadLink = document.createElement("a");
			downloadLink.download = fileNameToSaveAs;
			downloadLink.innerHTML = "Download File";
			if (window.webkitURL != null) {
				// Chrome allows the link to be clicked without actually adding it to the DOM
				downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
			}
			else {
				// Firefox requires the link to be added to the DOM before it can be clicked.
				downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
				downloadLink.onclick = destroyClickedElement;
				downloadLink.style.display = "none";
				document.body.appendChild(downloadLink);
			}
			downloadLink.trigger('click');
		}

		// download log file click event
		$('body').on('click', 'a[name=download-log-file]', function(e) {
			e.preventDefault();

			saveTextAsFile(logFileData, logFileName + ".log");
		});

		// tab click event
		$('body').on('click', '.tab-header', function(e) {
			e.preventDefault();

			// set the active log file name
			logFileName = $(this).attr('name');

			// get the log file
			get_log_file(logFileName);
		});

		// clear log file click event
		$('body').on('click', 'a[name=clear-log-file]', function (e) {

			e.preventDefault();

			// create popup
			var buttons = new Array(
				{ 'action': 'confirm-clear-log-file', 'text': 'Clear log file' },
				{ 'action': 'close-popup', 'text': 'Cancel' }
			);
			showPopup('Are you sure you want to clear this log file?', buttons);
		});

		// confirm clear log file
		$('body').on('click', 'a[data-action=confirm-clear-log-file]', function (e) {

			e.preventDefault();

		    $.ajax({
				url: ajaxUrl,
				data: {
					'action': 'clear_log_file',
					'log_file_name': logFileName
				},
				dataType: 'JSON',

				success: function(data) {
					console.log(data);

					// handle errors
					if (data.error != undefined) {
						// create popup
						var buttons = new Array(
							{ 'action': 'close-popup', 'text': 'Ok' }
						);
						showPopup(data.error, buttons);
					}

					else {

						// reset the log file data
						logFileData = "";

						// clear the active textarea
						$('.tab-body[name="' + logFileName +'"] textarea').text('');

						// load the log data
						var log_viewer = $('.tab-body[name="' + logFileName + '"] textarea');
						log_viewer.text(data);
						log_viewer.css("height", $(window).height()-300 + "px").scrollTop(log_viewer[0].scrollHeight);

		                // hide popup
		                $('.popup-overlay').fadeOut();
		                $('body').removeClass('no-scroll');

						hideFullScreenLoader();
					}
				},
				error: function(errorThrown) {
					console.log(errorThrown);
				},
				complete: function() {}
			});

		});

		// MAIN THREAD
		get_log_file();
	});
}(jQuery));









