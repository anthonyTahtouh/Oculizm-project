(function ($) {
	
	jQuery(document).ready(function() {

		// define variables
		var droppedFiles = false;
		var imageFile;
		var videoFile;
		var uploadForm = $('.upload-form');
		var $dropzone = $('.dropzone');
		
		// show image preview
		function showImagePreview(file) {
			if (window.FileReader) {
				var reader = new FileReader();
				if (file) {
					// hide the old preview
					$('.content-block[name=preview]').show();
					$('.main-image, .main-video').hide();

					// image
					if (file.type.match('image.*') || file.name.toLowerCase().endsWith('.heic')) {

						reader.readAsDataURL(file);
						imageFile = file;
						reader.onloadend = function (e) {

							// set the main image
							originalImgSrc = `${reader.result}`;
							$('.main-image-actual').attr('src', originalImgSrc);
							$('.rich-button[name=open-crop-modal]').show();

							// set the background
							$('.media-background').attr('src', originalImgSrc);

							// show the preview
							$('.main-image').show();

							// set up products
							setTimeout(initPostProducts, 100);
						};
						$('.form-row[name=image-alt-text]').css('display', 'block');
					}

					// video
					else if (file.type.match('video.*')) {

						reader.readAsDataURL(file);
						videoFile = file;

						// show the preview
						$('.main-video').show();
						$('.rich-button[name=open-crop-modal]').hide();

						// load the video preview
						var URL = window.URL || window.webkitURL;
						var fileURL = URL.createObjectURL(file);
						$('.main-video').show();
						var videoNode = document.querySelector('video');
						videoNode.src = fileURL;

						videoNode.addEventListener("seeked", function() {

							// get a still of the video
							var canvas =  getVideoThumbnail(videoNode, 0.5);
							videoNode.parentNode.appendChild(canvas);
							var previewImage = canvas.toDataURL("image/png");

							// set the video background to be that still
							$('.media-background').attr('src', previewImage);

							// create a blob
							imageFile = dataURItoBlob(previewImage);
						});
						videoNode.currentTime = 10;
						$('.form-row[name=image-alt-text]').css('display', 'none');
					}

					// unkonwn file type
					else {
						uploadForm.removeClass('image-added');
						$('.rich-button[name=remove-media]').hide();
						$('.file-chooser').show();
						$('.media-preview img').attr('src', '');
					}

					// show the preview content block
					$('.content-block[name=preview]').show();

					// update the layout
					$('.rich-button[name=remove-media]').css('display', 'inline-block');
					$('.file-chooser').hide();
					uploadForm.addClass('image-added');

					$('.content-block[name=add-media]').hide();
				}
			}
		}

		// clear image preview
		function clearImagePreview() {
			$('.content-block[name=add-media]').show();
			$('.content-block[name=preview]').hide();
			$('.rich-button[name=remove-media]').hide();
			uploadForm.removeClass('image-added');
			$('.file-chooser').attr('value', ''); // clear the file chooser's selection so the change event fires if we reselect the same file
			imageFile = null;
			cropperImgSrc = null;
			originalImgSrc = null;
		}

		// drop event
		$dropzone.on('drop', function(e) {
			showImagePreview(e.originalEvent.dataTransfer.files[0]);

			//show the page hidden content blocks
			$('.content-block[name=products] , .content-block[name=text], .content-block[name=galleries], .content-block[name=visibility], .content-block[name=status] , .content-block[name=publish-options]').show();
			$(".eqh").css('height', '34px');
		});

		// file chooser event
		$('.file-chooser').on('change', function(e) {
			showImagePreview(this.files[0]);

			//show the page hidden content blocks
			$('.content-block[name=products] , .content-block[name=text], .content-block[name=galleries], .content-block[name=visibility], .content-block[name=status] , .content-block[name=publish-options]').show();
			$(".eqh").css('height', '34px');
		});

		// trigger manual upload from clicking the dropzone
		$('.dropzone').on('click', function(e) {
			e.preventDefault();
			$('.file-chooser').trigger('click');
		});

		// clear uploaded image
		$('.rich-button[name=remove-media]').on('click', function(e) {
			e.preventDefault();
			clearImagePreview();

			//emty the tabs and the hotsposts
			$('.tab-headers, .tab-bodies').empty();
			$('.hotspot-spots').empty();
			$('.content-block-description').show();

			//hide the page hidden content blocks
			$('.content-block[name=products] , .content-block[name=text], .content-block[name=galleries], .content-block[name=visibility], .content-block[name=status] , .content-block[name=publish-options]').hide();
		});


		// create a post
		$('body').on('click', 'a[data-action=draft], a[data-action=publish] , a[data-action=future]', function(e) {
			e.preventDefault();
			var fd = new FormData();
							
			// form validation
			if (imageFile == null) {
				showPopup("Please select an image or video.", new Array({'action': 'close-popup', 'text': 'Ok'}));
				return;
			}

			// if publish button clicked	
			if ($(this).attr('data-action') != 'draft'){

				// check if we have matched product
				let matchedProducts = document.body.contains(document.getElementsByClassName("matched-product")[0]);
				var post_status = $(this).attr('data-action');

				 // handle scheduled post
				 if (post_status == 'future') {
					// Get the selected date and time from your date picker
					var selectedDate = $('#scheduled-time').val();
				
					// Get the current date and time
					var now = new Date();
					var nowFormatted = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2) + ' ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
				
					// Format the selected date for WordPress
					var formattedDate = selectedDate.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/, '$3-$1-$2 $4:$5:00');
				
					// Add the formatted date and now time to the form data
					fd.append('post_date', formattedDate);
					fd.append('now_time', nowFormatted);
				}

				// if no products attached show popup
				if(!matchedProducts) {

					if (post_status == 'future') {
						// create popup to ask if user want to proceed with tagged products
						var buttons = new Array(
							{'action': 'future', 'text': 'Schedule'},
							{'action': 'close-popup', 'text': 'Cancel'}
						);
						showPopup('Are you sure you want to continue?', buttons);

						$('body').on('click', '.popup-overlay a[data-action=future]', function(e) {
							e.preventDefault();
							var post_status = $(this).attr('data-action');
							proceedCreation(post_status);
						});
					}
					else{
						// create popup to ask if user want to proceed with tagged products
						var buttons = new Array(
							{'action': 'publish', 'text': 'Publish Now without Products'},
							{'action': 'draft', 'text': 'Save as Draft'},
							{'action': 'close-popup', 'text': 'Cancel'}
						);
						showPopup('Are you sure you want to continue?', buttons);

						$('body').on('click', '.popup-overlay a[data-action=publish] , .popup-overlay a[data-action=draft]', function(e) {
							e.preventDefault();
							var post_status = $(this).attr('data-action');
							proceedCreation(post_status);
						});
					}

					
				}
				//if we have tagged products
				else{
					var post_status = $(this).attr('data-action');
					proceedCreation(post_status);
				}
				
			}
			//if draft button clicked	
			else{
				var post_status = $(this).attr('data-action');
				proceedCreation(post_status);
			}

			function proceedCreation(post_status) {

		        // image
		        if (!videoFile) {
			        fd.append('uploaded_files[0]', imageFile, "post_image.png");
			    			}
		        // video
		        else if (videoFile) {
			        fd.append('uploaded_files[0]', imageFile);
			        fd.append('uploaded_files[1]', videoFile);
		        }
		        
				var post_title = $('.form-row[name=post-title] input').val();
				var post_caption = $('.form-row[name=post-caption] textarea').val();
				var image_alt_text = $('.form-row[name=image-alt-text] textarea').val();
				var post_status = post_status;

				// pinned post
				var pinned_post = $('.content-block[name=visibility] .checkbox-option').hasClass('active');

				// set matching products
				var products = new Array();
				$('.matched-product').each(function() {

					// hotspot data
					var x = $(this).attr('data-x');
					var y = $(this).attr('data-y');

					// product data
					var product_id = $(this).attr('data-product-id');
					var product_sku = $(this).attr('data-product-sku');
					var product_name = $(this).find('.product-name').text();
					var product_price = $(this).find('.product-price').text();
					var product_image = $(this).find('.product-image img').attr('src');
					var product_url = $(this).attr('data-product-url');

					var productAlreadyExists = searchArrayForProductID(product_id, products);
					if (!productAlreadyExists) {
						var p = { 
							'product_id': product_id,
							'product_sku': product_sku,
							'product_name': product_name,
							'product_price': product_price,
							'product_image': product_image,
							'product_url': product_url,
							'x': x,
							'y': y
						};
						products.push(p);
					}
				});

				// define galleries to be added to
				var galleries = new Array();
				$('.content-block-body[name=post-galleries] .form-row').each(function() {
					if ($(this).find('.checkbox-option').hasClass('active')) {
						var gallery_id = $(this).attr('data-gallery-id');
						galleries.push(gallery_id);
					}
				});
				

		        // add AJAX query parameters this way
		        fd.append('action', 'add_post');
		        fd.append('post_caption', post_caption);
		        fd.append('image_alt_text', image_alt_text);
		        fd.append('post_status', post_status);
		        fd.append('post_title', post_title);
		        fd.append('pinned_post', pinned_post);
		        fd.append('products', JSON.stringify(products));
		        fd.append('galleries', JSON.stringify(galleries));

		        showFullScreenLoader();

		        $.ajax({
		            type: 'POST',
		            url: ajaxUrl,
		            data: fd,
		            contentType: false,
		            processData: false,
		   			dataType: "json",
		            success: function(data) { 
		            	console.log(data);
						
						// redirect
						window.location.href = site_url + `/edit-post/?post_id=${data.ID}`;
						
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


		// MAIN THREAD

		// hide all content blocks that are displayed in the post form
		$('.content-block').hide();
		$('.content-block[name=add-media]').show();

        // cropper event
		let cropperImgSrc, originalImgSrc;
		$('.rich-button[action=name-crop-modal]').on("click", () => jQuery._openOculizmCropper(originalImgSrc, imgSrc => {
			cropperImgSrc = imgSrc;
			imageFile = dataURItoBlob(imgSrc);
			const $mainImage = $('.main-image-actual'); 
			$mainImage.attr('src', imgSrc);
			if (!$mainImage[0].onload) $mainImage[0].onload = resetHotspots;
		}));

		// get the galleries
	    $.ajax({
			url: ajaxUrl,
			data: {
				'action': 'get_galleries'
			},
			dataType: 'JSON',

			success: function(data) {

				if (data) {
					var galleryHtml = "";
					for (var i = 0; i < data.length; i++) {
						galleryHtml += '<div class="form-row" data-gallery-id="' + data[i]['id'] + '">' +
							'	<div class="checkbox-option active">' +
							'		<div class="checkbox-button"></div>' +
							'		<div class="checkbox-label">' + data[i]['name'] + '</div>' +
							'	</div>' +
							'</div>';
					}
					$('.content-block-body[name=post-galleries]').append($(galleryHtml));
				}
			},
			error: function(errorThrown) {
				console.log(errorThrown);
			},
			complete: function() {
				hideFullScreenLoader();
			}
		});

		// set up drag and drop events
		var dragDropSupport = function() {
			var div = document.createElement('div');
			return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
		}();
		if (dragDropSupport) {
			uploadForm.addClass('has-advanced-upload');
			$dropzone.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
				e.preventDefault();
				e.stopPropagation();
			})
			.on('dragover dragenter', function() {
				uploadForm.addClass('is-dragover');
			})
			.on('dragleave dragend drop', function() {
				uploadForm.removeClass('is-dragover');
			})
			.on('drop', function(e) {
				droppedFiles = e.originalEvent.dataTransfer.files;
			});
		}

		// Get the current date and time
        var currentDate = new Date();
        // Set the default value to one hour from now
        currentDate.setHours(currentDate.getHours() + 1);

        $('#scheduled-time').datetimepicker({
            format: 'Y-m-d H:i', // Adjust the format based on your needs
            step: 1, // Set the step to 15 minutes
            minDate: new Date(), // Set the minimum date to the current date and time
            minTime: 0, // Set the minimum time to 00:00
            value: currentDate, // Set the default value to one hour from now
        });

	});
}(jQuery));









