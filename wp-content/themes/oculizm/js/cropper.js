(function ($) {

    jQuery(document).ready(function() {
        
        let cropper;
        const cropperCancel  = ".form-overlay[name=crop-modal] [data-cropper-cancel]";
        const cropperModal   = ".form-overlay[name=crop-modal]";
        const $cropperModal  = $(cropperModal);
        const $cropperImage  = $("img[name=cropper-image]");
        const $cropperSubmit = $(".form-overlay[name=crop-modal] [data-cropper-submit]");
        
        $('body').on('click', cropperCancel, function(e) {
            $(e.currentTarget).parents(cropperModal).fadeOut(); //only close the latest modal opened
        })
        
        // this element doesn't have a normal event handler so we had to create this to add preventDefault()
        $('body').on('click', '.rich-button[name=open-crop-modal]', function(e) {
            e.preventDefault();
        })

        // this element doesn't have a normal event handler so we had to create this to add preventDefault()
        $('body').on('click', '[data-cropper-cancel]', function(e) {
            e.preventDefault();
        })

        // this element doesn't have a normal event handler so we had to create this to add preventDefault()
        $('body').on('click', '[data-cropper-submit]', function(e) {
            e.preventDefault();
        })

        jQuery._openOculizmCropper = function(imgSrc, cb) {
            cropper && cropper.destroy();

            if(!imgSrc) {
                var buttons = new Array(
                    {'action': 'close-popup', 'text': 'Ok'}
                );
                showPopup("No image to crop", buttons);
                return;
            }

            $cropperModal.fadeIn();
            $cropperImage.attr("src", imgSrc);
            $cropperImage[0].onload = () => {
                //init cropper
                cropper = new Cropper($cropperImage[0], {
                    viewMode: 3,
                    zoomOnWheel: false,
                    crop(event) { },
                });
            }

            $cropperSubmit.one("click", () => {
                $cropperModal.fadeOut();
                cb(cropper.getCroppedCanvas().toDataURL("image/png"))
                $cropperImage[0].onload = undefined;
                cropper.destroy();
            })
        }
    });

    
}(jQuery));
