<?php

// title sanitisation
function sanitise_title($title, $client_id) {

    // trim
    $title = preg_replace('~//<!\[CDATA\[\s*|\s*//\]\]>~', '', $title);
    $title = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $title);
    $title_parts = explode(" Default Title", $title); $title = trim($title_parts[0]); // strip out Shopify variant default title
    $title = str_replace("\n", "", $title);
    $title = str_replace("  ", "", $title);
    $title = trim($title);

    // DEDUPLICATION

    // VisualSoft
    if (in_array($client_id, array("14798", "20940", "5309", "13793", "16111", "21296"))) {
        $title_parts = explode("Size: ", $title); $title = trim($title_parts[0]);
    }

    // Band of Gold
    if ($client_id == "55452") {
        $title_parts = explode(" / S", $title); $title = trim($title_parts[0]);
        $title_parts = explode(" / M", $title); $title = trim($title_parts[0]);
        $title_parts = explode(" / L", $title); $title = trim($title_parts[0]);
        $title_parts = explode(" / X", $title); $title = trim($title_parts[0]);
    }

    // Cocobelle
    if ($client_id == "84424") {
        $title_parts = explode("/ 36", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/ 37", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/ 38", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/ 39", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/ 40", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/ 41", $title); $title = trim($title_parts[0]);
    }

    // Evviva
    if ($client_id == "40101") {
        $title_parts = explode("/S", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/M", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/L", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/X", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/1", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/2", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/3", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/4", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/5", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/6", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/7", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/8", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/9", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/0", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/EU", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/UK", $title); $title = trim($title_parts[0]);
        $title_parts = explode("/US", $title); $title = trim($title_parts[0]);
    }

    // Funky Chunky Furniture
    if ($client_id == "71950") {

        $title_parts = explode("| Funky Chunky Furniture", $title); $title = trim($title_parts[0]);

        // filtering on middle part of string

        $title = str_replace("- 30cm", "", $title);
        $title = str_replace("- 40cm", "", $title);
        $title = str_replace("- 45cm", "", $title);
        $title = str_replace("- 50cm", "", $title);
        $title = str_replace("- 55cm", "", $title);
        $title = str_replace("- 60cm", "", $title);
        $title = str_replace("- 70cm", "", $title);
        $title = str_replace("- 80cm", "", $title);
        $title = str_replace("- 85cm", "", $title);
        $title = str_replace("- 90cm", "", $title);
        $title = str_replace("- 100cm", "", $title);
        $title = str_replace("- 110cm", "", $title);
        $title = str_replace("- 115cm", "", $title);
        $title = str_replace("- 120cm", "", $title);
        $title = str_replace("- 130cm", "", $title);
        $title = str_replace("- 140cm", "", $title);
        $title = str_replace("- 145cm", "", $title);
        $title = str_replace("- 150cm", "", $title);
        $title = str_replace("- 160cm", "", $title);
        $title = str_replace("- 170cm", "", $title);
        $title = str_replace("- 180cm", "", $title);
        $title = str_replace("- 190cm", "", $title);
        $title = str_replace("- 200cm", "", $title);

        $title = str_replace(" 30cm", "", $title);
        $title = str_replace(" 40cm", "", $title);
        $title = str_replace(" 45cm", "", $title);
        $title = str_replace(" 50cm", "", $title);
        $title = str_replace(" 55cm", "", $title);
        $title = str_replace(" 60cm", "", $title);
        $title = str_replace(" 70cm", "", $title);
        $title = str_replace(" 80cm", "", $title);
        $title = str_replace(" 85cm", "", $title);
        $title = str_replace(" 90cm", "", $title);
        $title = str_replace(" 100cm", "", $title);
        $title = str_replace(" 110cm", "", $title);
        $title = str_replace(" 115cm", "", $title);
        $title = str_replace(" 120cm", "", $title);
        $title = str_replace(" 130cm", "", $title);
        $title = str_replace(" 140cm", "", $title);
        $title = str_replace(" 145cm", "", $title);
        $title = str_replace(" 150cm", "", $title);
        $title = str_replace(" 160cm", "", $title);
        $title = str_replace(" 170cm", "", $title);
        $title = str_replace(" 180cm", "", $title);
        $title = str_replace(" 190cm", "", $title);
        $title = str_replace(" 200cm", "", $title);

        $title = str_replace("(9.5x9.5cm)", "", $title);
        $title = str_replace("(9.5x14.5cm)", "", $title);
        $title = str_replace("(9.5x19.5cm)", "", $title);
        $title = str_replace("(15x3cm)", "", $title);
        $title = str_replace("(15x4cm)", "", $title);
        $title = str_replace("(15x4.5cm)", "", $title);
        $title = str_replace("(15x5cm)", "", $title);
        $title = str_replace("(15x7.5cm)", "", $title);
        $title = str_replace("(15x15cm)", "", $title);
        $title = str_replace("(14.5x3.5cm)", "", $title);
        $title = str_replace("(14.5x4cm)", "", $title);
        $title = str_replace("(14.5x4.5cm)", "", $title);
        $title = str_replace("(14.5x5cm)", "", $title);
        $title = str_replace("(19.5x3.5cm)", "", $title);
        $title = str_replace("(19.5x4cm)", "", $title);
        $title = str_replace("(19.5x4.5cm)", "", $title);
        $title = str_replace("(19.5x5cm)", "", $title);
        $title = str_replace("(19.5x9.5cm)", "", $title);
        $title = str_replace("(22x3.5cm)", "", $title);
        $title = str_replace("(22x4cm)", "", $title);
        $title = str_replace("(22x4.5cm)", "", $title);
        $title = str_replace("(22x5cm)", "", $title);
        $title = str_replace("(22x7.5cm)", "", $title);
        $title = str_replace("(22.5x4cm)", "", $title);
        $title = str_replace("(22.5x5cm)", "", $title);
        $title = str_replace("(22.5x7.5cm)", "", $title);
        $title = str_replace("(29x3.5cm)", "", $title);
        $title = str_replace("(29x4cm)", "", $title);
        $title = str_replace("(29x4.5cm)", "", $title);
        $title = str_replace("(29x5cm)", "", $title);
        $title = str_replace("(29.5x4.5cm)", "", $title);
        $title = str_replace("(30x5cm)", "", $title);

        $title = str_replace("(14.5cmx3.5cm)", "", $title);
        $title = str_replace("(14.5cmx4cm)", "", $title);
        $title = str_replace("(14.5cmx4.5cm)", "", $title);
        $title = str_replace("(14.5cmx5cm)", "", $title);
        $title = str_replace("(15cmx3.5cm)", "", $title);
        $title = str_replace("(15cmx4cm)", "", $title);
        $title = str_replace("(15cmx4.5cm)", "", $title);
        $title = str_replace("(15cmx5cm)", "", $title);
        $title = str_replace("(22cmx3.5cm)", "", $title);
        $title = str_replace("(22cmx4cm)", "", $title);
        $title = str_replace("(22cmx4.5cm)", "", $title);
        $title = str_replace("(22cmx5cm)", "", $title);
        $title = str_replace("(22.5cmx3.5cm)", "", $title);
        $title = str_replace("(22.5cmx4cm)", "", $title);
        $title = str_replace("(22.5cmx4.5cm)", "", $title);
        $title = str_replace("(22.5cmx5cm)", "", $title);
        $title = str_replace("(29cmx3.5cm)", "", $title);
        $title = str_replace("(29cmx4cm)", "", $title);
        $title = str_replace("(29cmx4.5cm)", "", $title);
        $title = str_replace("(29cmx5cm)", "", $title);
        $title = str_replace("(29.5cmx3.5cm)", "", $title);
        $title = str_replace("(29.5cmx4cm)", "", $title);
        $title = str_replace("(29.5cmx4.5cm)", "", $title);
        $title = str_replace("(29.5cmx5cm)", "", $title);

        $title = str_replace("(20x10cm)", "", $title);
        $title = str_replace("(10x10cm)", "", $title);

        $title = str_replace("table (55cm benches)", " ", $title);
        $title = str_replace("table (85cm benches)", " ", $title);
        $title = str_replace("table (115cm benches)", " ", $title);
        $title = str_replace("table (145cm benches)", " ", $title);

        $title = str_replace("(55cm benches)", "", $title);
        $title = str_replace("(85cm benches)", "", $title);
        $title = str_replace("(115cm benches)", "", $title);
        $title = str_replace("(145cm benches)", "", $title);

        $title = str_replace("table (55cm Benches)", " ", $title);
        $title = str_replace("table (85cm Benches)", " ", $title);
        $title = str_replace("table (115cm Benches)", " ", $title);
        $title = str_replace("table (145cm Benches)", " ", $title);

        $title = str_replace("(55cm Benches)", "", $title);
        $title = str_replace("(85cm Benches)", "", $title);
        $title = str_replace("(115cm Benches)", "", $title);
        $title = str_replace("(145cm Benches)", "", $title);

        $title_parts = explode("- Small Double", $title); $title = trim($title_parts[0]);
        $title_parts = explode("- Double", $title); $title = trim($title_parts[0]);
        $title_parts = explode("- Super King", $title); $title = trim($title_parts[0]);
        $title_parts = explode("- Kingsize", $title); $title = trim($title_parts[0]);

        $title_parts = explode("- Funky Chunky Furniture", $title); $title = trim($title_parts[0]);

    }

    // Moda in Pelle
    if ($client_id == "43862") {
        $title_parts = explode('7 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('8 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('9 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('10 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('11 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('12 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('13 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('14 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('33 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('34 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('35 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('36 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('37 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('38 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('39 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('40 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('41 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('42 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('43 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('45 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('46 Size', $title); $title = trim($title_parts[0]);
        $title_parts = explode('Leather 3', $title); $title = trim($title_parts[0]);
        $title_parts = explode('Suede 3', $title); $title = trim($title_parts[0]);
    }

    return $title;    
}




