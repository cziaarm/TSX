<?php
$data_dir = "/www/benpro/sitedata/TSX_metrics";
if($_REQUEST["file"]){
	//no attempts to get files from other dirs!!
	 if(preg_match('/\//g',$_REQUEST["file"])) exit;

	//file must exist
	 if(!file_exists($data_dir."/".$_REQUEST["file"])) exit;

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename='.$_REQUEST["file"]);

#$output = fopen('php://output', 'w');
#fwrite($output, file_get_contents($data_dir."/".$_REQUEST["file"]));
readfile($data_dir."/".$_REQUEST["file"]);


exit;

}elseif ($handle = opendir($data_dir)) {
?>
<html>
<head>
<title></title>
</head>
<body>
<h1>TSX metrics</h1>
<ul>
<?php
    /* This is the correct way to loop over the directory. */
    while (false !== ($entry = readdir($handle))) {
	if(preg_match('/^\./', $entry)) continue;
        print '<li><a href="?file='.$entry.'">'.$entry.'</a></li>';
    }
    closedir($handle);
}
?>
</ul>
</body>
</html>
