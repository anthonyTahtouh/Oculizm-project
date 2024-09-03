
// THESE NEED TO STAY HERE!
var currentPage;
var socialNetwork;
var regions_array = [];
var productSearchResults;
var clientID;
var user_prefs;
var maintenanceMode = false;
var headerCreated = false;
var currentUrl = window.location.href;
var urlParams = new URLSearchParams(window.location.search);

(function($) {

    jQuery(document).ready(function() {





        /************************************************
        *                                               *
        *                                               *
        *            GLOBAL JQUERY FUNCTIONS            *
        *                                               *
        *                                               *
        ************************************************/

        // resize sidebar function
        function resizeSidebar() {
            var h = Math.max(500, $(window).height());
            $('.sidebar').outerHeight(h);
        }

        // set menu item open/close statuses
        function initialise_menu_states() {

            // go through each top level menu item...
            var parentMenuItems = document.querySelectorAll('.menu > li');
            for (var i = 0; i < parentMenuItems.length; i++) {

                // if this menu item has a submenu...
                var subMenu = parentMenuItems[i].querySelector('ul');
                if (subMenu) {

                    // get this menu item's attributes
                    var parentLink = parentMenuItems[i].querySelector('.menu-item-group-name');
                    let menuItemName = $(parentMenuItems[i]).attr('name');
                    
                    // if this user has preferences...
                    if (user_prefs) {

                        // get this menu item's user preference
                        let menuItemStatus = user_prefs['menu_expanded_' + menuItemName];

                        // if it's set to open, open it
                        if (menuItemStatus == 1) {
                            subMenu.classList.add('active');
                            parentLink.classList.add('open');
                        }
                    }

                    // if there are no user preferences for this user, just leave all menu items open
                    else {
                        subMenu.classList.add('active');
                        parentLink.classList.add('open');
                    }
                }
            }
        }

        // equal heights
        jQuery._equalHeights = function() {
            var h = 0;
            $('.eqh').each(function() {
                $(this).height('auto');
                if ($(this).outerHeight() > h) h = $(this).outerHeight();
            });
            $('.eqh').height(h);
        };
        
        

        // get the current page template
        jQuery._setLocalVariables = function() {

            // new way of getting the current page
            let currentUrlNoParams = currentUrl.substring(0, currentUrl.lastIndexOf('/')); // remove URL params
            currentUrlNoParams = currentUrlNoParams.replace(/\/$/, ''); // remove the trailing '/'
            currentPage =  currentUrlNoParams.substring(currentUrlNoParams.lastIndexOf('/') + 1); // get the last slug
            if (site_url.indexOf(currentPage) != -1) currentPage = 'summary'; // the homepage is the summary page
            
            // set the active menu item
            $('li[name=' + currentPage + ']').addClass('active');

            // determine the social network if we're on a social network page
            if (currentPage.includes('instagram')) socialNetwork = "instagram";
            if (currentPage.includes('facebook')) socialNetwork = "facebook";
            if (currentPage.includes('twitter')) socialNetwork = "twitter";
            if (currentPage.includes('tiktok')) socialNetwork = "tiktok";
        };

        // show the loader
        jQuery._showFullScreenLoader = function() {
            $('.loading-overlay').fadeIn();
        };

        // hide the loader
        jQuery._hideFullScreenLoader = function() {
            $('.loading-overlay').fadeOut();
        };

        // show a popup
        jQuery._showPopup = function(text, buttons) {
            $('.popup-text').html(text);
            var buttonsHtml = '';
            for (var i = 0; i < buttons.length; i++) {
                buttonsHtml += '<a href="#" class="cta-secondary" data-action="' + buttons[i].action + '">' + buttons[i].text + '</a>';
            }
            $('.popup-overlay .cta-group').empty().append(buttonsHtml);

            // show overlay
            $('.popup-overlay').fadeIn();
            $('body').addClass('no-scroll');

            // set the focus
            $('.popup-overlay .cta-group a').focus();
        };

        // make images fill their containers
        jQuery._makeImagesFillContainers = function() {
            $('.image-fill').on('load', function() {
                var aspect = ($(this).get(0).width / $(this).get(0).height); // .width() and .height() don't work in a hidden container
                $(this).css({ 'width': 'auto', 'height': 'auto' });
                if (aspect > 1) { // landscape
                    $(this).css('width', '100%');
                    $(this).css('height', '100%');
                    $(this).css('object-fit', 'cover');
                    // $(this).css('left', '-50%');
                }
                if ($(this).parent().hasClass('product-inner')) {
                    $(this).css('height', '87%');
                    $(this).css('width', '100%');
                }
                 else { // portrait
                    $(this).css('width', '100%');
                }
            }).each(function() {
                if (this.complete) $(this).trigger('load');
            });
        };

        // square image containers
        jQuery._squareImageContainers = function() {
            $('.post-inner').each(function() {
                var w = $(this).width();
                $(this).css('height', w + 'px');

                // TikTok auto size videos
                if ($(this).parent().attr('data-social-network') == "tiktok") {
                    var aspect_ratio = $(this).parent().attr('data-aspect-ratio');
                    var newHeight = $(this).height()/aspect_ratio;
                    $(this).height(newHeight);
                }
            });
            $('.product-inner').each(function() {
                var w = $(this).width();
                $(this).css('height', w + 'px');
            });
        };

        // create a screenshot of a video
        jQuery._getVideoThumbnail = function(video, scaleFactor) {
            if (scaleFactor === null) scaleFactor = 1;
            var w = video.videoWidth * scaleFactor;
            var h = video.videoHeight * scaleFactor;
            var canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, w, h);
            return canvas;
        }


        /************************************************
        *                                               *
        *                                               *
        *                 GLOBAL EVENTS                 *
        *                                               *
        *                                               *
        ************************************************/

        // Close the open menu by clicking outside any top bar menus
        $(document).on('click', function(e) {

            // Check if clicked outside any menu
            if (!$(e.target).closest('.notifications-menu, .user-menu, .admin-menu').length) {

              // Hide all menus
              $('.notifications-menu, .user-menu, .admin-menu').slideUp();

              // Remove active class from all icons
              $('.notifications-menu-icon, .user-menu-icon, .admin-menu-icon').removeClass('active');
            }
          });

        // open/close notifications menu
        $('body').on('click', '.notifications-menu-icon', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // close the other menus
            $('.admin-menu').hide();
            $('.admin-menu-icon').removeClass('active');
            $('.user-menu').hide();
            $('.user-menu-icon').removeClass('active');

            if ($('.notifications-menu-icon').hasClass('active')) {
                $('.notifications-menu').slideUp();
                $('.notifications-menu-icon').removeClass('active');
            }
            else {
                $('.notifications-menu').slideDown();
                $('.notifications-menu-icon').addClass('active');
            }
        });

        // open/close user menu
        $('body').on('click', '.user-menu-icon', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // close the other menus
            $('.admin-menu').hide();
            $('.admin-menu-icon').removeClass('active');
            $('.notifications-menu').hide();
            $('.notifications-menu-icon').removeClass('active');

            if ($('.user-menu-icon').hasClass('active')) {
                $('.user-menu').slideUp();
                $('.user-menu-icon').removeClass('active');
            }
            else {
                $('.user-menu').slideDown();
                $('.user-menu-icon').addClass('active');
            }
        });

        // open/close admin menu
        $('body').on('click', '.admin-menu-icon', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // close the other menus
            $('.user-menu').hide();
            $('.user-menu-icon').removeClass('active');
            $('.notifications-menu').hide();
            $('.notifications-menu-icon').removeClass('active');

            if ($('.admin-menu-icon').hasClass('active')) {
                $('.admin-menu').slideUp();
                $('.admin-menu-icon').removeClass('active');
            }
            else {
                $('.admin-menu').slideDown();
                $('.admin-menu-icon').addClass('active');
            }
        });



        // maintenance mode switch
        $('body').on('click', '.switch[name=maintenance-mode] .switch-track', function(e) {
            e.preventDefault();

            var theSwitch = $(this).parent();

            // set the element attribute
            if (theSwitch.attr('data-status') == "true") theSwitch.attr('data-status', "false");
            else theSwitch.attr('data-status', "true");

            showFullScreenLoader();

            // get the new attribute value
            maintenanceMode = theSwitch.attr('data-status');

            // send it to the back end
            $.ajax({
                url: ajaxUrl,
                data: {
                    'action': 'set_system_option',
                    'setting_name': 'maintenance_mode',
                    'setting_value': maintenanceMode
                },
                dataType: 'JSON',

                success: function(data) {
                    console.log(data);

                    if (data == "1") {
                        console.log('Maintenance mode set to: ' + maintenanceMode);
                    }
                    else {
                        console.log('Nothing changed');
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                },
                complete: function() {
                    hideFullScreenLoader();
                }
            });
        });

        // form overlay close button
        $('body').on('click', '.form-overlay .close', function(e) {
            e.preventDefault();
            $(this).closest('.form-overlay').fadeOut('fast');
            $('body').removeClass('no-scroll');

             // also stop any video playing
             if ($(".video").length > 0) {
                $(".video").get(0).pause();
                $(".main-video .video-icon").fadeIn();
            }
        });

        // form overlay background click
        $('body').on('click', '.form-overlay .overlay-bg', function(e) {

            if (maintenanceMode == "true") {
                if ($('body').hasClass('editor')) return;
            }

            e.preventDefault();
            $(e.currentTarget).parent(".form-overlay").fadeOut(); //only close the latest modal opened
            $('body').removeClass('no-scroll');

            // also stop any video playing
            if ($(".video").length > 0) {
                $(".video").get(0).pause();
                $(".main-video .video-icon").fadeIn();
            }
        });

        // popup overlay close button
        $('body').on('click', '.popup-overlay a[data-action=close-popup]', function(e) {
            e.preventDefault();
            $('.popup-overlay').fadeOut();
            $('body').removeClass('no-scroll');
        });

        // popup overlay background click
        $('body').on('click', '.popup-overlay .overlay-bg', function(e) {

            if (maintenanceMode == "true") {
                if ($('body').hasClass('editor')) return;
            }

            e.preventDefault();
            $('.popup-overlay').fadeOut();
            $('body').removeClass('no-scroll');
        });

        // radio button functionality
        $('body').on('click', '.radio-option', function(e) {
            e.preventDefault();

            $(this).closest('.form-row').find('.radio-option').removeClass('active');
            $(this).addClass('active');
        });

        // checkbox functionality
        $('body').on('click', '.checkbox-button', function(e) {
            e.preventDefault();
            $(this).closest('.checkbox-option').toggleClass('active');
        });

        // expand and collapse / accordion / dropdown buttons
        $('body').on('click', '.expand-trigger', function (e) {
            var row = $(this).closest('.expandable-row');
            if (!row.hasClass('row-open')) {
                row.find('.expandable-content').slideDown();
            }
            else {
                row.find('.expandable-content').slideUp();
            }
            row.toggleClass('row-open');
            row.find('.chevron').toggleClass('chevron-down');
            row.find('.chevron').toggleClass('chevron-up');
        });

        // tab switching
        $('body').on('click', '.tab-header', function (e) {
            e.preventDefault();

            $(this).show(); // sometimes a hidden tab header click is triggered programmatically

            var tabs = $(this).closest('.tabs');
            var activeTabName = $(this).attr('name');

            // deactivate all tab headers
            tabs.find('.tab-header').removeClass('active');

            // deactivate and hide all tab bodies
            tabs.find('.tab-body').removeClass('active').hide();

            // show this tab header
            $(this).addClass('active');

            // show this tab body
            tabs.find('.tab-body[name=' + activeTabName + ']').addClass('active').show();
        });

        // mobile / desktop preview switcher
        $('body').on('click', '.device-options img', function (e) {
            if ($(this).attr('data-view') === 'mobile') $('div[name=tag-preview]').addClass('mobile-view');
            else $('div[name=tag-preview]').removeClass('mobile-view');

            $('.device-options img').removeClass('active');
            $(this).addClass('active');
        });

        // video controls
        $('body').on('click', '.main-video', function(e) {
            var vc = $(this);
            var video = $(this).children(".video").get(0);
            if (video.paused) {
                video.play();
                vc.children(".video-icon").fadeOut();
                video.onended = function(e) {
                    vc.children(".video-icon").fadeIn();
                };
            } else {
                video.pause();
                vc.children(".video-icon").fadeIn();
            }
        });

        // copy button
        $('body').on('click', '.button-copy', function(e) {
            e.preventDefault();

            let copyTarget;

            // first look for a nearby textarea
            if ($(this).closest('.form-row').find('textarea').length > 0) {
                copyTarget = $(this).closest('.form-row').find('textarea');
            }

            // else look for a nearby input
            else if ($(this).closest('.form-row').find('input').length > 0) {
                copyTarget = $(this).closest('.form-row').find('input');
            }

            // copy
            copyTarget.select();
            document.execCommand('copy');

            // show popup
            showPopup( 'Code copied to clipboard', new Array({'action': 'close-popup', 'text': 'Ok'}));
        });

        // open logout popup
        $('body').on('click', 'li[name=logout] a', function(e) {
            e.preventDefault();

            // create popup
            var buttons = new Array({ 'action': 'log-out', 'text': 'Log out' }, { 'action': 'close-popup', 'text': 'Cancel' });
            showPopup('Are you sure you want to log out?', buttons);
        });

        // confirm log out
        $('body').on('click', '.popup-overlay a[data-action=log-out]', function(e) {
            e.preventDefault();

            // destroy local storage items
            //localStorage remains as long as the user hasn't closed their browser, even if they leave the site and return to it later
            window.localStorage.removeItem('connections');

            //    location remains as long as the user hasn't closed their browser, even if they leave the site and return to it later
            window.location.href = $('li[name=logout] a').attr('href');
        });

        // change client
        $('body').on('change', '.client-list', function(e) {

            let newClientId = $(this).val();

            showFullScreenLoader();

            $.ajax({
                url: ajaxUrl,
                data: {
                    'action': 'update_user_client_id',
                    'new_client_id': newClientId
                },
                dataType: 'JSON',

                success: function(data) {
                    // console.log(data);

                    if (data == "0") {
                        // create popup
                        var buttons = new Array({ 'action': 'close-popup', 'text': 'Close' });
                        showPopup('Nothing updated.', buttons);
                    }
                    //location remains as long as the user hasn't closed their browser, even if they leave your site and return to it in a few minutes
                    if (data == "1") window.location.href = site_url;
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                },
                complete: function() {
                    hideFullScreenLoader();
                }
            });
        });

        // textarea height
        checkElement('textarea').then((selector) => {
            $('textarea').each(function() {
                let h = 120;
                if ($(this).hasClass('big-textarea')) h = 250;
                $(this).height(h);
            });
        });

        // demo mode
        $('body').on('click', '.switch[name=demo-mode] .switch-track', function(e) {

            var demoModeToggle = $(this).parent('.switch[name=demo-mode]');
            var demoModeStatus = demoModeToggle.attr('data-status');
            demoModeToggle.attr('data-status', demoModeStatus === 'true' ? 'false' : 'true');
            sessionStorage.status = demoModeStatus === 'true' ? 'false' : 'true';

            if ($('.switch[name=demo-mode]').attr('data-status') === 'true') demoMode = true;
            else demoMode = false;
            sessionStorage.setItem('demoMode', demoMode);

            // Summary
            if ($('.metric-box-container[name=summary]').is(':visible')) {
                $('.metric-highlight ').hide();
                $('.metric-description').hide();
                $('.metric .loader').show();
                fetchSummaryStats();
            }

            // Sales
            if ($('.chart-container[name=orders]').is(':visible')) {
                $(".tabs[name=ordersByRegion] .tab-headers").empty();
                $(".tabs[name=ordersByRegion] .tab-bodies").empty();
                $(".tabs[name=revenueByRegion] .tab-headers").empty();
                $(".tabs[name=revenueByRegion] .tab-bodies").empty();
                $('.content-block[name=orders] .loader').show();
                $('.content-block[name=revenue] .loader').show();
                fetchSalesStats();
            }

            // Orders
            if ($('.content-block[name=orders-list]').is(':visible')) {
                $('table[name=orders] tbody tr').remove(); 
                $('.content-block-body table[name=orders]').hide();
                $('.content-block[name=orders-list] .content-block-body .loader').show();
                fetchOrderStats(false);
            }
        });

        // Firefox doesn't track mousewheel events properly so we use this. Do not edit!
        $('.form-overlay').on('DOMMouseScroll mousewheel', function (event) { 
            if (event.originalEvent.detail > 0 || event.originalEvent.wheelDelta < 0) {
                //scroll down
                // console.log('Down');
            } else {
                //scroll up
                // console.log('Up');
            }
            return true;
        });

        // resize events
        $(window).resize(function() {

            // equal heights
            equalHeights();

            // resize sidebar
            resizeSidebar();

            // reselect active tabs
            $('.tabs').each(function() {
                if ($(this).find('.tab-header.active').length) {
                    $(this).attr('data-active-tab-index', $(this).find('.tab-header.active').index() + 1);
                }
                setTimeout(function() { 
                    $('.tabs').each(function() {
                        if ($(this).attr('data-active-tab-index') >= 1) {
                            var activeTabIndex = $(this).attr('data-active-tab-index');
                            $(this).find('.tab-header:nth-of-type(' + activeTabIndex + ')').trigger('click'); 
                        }
                    });
                }, 250);
            });
        });

        // key events
        $(document).keyup(function(e) {

            // Enter key
            if (e.which == 13) {
                if ($('.popup-overlay').is(':visible') && ($('.popup-overlay .cta-group a').length == 1)) {
                    $('a[data-action=close-popup]').trigger('click');
                }
            }

            // Escape key
            if (e.which == 27) {

                if (maintenanceMode == "true") {
                    if ($('body').hasClass('editor')) return;
                }

                // else if the user menu is showing...
                else if ($('.user-menu').is(':visible')) $('.user-menu-icon').trigger('click');
                
                // else if the notifications menu is showing...
                else if ($('.notifications-menu').is(':visible')) $('.notifications-menu-icon').trigger('click');
                
                // else if a popup is showing...
                else if ($('.popup-overlay').is(':visible')) $('a[data-action=close-popup]').trigger('click');
                
                // else if the crop overlay is open...
                else if ($('.form-overlay[name=crop-modal]').is(':visible')) $('.form-overlay[name=crop-modal] .close').trigger('click');

                // else if another form overlay is open...
                else if ($('.form-overlay').is(':visible')) $('.form-overlay .close').trigger('click');

                // if the product matcher is showing...
                else if ($('.product-search').is(':visible')) {

                    // remove active hotspot
                    $('.hotspot.active').remove();

                    // hide the product matcher message
                    $('.product-matcher-message').hide();

                    // reset the product search input element
                    $('.product-search').val('');

                    // empty fetched products
                    $('.product-search-results').html('');

                    // Products page
                    $(".post-grid-container, .pagination").fadeTo("fast", 1.0, function() {});

                    // if it's an image...
                    if ($('.main-image-actual').is(':visible')) {

                        // hide the product search input element
                        $('.product-search').hide();
                    }

                    // if it's a video...
                    else {
                        // and the product search input element is already empty, then the user probably wants to close the form overlay
                        if ($('.product-search').val() == "") $('.form-overlay .close').trigger('click');
                    }
                }
            }
            return false;
        });





        // MAIN THREAD
        if ($('body.logged-in').length) {

            // get region data
            $.getJSON(site_url + "/wp-content/themes/oculizm/data/regions.json", function(json) {
                $.each(json, function(key, val) {
                    regions_array.push([val.code, val.name, val.flag, val.currency, val.currency_code]);
                });
            });

            // get system options
            $.ajax({
                url: ajaxUrl,
                data: {
                    'action': 'get_system_options'
                },
                dataType: 'JSON',

                success: function(data) {
                    // console.log(data);

                    if (Array.isArray(data)) {
                        var newM;
                        for (var i=0; i<data.length; i++) {
                            if (data[i].setting_name == "maintenance_mode") maintenanceMode = data[i].setting_value;
                        }
                    }
                    if (maintenanceMode == "true") console.log("*** MAINTENANCE MODE IS ON ***");
                    
                    // set the switch UI
                    $('.switch[name=maintenance-mode]').attr('data-status', maintenanceMode);

                    // maintenance mode
                    if (maintenanceMode == "true") {
                        console.log(maintenanceMode);
                        if ($('body').hasClass('editor')) {
                            var buttons = new Array({ 'action': 'close-popup', 'text': 'Close' });
                            showPopup("The Oculizm curation platfrom is currently undergoing  maintenance and will be operational again in a few minutes. And don't worry, your website's shoppable gallery is still working as usual.", buttons);
                            $('.popup-overlay .cta-group').hide();
                        }
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                },
                complete: function() {}
            });

            // get user preferences
            $.ajax({
                url: ajaxUrl,
                data: {
                    'action': 'get_user_prefs'
                },
                dataType: 'JSON',

                success: function(data) {
                    console.log(data);

                    user_prefs = data;

                    initialise_menu_states();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                },
                complete: function() {}
            });

            // sidebar menu item event listeners
            var parentLinks = document.querySelectorAll('.menu-item-group-name');
            for (var i = 0; i < parentLinks.length; i++) {
                parentLinks[i].addEventListener('click', function() {

                    // get the menu item being clicked
                    var parent = this.parentNode;
                    let menuName = "menu_expanded_" + $(parent).attr('name');

                    // get the submenu to open/close
                    var subMenu = parent.querySelector('ul');
                    subMenu.classList.toggle('active');
                    this.classList.toggle('open');
                    let menuStatus = 0;
                    if ($(this).hasClass('open')) menuStatus = 1;

                    // save the open/close user preference in the DB
                    $.ajax({
                        url: ajaxUrl,
                        data: {
                            'action': 'set_user_pref',
                            'user_pref_name': menuName,
                            'user_pref_value': menuStatus
                        },
                        dataType: 'JSON',

                        success: function(data) {
                            // console.log(data);
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            console.log(errorThrown);
                        },
                        complete: function() {
                            hideFullScreenLoader();
                        }
                    });
                });
            }

            // initialise demo mode switch
            var demoModeStatus = sessionStorage.status === 'true'? true: false;
            $('.switch[name=demo-mode]').attr('data-status', demoModeStatus);
            let demoMode = false;
            if ($('.switch[name=demo-mode]').attr('data-status') === 'true') demoMode = true;
            sessionStorage.setItem('demoMode', demoMode);

            setLocalVariables();
            resizeSidebar();
            equalHeights();

            // Facebook Reviewer UI customisations
            if (clientID == "71948") {
                // $('.menu-item[name=analytics]').remove();
                // $('.menu-item[name=posts]').remove();
                // $('.menu-item[name=integration]').remove();
                // $('.menu-item[name=settings]').remove();
                // // $('.menu-item[name=instagram]').remove();
                // $('.menu-item[name=twitter]').remove();
                // $('.menu-item[name=tiktok]').remove();
                // $('.menu-item[name=upload]').remove();
            }
        }

        // Adblocker notice
        if (window.canRunAds === undefined ) {
            var adblockUsersMessage = " For best results please disable your ad blocking browser extension.";
            showPopup( adblockUsersMessage, new Array({'action': 'close-popup', 'text': 'ok'}));
        }

        // touch support
        var isTouch = !!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;
        if (isTouch) $('body').addClass('is-touch');

    });


}(jQuery));





/************************************************
*                                               *
*                                               *
*       GLOBAL JQUERY FUNCTION ACCESSORS        *
*                                               *
*                                               *
************************************************/

function equalHeights(container) {
    return jQuery._equalHeights(container);
}


function setLocalVariables() {
    return jQuery._setLocalVariables();
}

function showFullScreenLoader() {
    return jQuery._showFullScreenLoader();
}

function hideFullScreenLoader() {
    return jQuery._hideFullScreenLoader();
}

function showPopup(text, buttons) {
    return jQuery._showPopup(text, buttons);
}

function makeImagesFillContainers() {
    return jQuery._makeImagesFillContainers();
}

function squareImageContainers() {
    return jQuery._squareImageContainers();
}

function getVideoThumbnail(video, scaleFactor) {
    return jQuery._getVideoThumbnail(video, scaleFactor);
}



