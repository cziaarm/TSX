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
  	<div class="col-md-3 col-md-push-9">
	    <div class="panel panel-default" id="tsx-image">
	<!--		<div class="panel-heading"><strong>Jeremy Bentham</strong></div>
			<div class="panel-body"> -->
				<img src="<?php print $TSX_root;?>/images/Bentham.jpg" class="img-rounded" width="100%"/>
				<p>Jeremy Bentham</p>
<!--			</div> -->
	    </div> 
	</div>

  	<div class="col-md-9 col-md-pull-3">
	 <!--   <div class="panel panel-default">
			<div class="panel-heading"><strong>Welcome to TSX!</strong></div>
			<div class="panel-body"> -->
		<div class="jumbotron">
			<h1>Welcome to TSX!!</h1>
			<p>By registering with TSX you can do two of exciting things: transcribe fascinating and valuable manuscripts written and composed by the philosopher and reformer, Jeremy Bentham (1748-1832), and be among the first volunteer transcribers to test modern Handwritten Text Recognition (HTR) technology.</p>
			<p>TSX may appear familiar to participants in the award-winning Transcribe Bentham initiative, but introduces new and innovative functionalities beyond transcription.</p>
			<p>Volunteers may choose to receive from the HTR engine a full transcript of a given manuscript image, and then correct this automated transcript against the original, or to take advantage of the interactive transcription mode, in which the HTR engine offers suggestions for a subsequent word or words as you type.</p>
			<p>These methods of participation are more fully explained in our instructional material.</p>
			<p>We hope that you will be interested in testing out this innovative technology, and welcome any questions or feedback - positive or negative - to <a href="mailto:transcribe.bentham@ucl.ac.uk">transcribe.bentham@ucl.ac.uk</a>.</p>
			<div class="well well-sm" style="text-align: center;">
				<strong>To begin transcribing please <span class="tsx-not-logged-in"><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#createAccountModal">Sign up</button> or <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#loginModal">Sign in</button> and </span>visit the <a href="<?php print $TSX_root;?>/desk"><button type="button" class="btn btn-primary" title="TSX Desk">TSX Desk</button></strong></a>
			</div>
  <!--<p><a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a></p>-->
		</div>

<!--
				<p>By registering with TSX you can do two of exciting things: transcribe fascinating and valuable manuscripts written and composed by the philosopher and reformer, Jeremy Bentham (1748-1832), and be among the first volunteer transcribers to test modern Handwritten Text Recognition (HTR) technology.</p>
				<p>TSX may appear familiar to participants in the award-winning Transcribe Bentham initiative, but introduces new and innovative functionalities beyond transcription.</p>
				<p>Volunteers may choose to receive from the HTR engine a full transcript of a given manuscript image, and then correct this automated transcript against the original, or to take advantage of the interactive transcription mode, in which the HTR engine offers suggestions for a subsequent word or words as you type.</p>
				<p>These methods of participation are more fully explained in our instructional material.</p>
				<p>We hope that you will be interested in testing out this innovative technology, and welcome any questions or feedback - positive or negative - to <a href="mailto:transcribe.bentham@ucl.ac.uk">transcribe.bentham@ucl.ac.uk</a>.</p>
				<div class="well well-sm" style="text-align: center;">
					<strong>To begin transcribing please <span class="tsx-not-logged-in"><button type="button" class="btn btn-default" data-toggle="modal" data-target="#createAccountModal">Sign up</button> or <button type="button" class="btn btn-default" data-toggle="modal" data-target="#loginModal">Sign in</button> and </span>visit the <a href="<?php print $TSX_root;?>/desk"><button type="button" class="btn btn-default" title="TSX Desk">TSX Desk</button></strong></a>
				</div>
-->
<!--
			</div>
	    </div> -->
<!--	</div> -->
<!--  	<div class="col-md-9 col-md-push-3"> -->
<!--	    <div class="panel panel-default">
			<div class="panel-heading"><strong>Credits</strong></div>
			<div class="panel-body">
				<p>TSX was developed by the <a href="http://www.ulcc.ac.uk">University of London Computer Centre</a> and <a href="http://www.ucl.ac.uk">University College London</a> as part of the EU FP7-funded tranScriptorium consortium, which is developing innovative, efficient and cost-effective solutions for the indexing, searching, and full transcription of historic handwritten manuscript images, using modern, holistic HTR technology.</p>
				<p>tranScriptorium is led by the <a href="http://www.upv.es">Universitat Politècnica de València</a>, and has received funding from the European Union’s Seventh Framework Programme for research, technological development and demonstration under grant agreement no 600707.</p></p>
			</div>
	    </div>
	</div>
-->


   </div>
	  	<div class="col-md-12">

			<div class="well well-sm" style="text-align: center;">

			<p>TSX was developed by the <a href="http://www.ulcc.ac.uk">University of London Computer Centre</a> and <a href="http://www.ucl.ac.uk">University College London</a> as part of the EU FP7-funded tranScriptorium consortium, which is developing innovative, efficient and cost-effective solutions for the indexing, searching, and full transcription of historic handwritten manuscript images, using modern, holistic HTR technology.</p>
			<p>tranScriptorium is led by the <a href="http://www.upv.es">Universitat Politècnica de València</a>, and has received funding from the European Union’s Seventh Framework Programme for research, technological development and demonstration under grant agreement no 600707.</p></p>
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
			var data_server = "https://dbis-faxe.uibk.ac.at/TrpServer/rest/";
		tsxController = new TSXController({data_server: data_server});
	});
</script>

</body>
</html>
