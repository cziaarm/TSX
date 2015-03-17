<!DOCTYPE html>
<html lang="en">
<?php 
$knowthyself = basename(__FILE__, '.php');
require("./head.inc.php");?>
  <body>
<?php require("./header.inc.php");?>
<!-- Bootstrap 3 panel list. -->
<div class="container-fluid">
   <div class="row">
  	<div class="col-md-9 col-md-push-3">
	    <div class="panel panel-default">
			<div class="panel-heading"><strong>TSX User area</strong></div>
			<div class="panel-body">
				 
				
			</div>
	    </div>
	</div>

  	<div class="col-md-3 col-md-pull-9">
	    <div class="panel panel-default">
			<div class="panel-heading"><strong>Recent activity</strong></div>
			<div class="panel-body">
				Recent activity...
			</div>
			</div>
	</div>


   </div>
</div>

<?php require("./login.inc.php");?>

<script>
	$(document).ready(function(){
//		if(window.location.host.match(/devorkin/)){
//			var data_server = "/local_data";
//		}else{
			var data_server = "https://dbis-faxe.uibk.ac.at/TrpServerTesting/rest/";
//		}
		var data_server = "https://dbis-faxe.uibk.ac.at/TrpServer/rest/";
		tsxController = new TSXController({data_server: data_server});
	});
</script>

</body>
</html>
