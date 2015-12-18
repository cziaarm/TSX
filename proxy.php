
<?php
//really really wanted to avoid these, but...
$col = $_REQUEST["col"];
$doc = $_REQUEST["doc"];
$page = $_REQUEST["page"];
$sessionid = $_REQUEST["session"];
$xml_str = $_REQUEST["xml"];
error_log("IN pROXy");
if(preg_match('/^\d+$/',$col) && preg_match('/^\d+$/',$doc) && preg_match('/^\d+$/',$page)){
	
//	error_log("XML: \n".$xml_str);
	$temp = tmpfile();
	fwrite($temp, $xml_str);
	$meta_data = stream_get_meta_data($temp);
	$filename = $meta_data["uri"];
	error_log("filename: $filename");
	$post = array('file_contents'=>'@'.$filename);
	// create a new cURL resource
//	$ch = curl_init();

	$curl = "curl -k -X POST -d @$filename --cookie \"JSESSIONID=$sessionid\" --header \"Content-Type: application/xml\" https://transkribus.eu/TrpServer/rest/collections/$col/$doc/$page/text";
	 error_log($curl);

	print passthru(escapeshellcmd($curl));

	// set URL and other appropriate options
/*	$url = "https://dbis-faxe.uibk.ac.at/TrpServer/rest/docs/$col/$doc/$page/text";
	error_log("url: $url");

	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array("Cookie: JSESSIONID=$sessionid"));
	curl_setopt($ch, CURLOPT_POST,1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

	// grab URL and pass it to the browser
	$data = curl_exec($ch);
	header("Content-type: application/xml");
	print $data;

	// close cURL resource, and free up system resources
	curl_close($ch);
*/
//	fclose($temp); // this removes the file	

}
