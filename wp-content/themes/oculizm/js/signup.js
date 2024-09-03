
(function($) {

    jQuery(document).ready(function() {


        // signup form package selection
        $('body').on('click', '.package', function(e) { // tested with window on load and DOMContentLoaded and none (to wait for the form load )of them works
            let col = $(this).closest('.forminator-col');
            let classes = col.attr('class').split(' ');
            let package;
            for (var i=0; i<classes.length; i++) {
                if (classes[i].startsWith('package')) package = classes[i];
            }
            let packageNumber = package.substring(8,9);
            $('#forminator-field-radio-1-label-' + packageNumber + ' input').trigger('click');
            setTimeout(equalHeights, 300); // because some packages are longer than others

        });

        // Forminator pagination callback
        $(document).on( 'forminator.front.pagination.move', function( e ) {
            setTimeout(equalHeights, 500);
        });

        // signup form payment method event
        $('body').on('click', '#radio-2 label', function(e) {
            let i = $(this).index();
            $('#radio-2 label').css('opacity', '0.5');
            $('#radio-2 label:nth-of-type(' + i + ')').css('opacity', '1.0');
        });

        function radio_triggered_code( option ) {
            console.log('radio_triggered_code');
            equalHeights();
        }

        $(document).on('after.load.forminator', function(e) {

            $('#radio-1 input[type=radio]').change(function() {
                radio_triggered_code( this.value );
                return;
            });
            
        });



    });


}(jQuery));

