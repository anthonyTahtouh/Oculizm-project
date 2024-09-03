(function ($) {

    jQuery(document).ready(function() {

        // define variables
        var post; // used by Edit Post page to load this post data onto the page
        var postNum = 0; // a debug field sent to the server
        var products = [];
        var selectedPost;
        var contentCreatorProfilePicture;
        var contentCreatorUserId;
        var contentCreatorScreenName;
        let cropperImgSrc, originalImgSrc;
        var formattedDate;
        var nowFormatted;


        // create a post
        function createPost(post_status) {

            selectedPost = $('.network-post.selected');

            // image
            var media_url;
            if ((selectedPost.attr('data-post-type').toLowerCase() == "image") || (selectedPost.attr('data-post-type').toLowerCase() == "carousel_album") || (selectedPost.attr('data-post-type').toLowerCase() == "photo")) {
                var media_url = selectedPost.find('.post-inner img').attr('src');
            }

            // video
            var video_url;
            if (selectedPost.attr('data-post-type').toLowerCase() == "video") {
                // media_url = selectedPost.find('.post-inner').attr('data-thumbnail');
                video_url = selectedPost.find('.post-inner .video').get(0).currentSrc;
            }

            // get original post variables
            var social_id = selectedPost.attr('data-social-id');
            var post_date = selectedPost.attr('data-post-created');
            var social_network = selectedPost.attr('data-social-network');
            var original_tweeter = selectedPost.attr('data-original-tweeter');
            var carouselIndex = selectedPost.attr('data-album-index');
            var source_media_url = selectedPost.attr('data-href');
            var source_url = `${source_media_url}${carouselIndex !== undefined ? `${source_media_url.indexOf("?") > -1 ? '&' : '?'}oci=${carouselIndex}`: ''}`;

            // get form variables
            var post_title = $(`.form-row[name=post-title] input`).val();
            var post_caption = $(`.form-row[name=post-caption] textarea`).val();
            var image_alt_text = $(`.form-row[name=image-alt-text] textarea`).val();
            var pinned_post = $('.form-row[name=visibility] .checkbox-option').hasClass('active');

            // get matched products
            products = new Array();
            $('.matched-product').each(function() {

                // hotspot data
                var x = $(this).attr('data-x');
                var y = $(this).attr('data-y');

                // product data
                var product_id = $(this).attr('data-product-id');
                var product_sku = $(this).attr('data-product-sku');
                var product_name = $(this).find('.product-name').text();
                var product_price = $(this).find('.product-price .price-value').text();
                var product_image = $(this).find('.product-image img').attr('src');
                var product_url = $(this).attr('data-product-url');
                
                var productAlreadyExists = searchArrayForProductID(product_id, products);
                if(!productAlreadyExists){
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
            galleries = new Array();
            $('.content-block-body[name=post-galleries] .form-row').each(function() {
                if ($(this).find('.checkbox-option').hasClass('active')) {
                    var gallery_id = $(this).attr('data-gallery-id');
                    galleries.push(gallery_id);
                }
            });

            showFullScreenLoader();
            $('.form-overlay[name=post-form-overlay]').fadeOut();
            $('.popup-overlay').fadeOut();

            var fd = new FormData();
            postNum++;
            
            // add post variables to form data
            fd.append('action', 'add_post');
            if (cropperImgSrc && isStringAURL(cropperImgSrc)) fd.append('uploaded_files[0]', dataURItoBlob(cropperImgSrc), "post_image.png");
            if (media_url) fd.append('media_url', media_url);
            if (video_url) fd.append('video_url', video_url);

            if (post_status == 'future') {
                // Add the formatted date to the form data
					fd.append('post_date', formattedDate);
                    fd.append('now_time', nowFormatted);
            }
            else{
                fd.append('post_date', post_date);
            }
            fd.append('post_title', post_title);
            fd.append('post_caption', post_caption);
            fd.append('image_alt_text', image_alt_text);
            fd.append('social_id', social_id);
            fd.append('social_network', social_network);
            fd.append('source_url', source_url);
            fd.append('post_status', post_status);
            fd.append('products', JSON.stringify(products));
            fd.append('galleries', JSON.stringify(galleries));
            fd.append('pinned_post', pinned_post);
            fd.append('current_page', currentPage);
            fd.append('social_source', source_url);
            fd.append('postNum', postNum);
            fd.append('_action', 'insert');
            fd.append('type', selectedPost.attr('data-post-type').toLowerCase());
            fd.append('album_index', selectedPost.attr('data-album-index'));   
            fd.append('user_profile_pic', $('.profile-pic img').attr('src') );
            fd.append('hashtag', $('.search-page-header .hashtag-text').text().replace("#", ''));
            fd.append('social_network_username', selectedPost.find('.username').text());
            if (contentCreatorUserId != undefined) fd.append('social_network_user_id', contentCreatorUserId);
            if (contentCreatorScreenName != undefined) fd.append('screen_name', contentCreatorScreenName);
            if (contentCreatorProfilePicture != undefined) fd.append('screen_name', contentCreatorProfilePicture);
                
            showFullScreenLoader();
            cropperImgSrc = null;
            $.ajax({
                type: 'POST',
                url: ajaxUrl,
                data: fd,
                contentType: false,
                processData: false,
                dataType: "json",
                success: function (data) {
                    console.log(data);

                    // update the status of the post
                    selectedPost.attr('data-post-status', data.post_status);
                    showPopup("Post created successfully and will be live within an hour.", new Array({'action': 'close-popup', 'text': 'Ok'}));
                },
                error: function (errorThrown) {
                    console.log(errorThrown);
                    showPopup(errorThrown.statusText, new Array({'action': 'close-popup', 'text': 'Ok'}));  
                },
                complete: function () {
                    hideFullScreenLoader();
                    $('.form-overlay[name=post-form-overlay]').fadeOut();
                    $('body').removeClass('no-scroll');
                }
            });
        }

        // update a post
        function updatePost(post_status) {

            // form validation
            var post_title = $('.form-row[name=post-title] input').val();
            var post_caption = $('.form-row[name=post-caption] textarea').val();
            var image_alt_text = $('.form-row[name=image-alt-text] textarea').val();

            // format the current post update date 
            const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
            var updatePostDate = Date.now() ;
            updatePostDate = new Date(updatePostDate);
            updatePostDate = updatePostDate.getHours() + ":" + updatePostDate.getMinutes() + " " + updatePostDate.getUTCDate() + " " + monthNames[updatePostDate.getMonth()] + " " + updatePostDate.getFullYear();

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
                var product_price = $(this).find('.product-price .price-value').text();
                var product_image = $(this).find('.product-image img').attr('src');
                var product_url = $(this).attr('data-product-url');

                var exists = searchArrayForProductID(product_id, products);
                if (!exists) {
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

            // pinned post
            var pinned_post = $('.form-row[name=visibility] .checkbox-option').hasClass('active');

            showFullScreenLoader();
            $('.form-overlay[name=post-form-overlay]').fadeOut();
            $('.popup-overlay').fadeOut();

            var fd = new FormData();

            fd.append('action', 'update_post');
            if (cropperImgSrc && isStringAURL(cropperImgSrc)) fd.append('uploaded_files[0]', dataURItoBlob(cropperImgSrc), "post_image.png");
            if (post_status == 'future') {
                // Add the formatted date and now date to the form data
					fd.append('post_date', formattedDate);
                    fd.append('now_time', nowFormatted);
            }
            fd.append('post_id', post_id);
            fd.append('post_title', post_title);
            fd.append('post_caption', post_caption);
            fd.append('image_alt_text', image_alt_text);
            fd.append('post_status', post_status);
            fd.append('products', JSON.stringify(products));
            fd.append('galleries', JSON.stringify(galleries));
            fd.append('pinned_post', pinned_post);

            showFullScreenLoader();

            $.ajax({
                type: 'POST',
                url: ajaxUrl,
                data: fd,
                contentType: false,
                processData: false,
                dataType: "json",
                success: function(data) {

                    if (data) {
                        console.log(data);

                        if (post_status == "publish") {
                            publish_label = "Update";
                            $('.content-block[name=status] .cta-primary[data-action=publish]').text(publish_label);
                            showPopup("Post edited successfully and will be live within an hour.", new Array({ 'action': 'close-popup', 'text': 'Ok' }));

                            //updating the date on publish panel to be the curent date  
                            $('.content-block[name=status] .content-block-description').text("Publish date : " + updatePostDate);
                        }
                        if (post_status == "future") {
                            publish_label = "Update";
                            $('.content-block[name=status] .cta-primary[data-action=publish]').text(publish_label);
                            showPopup("Post scheduled successfully.", new Array({ 'action': 'close-popup', 'text': 'Ok' }));

                            //updating the date on publish panel to be the curent date  
                            $('.content-block[name=status] .content-block-description').text("Schedule date : " + updatePostDate);
                        }
                        else {
                            if (post_status == 'draft') {
                                publish_label = "Publish Now";
                                $('.content-block[name=status] .cta-primary[data-action=publish]').text(publish_label);
                            }
                            showPopup("Post edited successfully.", new Array({ 'action': 'close-popup', 'text': 'Ok' })); 

                            //updating the date on publish panel to be the curent date 
                            $('.content-block[name=status] .content-block-description').text("Draft date : " + updatePostDate);
                        }
                        
                        // need to set the focus away from the button we just pressed
                        $('.popup-overlay .cta-secondary[data-action=close-popup]').focus();
                    }

                    // else
                    else {
                        showPopup("Post update failed.", new Array({ 'action': 'close-popup', 'text': 'Ok' }));
                    }
                },
                error: function(errorThrown) {
                    console.log(errorThrown);
                    showPopup(errorThrown.statusText, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
                },
                complete: function() {
                    hideFullScreenLoader();
                }
            });
        }

        // show confirm delete post overlay
        $('body').on('click', 'a[data-action=delete-post]', function(e) {
            e.preventDefault();

            // create popup
            var buttons = new Array({ 'action': 'confirm-delete-post', 'text': 'Delete' }, { 'action': 'close-popup', 'text': 'Cancel' });
            showPopup('Are you sure you want to delete this post?', buttons);
        });

        // confirm delete post
        $('body').on('click', '.popup-overlay a[data-action=confirm-delete-post]', function(e) {
            e.preventDefault();

            showFullScreenLoader();

            $.ajax({
                url: ajaxUrl,
                data: {
                    'action': 'delete_oculizm_post',
                    'post_id': post_id
                },
                dataType: 'JSON',

                success: function(data) {
                    //console.log(data);
                    
                    // hide popup
                    $('.popup-overlay').fadeOut();
                    $('body').removeClass('no-scroll');

                    // remove form
                    $('.content-block').slideUp();
                    $('.content-block[name=delete-post]').append('<div class="content-block-description">Post deleted.</div>');
                    $('.content-block[name=delete-post] a').remove();
                    $('.content-block[name=delete-post]').slideDown();

                    showPopup("Post deleted successfully.", new Array({ 'action': 'close-popup', 'text': 'Ok' }));
                },
                error: function(errorThrown) {
                    console.log(errorThrown);
                },
                complete: function() {
                    hideFullScreenLoader();
                }
            });
        });

        // save as draft
        $('body').on('click', 'a[data-action=draft]', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            if (currentPage === 'edit-post') {
                updatePost('draft');
            }
             else {
                createPost('draft');
            }
        });

        // confirm publish without products
        $('body').on('click', 'a[data-action=publish-without-products] , a[data-action=schedule-publish-without-products]', function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var post_status = $(this).attr('data-action');

            // if we're on the Edit Post page...
            if (currentPage === 'edit-post') {
                if (post_status == 'schedule-publish-without-products') {
                    updatePost('future');
                }
                else{
                    updatePost('publish');
                }
                
            }

            // else, probably a social network search page...
            else {
                if (post_status == 'schedule-publish-without-products') {
                    createPost('future');
                }
                else{
                    createPost('publish');
                }
                
            }
        });

        // if the post form Publish button is clicked...
        $('body').on('click', 'a[data-action=publish] , a[data-action=future]', function(e) {

            e.preventDefault();
            e.stopImmediatePropagation();
            
            //check if we have matched product
            let matchedProducts = document.body.contains(document.getElementsByClassName("matched-product")[0]);
            var post_status = $(this).attr('data-action');
				 // handle scheduled post
				 if (post_status == 'future') {

                    // Get the selected date and time from your date picker
					var selectedDate = $('#scheduled-time').val();
				
					// Get the current date and time
					var now = new Date();

				    nowFormatted = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2) + ' ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
				
					// Format the selected date for WordPress
					formattedDate = selectedDate.replace(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/, '$3-$1-$2 $4:$5:00');
		
				}
            
            // if there are no tagged products...
            if (!matchedProducts) {

                if (post_status == 'future') {
                    // create popup
                    var buttons = new Array(
                        {'action': 'schedule-publish-without-products', 'text': 'Schedule Publish without Products'},
                        {'action': 'draft', 'text': 'Save as Draft'},
                        {'action': 'close-popup', 'text': 'Cancel'}
                    );
                    showPopup('Are you sure you want to Schedule publish this post without any tagged products?', buttons);
                }
                else{
                    // create popup
                    var buttons = new Array(
                        {'action': 'publish-without-products', 'text': 'Publish Now without Products'},
                        {'action': 'draft', 'text': 'Save as Draft'},
                        {'action': 'close-popup', 'text': 'Cancel'}
                    );
                    showPopup('Are you sure you want to publish this post without any tagged products?', buttons);
                }
            }

            // if we have tagged products
            else {
                if (currentPage === 'edit-post') {
                    if (post_status == 'future') {
                        updatePost('future');
                    }
                    else{
                        updatePost('publish');
                    }
                    
                }
                 else {
                    if (post_status == 'future') {
                        createPost('future');
                    }
                    else{
                        createPost('publish');
                    }
                }
            }
        });

        // open the add post modal
        $('body').on('click', 'a[name=open-add-post-modal]', function (e) {
            e.preventDefault();

            $('.network-post').removeClass('selected');
            $('.video-icon').fadeIn();
            $('.post-form-header').empty();

            // if we've previously selected a post...
            if (selectedPost) {
                // if this is a different post to the previously selected one...
                if (selectedPost.attr('data-social-id') !== $(this).closest('.network-post').attr('data-social-id')) {
                    // remove any previously matched products and hotspots
                    $('.matched-product').remove();
                    $('.hotspot-spots').empty();
                }
            }

            // select this one
            selectedPost = $(this).closest('.network-post');
            selectedPost.addClass('selected');

            // set the post title
            var post_title = selectedPost.find('.post-title').text();

            if (socialNetwork == "instagram") {

                // if the content creator was not the authenticating user...
                if ((searchObject.type == 'mentions') || (searchObject.type == 'user')) {
                    
                    // first get the content creator's username
                    var creatorUsername = selectedPost.find('.post-title').text();

                    // now fetch their profile picture and user ID
                    FB.api(
                        '/' + ig_instagram_business_id,
                        'GET',
                        {
                            "fields": "business_discovery.username(" + creatorUsername + "){profile_picture_url,name}",
                            access_token: ig_facebook_access_token
                        },
                        function (response) {
                            console.log(response);

                            // Instagram personal account
                            if (response.error) {}

                            // Instagram business account
                            else {
                                contentCreatorUserId = response.business_discovery.id;
                                contentCreatorScreenName = response.business_discovery.name;
                                contentCreatorProfilePicture = response.business_discovery.profile_picture_url;
                            }
                        }
                    );
                }
                
                // no username pulled through if we're on the hashtag page, so set the title to be the hashtag
                if (post_title == "") post_title = $('.search-page-header .hashtag-text').text();
            }  
                
            // set the title
            $(`.form-row[name=post-title] input`).val(post_title);

            // set the post caption
            $(`.form-row[name=post-caption] textarea`).val(selectedPost.find('.post-caption').text());
            
            // set the image alt text (we just use the post title as the default value)
            $(`.form-row[name=image-alt-text] textarea`).val(post_title);

            // set the source URL
            var sourceUrlHtml;
            if (selectedPost.attr('data-href')) {
                sourceUrlHtml = "<a target='_blank' class='external-link' href='" + selectedPost.attr('data-href') + "'>" +
                    selectedPost.attr('data-href') +
                    "</a>";
                $(`.form-row[name=source-url] .form-value`).html(sourceUrlHtml);
                $('.form-row[name=source-url]').show();
            }
            else {
                $(`.form-row[name=source-url] .form-value`).empty();
                $('.form-row[name=source-url]').hide();
            }

            // remove data previously loaded into the popup
            $('.product-search').val("");

            // hide both media templates
            $('.main-image, .main-video').hide();

            if (selectedPost.attr('data-post-status') != "") {

                // curated posts Notice
                var curatedPostsNoticeHtml = "";
                
                curatedPostsNoticeHtml = " <div class='modal-notice'>" +
                "<span><img src='" + site_url + "/wp-content/themes/oculizm/img/approved.png'></span>" +
                "You have already curated this post</div> ";
                $('.post-form-header').html($(curatedPostsNoticeHtml));
            }


            // image
            if (selectedPost.attr('data-post-type') != "video") {

                var media_url = selectedPost.find('.image-fill').attr('src');

                // set background
                $('.media-preview .media-background').attr('src', media_url);

                originalImgSrc = media_url;
                $('.main-image-actual').attr('src', originalImgSrc);
                $('.rich-button[name=open-crop-modal]').show();

                // show it
                $('.main-image').css('display', 'block');

                // set up products
                setTimeout(initPostProducts, 500);
                $('.form-row[name=image-alt-text]').css('display', 'block');
                $('.media-preview .video-background').remove();
            }

            // video
            else {

                // var videoNode = selectedPost[0].childNodes[1].childNodes[0].attributes[2].nodeValue;
                var mediaThumbnail = selectedPost.find('.post-inner').attr('data-thumbnail');

                // set background
                $('.media-preview .media-background').attr('src', mediaThumbnail);
                mediaHtml = "<video class='media-background video-background'>" +
							"				<source src='" + mediaThumbnail +"' >" +
							"			</video>"
                $('.media-preview').append($(mediaHtml));

                var videoUrl = selectedPost.find('.post-inner .video').get(0).currentSrc;
                var previewVideo = $(".main-video .video").get(0);
                previewVideo.src = videoUrl;
                
                var vidw = selectedPost.find('.post-inner .video').get(0).videoWidth;
                var vidh = selectedPost.find('.post-inner .video').get(0).videoHeight;
                var aspect = vidw/vidh;

                // if landscape increase the video width
                if (aspect > 1) {
                    $(".main-video").css('width', '550px');
                    $(".main-video .video").css('width', '550px');
                }
                // if portrait full height
                else {
                    $(".media-preview").css('height', 'auto');
                    $(".main-video").css('height', '500px');
                    $(".main-video .video").css('height', '500px');
                    $(".main-video .video").css('width', 'auto');
                }
                // show it
                $('.main-video').css('display', 'block');

                // show the product search (it may have been hidden if an image was opened earlier)
                $('.product-search').show();
                $('.form-row[name=image-alt-text]').css('display', 'none');
            }

            // open the form overlay
            $('.form-overlay[name=post-form-overlay]').fadeIn();
            $('body').addClass('no-scroll');
            equalHeights();
            $('.form-overlay[name=post-form-overlay]').scrollTop(0);
        });

        // cropper event
        $('.rich-button[name=open-crop-modal]').on("click", () => jQuery._openOculizmCropper(originalImgSrc, imgSrc => {
            cropperImgSrc = imgSrc;
            const $mainImage = $('.main-image-actual');
            $mainImage.attr('src', imgSrc);
            if (!$mainImage[0].onload) $mainImage[0].onload = resetHotspots;
        }));

        // MAIN THREAD

        // get the galleries
        $.ajax({
            url: ajaxUrl,
            data: {
                'action': 'get_galleries'
            },
            dataType: 'JSON',

            success: function(data) {
                //console.log(data);

                if (data) {
                    var galleryHtml = "";
                    for (var i = 0; i < data.length; i++) {
                        galleryHtml += '<div class="form-row" data-gallery-id="' + data[i]['id'] + '">' +
                            '   <div class="checkbox-option active">' +
                            '       <div class="checkbox-button"></div>' +
                            '       <div class="checkbox-label">' + data[i]['name'] + '</div>' +
                            '   </div>' +
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

        // EDIT POST PAGE
        if (currentPage === 'edit-post') {

            // get the post
            $.ajax({
                url: ajaxUrl,
                data: {
                    'action': 'get_oculizm_post',
                    'post_id': post_id
                },
                dataType: 'JSON',

                success: function(data) {
                    console.log(data);
                    
                    singlePostProducts = data['products'];

                    // global variable disappears as soon as the user leaves the page
                    allProducts = window.allClientProducts;
                    
                    if (data) {
                        if (data.error) {
                            showPopup(data.error, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
                            $('.content-block').hide();
                        }

                        if ((data['post_status']) && (document.referrer.endsWith("/create/"))) {
                            showPopup("Post published successfully and will be live within an hour.", new Array({ 'action': 'close-popup', 'text': 'Ok' }));
                        }

                        // check if post has tagged products
                        if (singlePostProducts) {
                            if (singlePostProducts.length > 0) {

                                // check if each tagged product if exist in the DB
                                for (var i=0; i<singlePostProducts.length; i++) {
                                    
                                    var productExist = false; 
                                    for (var j=0; j<allProducts.length; j++) {
                                        if (singlePostProducts[i]['product_id'] == allProducts[j]['productId']) {
                                            productExist = true;
                                            break;
                                        }
                                    }
                                    // product does not exist in DB
                                    if (productExist === false) break;
                                }
                                
                                // add a warning below the title if some products is missing in the DB
                                if (productExist === false){
                                    showPopup("Warning: This post contains stale products.", new Array({ 'action': 'close-popup', 'text': 'Ok' }));
                                }
                            }
                        }

                        post = data;

                        // set the page title
                        var parser = new DOMParser();
                        var unescapedPostTitle = parser.parseFromString(`<!doctype html><body>${post['post_title']}`, 'text/html').body.textContent;
                        $('h1').text("Edit post: " + unescapedPostTitle);

                        // determine post status summary
                        var post_status = post['post_status'];
                        var logins_number = post['logins_number'];
                        var user_has_posts = post['user_has_posts'];
                        var post_status_value = post['date'];
                        post_status_value = moment.unix(post_status_value).format("HH:mm DD MMMM YYYY");
                        var post_status_description;
                        var publish_label = "Publish Now";
                        var update_post = moment.unix(post['date']).format("YYYY/MM/DD H:m");

                        if (post['source_url']) {
                            var sourceLink = "<a class='external-link' target='_blank' href='" + post['source_url'] + "'>" + post['source_url'] + "</a>";
                            $('.form-row[name=source-url] .form-value').html(sourceLink);
                            $('.form-row[name=source-url]').show();
                        }

                        // tooltip for first time users and non video posts
                        if (((logins_number <= 1) || (user_has_posts == false)) && (!post['video_url']) ) {
                            $(".media-preview").each(function(index) {
                                $(this).tooltip({
                                    tooltipClass: "rich-tooltip",
                                    position: { collision: 'none' },
                                    hide: true
                                });   
                            });

                            //changing the tooltip normal hover behavior

                            //prevent tooltip hiding on mouseleave 
                            $(".media-preview").tooltip().tooltip("open").off("mouseleave");

                            //adding a close button to the tooltip
                            $('.rich-tooltip').append($('<span>X</span>'));

                            //hiding the tootltip when clicking close button
                            $('body').on('click', '.rich-tooltip span', function() {
                                $(".media-preview").tooltip().tooltip("close");
                            });
                        }

                        // hide tooltip for video posts
                        if(post['video_url']){
                            const mediaPreview = document.querySelector('.media-preview');
                            mediaPreview.setAttribute('title', '');
                        }

                        if (post_status == "draft") {
                            post_status_description = "Draft date :";
                        }
                        if (post_status == "publish") {
                            post_status_description = "Publish date :";
                            publish_label = "Save changes";
                            $('.publish-option[name=future-publish]').hide();
                        }
                        if (post_status == "future") {
                            post_status_description = "Scheduled publish date :";
                        }
                        $('.content-block[name=status] .cta-primary[data-action=publish]').text(publish_label);
                        $('.content-block[name=status] .content-block-description').text(post_status_description + " " + post_status_value);

                        // check if the media URL is valid (sometimes the image is broken)
                        var mediaUrlToCheck;
                        if (!post['video_url']) {
                            mediaUrlToCheck = post['image_url'];
                        }
                        else mediaUrlToCheck = post['video_url'];

                        // set up the form data
                        var parser = new DOMParser();
                        var unescapedPostTitle = parser.parseFromString(`<!doctype html><body>${post['post_title']}`, 'text/html').body.textContent;
                        $('.form-row[name=post-title] input').val(unescapedPostTitle);
                        $('.form-row[name=post-caption] textarea').html(post['caption']);
                        $('.form-row[name=image-alt-text] textarea').html(post['image_alt_text']);

                        // more meta
                        var post_status_message = "";

                        // hide both media templates
                        $('.main-image, .main-video').hide();

                        // set media preview background
                        $('.media-background').attr('src', post['image_url']);

                        // image
                        $('.img-bg').attr('src', post['image_url']);
                        var media_html;
                        if (!post['video_url']) {
                            originalImgSrc = post['image_url'];
                            $('.main-image-actual').attr('src', originalImgSrc);
                            $('.rich-button').show();

                            // show it
                            $('.main-image').css('display', 'block');
                            $('.form-row[name=image-alt-text]').css('display', 'block');
                        }

                        // video
                        else {
                            var video = $(".main-video .video").get(0);
                            video.src = post['video_url'];

                            // show it
                            $('.main-video').css('display', 'block');
                            $('.form-row[name=image-alt-text]').css('display', 'none');
                        }


                        // set up products
                        setTimeout(function() {
                            initPostProducts(post['products']);
                        }, 500);

                        // if there are already products, update products content block UI
                        if (post['products']) {
                            $('.content-block[name=products] .content-block-description').remove();
                            // $('.tabs[name=product-matcher] .tab-headers').show();
                        }

                        // pinned post
                        if (post['pinned_post']) $('.form-row[name=visibility] .checkbox-option').addClass('active');

                        // galleries
                        setTimeout(function() {
                            if (post['galleries']) {
                                $('.content-block-body[name=post-galleries] .form-row .checkbox-option').removeClass('active');
                                for (var i = 0; i < post['galleries'].length; i++) {
                                    if (post['galleries'][i]) {
                                        $('.form-row[data-gallery-id=' + post['galleries'][i] + '] .checkbox-option').addClass('active');
                                    }
                                }
                            }
                        }, 1000);

                        // show the delete post section
                        $('.content-block[name=delete-post]').show();
                    }

                },
                error: function(errorThrown) {
                    console.log(errorThrown);
                    showPopup(errorThrown.statusText, new Array({ 'action': 'close-popup', 'text': 'Ok' }));
                },
                complete: function() {
                    hideFullScreenLoader();
                }
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