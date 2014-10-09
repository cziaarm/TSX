/*
 * jQuery Activity
 * December 20, 2009
 * Corey Hart @ http://www.codenothing.com
 */

/* TSX "Class" */	
function TSX(config) {
	this.data_server = config.data_server;
	this.data_list = config.data_list;
	this.htr_server = config.htr_server;
	this.dia_server = config.dia_server;
	this.sessionId = $.cookie("TSX_session");
	this.local = false;
	this.logged_in = false;
	this.mode = "plain";
	this.edit_view = "encoded";
	this.current_doc;
	this.docs;
	this.metrics = {};
	this.cm = undefined;
	self = this;

	//init: check connection to data server
	// have connection fire afterConnection()
	// don't have connection: if anauth fire credentials else report error
	this.init = function (){
		$("#TSX_main").hide();	
		$("#login_section").hide();		
		//session is local no need for auth etc
		if(!window.location.protocol.match(/^http/)){
			self.local = true;
			var local_docs = self.data_server+"index.html";
			$.getJSON(  local_docs  )
				.done(function( json ) {
					self.docs = json;
					$("#connection_message").remove();
					self.afterConnection();
//					self.render_data_list();
				  })
				  .fail(function( jqxhr, textStatus, error ) {
					var err = textStatus + ", " + error;
					console.log( "Request Failed: " + err );
				});

		}else{
			//check the remote connection	
			$.getJSON(  self.data_server+self.data_list, {JSESSIONID: self.sessionId} )
				.done(function(data, textStatus, jqxhr){
					self.logged_in = true;
					self.docs = data;
					self.afterConnection();
				}).fail(function(jqxhr,textStatus,error){
					if(error === 'Unauthorized'){
						self.credentials();
					}else{
						console.log("Connection failure: "+error);
						alert("Could not connect to data server: "+self.data_server);
					}
				}).always(function(){
					$("#connection_message").remove();
				});
		}
	}
	//credentials: dialog for getting (ans setting) credentials
	this.credentials = function(callback){
		 dialog = $( "#dialog-form" ).dialog({
			autoOpen: false,
			height: 300,
			width: 420,
			modal: true,
			buttons: {
				"Create account": self.addUser,
				"Log in": self.authenticate,
				Cancel: function() {
					dialog.dialog( "close" );
				},
				
			},
			close: function() {
				form[ 0 ].reset();
				//allFields.removeClass( "ui-state-error" );
			}
		});
		form = dialog.find( "form" ).on( "submit", function( event ) {
			event.preventDefault();
			addUser();
		});
		dialog.dialog( "open" );
 
/*		$( "#login" ).button().on( "click", function() {
			dialog.dialog( "open" );
		});
*/
	}
	//authenticate: authenticate user credentials against data_server and set cookie
	this.authenticate = function(){
//		var auth_url = self.data_server+"auth/login_debug";
		var auth_url = self.data_server+"auth/login";
		data = {user: $("#email").val(), pw: $("#password").val()};
		var jqxhr = $.post( auth_url, data, function(d) {
			self.sessionId = $(d).find("trpUserLogin sessionId").html();
			$.cookie("TSX_session", self.sessionId);
		//	dialog.dialog( "close" );
			$( "#dialog-form" ).dialog("close");
//			console.log("Have set cookie: "+self.sessionId);
			self.afterConnection();
		}).fail(function(jqxhr,textStatus,error) {
			$("#auth_error_message").html("We were unable to authenticate you using the username and password supplied, please try again or create an account if you don't have one.");
		});
		 
//		?user=trpUser&pw=test123
	}
	this.addUser = function() {
/*
	      var valid = true;
	      allFields.removeClass( "ui-state-error" );
	 
	      valid = valid && checkLength( name, "username", 3, 16 );
	      valid = valid && checkLength( email, "email", 6, 80 );
	      valid = valid && checkLength( password, "password", 5, 16 );
	 
	      valid = valid && checkRegexp( name, /^[a-z]([0-9a-z_\s])+$/i, "Username may consist of a-z, 0-9, underscores, spaces and must begin with a letter." );
	      valid = valid && checkRegexp( email, emailRegex, "eg. ui@jquery.com" );
	      valid = valid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );
	 
	      if ( valid ) {
		$( "#users tbody" ).append( "<tr>" +
		  "<td>" + name.val() + "</td>" +
		  "<td>" + email.val() + "</td>" +
		  "<td>" + password.val() + "</td>" +
		"</tr>" );
		dialog.dialog( "close" );
	      }
	      return valid;
*/
    	}

	this.afterConnection = function(){
		$("#TSX_main").show(function(){
			$("#login_section").hide();
		});
		self.start_session();	
		self.init_panels();
		self.init_mode_handling();	
		if(self.local){
			self.render_local_data_list();
		}else{
			if(self.docs === undefined){
				$.getJSON(  self.data_server+self.data_list, {JSESSIONID: self.sessionId} )
					.done(function(data, textStatus, jqxhr){
					self.logged_in = true;
					self.docs = data;
					self.render_data_list();
				}).fail(function(jqxhr,textStatus,error){
					console.log("Connection failure: "+error);
					alert("Could not connect to data server: "+self.data_server);
				}).always(function(){
					$("#connection_message").remove();
				});
			}else{
				self.render_data_list();
			}
		}

	}

	function now(){
		return (new Date).getTime();
	}

	this.start_session = function(){
		console.log("starting session");
		self.metrics = {sessionstart : new Date(),
						subsessions : [],
						session_index: -1};
		self.tsx_areas = ["control-column","data-column","edit-column","image-column"];
						
		console.log(self.metrics.sessionstart);
		console.log(self.metrics.sessionstart.getTime());
		for(i in self.tsx_areas){
			self.init_idleTimer("#"+self.tsx_areas[i]);
		}
			//self.init_idleTimer("#data-column");
	/*	 $.activity.init({
			// Set interval check to every 5 seconds
			interval: 1000*5,
			intervalFn: function(info){
				console.log('Interval Check - Last Active:', info.lastActive, ', Difference in milliseconds to current time:', info.diff);
			},
			// Set inactive check to every 15 seconds
			inactive: 1000*5*3,
			inactiveFn: function(info){
				console.warn('Inactive Triggered - Last Active:', info.lastActive, ', Difference in milliseconds to current time:', info.diff);
				console.log(self.metrics);
			}
		});
		*/
/*
		// Either reactivate, or update the current timestamp when user clicks on the page
		$(document).on("click keydown", "body", function(e){
			if(/(^|\s)m-(\w+)(\s|$)/.test($(e.target).attr("class"))){
				var tsx_area = RegExp.$2;
				if(self.metrics[tsx_area].start != undefined){
					self.metrics[tsx_area].elapsed = $.activity.now()-self.metrics[tsx_area].start;
				}
				self.metrics[tsx_area].start = $.activity.now()
			}
			if ( $.activity.isActive() )
				$.activity.update();
			else
				$.activity.reActivate();
		});
*/
	}
	this.init_idleTimer = function(tsx_area_elem){
		var tsx_area = $(tsx_area_elem).attr("id");
		//create idleTimer for this tsx_area
		$( tsx_area_elem ).idleTimer( {
			timeout:5000,
			events: "mousedown keydown",
			idle: true,
       		});

		//.idleTimer("pause");
		 $( tsx_area_elem ).on( "idle.idleTimer", function(event, elem, obj){
			// function you want to fire when the user goes idle
			console.log("User is idle: "+tsx_area);
			var subsession = self.metrics.subsessions[self.metrics.subsession_index];
			subsession.elapsed = now()-subsession.start;
			console.log("Time spent on "+tsx_area+" is "+subsession.elapsed);
		});

			//stop idleTimer(s) for other tsx_areas by firing their idle event
			$( ".column" ).not("#"+tsx_area).each(function(){				
				if(!$(this).idleTimer("isIdle")){
					console.log("triggering idleness for "+$(this).attr("id"));
					var e= new Event("idle.idleTimer");
					$(this).trigger(e);
					//need to stop this being triggered again by the idleTimer source (due to idelness)...!!
				}
			});
			console.log("User is active: "+tsx_area);
			//start the clock for tsx_area... create a sub-session
			self.metrics.subsession_index++;
			self.metrics.subsessions[self.metrics.subsession_index] = 
				{tsx_area: tsx_area, start : now(), elapsed : 0};
		//});
	}

	this.render_local_data_list = function(){
		$("#data-container").append("<div id=\"data-list\"><ul></ul></div>");
		for( var box_num in self.docs.iids){
			$("#data-list ul").append("<li class=\"box\" id=\""+box_num+"\">"+box_num+"</li>");
		}

		$(".box").on("click", function(){

		//console.log("get box contents for "+$(this).attr("id"));
			var box = self.docs.iids[$(this).attr("id")];
			$("#data-list ul").empty().addClass("grid");
			for( var id in box){
				var thumb = self.data_server+box[id].replace(/JB\./, "tn_") + ".png";
				$("#data-list ul").append("<li class=\"doc_ref\" id=\""+box[id]+"\"><img src=\""+thumb+"\" title='"+box[id]+"'/>"+box[id]+"</li>");
			}

			$(".doc_ref").on("click", function(){
				self.current_page = $(this).attr("id").replace(/JB\./, "");
				var image = self.data_server+self.current_page + ".jpg";
				self.load_image(image);
				self.load_transcript();
			});
		});
	}
	this.render_data_list = function(){

		$("#data-container").append("<div id=\"data-list\"><ul></ul></div>");
		for( var i in self.docs){
			$("#data-list ul").append("<li class=\"batch\" data-docId=\""+self.docs[i].docId+"\">"+self.docs[i].title+"</li>");
		}
		$(".batch").on("click", function(){
			self.current_doc = $(this).attr("data-docId");
			var url = self.data_server+"docs/"+$(this).attr("data-docId")+"/fulldoc";
			$.getJSON(  url  )
		  		.done(function( json ) {
					self.docs = json;
					self.render_docs_list();
				  })
				  .fail(function( jqxhr, textStatus, error ) {
					var err = textStatus + ", " + error;
					console.log( "Request Failed: " + err );
				});
		});
	}
	this.render_docs_list = function(){
		var pages = self.docs.pageList.pages;
	
		//create fake boxes subdir
		var boxes = [];
		for(var i in pages){
			pages[i].imgFileName.match(/^(\d+)_.+$/);
			box = RegExp.$1;
			if(boxes[box] === undefined) boxes[box] = [];
			boxes[box].push(pages[i]);
		}	
		$("#data-list ul").empty();
		for( var box_num in boxes){
			$("#data-list ul").append("<li class=\"box\" id=\""+box_num+"\">"+box_num+"</li>");
		}

		$(".box").on("click", function(){

		//console.log("get box contents for "+$(this).attr("id"));
			var box = boxes[$(this).attr("id")];
			$("#data-list ul").empty().addClass("grid");
			for( var i in box){
//				$("#data-list ul").append("<li class=\"doc_ref\"rel=\""+box[i].url+"\" data-pageInd="+box[i].pageNr+"><img src=\""+box[i].thumbUrl+"\" title='"+box[i].imgFileName+"'/>"+box[i].imgFileName+"</li>");
				$("#data-list ul").append("<li class=\"doc_ref\"rel=\""+box[i].url+"\" data-pageInd=\""+i+"\"><img src=\""+box[i].thumbUrl+"\" title='"+box[i].imgFileName+"'/>"+box[i].imgFileName+"</li>");

			}

			$(".doc_ref").on("click", function(){
				self.current_page = $(this).attr("data-pageInd");
				self.load_image($(this).attr("rel"));
				self.load_transcript();

			});
		});
	}

	this.init_panels = function(){
		$("#control")
			.addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
			.resizable()
			.find( ".column-header" )
			.addClass( "ui-widget-header ui-corner-all" )
			.prepend( "<span class='ui-icon ui-icon-minusthick column-toggle'></span>");
		
		$("#zoom-slider").slider();
		
		  $('#fullscreen').on("change", function() {
				if($.fullscreen.isFullScreen()){
					$.fullscreen.exit();
					$('#fullscreen').html("Full screen");
				}else{
					$('body').fullscreen();
					$('#fullscreen').html("Exit full screen");
				}
								return false;
		}).button();
		
		$( "#columns" ).sortable({
			//    connectWith: ".column",
			handle: ".column-header",
			cancel: ".column-toggle",
		      	//placeholder: "column-placeholder ui-corner-all",
			//axis: "x"
		});

		$( "#columns .column" )
			.addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
			.find( ".column-header" )
			.addClass( "ui-widget-header ui-corner-all" )
			.prepend( "<span class='ui-icon ui-icon-minusthick column-toggle'></span>");

		$("#data-column, #image-column").resizable();
		//TODO: refresh cm on resize
		$("#edit-column").resizable({alsoResize: "#edit-area #CodeMirror-scroll"});
		
		$( ".column-toggle" ).click(function() {
			console.log("toggle");
			var icon = $( this );
			icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
			icon.closest( ".column" ).find( ".column-content" ).toggle();
		});
		$( ".panel-view" ).on("change", function() {
			var panel = $(this).attr("rel");
			$( "#"+panel ).toggle();
		}).attr("checked", "check");
		$("#panel-control").buttonset();

		self.cm = CodeMirror(document.getElementById("edit-area"),{lineNumbers: true});
		
		//TODO pickup the cm event 
		$("#edit-area").on("mousedown", function(e){
			console.log(self.report_line());
		});
		$("#edit-area").on("keydown", function(e){
			//console.log("which: "+e.which);
			//return
			if(e.which === 13){
				console.log(self.report_line());
			}
			//up
			if(e.which === 38){
				console.log(self.report_line());
			}
			//down
			if(e.which === 40){
				console.log(self.report_line());
			}
			//delete
			if(e.which === 8){
				console.log(self.report_line());
			}
		});
		$("#edit-view-switch span#edit-view-"+self.edit_view).css({color: "#000"});
		$("#edit-view-switch span").on("click", function(){
				if($(this).attr("id").match(/encoded$/)){
					$("#edit-view-switch span#edit-view-encoded").css({color: "#000"});
					$("#edit-view-switch span#edit-view-visual").css({color: "#ccc"});
					self.edit_view = "encoded";
				}else{
					$("#edit-view-switch span#edit-view-encoded").css({color: "#ccc"});
					$("#edit-view-switch span#edit-view-visual").css({color: "#000"});
					self.edit_view = "visual";
					self.render_visual();
			}
		});
		
/*		$(".tei").on("click",function(){
			var from = self.cm.getCursor("from");
			var to = self.cm.getCursor("to");	
			console.log("marking text with class tei-"+$(this).attr("id"));
			self.cm.markText(from, to, {className: "tei-"+$(this).attr("id")});
		});
		*/
		$(".tei-insert").on("click",function(){			
			self.cm.replaceSelection("<"+$(this).attr("id")+"/>");
		});
		$(".tei-wrap").on("click",function(){
			var text = self.cm.getSelection();
			self.cm.replaceSelection("<"+$(this).attr("id")+">"+text+"</"+$(this).attr("id")+">");
		});
		$(".page-format").on("click",function(){
			var text = self.cm.getSelection();
			var from = self.cm.getCursor("from");
			var to = self.cm.getCursor("to");
			//in the <pre> (or do we build/amend the "page" data structure as we go along)
			self.cm.addLineClass(from.line, "text", "page-"+$(this).attr("id")+"-start");
			self.cm.addLineClass(to.line, "text", "page-"+$(this).attr("id")+"-end");
			//also in the wrapping element for visual effect
			self.cm.addLineClass(from.line, "wrap", "page-"+$(this).attr("id")+"-start");
			self.cm.addLineClass(to.line, "wrap", "page-"+$(this).attr("id")+"-end");
		});
	}
	this.render_visual = function(){
		console.log("rendering visual");
		//TODO Switch TEI tags for spans with tei-class
	}
	this.render_encoded =- function(){
		console.log("rendering encoded");
		//TODO Switch spans with tei-class for TEI tags
	}
	this.report_line = function(){
		var cursor = self.cm.getCursor();
		if(self.ts_data != undefined && self.ts_data[cursor.line] != undefined){
			console.log(self.ts_data[cursor.line].poly);
		}
		return cursor.line;
	}
	this.init_mode_handling = function (){
		$( "#control-column" ).find( ".column-header span" ).html(" - "+ucfirst(self.mode));
		$("#mode").on("change", function(){
			console.log("I am in "+$(this).val()+" mode");
			self.mode = $(this).val();
			$(this).closest( ".column" ).find( ".column-header span" ).html(" - "+ucfirst(self.mode));
		});
	}

	this.load_image = function(image) {
				$("#image-canvas").css({background: "none"}).drawText({
				  fillStyle: '#333',
				  strokeStyle: '#ccc',
				  strokeWidth: 1,
				  x: 150, y: 10,
				  fontSize: 14,
				  fontFamily: 'Verdana, sans-serif',
				  text: "Please wait, fetching image..."});
				
				var img = new Image();

				$(img).attr('src', image).load(function() {

					$("#image-control").fadeIn();
					var dw = $("#image-canvas").width();
					console.log(img.width);
					var ratio = dw/img.width;
					var canvas_height = ratio*img.height;
 
   					$(this).remove(); // prevent memory leaks as @benweet suggested
					$("#image-canvas").
						clearCanvas().
						css({background: 'url('+image+') no-repeat', 'background-size': '100%', height: canvas_height+"px"}).
						panzoom({
							minScale: 1,
							$zoomIn: $("#zoom-in").button(),
							$zoomOut: $("#zoom-out").button(),
							$zoomRange: $("#zoom-slider").slider(),
							$reset: $("#reset").button(),
							animate: true,
						}).
						   parents("div").
						   css("height", canvas_height+"px");
						    //mousewheel stuff is jerky with animate, but without animate it doesn't fix resolution
						   /*.on('mousewheel.focal', function( e ) {
								e.preventDefault();
								var delta = e.delta || e.originalEvent.wheelDelta;
								var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
								$("#image-canvas").panzoom('zoom', zoomOut, {
									increment: 0.05,
									animate: true,
									focal: e
								});
							});*/
				});

				
				//Draw Polygons on canvas image
				// http://www.jqueryscript.net/demo/jQuery-Plugin-For-Canvas-Image-Map-Area-Editor-Canvas-Area-Draw/
				//var canvas = $('<canvas style="background: url('+image+') no-repeat; background-size: '+i_width+'px" width="'+i_width+'" height="600"></canvas>');
				//$("#image-container").empty().append(canvas);
	}
	this.load_transcript = function() {
		if(self.local){
			var url = self.data_server+"page/"+self.current_page+".xml";
			console.log("Loading transcript: "+url);
			$.get(url)
				.done(function( doc ) {
					console.log("HERE");
					self.current_transcript = doc;
					self.render_transcript();
				 })
				  .fail(function( jqxhr, textStatus, error ) {
					var err = textStatus + ", " + error;
					console.log( "Request Failed: " + err );
				});
				
		}else{
			var transcripts = self.docs.pageList.pages[self.current_page].tsList.transcripts;
	/*		var url = self.data_server+"docs/"+self.current_doc+"/"+self.current_page+"/text";
			console.log("Loading transcript: "+url);
			$.get(url, {JSESSIONID : self.sessionId}  )
				.done(function( doc ) {
					self.current_transcript = doc;
					self.render_transcript();
				 })
				  .fail(function( jqxhr, textStatus, error ) {
					var err = textStatus + ", " + error;
					console.log( "Request Failed: " + err );
				});
	*/
			if(transcripts.length == 1){
				self.handle_transcript(transcripts[0]);
			}else if(!transcripts.length){
				console.log("No transcript available");
			}else{
				self.handle_transcript_list(transcripts);
			}
		}
	}	
	this.render_transcript = function (){
		self.ts_data = [];
		var line = 0;
		$(self.current_transcript).find("TextLine").each(function(){
			self.ts_data[line] = {
				text: $(this).find(" > TextEquiv > Unicode").html(), 
				poly: $(this).find(" > Coords").attr("points")
			};
			line++;
		});
		for(var i in self.ts_data){
			console.log(i);
			self.cm.replaceRange(self.ts_data[i].text+"\n", {line:line, ch: 0});
		}

/*
		$(self.current_transcript).find("TextLine > TextEquiv > Unicode").each(function(){
			console.log(line);
			self.cm.replaceRange($(this).html()+"\n", {line:line, ch: 0});
			line++;
		});
*/
	}
	this.handle_transcript = function(transcript){
		console.log(transcript);
		var url = transcript.url;
		console.log("Loading transcript: "+url);
		$.get(url, {JSESSIONID : self.sessionId}  )
			.done(function( doc ) {
				self.current_transcript = doc;
				self.render_transcript();
			 })
			  .fail(function( jqxhr, textStatus, error ) {
				var err = textStatus + ", " + error;
				console.log( "Request Failed: " + err );
			});

	}
	this.handle_transcript_list = function(transcripts){
		for(var i in transcripts){	
			console.log(transcripts[i].url);	
		}

	}
	this.get_wglist = function (){
		console.log("I will get the wglist from the "+this.data_server);
		console.log($("#text-area"));
	}

	function ucfirst(str) {
	  str += '';
	  var f = str.charAt(0)
	    .toUpperCase();
	  return f + str.substr(1);
	}

/*	function MouseWheelHandler(e) {
		// cross-browser wheel delta
		var e = window.event || e;
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		sq.e.style.width = Math.max(sq.zoom, Math.min(sq.nw, sq.e.width + (sq.zoom * delta))) + "px";
		return false;
	}
*/

}




//Store images and xml in wiki?
	//http://en.wikipedia.org/wiki/Help:File_page

//	var tsx = new TSX({data_server: "http://www.transcribe-bentham.da.ulcc.ac.uk/tsx/TSX_images/"});




$(document).ready(function(){
		switch(window.location.protocol) {
			case 'http:':
			case 'https:':
			 //remote file over http or https
			 var tsx = new TSX({data_server: "https://dbis-faxe.uibk.ac.at/TrpServerBentham/rest/",data_list: "docs/list"});

			 break;
			case 'file:':
				var tsx = new TSX({data_server: "./TSX_images/", data_list: "index.html"});
			 //local file
			 break;
			default: 
				//some other protocol
		}

	tsx.init();
});


