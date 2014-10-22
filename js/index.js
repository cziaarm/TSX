/*
TSX Transcriptorium Crowd-sourcing platform
Rory McNicholl
University of London Computer centre
 */

/* TSX "Class" */	
function TSX(config) {

	//communication config
	this.data_server = config.data_server;
	this.data_list = config.data_list;
	this.htr_server = config.htr_server;
	this.dia_server = config.dia_server;
	//session cookie
	this.sessionId = $.cookie("TSX_session");
	//flags
	this.local = false;
	this.logged_in = false;
	this.mode = "plain";
	this.edit_view = "encoded";
	this.htrConnected = false;
	
	//data structures
	//for the documents tree from the data server
	this.docs;
	//for the current selected document
	this.current_doc;
	//for transcription data
	this.ts_data = [];
	//for metrics
	this.metrics = {};
	//for the codeMirror object
	this.cm = undefined;
	
	//Key stroke management
	//keys that will (potentially) change the line of transcript the cursor is on
	//return, up, down, delete, pageup, pagedown
	this.line_change_keys = [13,38,40,8,33,34];
	//keys for accepting transcription suggestions
	//tab space (only if at end of word)
	this.accept_keys = [9,32];
	//keys to "ignore"
	this.control_keys = [17, 18, 16, 20, 35, 36, 37, 39, 45, 46, 91, 93, 144, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 145, 19, 13,38,40,33,34 ]; //ignore these
	//so we don't get all the other this' mixed up
	self = this;

	//init: check connection to data server
	// have connection fire afterConnection()
	// don't have connection: if unauthorised fire credentials else report error
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
				  })
				  .fail(function( jqxhr, textStatus, error ) {
					var err = textStatus + ", " + error;
					console.log( "Request Failed: " + err );
				});

		}else{
			//remote mode: check the remote connection if no session already in action
			if(self.sessionId != undefined){
				$.getJSON(  self.data_server+self.data_list, {JSESSIONID: self.sessionId} )
					.done(function(data, textStatus, jqxhr){
						self.logged_in = true; 
						self.docs = data; 
						self.afterConnection();
					}).fail(function(jqxhr,textStatus,error){
						//session expired or otherwise invalid: fire auth process
						if(error === 'Unauthorized'){
							self.credentials();
						}else{
							console.log("Connection failure: "+error);
							alert("Could not connect to data server: "+self.data_server);
						}
					}).always(function(){
						$("#connection_message").remove();
					});
			}else{
				//have no session so fire auth process
				self.credentials();
			}
		}
	}
	
	/************** USER AUTH Functions *******************/
	/** Functions for initial communication and 	     **/
	/** authentication with data server user management  **/
	/** etc						     **/
	/******************************************************/
	
	//credentials() show log-in dialog with option to create account
	this.credentials = function(){
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
	}
	//authenticate(): authenticate user credentials against data_server and set cookie
	this.authenticate = function(){
		var auth_url = self.data_server+"auth/login_debug";
		//console.log("Logging into Innsbruck with: "+auth_url+" and {user: "+$("#email").val()+", pw: "+$("#password").val()+"}");

//		var auth_url = self.data_server+"auth/login";
		data = {user: $("#email").val(), pw: $("#password").val()};
		var jqxhr = $.ajax( auth_url, {
			  crossDomain: true,
			  data: data,
		    	  xhrFields: {
			        withCredentials: true
			  }} )
		  .done(function(d) {
				//console.log("Storing session id: "+$(d).find("trpUserLogin sessionId").html());
				self.sessionId = $(d).find("trpUserLogin sessionId").html();
				$.cookie("TSX_session", self.sessionId);
				$( "#dialog-form" ).dialog("close");
				//console.log("Have set cookie: "+self.sessionId);
				self.afterConnection();

		  })
		  .fail(function(jqxhr,textStatus,error) {
				console.log("Login Failed");
				$("#auth_error_message").html("We were unable to authenticate you using the username and password supplied, please try again or create an account if you don't have one.");
		  })
		  .always(function() {
		 //   alert( "complete" );
		  });
	}
	//addUser(): add new user to data server using if poss same form as log-in
	//TODO everything
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

		
	/*************** TSX Session and metrics ****************/
	/** here we start a user transcription session and 	   **/
	/** gather metrics on how they use the UI			   **/
	/********************************************************/
	
	function now(){
		return (new Date).getTime();
	}
	//start_session(): define areas to track use of, call init idleTimer to gather time-spent data
	this.start_session = function(){
//		console.log("starting session");
		self.metrics = {sessionstart : new Date(),
						subsessions : [],
						session_index: -1};
	
		self.tsx_areas = ["control-column","data-column","edit-column","image-column"];
						
//		console.log(self.metrics.sessionstart);
//		console.log(self.metrics.sessionstart.getTime());
		for(i in self.tsx_areas){
			self.init_idleTimer("#"+self.tsx_areas[i]);
		}
	}
	//	init_idelTimer(): bind functions to a TSX area that will "timeout" after
	//	inactivity and more generally keep a clock running so we can record time-spent
	//	when a) user goes idle or b) user goes to another area
	//TODO :lots
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
		//	console.log("User is idle: "+tsx_area);
			var subsession = self.metrics.subsessions[self.metrics.subsession_index];
			subsession.elapsed = now()-subsession.start;
		//	console.log("Time spent on "+tsx_area+" is "+subsession.elapsed);
		});

		//stop idleTimer(s) for other tsx_areas by firing their idle event
		$( ".column" ).not("#"+tsx_area).each(function(){				
			if(!$(this).idleTimer("isIdle")){
		//		console.log("triggering idleness for "+$(this).attr("id"));
				var e= new Event("idle.idleTimer");
				$(this).trigger(e);
				//need to stop this being triggered *again* by the idleTimer source (due to idelness)...!!
			}
		});
		//console.log("User is active: "+tsx_area);
		//start the clock for tsx_area... create a sub-session
		self.metrics.subsession_index++;
		self.metrics.subsessions[self.metrics.subsession_index] = 
			{tsx_area: tsx_area, start : now(), elapsed : 0};

	}
	
	/************ TSX start-up *************/
	/** initialise the main bits of TSX   **/
	/***************************************/
	
	//afterConnection(): handle post login actions, calling various other init procedures etc
	this.afterConnection = function(){
		//show the main, hide the login
		$("#TSX_main").show(function(){
			$("#login_section").hide();
		});
		//start session (metrics)
		self.start_session();
		//show UI panels
		self.init_panels();
		//initialise the transcription mode
		self.init_mode_handling();
		//render the header and nav for the data and docs
		self.render_data_header();
		//if local, we already have the data
	//	if(self.local){
	//		self.render_local_data_list();
	//	}else{
			//check if we have already picked up the document tree
			if(self.docs === undefined){
				//no? lets get it from data_server
				$.ajax({
  				  url: self.data_server+self.data_list,
				  data:  {JSESSIONID: self.sessionId},
				  crossDomain: true,
				    xhrFields: {
				        withCredentials: true
				    }}).
					done(function(data, textStatus, jqxhr){
						self.logged_in = true; //not sure we need this here (will check when have connection)
						self.docs = data;
						self.render_data_list();
					}).
					fail(function(jqxhr,textStatus,error){
						console.log("Connection failure: "+error);
						alert("Could not connect to data server: "+self.data_server);
					}).
					always(function(){
						$("#connection_message").remove();
					});
			}else{
				self.render_data_list();
			}
		//}
	}
	//  init_panels(): prepare and show the four main TSX panels
	//	control (top) - change mode, toggle other panels, full screen and image zooming
	//	data (left) - show lists of batches, documents, pages, thumbnails, whatever
	//	edit (middle) - for editing the transcript
	//	image (right) - for showing the image of the document/page
	//	The position of all but control can be changed
	//  includes lots of action binding here
	this.init_panels = function(){
	
		//make sure mode is consistent with what is in dropdown
		if($("#mode").val() != undefined){
			self.mode = $("#mode").val();
		}
		//we set up the panels as sortable columns
		$( "#columns" ).sortable({
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
		//roll- and down panels with - and +
		$( ".column-toggle" ).click(function() {
			var icon = $( this );
			icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
			icon.closest( ".column" ).find( ".column-content" ).toggle();
		});
		
		//init control_panel
		self.control_panel(); //hehe the self control panel!!
		//init data panel
		self.data_panel();
		//init image panel
		self.image_panel();
		//init edit panel
		self.edit_panel();
		
	}

	this.control_panel = function(){
		//show the control panel
		$("#control")
			.addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
			.resizable()
			.find( ".column-header" )
			.addClass( "ui-widget-header ui-corner-all" )
			.prepend( "<span class='ui-icon ui-icon-minusthick column-toggle'></span>");
		
		//init the zoom slider (for image zooming)
		$("#zoom-slider").slider();
		//set-up the fullscreen button
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
		//buttons for hiding and showing the other panels
		$( ".panel-view" ).on("change", function() {
			var panel = $(this).attr("rel");
			$( "#"+panel ).toggle();
		}).attr("checked", "check");
		
		$("#panel-control").buttonset();
	}
	this.data_panel = function(){
			
		//make panel resizable
		$("#data-column").resizable();
	
	}
	this.image_panel = function(){		
		//make panel resizable
		$("#image-column").resizable();
	
	}
	this.edit_panel = function(){
		//make edit panel resizable (but also codeMirror)
		$("#edit-column").resizable({alsoResize: "#edit-area .CodeMirror"});

		//we use codeMirror to control and manipulate the transcript editing area
		self.cm = CodeMirror(document.getElementById("edit-area"),{lineNumbers: true});
		
		//bind htr communication to edit-area IF we are in interactive mode
		$("#edit-area").on("mousedown", function(e){
			//always handle_move when there is a potential line change!
			self.handle_move();
			
			//console.log(self.mode+' === "interactive" && '+self.htrSocketPort+' && !'+self.htrConnected);
			//the conditions are right, lets HTR!
			//This could not get called if one tabs to the edit-area???? maybe focus would be more appropriate
			//TODO move this block into a focus()
			if(self.mode === "interactive" && self.htrSocketPort && !self.htrConnected){
				self.connect_to_htr(e);
				self.suggestion_handling();
			}
		});
		
		$("#edit-area").on("keydown", function(e){
		
			//call handle move for a designated set of "action keys" that will move the line
			if($.inArray(e.which, self.line_change_keys)>=0){
				self.handle_move(e);
			}
			//tab complete

		});
		self.init_TEI_editing();
	}
	//init_mode_handling() actions dependent on transcription mode
	// 1. plain - no transcript (though layout data loaded if available)
	// 2. post - transcript for whole page loaded into edit area
	// 3. interactive - no transcript, but HTR interaction initialised for predictive suggestions
	this.init_mode_handling = function (){
		$( "#control-column" ).find( ".column-header span" ).html(" - "+ucfirst(self.mode));
		$("#mode").on("change", function(){
	//		console.log("I am in "+$(this).val()+" mode");
			self.mode = $(this).val();
			$(this).closest( ".column" ).find( ".column-header span" ).html(" - "+ucfirst(self.mode));
			//no current page loaded so we don't care at this point...action-wise?
			if(self.current_page === undefined){
					return false;
			}
	
			//current_page is defined, but the transcript data is not loaded 
			if(self.ts_data[self.current_page] === undefined){
					//load transcript data
					self.load_transcript();
			}
			
			switch(self.mode) {
				case "plain":
						//hide transcript
						self.unrender_transcript();
					break;
				case "post":
						//show transcript
						self.render_transcript();
					break;
				case "interactive":
						//hide transcript
						self.unrender_transcript();
						//init handwriting transcription recognition... I have no idea what HTR actually stands for
						self.init_htr();
					break;
				default:
					console.log("mode not defined");
			}				
		});
	}		
	
	/****************** Doc/Data presentation ****************/
	/** After comms, auth and UI main sorted out we will	**/ 
	/** access the lists of docs stored on the data server  **/
	/** and present them to the user in some form		    **/
	/*********************************************************/
		
	this.render_data_header = function(){
		$("#nav-control").html('<p>Data source: <span class="nav_link" id="nav-0">'+self.data_server+'</span></p>');
		//yuck.. why won't this live bind...
		$("#nav-0").on("click", function(){
				self.move_nav(this);
		});
	}
	this.build_nav = function(id, level,ref){
			console.log("building nav for "+id+" - "+level);
			if($("#nav-control p").find("#nav-"+level).length ==0){
				$("#nav-control p").append('<span class="nav_link" id="nav-'+level+'" data-ref="'+id+'">:'+id+'</span>');
				$("#nav-"+level).on("click", function(){
					self.move_nav(this);
				});
			}else{
				$("#nav-control p #nav-"+level).html(':'+id);
			}
	}
	this.move_nav = function(nav_link){
		var level =  parseInt($(nav_link).attr("id").replace(/^nav-/,""));
		var id =  $(nav_link).attr("data-ref");

		$("#nav-control span").each(function(){
			if(parseInt($(this).attr("id").replace(/^nav-/,"")) > level){
				$(this).remove();
			}
		});
		//differences in local / remote data structures....
		//remote root:batches:boxes:images
		//local root:boxes:images
		switch(level){
			case 0 : self.render_data_list(); break;
			case 1 : self.render_data_list(id); break;
			case 2 : if(self.local) self.load_image(); else self.render_docs_list(); break;
			case 3 : self.load_image(); break;
			default : console.log("level not catered for");
		}
	}
	//render_data_list(): render the document tree and bind the "next-step" actions to the batches/folders/directories etc
	this.render_data_list = function(box){
		
		self.unload_image();
		self.unrender_transcript();
		
		if(self.local){
			self.render_local_data_list(box);
			return;
		}

		//render docs "tree"... tree in the very loosest sense of the word
		$("#data-container").append("<div id=\"data-list\"><ul></ul></div>");
		for( var i in self.docs){
			$("#data-list ul").append("<li class=\"batch\" data-docId=\""+self.docs[i].docId+"\">"+self.docs[i].title+"</li>");
		}
		//bind next steps...
		$(".batch").on("click", function(){
			//set the chosen document as the current_doc
			self.current_doc = $(this).attr("data-docId");
			//add to nav
			self.build_nav($(this).attr("data-docId"),1);
			//get the data on pages and transcripts etc
			var url = self.data_server+"docs/"+$(this).attr("data-docId")+"/fulldoc";
			$.ajax({
  				  url: url,
				  crossDomain: true,
				    xhrFields: {
				        withCredentials: true
				    }}).
					done(function(json, textStatus, jqxhr){
						//hmmm docs has morphed from data-structure for all docs to one for pages/transcripts for a particular doc
						//TODO check out a suitable name change for this var
						self.docs = json;
						//render list of actual docs (ie thumbnails) maybe pages would be a better term?
						self.render_docs_list();
					}).
					fail(function(jqxhr,textStatus,error){
						var err = textStatus + ", " + error;
						console.log( "Request Failed: " + err );
					}).
					always(function(){
//						$("#connection_message").remove();
					});
		});
	}
	//render_local_data_list(): This is a local version of the above
	//TODO: have this running off same data structures as found in innsbruck
	this.render_local_data_list = function(box){
		//render list of docs/batches
		$("#data-container").html("<div id=\"data-list\"><ul></ul></div>");
		console.log("box: "+box);
		if(box != undefined){
			console.log("rendering box");
			self.render_box(box);
			return;
		}
		for( var box_num in self.docs.iids){
			$("#data-list ul").append("<li class=\"box\" id=\""+box_num+"\">Box: "+box_num+"</li>");
		}
		//bin next-step functions
		$(".box").on("click", function(){
			//add to nav
			self.build_nav($(this).attr("id"),1);
			self.render_box($(this).attr("id"));
		
		});
	}
	this.render_box = function(id){
		//which in this case involve building the thumbnails list
			self.unload_image();
			self.unrender_transcript();
			var box = self.docs.iids[id];
			$("#data-list ul").empty().addClass("grid");
			for( var id in box){
				var thumb = self.data_server+box[id].replace(/JB\./, "tn_") + ".png";
				$("#data-list ul").append("<li class=\"doc_ref\" id=\""+box[id]+"\"><img src=\""+thumb+"\" title='"+box[id]+"'/>"+box[id]+"</li>");
			}
			//and binding the image/transcript loading functions
			$(".doc_ref").on("click", function(){
				self.current_page = $(this).attr("id").replace(/JB\./, "");
				//add to nav
				self.build_nav(self.current_page,2);
				var image = self.data_server+self.current_page + ".jpg";
				self.load_image(image);
			});
	}
	//render_docs_list(): when in remote mode this will render list of pages (thumbnails) and bind image and transcription loading functions
	this.render_docs_list = function(){
		
		var pages = self.docs.pageList.pages;
	
		//create an intermediary "box" level to prevent browsing entire documents (ie hundreds of pages and thumbnails)
		//This is done by using the first number from the ref with syntax: \d+_\d+_\d+
		var boxes = [];
		for(var i in pages){
			pages[i].imgFileName.match(/^(\d+)_.+$/);
			box = RegExp.$1;
			if(boxes[box] === undefined) boxes[box] = [];
			boxes[box].push(pages[i]);
		}
		//clean out the data liist
		$("#data-list ul").empty();
		//render it again with the box list
		for( var box_num in boxes){
			$("#data-list ul").append("<li class=\"box\" id=\""+box_num+"\">Box: "+box_num+"</li>");
		}
		//bind the next-step functions for the box refs
		//ie rendering the thumbnails for a box
		$(".box").on("click", function(){

			var box = boxes[$(this).attr("id")];
			//use .grid class to display thumbs
			$("#data-list ul").empty().addClass("grid");
			for( var i in box){
				//page_ref is what we should be refering to the page as (for HTR server)
				var page_ref = box[i].imgFileName.replace(/\.\w+$/,"");
				$("#data-list ul").append("<li class=\"doc_ref\"rel=\""+box[i].url+"\" data-pageInd=\""+i+"\" data-pageRef=\""+page_ref+"\"><img src=\""+box[i].thumbUrl+"\" title='"+box[i].imgFileName+"'/>"+box[i].imgFileName+"</li>");

			}
			//bind image and transcript loading functions (finally!)
			$(".doc_ref").on("click", function(){
				//set choosen as current page
				self.current_page = $(this).attr("data-pageInd");
				// and it;s ref as current_page_ref
				self.current_page_ref = $(this).attr("data-pageRef");
				//call load_image (this will in turn call load_transcript(s) when done
				self.load_image($(this).attr("rel"));
			});
		});
	}
	
	
	/******************************* EDITING ********************************/
	/** functions for editing transcripts								   **/
	/** 	1. tracking line and moving/hilighting associated image region **/
	/**		2. managing TEI and visual editing modes					   **/
	/************************************************************************/
	
	//1. handle_move(), pan_to_line(), draw_line_poly()
	
	this.handle_move = function(e){
		
		var prev_line = self.current_line_num;
		var cursor = self.cm.getCursor();
		console.log(self.current_page);
		console.log(cursor.line);
		$("#htr_stuff").html('<p class="source-text">'+self.ts_data[self.current_page][cursor.line].id+'</p>');
		console.log(self.ts_data[self.current_page][cursor.line].id);

		if(self.ts_data[self.current_page] != undefined && self.ts_data[self.current_page][cursor.line] != undefined){
			//console.log(self.ts_data[cursor.line].poly);
			self.current_line = self.ts_data[self.current_page][cursor.line];
		}
		self.current_line_num = cursor.line;
		//we have moved to another line
		if(cursor.line != prev_line){
			//self.draw_line_poly();
			//pan the image to the new line
			if(self.mode != "plain"){
				self.pan_to_line();
			}
			//init suggestions for the new line
			if(self.mode === "interactive"){
				self.init_suggestions();
			}
		}
		//else if(self.mode == "interactive"){
		//	this.reposition_suggestions(cursor);
		//}
	}
	this.pan_to_line = function(){
		
		self.ratio =  $("#image-canvas").width()/self.image_width;	
		console.log(self.ratio);
		console.log(self.current_line.rec.x.min*self.ratio);
		
		if(self.current_line != undefined){
			$("#image-canvas").panzoom("pan", 
				0,//0 - (self.current_line.rec.x.min*self.ratio), 
				0 - (self.current_line.rec.y.min*self.ratio)
			);
		}
	}
	
	this.draw_line_poly = function(){
		if(self.current_line.points != undefined){
			var c2 = document.getElementById('image-canvas').getContext('2d');
			c2.fillStyle = '#f00';
			c2.beginPath();
			
			c2.moveTo(self.current_line.rec.x.min*self.ratio, self.current_line.rec.y.min*self.ratio);
			c2.lineTo(self.current_line.rec.x.max/2, self.current_line.rec.y.min*self.ratio);
			c2.lineTo(self.current_line.rec.x.max/2, self.current_line.rec.y.max*self.ratio);
			c2.lineTo(self.current_line.rec.x.min*self.ratio, self.current_line.rec.y.max*self.ratio);
			c2.closePath();
			c2.fill();

			/*		var p = self.current_line.points;
			console.log(p[0].x+", "+p[0].y);
			
			c2.moveTo(0-p[0].x,0-p[0].y);
			for(var i in p){
				c2.lineTo(0-p[i].x, 0-p[i].y);
			}
			c2.closePath();
			c2.fill();
		*/		 		
		}
	}
	
	// 2. init_TEI_editing()
	this.init_TEI_editing = function(){
		
		//editing mode (ie encoded or visual) switch
		$("#edit-view-switch span#edit-view-"+self.edit_view).css({color: "#000"});
		
		$("#edit-view-switch span").on("click", function(){
				if($(this).attr("id").match(/encoded$/)){
					$("#edit-view-switch span#edit-view-encoded").css({color: "#000"});
					$("#edit-view-switch span#edit-view-visual").css({color: "#ccc"});
					self.render_encoded();
				}else{
					$("#edit-view-switch span#edit-view-encoded").css({color: "#ccc"});
					$("#edit-view-switch span#edit-view-visual").css({color: "#000"});
					self.render_visual();
			}
		});
		//insert void TEI tags (eg <gap/>
		$(".tei-insert").on("click",function(){			
			self.cm.replaceSelection("<"+$(this).attr("id")+"/>");
		});
		//wrap TEI tags around selected content
		$(".tei-wrap").on("click",function(){
			var text = self.cm.getSelection();
			var from = self.cm.getCursor("from");
			var to = self.cm.getCursor("to");
			//TODO properly represent these?
			var tei_tags = {o: "<"+$(this).attr("id")+">", c: "</"+$(this).attr("id")+">"}; 
			self.cm.replaceSelection(tei_tags.o+text+tei_tags.c);
			//offset the text to mark according to the tei_tags...
			to.ch += (tei_tags.o.length+tei_tags.c.length);
			//mark text with the disbaled version of the tei visual class
			self.cm.markText(from, to, {className: "tei-visual tei-"+$(this).attr("id")+"-disabled"});
		});
		
		//buggy and this is a visual thing...
		//TODO make this encoded ie ,<p>s and <lb/>s
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
	//render_visual()
	this.render_visual = function(){
		if(self.edit_view === "visual"){
			return;
		}
		self.edit_view = "visual";
//		console.log("rendering visual");
		//nip through the spans that have been marked already and enable their dormant tei visual classes
		$(".tei-visual").each(function(){
			
			var new_class = $(this).attr("class").replace(/-disabled/,"-enabled");
			var new_content = $(this).text().replace(/(<[^>]+>)/g,"");
			//console.log("new_content: "+new_content);
			//console.log(RegExp.$1);
			$(this).attr("class", new_class);
			
			$(this).html(new_content); //using html to reinsert strips out end tags... ha!
		});
		
		//TODO: Switch TEI tags for spans with tei-class
	}
	//render_encoded()
	this.render_encoded = function(){
		if(self.edit_view === "encoded"){
			console.log("already encoded");
			return;
		}
		self.edit_view = "encoded";
		//console.log("rendering encoded");					

		//disable the tei visual classes
		$(".tei-visual").each(function(){
			
			var new_class = $(this).attr("class").replace(/(.+\s(.+))-enabled/,RegExp.$1+"-disabled");
			var new_content = $(this).text();
			var tei_tag = RegExp.$2;
//			console.log("new_content: "+new_content);
	//		console.log("tei_tag: "+tei_tag);
			$(this).attr("class", new_class);
			
			$(this).html(new_content); //using html to reinsert strips out end tags... ha!
		});
		//TODO Switch spans with tei-class for TEI tags
	}

	/*********************** HTR *************************/
	/** Function for handling the connecction to the    **/
	/** HTR server and suggestions etc		    **/
	/*****************************************************/

	//init_htr() = set up the bits of DOM that will request and respond to HTR
	this.init_htr = function(){
		console.log("INIT HTR");
		if(self.local) return;
		if(self.mode != "interactive") return;

		require("jquery.editable.itp");
		// This lib may help to prevent unwanted asynchronous events.
		require("jquery.blockUI");
  
		// Check HTR engine availability.
		self.getAvailableSocket();
		//TODO: insert here (or after have socket) a check for presence of associated HTR data 
		//(using http://transcriptorium.eu/demots/corpora/bentham/JB.002_080_001.json)
	
	}
	// getAvailableSocket() gets a valid port to usse for HTR socket
	this.getAvailableSocket = function(){
//		$.getJSON("http://casmacat.prhlt.upv.es/servers/status/poc?callback=?", function(portNums){
		$.getJSON(self.htr_server+"/servers/status/poc?callback=?", function(portNums){
			var howMany = Object.keys(portNums).length,
			nTested = 0;
			for (var n in portNums) {
				if (portNums[n] === true) {
					self.htrSocketPort = n;
					break;
				}
				nTested++;
			}
			if (nTested == howMany) alert("No HTR engines are available!");
			console.log("Using engine at port", self.htrSocketPort);
		});
	}
	
	//connect_to_htr() get suggestion for current_line 
	//at present called only when there is a mousedown in edit-area
	
	// We will farm use hidden elements in page htr_image, htr_target etc 
	// to interact with HTR. suggestion fcuntions will pick up data from 
	// htr_target
	this.connect_to_htr = function(ev) {
	    console.log("Connecting...");
	    
	    // Setup the jQuery editable plugin.
		var $target = $('#htr_target');

	    $("#htr_target").editableItp({
	      // We must indicate the source element to read data from.
	      sourceSelector: ".source-text",
	      // By now we are using the CasMaCat architecture, 
	      // although in tS it will be pretty similar.
	      // We use the "at" symbol to indicate custom socket.io resources.
//	      itpServerUrl:   "http://casmacat.prhlt.upv.es@" + self.htrSocketPort + "/casmacat"
	      itpServerUrl:   self.htr_server + "@" + self.htrSocketPort + "/casmacat"

	    })
	    // Now we can attach some event listeners, this one is mandatory.
	    .on('ready', self.isReady)
	    // We can attach different callbacks to the same event, of course.
	    .on('ready', function(ev, msg) {
	      self.unblockUI();
	    })
	    .on('unready', function(ev, msg) {
	      self.blockUI(msg);
	    })
		self.htrConnected = true;
	  }
	//isReady() is callback for post HTR response action
	//TODO: lots 
	this.isReady = function() {
		var $target = $('#htr_target');

	    // At this point, the server has initialized the wordgraph 
	    // the connection has been successfully stablished.
	    
	    // Let's change some server-side settings.
	    var settings = $target.editableItp('getConfig');
	    console.log("Settings:", settings);
	    // For instance, the editing mode will be Interactive Text Prediction.
	    settings.mode = "ITP";
	    $target.editableItp('updateConfig', settings);
	    
	    // Decode current image if there is no transcribed text so far.
	    var transcription = $target.text();
	    if ($.trim(transcription).length === 0) {
	      $target.editableItp('decode');
	    }

	    // Now attach a number of callbacks (more to come).
	    $target.on('decode', function(ev, data, err) {
	      if (err.length > 0) console.error("Error!", err);
	      // The server has decoded a given source image ID.
	      console.log(ev.type, data);
	      $target.editableItp('startSession');
	    })
	    .on('startSessionResult', function(data, err) {
	      if (err.length > 0) console.error("Error!", err);
	      // The server has initiated an interactive session.
	      console.log(ev.type, data);
	    })
	    .on('suffixchange', function(ev, data, err) {
	      if (err.length > 0) console.error("Error!", err);
	      // The user has validated a prefix, 
	      // so the server predicts a suitable continuation of it.
	      console.log(ev.type, data);
	    })
	    .on('confidences', function(ev, data, err) {
	      if (err.length > 0) console.error("Error!", err);
	      // Confidence measures information is received.
	      console.log(ev.type, data);
	    })
	    .on('tokens', function(ev, data, err) {
	      if (err.length > 0) console.error("Error!", err);
	      // Tokenization information is received.
	      console.log(ev.type, data);
	    })
	    .on('alignments', function(ev, data, err) {
	      if (err.length > 0) console.error("Error!", err);
	      // Word-level alignment information is received.
	      console.log(ev.type, data);
	    })    
	    .on('serverconfig', function(ev, data, err) {
	      if (err.length > 0) console.error("Error!", err);
	      // Server-side configuration information is received.
	      console.log(ev.type, data);
	    })
	    .on('validate', function(ev, data, err) {
	      if (err.length > 0) console.error("Error!", err);
	      // Transcription is validated. A new source-target pair has been learned.
	      console.log(ev.type, data);
	    })
	    .on('validatedcontributions', function(ev, data, err) {
	      // Requests a list of the previously validated user contributions.
	      console.log(ev.type, data);
	    })
	//    // TODO: Extra functionalities, for e.g. logging
	//    .on('mousewheelup', function(ev, pos, stack) {
	//    })
	//    .on('mousewheeldown', function(ev, pos, stack) {
	//    })
	//    .on('mousewheelinvalidate', function(ev) {
	//    })
	//    .on('mementoundo', function(ev, pos, stack) {
	//    })
	//    .on('mementoredo', function(ev, pos, stack) {
	//    })
	//    .on('mementoinvalidate', function(ev) {
	//    })
	}
	this.blockUI = function(msg) {
	    $('#global').block({
	      message: '<h2>' + msg + '</h2>',
	      // Add some fancy styles
	      css: {
		fontSize:'150%', 
		padding:'1% 2%', 
		top:'45%', 
		borderWidth:'3px', 
		borderRadius:'10px', 
		'-webkit-border-radius':'10px', 
		'-moz-border-radius':'10px' 
	      }
	    });  
	  }
	  
	this.unblockUI = function() {
	    $('#global').unblock();
	}

	/************* Predictive suggestions (via HTR) **************/
	/** Pick up data from HTR connection and suggest text 		**/
	/** completion. 											**/
	/*************************************************************/
	
	//TODO will need to integrate this more closely as HTR can 
	//change it's mind on a suffix if a prefix is validated...?
	
	//suggestion_handling() react to key presses in edit-area
	this.suggestion_handling = function(){
		//codeMirror event listener (we must use this to prevent default)
		self.cm.on("keydown", function(cm, e){
			//console.log(e.which);
			//console.log($.inArray(e.which, self.accept_keys));
			// key pressed is an accept key?
			if($.inArray(e.which, self.accept_keys)>=0){			
					//tab
					if(e.which === 9){
						//console.log("tabbing");
						e.preventDefault(); 
						self.tab_complete();
					}
					//space
					if(e.which === 32){
						//console.log("spacing");
						self.space_complete();
					}			
			//key pressed is not a control key
			}else if($.inArray(e.which, self.control_keys)<0){
				if(e.which === 8){ //backspace rejects the edit not the suggestion
					self.reject_edit();
				}else{
					// reject the character suggested even if the input char matches
					self.reject_suggestion();
				}
			}
		});
	}
	//init_suggestions() (from pre-loaded ts_data for now, from htr_target soon!)
	//line up the next suggested word (next_s_word)
	this.init_suggestions = function(){
		self.s_line = self.ts_data[self.current_page][self.current_line_num].text;
		self.s_words = self.s_line.split(/\s/);
		self.e_words = self.cm.getLine(self.current_line_num).split(/\s/);
		self.word = 0;
		self.next_s_word = self.s_words[self.word];
		self.old_s_word = "";
		this.suggest_word();
	}
	//suggest_word() puts the suggested word (or portion thereof) ahead of the cursor in grey
	this.suggest_word = function(){
		if(self.next_s_word === undefined) return;
		
		var cursor = self.cm.getCursor();
		
		//if what is infront of us is not whitespace... don't suggest!
		var infront = self.cm.getRange({line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: null});
		//console.log("*"+infront+"*");
		//console.log(infront.length+" > 0 || "+infront.match(/^\s+$/g))
		if(infront != "" && infront.match(/^\s+$/g) == null){
			return;
		}
		
//		console.log("NOThing or just WHITESPACE!");
								
		self.cm.replaceRange(self.next_s_word+" ", {line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+self.next_s_word.length});
		self.cm.markText({line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+self.next_s_word.length}, {className: "suggestion"});
		self.cm.setCursor({line:self.current_line_num, ch: cursor.ch});
	}
	//tab_complete() accept the suggestion replacing the grey text with some black text
	this.tab_complete = function(){
		if(self.next_s_word === undefined) return;
		var cursor = self.cm.getCursor();
		//console.log("tabbed...");
		self.cm.replaceRange(self.next_s_word+" ", {line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+self.next_s_word.length});
		//accepted that word so on to the next
		self.word++;
		self.next_s_word = self.s_words[self.word];
		self.old_s_word = "";
		self.suggest_word();
	}
	//space_complete() accept the suggestion replacing the grey text with some black text 
	//but only if we are at the end of the suggested word
	this.space_complete = function(){
		if(self.next_s_word === undefined) return;
	//	console.log("spaced...");
		if(self.next_s_word.length == 0){ //we are at end of word...
			self.word++;
			self.next_s_word = self.s_words[self.word];
			self.old_s_word = "";
		}else{
			//we are not at end of word... what do we do?
			//apparently nothing... just let the space shunt the suggestion along...?
		}
		//suggest next word
		self.suggest_word();
	}
	//reject_suggestion(): this will be the operation for normal typing	
	this.reject_suggestion = function(e){
		if(self.next_s_word === undefined) return;
		console.log("rejecting suggestion...");
		var cursor = self.cm.getCursor();
		//We let typing happen as normal, but remove the first char of the suggestion
		self.cm.replaceRange("", {line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+1});
		//we knock the first non-space char off the next suggested word
		self.next_s_word = self.next_s_word.replace(/^([^\s])/,"");
		//but we add that char to the old suggested word (see reject_edit())
		if(RegExp.$1 != undefined){
			self.old_s_word = self.old_s_word+RegExp.$1;
		}
	}
	//reject_edit(): This is for backspaces and makes use of the old_s_word
	this.reject_edit = function(){
		if(self.old_s_word === undefined) return;
	
		//repair the next_s_word ie stick the last letter of old_s_word to the end
		var cursor = self.cm.getCursor();
		console.log("old_s_word is *"+self.old_s_word+"*");
		//we have no more old word... must be space. move over space and decrement the s_word
		if(self.old_s_word === ""){
			self.cm.replaceRange(" ", {line:self.current_line_num, ch: cursor.ch});
			self.cm.setCursor({line:self.current_line_num, ch: cursor.ch});
			self.word--;
			self.old_s_word = self.s_words[self.word];
//			console.log("reset old_s_word to : "+self.old_s_word);
		}else{
			//otherwise get tge last letter of the old suggested word
			self.old_s_word = self.old_s_word.replace(/([^\s])$/,"");
			osw_last = RegExp.$1;
			//console.log("putting "+osw_last+" back on "+self.next_s_word);
			//stick it back on the next suggested word
			self.next_s_word = osw_last+self.next_s_word;
			//console.log("next_s_word is now: "+self.next_s_word);
			//also stick it back on to the greyed out suggestion in the edit-area
			self.cm.replaceRange(osw_last, {line:self.current_line_num, ch: cursor.ch});
			self.cm.markText({line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+1}, {className: "suggestion"});
			self.cm.setCursor({line:self.current_line_num, ch: cursor.ch});
		}
	}
	
	/******************************** IMAGE *********************************/
	/** Functions for loading and managing the image of the document page  **/
	/** Image is (at present) loaded as the background of a canvas element **/
	/************************************************************************/
	
	//load_image(): set-up the image-canvas load the real image to get dimensions
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
			//do it this way first... obviously would prefer to keep this data no in the DOM if poss
			$("#htr_image").html('<img id="source" src="'+image+'"/>');
			//once the image is loaded show image-control and record dimensions
			$(img).attr('src', image).load(function() {

				$("#image-control").fadeIn();

				self.canvas_width = $("#image-canvas").width();
				self.image_width = img.width;
				self.image_height = img.height;
	//			console.log(self.canvas_width+" / "+img.width);
				self.ratio = self.canvas_width/img.width;
				self.canvas_height = self.ratio*img.height;
				//Also load transcript
				self.load_transcript();

				$(this).remove(); // prevent memory leaks as @benweet suggested
				//use dimensions to better style the <canvas> and init panzoom
				$("#image-canvas").
					clearCanvas().
					css({background: 'url('+image+') no-repeat', 'background-size': '100%', height: self.canvas_height+"px"}).
					panzoom({
						minScale: 1,
//							contain: "invert",
						$zoomIn: $("#zoom-in").button(),
						$zoomOut: $("#zoom-out").button(),
						$zoomRange: $("#zoom-slider").slider(),
						$reset: $("#reset").button(),
						animate: true,
					}).
					   parents("div").
					   css("height", self.canvas_height+"px");
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
	}
	//load_image(): set-up the image-canvas load the real image to get dimensions
	this.unload_image = function() {
		$("#image-canvas").css({"background-image" : "none"});
	}
	/******************** TRANSCRIPT *********************/
	/** Load and manage the transcript(s)				**/
	/*****************************************************/
	//load_transcript(): if local stick it in, otherwise see how many transcripts we have
	this.load_transcript = function() {
		
		if(self.local){
			var url = self.data_server+"page/"+self.current_page+".xml";
			console.log("Loading transcript: "+url);
			$.ajax(url, {
			  crossDomain: true,
		    	  xhrFields: {
			        withCredentials: true
			  }} ).
				done(function(data, textStatus, jqxhr){
						self.current_transcript = data;
						self.load_transcript_data();
					}).
				fail(function(jqxhr,textStatus,error){
						var err = textStatus + ", " + error;
						console.log( "Request Failed: " + err );
				}).
				always(function(){
//					$("#connection_message").remove();
				});
				
		}else{
			var transcripts = self.docs.pageList.pages[self.current_page].tsList.transcripts;
			if(transcripts.length == 1){
				self.handle_transcript(transcripts[0]);
			}else if(!transcripts.length){
				console.log("No transcript available");
			}else{
				self.handle_transcript_list(transcripts);
			}
		}
	}
	
	//handle_transcript_list(): in readiness for handling multiple transcript versions
	this.handle_transcript_list = function(transcripts){
		for(var i in transcripts){	
		//	console.log(transcripts[i].url);	
		}
	}
	//handle_transcript(): dload transcript from data_server
	this.handle_transcript = function(transcript){
		//console.log(transcript);
		var url = transcript.url;
		console.log("Loading transcript: "+url);
		$.ajax({
			url: url,
			data:  {JSESSIONID: self.sessionId},
			crossDomain: true,
			    xhrFields: {
			        withCredentials: true
			    }
			}).done(function(data, textStatus, jqxhr){
					self.current_transcript = data;
					self.load_transcript_data();
			}).
			fail(function(jqxhr,textStatus,error){
					var err = textStatus + ", " + error;
					console.log( "Request Failed: " + err );
			}).
			always(function(){
//					$("#connection_message").remove();
			});
	}

	//load_transcript_data(): parse the transcript data (page XML) into the ts_data object
	this.load_transcript_data = function(){
		self.ts_data[self.current_page] = [];
		var line = 0;
		console.log("loading transcript data");
		$(self.current_transcript).find("TextLine").each(function(){
			var points = Array();
			var rec = {x: {max: 0, min: 1.7976931348623157E+10308}, y: {max: 0, min: 1.7976931348623157E+10308}};
			$(this).find(" > Coords").each(function(){	
				var coords = $(this).attr("points").split(/ /);
				for(var i in coords){
					var co = coords[i].split(/,/);
					x_adj = co[0]*self.ratio;
					y_adj = co[1]*self.ratio;
					points.push({x:x_adj, y:y_adj});
					/* 
					//adjust at point of use to check for resized canvas and ratio etc
					if(x_adj>rec.x.max) rec.x.max = x_adj;
					if(x_adj<rec.x.min) rec.x.min = x_adj;
					if(y_adj>rec.y.max) rec.y.max = y_adj;
					if(y_adj<rec.y.min) rec.y.min = y_adj;
					*/
					//mins and maxs for rectangles rather than polygons
					if(co[0]>rec.x.max) rec.x.max = co[0];
					if(co[0]<rec.x.min) rec.x.min = co[0];
					if(co[1]>rec.y.max) rec.y.max = co[1];
					if(co[1]<rec.y.min) rec.y.min = co[1];
				}
			});
//			console.log("loading data for line: "+line+" ("+self.current_page_ref+")");
			//into the ts_data per page per line you go
			self.ts_data[self.current_page][line] = {
				text: $(this).find(" > TextEquiv > Unicode").html(), 
				poly: $(this).find(" > Coords").attr("points"),
				id: "JB."+self.current_page_ref+"."+$(this).parent("TextRegion").attr("id")+"."+$(this).attr("id"),
//				id: "JB.115_065_004_02_01",
				points: points,
				rec: rec
			};
			line+=1;
		});
		self.render_transcript();
	}
	//render_transcript(): put the text in the edit-area
	//TODO: remove old transcript from cm before rendering new one
	this.render_transcript = function (){
		if(self.mode != "post") return false;
		for(var i =0; i<self.ts_data[self.current_page].length; i++){
		//	console.log("rendering line: "+i);
			self.cm.replaceRange(self.ts_data[self.current_page][i].text+"\n", {line:i, ch: 0});
		}
	}
	//unrender_transcript(): take the text out of the edit-area
	this.unrender_transcript = function() {
		if(self.ts_data[self.current_page] === undefined)
			return false;
		for(var i =0; i<self.ts_data[self.current_page].length; i++){
			if(self.cm.getLine(i) === undefined) continue;
			//remove line or something would be better...? check cm docs when online
			//console.log(self.cm.getLine(i).length);
			self.cm.replaceRange("", {line:i, ch: 0},{line:i, ch: self.cm.getLine(i).length});
		}
	}
	
	/************** UTILITY **************/
	/** Bentham in the house!			**/
	/*************************************/
	
	//ucfirst... is this the only shonky utility function I've used... that must be a record!
	function ucfirst(str) {
	  str += '';
	  var f = str.charAt(0)
	    .toUpperCase();
	  return f + str.substr(1);
	}

	/************ TRUTH **************/
	/** 			?			    **/
	/*********************************/
	
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
			 var tsx = new TSX({data_server: "https://dbis-faxe.uibk.ac.at/TrpServerBentham/rest/",
						data_list: "docs/list",
					    htr_server: "http://casmacat.prhlt.upv.es"});
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


