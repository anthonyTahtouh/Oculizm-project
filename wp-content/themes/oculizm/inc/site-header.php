
<?php
    $current_user = wp_get_current_user();
    $first_name = $current_user->user_firstname;
    $last_name = $current_user->user_lastname;
    $email = $current_user->user_email;
    $root = site_url();
    $current_user_id = $current_user->ID;
    $client_id = get_client_id();

    global $wpdb;

    $result = $wpdb->get_results("SELECT name FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
    $client_name = $result[0]['name'];

    $client_name_kebab = kebabCase($client_name);
    $clients_logo = "https://app.oculizm.com/wp-content/uploads/client-logos/" . $client_name_kebab . ".png";
?>

<?php
?>
	<div class="site-header">
        <a class="logo" href="<?php echo home_url(); ?>">
            <img alt="Oculizm" src="<?php echo esc_url(get_stylesheet_directory_uri()) . '/img/oculizm-soreto-logo-white.png'; ?>" />
        </a>

        <!-- <a class="user-menu-icon" href="#">&nbsp;</a> -->
        <a class="user-menu-icon" href="#" style="background-image: url('<?php echo esc_url($clients_logo); ?>');"></a>

        <div class="user-menu">
            <div class="session-info">
                <div class="session-full-name"><?php echo $first_name . " " . $last_name; ?></div>
                <div class="session-email"><?php echo $client_name; ?></div>
            </div>
            <ul>
                <li name="account"><a href="<?php echo site_url('/account/'); ?>">Account</a></li>
                <li name="support"><a href="<?php echo site_url('/support/'); ?>">Support</a></li>
                <li name="logout"><a  href="<?php echo wp_logout_url(); ?>">Log Out</a></li>
            </ul>
        </div>

        <?php
            if (current_user_can('administrator')) { // if admin...
        ?>
            <a class="admin-menu-icon" href="#">&nbsp;</a>
        <?php } ?>
        
            <a class="notifications-menu-icon" href="#">&nbsp;</a>"
            <div class="notifications-menu">
                <div class="no-notifications">No notifications</div>
            </div>

        <?php
            if (current_user_can('administrator')) { // if admin...
        ?>
            <div class="admin-menu">
                <div class="switch" name="demo-mode" data-status="">
                    <div class="switch-track">
                        <div class="switch-lever"></div>
                    </div>
                    <div class="switch-label">Demo Mode</div>
                </div>
                <div class="switch" name="maintenance-mode" data-status="">
                    <div class="switch-track">
                        <div class="switch-lever"></div>
                    </div>
                    <div class="switch-label">Maintenance Mode</div>
                </div>
                <ul>
                    <li class="menu-item" name="wp-admin">
                        <a href="<?php echo get_admin_url(); ?>">WordPress Admin</a>
                    </li>
                    <li class="menu-break"></li>
                    <li class="menu-item" name="manage-clients">
                        <a href="<?php echo $root; ?>/manage-clients/">Clients</a>
                    </li>
                    <li class="menu-item" name="manage-client-css">
                        <a href="<?php echo $root; ?>/manage-client-css/">Custom CSS</a>
                    </li>
                    <li class="menu-item" name="manage-client-events">
                        <a href="<?php echo $root; ?>/manage-client-events/">Client Events</a>
                    </li>
                    <li class="menu-item" name="logs">
                        <a href="<?php echo $root; ?>/logs/">Logs</a>
                    </li>
                    <li class="menu-item" name="admin-settings">
                        <a href="<?php echo $root; ?>/admin-settings/">Settings</a>
                    </li>
                </ul>
            </div>

        <?php
            // CLIENT SWITCHER

            global $wpdb;

            // get the currently selected client for this user
            $user_id = 'user_' . $current_user->ID;

            // get the system's clients list
            $result = $wpdb->get_results("SELECT * FROM oculizm_clients ORDER BY name", ARRAY_A);
            $clients = $result;

            echo "<select class='client-list'>";

            foreach ($clients as $client) {
                $selected_attr = "";
                if ($client['name'] == $client_name) $selected_attr = "selected";
                echo "<option value='" . $client['id'] . "' " . $selected_attr . ">" . $client['name'] . " (" . $client['id'] . ")</option>";
            }
            echo "</select>";
        ?>

        <?php
        } // end if (admin) clause
        ?>

        <?php
            if ($current_user_id == "97") { // if loops...
        ?>
        <?php

            // LOOPS CLIENT SWITCHER

            global $wpdb;

            // get the currently selected client for this user
            $user_id = 'user_' . $current_user->ID;
            $client_id = get_client_id();
            $result = $wpdb->get_results("SELECT name FROM oculizm_clients WHERE ID = " . $client_id, ARRAY_A);
            $client_name = $result[0]['name'];

            //get loops and wales clients list
            $result = $wpdb->get_results("SELECT * FROM oculizm_clients WHERE (ID ='16005' OR ID ='89001' OR ID ='77421') ORDER BY name", ARRAY_A);
            $loops_clients = $result;
            ?>
            <select class='client-list'>
            <?php
            foreach ($loops_clients as $client) {
                $selected_attr = "";
                if ($client['name'] == $client_name) $selected_attr = "selected";
                echo "<option value='" . $client['id'] . "' " . $selected_attr . ">" . $client['name'] . "</option>";
            }
            ?>
            </select>
        <?php
        } // end if (loops) clause
        ?>
        



        <!--
        <div class="session-info">
            <a href="<?php echo site_url('/account/'); ?>" class="logged-in-user"><?php echo $first_name . " " . $last_name; ?></a>
        </div>
        -->






	</div>