
(function($) {

    jQuery(document).ready(function() {

        let formHasErrors = false;

        // validate name
        jQuery._validateName = function(str) {
            var regex = /^[a-zA-Z ]{3,32}$/;
            return regex.test(str);
        }

        // validate email
        jQuery._validateEmail = function(str) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(str);
        };

        // validate password
        jQuery._validatePassword = function(str) {
            return str.length >= 8;
        };

        // validate a field
        jQuery._validateField = function(field) {

            // reset the field error state
            field.closest('.form-row').find('.error-message').remove();
            field.removeClass('input-error');

            // only validate a field if it has a validation rule
            if (field.attr('data-validation-rules')) {

                var validationPassed = false;
                if (field.is('textarea')) validationPassed = field.val().trim().length >= 4;
                else if (field.attr('type') == "text") validationPassed = validateName(field.val().trim());
                else if (field.attr('type') == "email") validationPassed = validateEmail(field.val().trim());
                else if (field.attr('type') == "password") {
                    validationPassed = validatePassword(field.val().trim());

                    //second check for password fields
                    if (validationPassed) {
                        if (field.attr('name') == 'password2') {
                            // get the firsrt password field
                            var password1_field = field.closest('.content-block-body').find('input[name=password1]');
                            validationPassed = $(password1_field).val().trim() == field.val().trim();
                        }
                    }
                }

                if (!validationPassed) {
                    var errorMessage = '<div class="error-message">' + field.attr('data-validation-rules') + '</div>';
                    field.closest('.form-row').append($(errorMessage));
                    field.addClass('input-error');
                    formHasErrors = true;
                }
            }
        };

        // validate a form
        jQuery._validateForm = function(trigger) {

            // reset the form error status
            formHasErrors = false;

            // get the form
            let formContainer = trigger.closest('.content-block-body');

            // validate this form's fields
            $(formContainer).find('input, textarea').each(function() {
                validateField($(this));
            });

            // error handling
            if (formHasErrors) return false;

            return true;
        };


    });

}(jQuery));

function validateName(str) {
    return jQuery._validateName(str);
}

function validateEmail(str) {
    return jQuery._validateEmail(str);
}

function validatePassword(str) {
    return jQuery._validatePassword(str);
}

function validateField(field) {
    return jQuery._validateField(field);
}

function validateForm(trigger) {
    return jQuery._validateForm(trigger);
}




