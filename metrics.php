<?php

$date = date("Ymd");
$headers = array('session', 'label', 'timestamp', 'user_id', 'user_name', 'document_ref', 'page_ref', 'line_length', 'line_number', 'line_ref', 'text');
$session = $_REQUEST["session"];
$csv_path = "/www/benpro/sitedata/TSX_metrics/".$date."_".$session.".csv";
$file = fopen($csv_path,"a");
$data = array();
if(!filesize($csv_path)) 
	fputcsv($file, $headers);

foreach($_REQUEST as $k => $v){
	if(in_array($k, $headers)) $data[] = $v;
}

#error_log("Data: ".$data);
fputcsv($file, $data);

fclose($file);
?>
