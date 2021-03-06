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
	    <div class="panel panel-default" >
			<div class="panel-heading">Thumbnails
				<div class="btn-toolbar tsx-panel-control" role="toolbar" aria-label="...">
					<a href="/td/TSX_Guidelines#Selecting_a_manuscript_to_transcribe" target="_new"><button type="button" class="btn btn-default pull-right" title="Guidelines"><span class="glyphicon glyphicon-question-sign"></span></button></a>
				</div>
			</div>
			<div class="panel-body" id="tsx-thumb-panel">
				<div class="container-fluid">
					<div class="row">
					</div>
				</div>
			</div>
	    </div>
	</div>
  	<div class="col-md-3 col-md-pull-9">
	    <div class="panel panel-default">
		<div class="panel-heading">Manuscript collections
			<div class="btn-toolbar tsx-panel-control" role="toolbar" aria-label="...">
				<a href="/td/TSX_Guidelines#Selecting_a_manuscript_to_transcribe" target="_new"><button type="button" class="btn btn-default pull-right" title="Guidelines"><span class="glyphicon glyphicon-question-sign"></span></button></a>
			</div>
		</div>
		<div class="panel-body" id="tsx-file-panel">
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
//			var data_server = "https://dbis-faxe.uibk.ac.at/TrpServerTesting/rest/";
//		}
			var data_server = "https://transkribus.eu/TrpServer/rest/";
		tsxController = new TSXController({data_server: data_server, file_panel: "#tsx-file-panel", thumb_panel: "#tsx-thumb-panel"});
	});
</script>

</body>
</html>
