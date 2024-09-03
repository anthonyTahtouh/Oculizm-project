<?php


// get a client's support tickets
add_action('wp_ajax_get_support_tickets', 'get_support_tickets');
function get_support_tickets() {
    
    $client_id = get_client_id();

    global $wpdb;

    // get this client's support tickets
    $support_tickets = $wpdb->get_results("SELECT * FROM oculizm_support_tickets WHERE CLIENT_ID = " . $client_id . " ORDER BY ID DESC", ARRAY_A);

    // get this client's support ticket items
    $support_ticket_items = $wpdb->get_results("SELECT * FROM oculizm_support_ticket_items WHERE CLIENT_ID = " . $client_id, ARRAY_A);


    // for each support ticket... 
    foreach($support_tickets as &$st) {

        // create a new array for its support ticket items
        $this_ticket_items = [];

        foreach($support_ticket_items as $sti) {
            if ($sti['ticket_id'] == $st['id']) array_push($this_ticket_items, $sti);
        }

        $st['items'] = $this_ticket_items;
    }

    $result = $support_tickets;

    echo json_encode($result);
    die();
}


// add a support ticket
add_action('wp_ajax_add_support_ticket', 'add_support_ticket');
function add_support_ticket() {

    $client_id = get_client_id();

    $subject = $_REQUEST['subject'];
    $message = $_REQUEST['message'];

    // remove the backslash from the subject and the message
    $subject = stripslashes($subject);
    $message = stripslashes($message);

    // check the fields exist
    if ($subject && $message) {

        $time = time();
        $created = date('Y-m-d H:i:s', $time);
        $last_updated = date('Y-m-d H:i:s', $time);

        global $wpdb;

        // create the parent support ticket
        $row = array(
            "client_id" => $client_id,
            "subject" => $subject,
            "status" => "open",
            "created" => $created,
            "last_updated" => $last_updated,
        );
        $insert_result_1 = $wpdb->insert('oculizm_support_tickets', $row);

        $support_ticket_id = $wpdb->insert_id;

        // get the author
        global $current_user;
        $author = $current_user->user_firstname . " " . $current_user->user_lastname;

        // create the support ticket message
        $row = array(
            "client_id" => $client_id,
            "message" => $message,
            "created" => $created,
            "author" => $author,
            "ticket_id" => $support_ticket_id,
        );
        $insert_result_2 = $wpdb->insert('oculizm_support_ticket_items', $row);

        if ($insert_result_1 && $insert_result_2) {

            // get this support ticket from the DB
            $result = $wpdb->get_row("SELECT * FROM oculizm_support_tickets WHERE ID = " . $support_ticket_id);

            // construct email
            $email_title = 'New Oculizm Support Ticket: ' . $subject . '(' . $client_id . ')';
            $email_message = "An Oculizm support ticket has been opened:<br><br><i>" . $message . "</i><br><br>Please <a href='" . site_url() . "'>log in</a> to view the ticket.";

            // send admin emails
            $admin_email_result = oEmail('sean@oculizm.com', $email_title, $email_message);
            $admin_email_result = oEmail('anthony@oculizm.com', $email_title, $email_message);

            // send client email
            $client_email = $current_user->user_email;
            $client_email_result = oEmail($client_email, $email_title, $email_message);
        }

        $debug = array(
            "insert_result_1" => $insert_result_1,
            "insert_result_2" => $insert_result_2,
            "support_ticket_id" => $support_ticket_id,
            "admin_email_result" => $admin_email_result,
            "client_email_result" => $client_email_result
        );

        // get the support ticket
        $support_ticket = $wpdb->get_results("SELECT * FROM oculizm_support_tickets WHERE ID = " . $support_ticket_id, ARRAY_A);
        $support_ticket = $support_ticket[0];

        // get the support ticket items
        $support_ticket_items = $wpdb->get_results("SELECT * FROM oculizm_support_ticket_items WHERE TICKET_ID = " . $support_ticket_id, ARRAY_A);

        // attach them to the support ticket object
        $support_ticket['items'] = $support_ticket_items;

        $result = $support_ticket;
    }

    echo json_encode($result);
    die();
}



