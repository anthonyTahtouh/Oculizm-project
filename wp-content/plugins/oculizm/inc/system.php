<?php

// get system options
add_action('wp_ajax_get_system_options', 'get_system_options');
function get_system_options() {
    
    global $wpdb;

    $system_options = $wpdb->get_results("SELECT * FROM oculizm_settings ORDER BY ID DESC", ARRAY_A);

    echo json_encode($system_options);
    die();
}

// set a system option
add_action('wp_ajax_set_system_option', 'set_system_option');
function set_system_option() {
    
    $setting_name = $_REQUEST['setting_name'];
    $setting_value = $_REQUEST['setting_value'];

    global $wpdb;

    $rows_affected = $wpdb->query($wpdb->prepare("UPDATE oculizm_settings
    SET setting_value = %s
    WHERE setting_name = %s", $setting_value, $setting_name));

    echo json_encode($rows_affected);
    die();
}

// get current environment
function get_environment() {

    $current_domain = preg_replace('/www\./i', '', $_SERVER['SERVER_NAME']);
    if ($current_domain == "localhost") return site_url();

    $transport = "http://";
    if ($_SERVER['SERVER_PORT'] == 443) $transport = "https://";

    return $transport . $current_domain;
}


// WordPress table bulk insert
function sql_bulk_insert($table, $rows) {
    
    global $wpdb;
    
    // extract column list from first row of data!
    $columns = array_keys($rows[0]);
    asort($columns);
    $columnList = '`' . implode('`, `', $columns) . '`';
    
    // start building SQL, initialise data and placeholder arrays
    $sql = "INSERT INTO `$table` ($columnList) VALUES\n";
    $placeholders = array();
    $data = array();
    
    // build placeholders for each row, and add values to data array
    foreach ($rows as $row) {
        ksort($row);
        $rowPlaceholders = array();
        foreach ($row as $key => $value) {
            $data[] = $value;
            $rowPlaceholders[] = '%s';
        }
        $placeholders[] = '(' . implode(', ', $rowPlaceholders) . ')';
    }
    
    // stitch all rows together
    $sql .= implode(",\n", $placeholders);
    $result = $wpdb->query($wpdb->prepare($sql, $data));
    
    // run the query, returning number of affected rows for this chunk
    return $result;
}


// upload multiple files
function prepare_media_upload($file_handler) {
    if ($_FILES[$file_handler]['error'] !== UPLOAD_ERR_OK) __return_false();
    
    require_once(ABSPATH . "wp-admin" . '/includes/image.php');
    require_once(ABSPATH . "wp-admin" . '/includes/file.php');
    require_once(ABSPATH . "wp-admin" . '/includes/media.php');
    
    $attach_id = media_handle_upload( $file_handler, null);
    
    return $attach_id;
}

// main logging function
function oLog($message) {

    // format arrays
    if (is_array($message)) $message = json_encode($message);

    // format objects
    elseif (is_object($message)) $message = json_encode($message);

    // timestamp and client ID
    $t = date("d M Y H:i:s");
    $message = "" . $t . " [" . get_client_id() . "] " . $message . "\r\r";

    // determine which log file to use
    if (!isset($log)) $log = "debug";

    $writeAttempt = file_put_contents(ABSPATH . 'wp-content/' . $log . '.log', PHP_EOL . $message, FILE_APPEND);
    return $writeAttempt;
}

// get a log file
add_action('wp_ajax_get_log_file', 'get_log_file');
function get_log_file() {
    $log_file_name = $_REQUEST['log_file_name'];
    
    // WordPress debug log
    if ($log_file_name == "debug") $log_file_path = WP_CONTENT_DIR . '/debug.log';
    // Apache error log
    else $log_file_path = '/opt/bitnami/apache/logs/error_log';
    
    // Read the log file and ensure it's UTF-8 encoded
    $log_file = file_get_contents($log_file_path);
    if ($log_file === false) {
        echo json_encode(['error' => 'Failed to read log file']);
    } else {
        // Convert encoding if necessary
        $log_file = mb_convert_encoding($log_file, 'UTF-8', 'UTF-8');
        echo json_encode($log_file);
    }
    die();
}


// clear a log file
add_action('wp_ajax_clear_log_file', 'clear_log_file');
function clear_log_file() {

    $response = array();

    $log_file_name = $_REQUEST['log_file_name'];

    // WordPress debug log
    if ($log_file_name == "debug") {
        $log_file_path = WP_CONTENT_DIR . "/debug.log";
        $log_file_path_prefix = WP_CONTENT_DIR . "/debug_";
    }

    // Apache error log
    else {
        $log_file_path = '/opt/bitnami/apache/logs/error_log';
        $log_file_path_prefix = '/opt/bitnami/apache/logs/error_log_';
    }

    // get the current time
    $timestamp = time();
    $currentDateTime = gmdate('Y-m-d H:i:s', $timestamp);
    $new_log_file_path = $log_file_path_prefix . $currentDateTime . ".log";

    // backup the existing log file
    if (!copy($log_file_path, $new_log_file_path)) {
        $response['error'] = "Failed to backup existing log file";
        echo json_encode($response);
        die();
    }

    // empty it
    $writeAttempt = file_put_contents($log_file_path, $currentDateTime . " Log file cleared!" . "\r\r");

    // get the new log file
    $log_file = file_get_contents($log_file_path);

    $response = $log_file;

    echo json_encode($response);
    die();
}






