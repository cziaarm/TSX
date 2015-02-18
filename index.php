<!DOCTYPE html>
<html lang="en">
<?php require("./head.inc.php");?>
  <body>
<?php 
$menu["home"] = $active_menu;
require("./header.inc.php");?>
<!-- Bootstrap 3 panel list. -->
<div class="container-fluid">
   <div class="row">
  	<div class="col-md-9 col-md-push-3">
	    <div class="panel panel-default" id="tsx-documents">
		<div class="panel-heading">Home page content</div>
		<div class="panel-body">Content ...</div>
	    </div>
	</div>
  	<div class="col-md-3 col-md-pull-9">
	    <div class="panel panel-default" id="tsx-image">
		<div class="panel-heading">Stats?</div>
		<div class="panel-body">Content ...</div>
	    </div>
	</div>
   </div>
</div>

<?php require("./login.inc.php");?>

<script>
	$(document).ready(function(){
		if(window.location.host.match(/devorkin/)){
			var data_server = "/local_data";
		}else{
			var data_server = "https://dbis-faxe.uibk.ac.at/TrpServerTesting/rest/";
		}
		
		tsxController = new TSXController({data_server: data_server});
	});
</script>

</body>
</html>
