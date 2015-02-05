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
						<button id="tsx-save-tei" type="button" class="btn btn-default" title="Save changes"><span class="glyphicon glyphicon-save"></span></button>
						<button id="tsx-toggle-transcript" type="button" class="btn btn-default" title="Clear transcript"><span class="glyphicon glyphicon-list-alt"></span></button>
				</div>
			</div>
			<div class="panel-body" id="tsx-edit-panel">
				<ul class="nav nav-tabs">
					<li role="presentation" class="active"><a data-toggle="tab" href="#tsx-edit">Edit</a></li>
					<li role="presentation"><a data-toggle="tab" href="#tsx-preview">Preview</a></li>
					<li role="presentation"><a data-toggle="tab" href="#tsx-diffs">Diffs</a></li>
				</ul>
				<div class="tab-content">
					<div id="tsx-edit" class="tab-pane fade in active">
						<div id="tsx-tei-buttons" class="btn-toolbar" role="toolbar" aria-label="...">
							<div class="btn-group" role="group" aria-label="TEI tools">
<!--								<button id="tsx-tei-linebreak" type="button" class="btn btn-default" title="Pagebreak"><span class="icon icon-pagebreak"></span></button> -->
								<button id="tsx-tei-head" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Heading"><span class="icon icon-heading"></span></button>
								<button id="tsx-tei-p" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Paragraph">p</button>
								<button id="tsx-tei-add" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Addition">[+]</button>
								<button id="tsx-tei-del" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Deletion"><strike>str</strike></button>
								<button id="tsx-tei-unclear" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Questionable">?</button>
								<button id="tsx-tei-gap" type="button" class="btn btn-default btn-sm tsx-tei-insert" title="Illegible">[...]</button>
								<button id="tsx-tei-note" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Mrginal note">note</button>
								<button id="tsx-tei-underscore" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Underscore"><u>U</u></button>
								<button id="tsx-tei-super" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Superscript">x<sup>2</sup></button>
								<button id="tsx-tei-sic" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Unusual spelling">&lt;sic&gt;</button>
								<button id="tsx-tei-foreign" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Foreign">fr</button>
								<button id="tsx-tei-amp" type="button" class="btn btn-default btn-sm tsx-tei-insert" title="Ampersand">&amp;</button>
								<button id="tsx-tei-longdash" type="button" class="btn btn-default btn-sm tsx-tei-insert" title="Long dash">-</button>
								<button id="tsx-tei-comment" type="button" class="btn btn-default btn-sm tsx-tei-wrap" title="Comment">&lt;!--</button>
<!--								<button id="tsx-suggest" type="button" class="btn btn-default" data-toggle="popover" title="Suggestions for next word(s)" data-html="true" data-content="<img src='css/throbber.gif'/>"><span class="glyphicon glyphicon-question-sign"></span></button> -->
						</div>
						</div>
<!--						<div id="tsx-tei-buttons" rel="format" style="display: block;">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-linebreak.png?20141114T085607Z" width="22" height="22" alt="Line break" title="Line break" rel="line-break" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-pagebreak.png?20141114T085607Z" width="22" height="22" alt="Page break" title="Page break" rel="pagebreak" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-heading.png?20141114T085607Z" width="22" height="22" alt="Heading" title="Heading" rel="heading" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-paragraph.png?20141114T085607Z" width="22" height="22" alt="Paragraph" title="Paragraph" rel="paragraph" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-add.png?20141114T085607Z" width="22" height="22" alt="Addition" title="Addition" rel="addition" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-deletion.png?20141114T085607Z" width="22" height="22" alt="Deletion" title="Deletion" rel="deletion" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-questionable.png?20141114T085607Z" width="22" height="22" alt="Questionable" title="Questionable" rel="questionable" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-illegible.png?20141114T085607Z" width="22" height="22" alt="Illegible" title="Illegible" rel="illegible" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-note.png?20141114T085607Z" width="22" height="22" alt="Marginal Note" title="Marginal Note" rel="note" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-underline.png?20141114T085607Z" width="22" height="22" alt="Underline" title="Underline" rel="underline" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-superscript.png?20141114T085607Z" width="22" height="22" alt="SuperScript" title="SuperScript" rel="superscript" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-sic.png?20141114T085607Z" width="22" height="22" alt="Unusual spelling" title="Unusual spelling" rel="sic" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-foreign.png?20141114T085607Z" width="22" height="22" alt="Foreign" title="Foreign" rel="foreign" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-ampersand.png?20141114T085607Z" width="22" height="22" alt="Ampersand" title="Ampersand" rel="ampersand" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-longdash.png?20141114T085607Z" width="22" height="22" alt="Long dash" title="Long dash" rel="longdash" class="tool tool-button">
							<img src="/td/extensions/JBTEIToolbar/images/jb-button-comment.png?20141114T085607Z" width="22" height="22" alt="Comment" title="Comment" rel="commment" class="tool tool-button">
						</div>-->
						<div id="tsx-transcript-editor"></div>
					</div>
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
		var data_server = "https://dbis-faxe.uibk.ac.at/TrpServerTesting/rest/";
//	}
	
	tsxConroller = new TSXController({data_server: data_server, view_box: "#tsx-image", image_panel: "#tsx-image-panel", edit_panel: "#tsx-edit-panel"});
	});
</script>
</body>
</html>
