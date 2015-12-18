<?php
require("./server.php");
if(preg_match("/dev/",$_SERVER["SERVER_NAME"]))
	require("./server_dev.php");
if(preg_match("/test/",$_SERVER["SERVER_NAME"]))
	require("./server_test.php");

$menu[$knowthyself] = 'class="active"';
?>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>TSX</title>


    <!-- general css libs -->
    <link href="<?php print $TSX_root; ?>/css/bootstrap.min.css" rel="stylesheet">
    <link href="<?php print $TSX_root; ?>/css/bootstrap-dialog.css" rel="stylesheet">
<?php
//Load the appropriate css (nodejs and require would be preferable...)
switch($knowthyself){
	case "desk" : { ?>
		<!-- desk css libs -->
		<link href="<?php print $TSX_root; ?>/css/style.min.css" rel="stylesheet"/>
	<?php break;}
	case "transcribe" : {?>
		<!-- transcribe css libs -->
		<link href="<?php print $TSX_root; ?>/css/codemirror.css" rel="stylesheet"/>	
		<link href="<?php print $TSX_root; ?>/css/merge.css" rel="stylesheet"/>
		<link href="<?php print $TSX_root; ?>/css/show-hint.css" rel="stylesheet"/>
	
<!--		<link href="<?php print $TSX_root; ?>/css/medium.css" rel="stylesheet"/> -->


	<?php break;}
	default: {}
}
?>
    <!-- tsx css -->
    <link href="<?php print $TSX_root; ?>/css/tsx.css" rel="stylesheet">

    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->

    <!-- general js libs -->
    <script src="<?php print $TSX_root; ?>/js/jquery.min.js"></script>
    <script src="<?php print $TSX_root; ?>/js/bootstrap.min.js"></script>
    <script src="<?php print $TSX_root; ?>/js/bootstrap-dialog.js"></script> 
    <script src="<?php print $TSX_root; ?>/js/jquery.validate.min.js"></script>
    <script src="<?php print $TSX_root; ?>/js/jquery.cookie.js"></script>
	<script src="<?php print $TSX_root; ?>/js/xml2json.js"></script>
    <script src='https://www.google.com/recaptcha/api.js'></script> 

<!-- GA -->
<script type="text/javascript">
/*
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-61018046-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
*/

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-61018046-1', 'auto');
  ga('send', 'pageview');


</script>

<!-------->

	<?php
//Load the appropriate js (nodejs and require would be preferable...)
switch($knowthyself){
	case "desk" : { ?>
		<!-- desk js libs -->
		<script src="<?php print $TSX_root; ?>/js/jstree.min.js"></script>
	<?php break;}
	case "transcribe" : {?>
		<!-- transcribe js libs -->
		<script src="<?php print $TSX_root; ?>/js/raphael-min.js"></script>
		<script src="<?php print $TSX_root; ?>/js/jquery.mousewheel.min.js"></script> 
		<script src="<?php print $TSX_root; ?>/js/codemirror.js"></script>
		<script src="<?php print $TSX_root; ?>/js/diff_match_patch.js"></script>
		<script src="<?php print $TSX_root; ?>/js/merge.js"></script>	
		<script src="<?php print $TSX_root; ?>/js/show-hint.js"></script>	
		<script src="<?php print $TSX_root; ?>/js/xml.js"></script>	
 		<script src="<?php print $TSX_root; ?>/js/htr/require.custom.js"></script>

<!--		<script src="<?php print $TSX_root; ?>/js/rangy-core.js"></script>	
		<script src="<?php print $TSX_root; ?>/js/rangy-classapplier.js"></script>	
		<script src="<?php print $TSX_root; ?>/js/undo.js"></script>	
		<script src="<?php print $TSX_root; ?>/js/medium.min.js"></script>	-->


	<?php break;}
	default: {}
}
?>
    <!-- tsx js -->
    <script src="<?php print $TSX_root; ?>/js/tsx.js"></script> 

  </head>