// update a support ticket
add_action('wp_ajax_update_support_ticket', 'update_support_ticket');
function update_support_ticket() {

    $client_id = get_client_id();

    $support_ticket_id = $_REQUEST['support_ticket_id'];
    $message = $_REQUEST['message'];
    $message = str_replace( array( "\'" ), "'", $message);

    // check the fields exist
    if ($support_ticket_id && $message) {

        // get the author
        global $current_user;
        $author = $current_user->user_firstname . " " . $current_user->user_lastname;

        $time = time();
        $created = date('Y-m-d H:i:s', $time);

        global $wpdb;

        // create the support ticket message
        $row = array(
            "client_id" => $client_id,
            "message" => $message,
            "created" => $created,
            "author" => $author,
            "ticket_id" => $support_ticket_id,
        );
        $insert_result = $wpdb->insert('oculizm_support_ticket_items', $row);

        // get the support ticket
        $support_ticket = $wpdb->get_results("SELECT * FROM oculizm_support_tickets WHERE ID = " . $support_ticket_id, ARRAY_A);
        $support_ticket = $support_ticket[0];

        // get this client's support ticket items
        $support_ticket_items = $wpdb->get_results("SELECT * FROM oculizm_support_ticket_items WHERE CLIENT_ID = " . $client_id, ARRAY_A);

        // create a new array for its support ticket items
        $this_ticket_items = [];

        foreach($support_ticket_items as $sti) {
            if ($sti['ticket_id'] == $support_ticket_id) array_push($this_ticket_items, $sti);
        }
        $support_ticket['items'] = $this_ticket_items;
    
        $result = $support_ticket;

        // construct email
        $email_title = 'Oculizm Support Ticket Updated (' . $client_id . ')';
        $email_message = "An Oculizm support ticket has been updated:<br><br><i>" . $message . "</i><br><br>Please <a href='" . site_url() . "'>log in</a> to view the ticket.";

        // send admin emails
        $admin_email_result = oEmail('sean@oculizm.com', $email_title, $email_message);
        $admin_email_result = oEmail('anthony@oculizm.com', $email_title, $email_message);

        // send client email
        $client_email = $current_user->user_email;
        $client_email_result = oEmail($client_email, $email_title, $email_message);
    }

    echo json_encode($result);
    die();
}




// update a support ticket
add_action('wp_ajax_close_support_ticket', 'close_support_ticket');
function close_support_ticket() {

    $client_id = get_client_id();

    $support_ticket_id = $_REQUEST['support_ticket_id'];

    global $wpdb;

    $result = $wpdb->query($wpdb->prepare("UPDATE oculizm_support_tickets SET status = 'closed' WHERE id = %s", $support_ticket_id));

    // get this client's support tickets
    $support_tickets = $wpdb->get_results("SELECT * FROM oculizm_support_tickets WHERE CLIENT_ID = " . $client_id . " ORDER BY ID DESC", ARRAY_A);

    // get this client's support ticket items
    $support_ticket_items = $wpdb->get_results("SELECT * FROM oculizm_support_ticket_items WHERE CLIENT_ID = " . $client_id, ARRAY_A);


    // for each support ticket... 
    foreach($support_tickets as &$st) {

        // create a new array for its support ticket items
        $this_ticket_items = [];

        foreach($support_ticket_items as $sti) {
            if ($sti['ticket_id'] == $st['id']) array_push($this_ticket_items, $sti);
        }

        $st['items'] = $this_ticket_items;
    }
    $result = $support_tickets;

    echo json_encode($result);
    die();
}




// delete a support ticket
add_action('wp_ajax_delete_support_ticket', 'delete_support_ticket');
function delete_support_ticket() {

    $client_id = get_client_id();

    $support_ticket_id = $_REQUEST['support_ticket_id'];

    global $wpdb;

    $result = array();
    
    $query1 = $wpdb->prepare('DELETE FROM oculizm_support_tickets WHERE ID = %d', $support_ticket_id);
    $delete1 = $wpdb->query($query1);

    $query2 = $wpdb->prepare('DELETE FROM oculizm_support_ticket_items WHERE ticket_id = %d', $support_ticket_id);
    $delete2 = $wpdb->query($query2);
    
    $result['delete1'] = $delete1;
    $result['delete2'] = $delete1;
    
    echo json_encode($result);
    die();
}




