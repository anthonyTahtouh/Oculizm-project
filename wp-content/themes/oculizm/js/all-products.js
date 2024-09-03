(function ($) {

    jQuery(document).ready(function() {

        // define variables
        var products;
        var totalProducts;
        var allClientProducts;
        var productFeeds;
        var mainRegion;
        var all_region_codes = ["gb", "fr", "de", "ch", "au", "at", "ca", "it", "us", "ar", "se", "dk", "es"];
        var ppgTag = "";
        var ppgXMLFeed = "";
        var supplied_product_id = 0;

        // update page heading
        function updateHeading() {
            $('h1').html('All Products (' + totalProducts + ')');
        }

        // populate the product details modal
        function populateProductLightbox(product_id, client_id) {

            var p = products.find(obj => {
                return obj.product_id === product_id
            });

            // Funky Chunky Furniture matches on SKU
            if (client_id == '71950') {
                var p = products.find(obj => {
                    return obj.sku === product_id
                }); 
            }

            // if we've clicked on a search result we need to get the product details of THAT product,
            // and it won't necessarily be found in the products array if it's not showing on this page already
            // so we need to search the global variable of product search results
            if (!p) {
                p = allClientProducts.find(obj => {
                    return obj.product_id === product_id
                });
            }

            // get all region codes where _title is defined
            // https://stackoverflow.com/questions/34488829/get-all-values-from-an-object-whos-key-ends-with-a-particular-pattern
            if (!p) {
                showPopup("Product ID does not exist", new Array({ 'action': 'close-popup', 'text': 'Ok' }));
                return;
            }
            p_regions = $.map(Object.keys(p), function(val, i) {
                if (val.indexOf("_title") != -1 && p[val] != undefined) {
                    return val.substring(0, 2);
                }
            });

            // for each region that this product supports...
            for (var j = 0; j < p_regions.length; j++) {

                // set the modal title to be the first region's product title
                var parser = new DOMParser();
                var unescapedProductTitle = parser.parseFromString(`<!doctype html><body>${p[p_regions[0] + "_title"]}`, 'text/html').body.textContent;
                $('.form-overlay[name=product-details] h2').text(unescapedProductTitle);

                var regionTabHeader = "";
                var regionTabBody = "";

                // get this region's flat file data
                var myf = function(a) {
                    return a[0].toLowerCase() === p_regions[j];
                }
                var r = regions_array.filter(myf)[0];

                // create the HTML for that region
                regionTabHeader += "<div class='tab-header' product_id='" + product_id + "' name='" + p_regions[j] + "'  title='" + r[4] + "'>" + r[2] + "</div>";
                regionTabBody += "<div class='tab-body' name='" + p_regions[j] + "'>" +
                    "   <div class='product-title'>" + p[p_regions[j] + "_title"] + "</div>" +
                    "   <div class='product-price'>" + r[3] + Number(p[p_regions[j] + "_price"]).toFixed(2) + "</div>" +
                    "   <div class='product-price-strikeout'>" + r[3] + Number(p["price_strikeout"]).toFixed(2) + "</div>" +
                    "   <a target='_blank' class='product-link' href='" + p[p_regions[j] + "_link"] + "'>" + p[p_regions[j] + "_link"] + "</a>" +
                    "</div>";
                
                // PPG tag
                var injected_product = ppgTag.replaceAll("INSERT_PRODUCT_ID", product_id);
                injected_product = ppgTag.replaceAll("productID: '{{product.id}}',   region: ''", " productID: '" + product_id + "',   region: '" + p_regions[0] + "'");
                $('.form-row[name=ppg-tag] textarea').val(injected_product);

                // XML feed
                var xml_feed_product = ppgXMLFeed.replaceAll("INSERT_PRODUCT_ID", product_id);
                $('.form-row[name=ppg-xml-feed] textarea').val(xml_feed_product);

                // GraphQL feed
                var graphql_feed = "https://app.oculizm.com/graphql?query=query { posts(first: 1000, where: {mpid1: \"" + product_id + "\", clientId: \"" + client_id + "\"}) { nodes { clientId databaseId title content featuredImage { node { id sourceUrl } } postFields { fieldGroupName galleries imageAltText isVideo matchedProducts { gbLink gbPrice gbTitle productId productName productPrice productUrl sku x y } socialNetwork sourceUrl } } } }";
                $('.form-row[name=ppg-graphql-feed] textarea').val(graphql_feed);

                // if there are product feeds...
                if (productFeeds.length > 0) {
                    let myr = searchArrayForRegion(p_regions[j].toUpperCase(), productFeeds);
                    let shopLink = myr['shop_link'];
                    let productReviewLink = shopLink + "?oclzm=rc&oculizm_pid=" + product_id;
                    $('div[name=product-review-form-link] input').val(productReviewLink);
                    $('div[name=product-review-form-link] input').attr('value', productReviewLink);
                }

                $('.tab-headers').append($(regionTabHeader));
                $('.tab-bodies').append($(regionTabBody));
            }

            // select the first tab
            $('.tabs[name=product-regions] .tab-header:nth-of-type(1)').trigger('click');

            // set other HTML fields
            $('.product-image img').attr('src', p.image_link);
            if (p.availability != 1) $('div[name=availability]').html('<span class="red">Out of stock</span>');
            else $('div[name=availability]').html('<span class="italic">In stock</span>');

            $.ajax({
                url: ajaxUrl,
                data: {
                    'action': 'get_product_posts',
                    'product_id': product_id
                },
                dataType: 'JSON',
                success: function(data) {
                    console.log(data);

                    posts = data;

                    // if there are tagged posts...
                    if (posts.length > 0) {

                        $(".form-row[name=ppg-preview] .preview-area").empty();

                        // build the HTML
                        var postHtml = "";

                        // for each post...
                        for (var i = 0; i < posts.length; i++) {

                            // image
                            if (posts[i].video_url === false) {
                                postHtml += '<div class="saved-post" data-post-id="' + posts[i].post_id + '"><div class="post-inner"><img class="image-fill" src="' + posts[i].image_url + '"></div></div>';
                            }
                            // video
                            else {
                                postHtml += '<div class="saved-post" data-post-id="' + posts[i].post_id + '"><div class="post-inner"><video class="video"><source src="' + posts[i].video_url + '" type="video/mp4">Your browser does not support the video tag.</video><div class="video-icon"></div></div></div>';
                            }
                        }
                        $(postHtml).hide().appendTo(".form-row[name=ppg-preview] .preview-area").show();

                        // set the PPG preview button href
                        $('body').find('a[data-action=show-preview]').attr('href', '../as-seen-on-preview/?product_id=' + product_id);

                        // update UI
                        $('.form-row[name=no-data]').hide();
                        $('.form-row[name=ppg-preview]').show();
                        $('.form-row[name=ppg-preview-button]').show();
                    }

                    else {
                        //update UI
                        $('.form-row[name=no-data]').show();
                        $('.form-row[name=ppg-preview]').hide();
                        $('.form-row[name=ppg-preview-button]').hide();
                    }
                },
                error: function(errorThrown) {
                    console.log(errorThrown);
                },
                complete: function() {
                    squareImageContainers();
                    makeImagesFillContainers();
                }
            });

            // open product overlay
            $('.form-overlay[name=product-details]').fadeIn();
        }

        // clicking on a product listing
        $('body').on('click', '.product-item, .matched-product-item', function(e) {

            // destroy old data
            $('.tab-headers, .tab-bodies').empty();
            
            var client_id = $(this).attr('data-client-id');

            // get the product ID
            var product_id = $(this).attr('data-product-id');
            if (!product_id) product_id = $(this).closest('.product-item').attr('data-product-id');

            // get the sku
            var sku = $(this).attr('data-product-sku');
            if (!sku) sku = $(this).closest('.product-item').attr('data-product-sku');

            // // Funky Chunky Furniture uses the SKU
            // if (client_id == '71950') {
            //     populateProductLightbox(sku, client_id);
            // }
            // else {
            //     populateProductLightbox(product_id, client_id);
            // }
            populateProductLightbox(product_id, client_id);
        });

        // prevent clicking on this page number
        $('body').on('click', '.page-button.active', function(e) {
            e.preventDefault();
        });

        // preview gallery in a modal
        $('body').on('click', '.form-row[name=ppg-preview-button]', function(e) {
            e.preventDefault();

            //clear any previous posts
			$('div[name=tag-preview]').empty();

            //Making the desktop view the default display
            $('div[name=tag-preview] .post-grid-container').removeClass('mobile-view');
            const desktopIcon = document.querySelector('img[data-view="desktop"]');
            const mobileIcon = document.querySelector('img[data-view="mobile"]');
            desktopIcon.classList.add('active');
            mobileIcon.classList.remove('active');

            var productId = $('body').find('a[data-action=show-preview]').attr('href').split('=')[1];

            if (!productId) return;
    
            var ppgTagUrl = site_url + "/wp-content/uploads/" + clientID + "_as-seen-on.js";
            var ppgInitCall = "jQuery('#oclzmAsSeenOn').oculize({" +
                "   productID: '" + productId + "'," +
                "   region: ''" +
                "});";
            var ppgTag = "<script id='oculizm_aso_script'>\n" +
                "   var OCULIZM_ASO_PARENT=jQuery('script#oculizm_aso_script').parent();\n" +
                "   OCULIZM_ASO_PARENT.append('<div id=\"oclzmAsSeenOn\"></div>');\n" +
                "   jQuery.getScript('" + ppgTagUrl + "',function(script,textStatus,jqXHR ){\n" +
                "       if(textStatus==='success') " + ppgInitCall + " \n" +
                "   });\n" +
                "</script>\n";
    
            $('div[name=tag-preview]').append(ppgTag);
            $('div[name=tag-preview-header] h3').text('Product ID: ' + productId );

            // close the parent overlay
            $('.form-overlay[name=product-details').fadeOut();
            // open the overlay
			$('.form-overlay[name=ppg-preview').fadeIn();
        });

        // change PPG code if new tab region selected
        $('body').on('click', '.tab-header', function(e) {

            var productId = $(this).attr('product_id');
            var region = $(this).attr('name');

            // change textarea
            var injected_product = ppgTag.replaceAll("productID: '{{product.id}}',   region: ''", " productID: '" + productId + "',   region: '" + region + "'");
            $('.form-row[name=ppg-tag] textarea').val(injected_product);
        });

        // window resize events
        $(window).resize(function() {
            squareImageContainers();
            makeImagesFillContainers();
        });


        // MAIN THREAD
        
        var urlParams = new RegExp('[\?&]product_id=([^&#]*)').exec(window.location.href);
        if (urlParams) supplied_product_id = urlParams[1] || 0;

        $('.post-grid-container .loader').show();
        
        // get product feeds
        $.ajax({
            url: ajaxUrl,
            type:'get',
            data:{
                'action':'get_product_feeds'
            },
            dataType: 'JSON',

            success:function(data) {
                console.log(data);

                productFeeds = data;
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

        // get products
        $.ajax({
            url: ajaxUrl,
            data: {
                'action': 'get_products',
                'page': page_num
            },
            dataType: 'JSON',
            success: function(data) {
                console.log(data);

                totalProducts = data['total'];
                updateHeading();

                products = data['products'];
                allClientProducts = data['allClientProducts'];
                if (allClientProducts.length > 0) {
                    mainRegion = data['region'].toLowerCase();
                }
                

                ppgTag = "<!-- Oculizm product page gallery tag start -->\n";
                ppgTag += "<script id='oculizm_aso_script'>\n";
                ppgTag += "var OCULIZM_ASO_PARENT=jQuery('script#oculizm_aso_script').parent();\n";
                ppgTag += "OCULIZM_ASO_PARENT.append('<div id=\"oclzmAsSeenOn\"></div>');\n";
                ppgTag += "jQuery.getScript('" + data['asoScriptURL'] + "',function(script,textStatus,jqXHR ){\n";
                ppgTag += "  if(textStatus==='success') " + data['asoCall'] + " \n";
                ppgTag += "});\n";
                ppgTag += "</script>\n";
                ppgTag += "<!-- Oculizm product page gallery tag end -->\n";

                ppgXMLFeed = data['asSeenOnXMLFeed'];

                if (products.length > 0) {

                    $('.count').html(commaInt(data['total']));

                    // pagination
                    var numPages = Math.ceil(data['total'] / data.limit);
                    if (numPages > 1) {
                        var buttonsHtml = "";
                        for (var i = 0; i < numPages; i++) {
                            var activeClass = "";
                            if (page_num == (i + 1)) activeClass = "active";
                            buttonsHtml += "<a href='" + site_url + "/all-products/?page_num=" + (i + 1) + "' class='page-button " + activeClass + "'>" + (i + 1) + "</a>";
                        }
                        var paginationHtml = "<div class='pagination'>" + buttonsHtml + "</div>";

                        $('.content-block-header, .content-block-footer').append($(paginationHtml));
                        $('.content-block-header, .content-block-footer').show();
                    }

                    // for each product...
                    for (var i = 0; i < products.length; i++) {

                        var p = products[i];

                        allClientProducts

                        // determine availability
                        var availabilityHtml = "";
                        if (p.availability == "2") availabilityHtml = "<div>Preorder</div>";
                        else if (p.availability != "1") availabilityHtml = "<div class='red'>Out of stock</div>";

                        // get the title
                        var title = p[mainRegion + "_title"];
                        // if the title for the main region is blank then cycle through the other regions until we find a valid title
                        if (!title || title == null || title == 'null') {
                            for (var region = 0; region < all_region_codes.length; region++) {
                                var regional_title = all_region_codes[region] + "_title";
                                if (p[regional_title] && p[regional_title] != null && p[regional_title] != 'null') {
                                    title = p[regional_title];
                                    break;
                                }
                            }
                        }
                        
                        // build matching posts label
                        var matchingPosts = '';
                        if (p['num_tagged_posts'] != "0" ) {
                            var matchingPosts ='   <div class="product-attributes-overlay">' +
                            '       <div class="label-icon"><span>' + p['num_tagged_posts'] + '</span></div>' +
                            '   </div>';
                        }

                        // show products
                        var productOption = '<div data-matching-posts="' + p['num_tagged_posts']  + '" data-product-id="' + p['product_id'] + '" data-product-sku="' + p['sku'] + '" data-client-id="' + p['client_id'] + '" class="product-item">' +
                            '   <img src="' + p['image_link'] + '">' +
                            matchingPosts +
                            '   <div class="product-title">' + title + availabilityHtml + '</div>' +
                            '   <div class="regions"></div>' +
                            '</div>';

                        $('.post-grid').append(productOption);
                    }

                    // if a product ID was supplied, show it in the pop up
                    var client_id = data['client_id'];
                    if (supplied_product_id) {
                        populateProductLightbox(supplied_product_id, client_id);
                    }
                }

                else {
                    // $('.post-grid').append($('<div class="no-data">Nothing to show</div>'));
                    $('.product-matcher').hide();
                    sampleData(".post-grid" , "all-products");
                }
            },
            error: function(errorThrown) {
                console.log(errorThrown);
            },
            complete: function() {
                $('.post-grid-container .loader').hide();
            }
        });

    });

}(jQuery));