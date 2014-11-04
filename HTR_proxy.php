<?php
//really really wanted to avoid these, but... 

$ref = $_REQUEST["ref"];

// create a new cURL resource
$ch = curl_init();

// set URL and other appropriate options
curl_setopt($ch, CURLOPT_URL, "http://casmacat.prhlt.upv.es/servers/wglist/".urlencode($ref));
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// grab URL and pass it to the browser
$data = curl_exec($ch);
header("Content-type: application/json");
print $data;

// close cURL resource, and free up system resources
curl_close($ch);
