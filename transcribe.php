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
  	<div class="col-md-7 col-md-push-5">
	    <div class="panel panel-default">
			<div class="panel-heading">Image
				<div id="tsx-image-control" class="btn-toolbar tsx-panel-control" role="toolbar" aria-label="...">
					<!--<div class="btn-group" role="group" aria-label="Zoom controls">-->
						<button id="tsx-zoom-pause" type="button" class="btn btn-default" title="Hold current zoom"><span class="glyphicon glyphicon-ban-circle"></span></button>
						<button id="tsx-zoom-in" type="button" class="btn btn-default" title="Zoom in"><span class="glyphicon glyphicon-plus"></span></button>
						<button id="tsx-zoom-reset" type="button" class="btn btn-default" title="Reset zoom"><span class="glyphicon glyphicon-record"></span></button>
						<button id="tsx-zoom-out" type="button" class="btn btn-default" title="Zoom out"><span class="glyphicon glyphicon-minus"></span></button>
					<!--</div> -->
				</div>
			</div>
			<div class="panel-body" id="tsx-image-panel">
				<div id="tsx-image"></div>
			</div>
	    </div>
	</div>
  	<div class="col-md-5 col-md-pull-7">
	    <div class="panel panel-default">
			<div class="panel-heading">Transcript
				<div id="tsx-edit-control" class="btn-toolbar tsx-panel-control" role="toolbar" aria-label="...">
						<button id="tsx-transcript-ready" type="button" class="btn btn-default" title="Transcript is ready!"><span class="glyphicon glyphicon-envelope"></span></button>

						<button id="tsx-save-tei" type="button" class="btn btn-default" title="Save changes"><span class="glyphicon glyphicon-save"></span></button>
						<button id="tsx-toggle-transcript" type="button" class="btn btn-default" title="Load existing transcript"><span class="glyphicon glyphicon-list-alt"></span></button>
				</div>
			</div>
			<div class="panel-body" id="tsx-edit-panel">
				<ul class="nav nav-tabs">
					<li role="presentation" class="active"><a data-toggle="tab" href="#tsx-edit">Edit</a></li>
<!--					<li role="presentation"><a data-toggle="tab" href="#tsx-wysiwyg">Wysiwyg</a></li> -->
					<li role="presentation"><a data-toggle="tab" href="#tsx-preview">Preview</a></li>
					<li role="presentation"><a data-toggle="tab" href="#tsx-diffs">Diffs</a></li>
				</ul>
				<div class="tab-content">
					<div id="tsx-edit" class="tab-pane fade in active">
						<?php require("./tei-buttons.inc.php"); ?>
						<div id="tsx-transcript-editor"></div>
					</div>
<!--					<div id="tsx-wysiwyg" class="tab-pane fade">
						<?php require("./tei-buttons.inc.php"); ?>
						<div id="tsx-w-transcript-editor"></div>	
					</div> -->

					<div id="tsx-preview" class="tab-pane fade">
						
					</div>
					<div id="tsx-diffs" class="tab-pane fade">
						<p>The originally loaded transcript is on the left and the edit is on the right.</p>
						<div id="tsx-transcript-diffs"></div>
					</div>
				</div>
			</div>
	    </div>
	</div>
   </div>
</div>

<?php require("./login.inc.php");?>

<div id="htr_stuff"></div>
<div id="htr_image"></div>
<div id="htr_target"></div>

<script>
	$(document).ready(function(){
//	if(window.location.host.match(/devorkin/)){
//		var data_server = "/local_data";
//	}else{
//		var data_server = "https://dbis-faxe.uibk.ac.at/TrpServerTesting/rest/";
//	}
	var data_server = "https://dbis-faxe.uibk.ac.at/TrpServer/rest/";

	
	tsxConroller = new TSXController({data_server: data_server, view_box: "#tsx-image", image_panel: "#tsx-image-panel", edit_panel: "#tsx-edit-panel"});
	});
</script>
</body>
</html>
