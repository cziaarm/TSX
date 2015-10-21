<?php
$doc = $_REQUEST["doc"];
$page = $_REQUEST["page"];
$sessionid = $_REQUEST["session"];
$userid = $_REQUEST["userid"];
$username = $_REQUEST["username"];
$email = "transcribe.bentham@ucl.ac.uk";
if(preg_match('/^\d+$/',$doc) && preg_match('/^\d+$/',$page) && preg_match('/^\d+$/',$userid)){
	
	$msg = "Dear TSX administrator,\r\n\r\nA transcript is ready for you to review. The details are below:\r\n\r\n- Document $doc\r\n- Page $page\r\n- Session $sessionid\r\n- User $username ($userid)\r\n\r\nThanks,\r\n\r\nTSX";
// use wordwrap() if lines are longer than 70 characters
$msg = wordwrap($msg,70);
$headers = "From: $email" . "\r\n" .
"CC: rory.mcnicholl@ulcc.ac.uk";
// send em,
if(mail($email, "TSX - transcript ready",$msg, $headers)){
	print 1;
}

}
// the message
?>
