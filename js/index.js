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
	this.ts_data = [];
	//return, up, down, delete, pageup pagedown
	this.line_change_keys = [13,38,40,8,33,34];
	this.accept_keys = [9,32];
	this.control_keys = [17, 18, 16, 20, 35, 36, 37, 39, 45, 46, 91, 93, 144, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 145, 19, 13,38,40,33,34 ]; //ignore these
	this.htrConnected = false;
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
			if(self.sessionId != undefined){
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
			}else{
				self.credentials();
			}
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
		var auth_url = self.data_server+"auth/login_debug";
		console.log("Logging into Innsbruck with: "+auth_url+" and {user: "+$("#email").val()+", pw: "+$("#password").val()+"}");

//		var auth_url = self.data_server+"auth/login";
		data = {user: $("#email").val(), pw: $("#password").val()};
		$.ajax({
			  url: auth_url,	
			  crossDomain: true,
			  data: data,
		    	  xhrFields: {
			        withCredentials: true
			  },
			done: function(d){
				console.log("Storing session id: "+$(d).find("trpUserLogin sessionId").html());
				self.sessionId = $(d).find("trpUserLogin sessionId").html();
				$.cookie("TSX_session", self.sessionId);
			//	dialog.dialog( "close" );
				$( "#dialog-form" ).dialog("close");
				console.log("Have set cookie: "+self.sessionId);
				self.afterConnection();
			},
			fail: function(jqxhr,textStatus,error){
				$("#auth_error_message").html("We were unable to authenticate you using the username and password supplied, please try again or create an account if you don't have one.");
			}
		});
/*
		var jqxhr = $.get( auth_url, data, function(d) {
			console.log("Storing session id: "+$(d).find("trpUserLogin sessionId").html());
			self.sessionId = $(d).find("trpUserLogin sessionId").html();
			$.cookie("TSX_session", self.sessionId);
		//	dialog.dialog( "close" );
			$( "#dialog-form" ).dialog("close");
			console.log("Have set cookie: "+self.sessionId);
			self.afterConnection();
		}).fail(function(jqxhr,textStatus,error) {
			$("#auth_error_message").html("We were unable to authenticate you using the username and password supplied, please try again or create an account if you don't have one.");
		});
*/		 
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
				$.ajax({
  				  url: self.data_server+self.data_list,
				  data:  {JSESSIONID: self.sessionId},
				  crossDomain: true,
				    xhrFields: {
				        withCredentials: true
				    },
					done : function(data, textStatus, jqxhr){
						self.logged_in = true;
						self.docs = data;
						self.render_data_list();
					},
					fail : function(jqxhr,textStatus,error){
						console.log("Connection failure: "+error);
						alert("Could not connect to data server: "+self.data_server);
					},
					always : function(){
						$("#connection_message").remove();
					}
				});

//				});
/*
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
*/
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
			console.log("HERE");
			$.ajax({
  				  url: url,
//				  type: "GET",
//				  data:  {JSESSIONID: self.sessionId},
				  crossDomain: true,
				    xhrFields: {
				        withCredentials: true
				    },
					done : function(json, textStatus, jqxhr){
						console.log("anything");

						self.docs = json;
						self.render_docs_list();
					},
					fail : function(jqxhr,textStatus,error){
						var err = textStatus + ", " + error;
						console.log( "Request Failed: " + err );
					},
					always : function(){
//						$("#connection_message").remove();
						console.log("anything");
					}
				});
		});
/*
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
*/
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
				var page_ref = box[i].imgFileName.replace(/\.\w+$/,"");
				$("#data-list ul").append("<li class=\"doc_ref\"rel=\""+box[i].url+"\" data-pageInd=\""+i+"\" data-pageRef=\""+page_ref+"\"><img src=\""+box[i].thumbUrl+"\" title='"+box[i].imgFileName+"'/>"+box[i].imgFileName+"</li>");

			}

			$(".doc_ref").on("click", function(){
				self.current_page = $(this).attr("data-pageInd");
				self.current_page_ref = $(this).attr("data-pageRef");
				self.load_image($(this).attr("rel"));
//				self.load_transcript();

			});
		});
	}

	this.init_panels = function(){
		
		if($("#mode").val() != undefined){
			self.mode = $("#mode").val();
		}
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
		$("#edit-column").resizable({alsoResize: "#edit-area .CodeMirror"});
		
		$( ".column-toggle" ).click(function() {
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
			self.handle_move();
			console.log(self.mode+' === "interactive" && '+self.htrSocketPort+' && !'+self.htrConnected);

			if(self.mode === "interactive" && self.htrSocketPort && !self.htrConnected){
				self.connect_to_htr(e);
			}

		});
		self.cm.on("keydown", function(cm, e){
			//console.log(e.which);
			//console.log($.inArray(e.which, self.accept_keys));
			
			if(self.mode === "interactive"){

				if($.inArray(e.which, self.accept_keys)>=0){			
						//tab
						if(e.which === 9){
							console.log("tabbing");
							e.preventDefault(); //why preventDefault not working? because this is codeMirror! we listen for cm.on...
							self.tab_complete();
						}
						//space
						if(e.which === 32){
							console.log("spacing");
							//e.preventDefault(); //why preventDefault not working? because this is codeMirror! we listen for cm.on...
							self.space_complete();
						}			
				}else if($.inArray(e.which, self.control_keys)<0){
					if(e.which === 8){ //backspace rejects the edit not the suggestion
						self.reject_edit();
					}else{
						self.reject_suggestion();
					}
				}
			}
		});
		$("#edit-area").on("keydown", function(e){
		
			//call handle move for a designated set of "action keys" that will move the line
			if($.inArray(e.which, self.line_change_keys)>=0){
				self.handle_move(e);
			}
			//tab complete

		});
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
			var from = self.cm.getCursor("from");
			var to = self.cm.getCursor("to");
	//		console.log(to);
			//TODO properly represent these
			var tei_tags = {o: "<"+$(this).attr("id")+">", c: "</"+$(this).attr("id")+">"}; 
			self.cm.replaceSelection(tei_tags.o+text+tei_tags.c);
			//offset the text to mark according to the tei_tags...
			//to.ch += offset;
			to.ch += (tei_tags.o.length+tei_tags.c.length);
		//	console.log("new from : "+from.ch);
			self.cm.markText(from, to, {className: "tei-visual tei-"+$(this).attr("id")+"-disabled"});
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
		if(self.edit_view === "visual"){
			return;
		}
		self.edit_view = "visual";
		console.log("rendering visual");
		
		$(".tei-visual").each(function(){
			
			var new_class = $(this).attr("class").replace(/-disabled/,"-enabled");
			var new_content = $(this).text().replace(/(<[^>]+>)/g,"");
			console.log("new_content: "+new_content);
			console.log(RegExp.$1);
			$(this).attr("class", new_class);
			
			$(this).html(new_content); //using html to reinsert strips out end tags... ha!
		});
		
		//TODO Switch TEI tags for spans with tei-class
	}
	this.render_encoded = function(){
		if(self.edit_view === "encoded"){
			console.log("already encoded");
			return;
		}
		$(".tei-visual").each(function(){
			
			var new_class = $(this).attr("class").replace(/(.+\s(.+))-enabled/,RegExp.$1+"-disabled");
			var new_content = $(this).text();
			var tei_tag = RegExp.$2;
			console.log("new_content: "+new_content);
			console.log("tei_tag: "+tei_tag);
			$(this).attr("class", new_class);
			
			$(this).html(new_content); //using html to reinsert strips out end tags... ha!
		});

		self.edit_view = "encoded";
		console.log("rendering encoded");					

		//TODO Switch spans with tei-class for TEI tags
	}
	this.handle_move = function(e){
		
		var prev_line = self.current_line_num;
		var cursor = self.cm.getCursor();
		$("#htr_stuff").html('<p class="source-text">'+self.ts_data[self.current_page][cursor.line].id+'</p>');
		console.log(self.ts_data[self.current_page][cursor.line].id);

		if(self.ts_data[self.current_page] != undefined && self.ts_data[self.current_page][cursor.line] != undefined){
			//console.log(self.ts_data[cursor.line].poly);
			self.current_line = self.ts_data[self.current_page][cursor.line];
		}
		self.current_line_num = cursor.line;
		if(cursor.line != prev_line){
			//self.draw_line_poly();
			if(self.mode != "plain"){
				self.pan_to_line();
			}
			if(self.mode === "interactive"){
				self.init_suggestions();
			}
		}else if(self.mode == "interactive"){
			this.reposition_suggestions(cursor);
		}
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
	this.init_mode_handling = function (){
		$( "#control-column" ).find( ".column-header span" ).html(" - "+ucfirst(self.mode));
		$("#mode").on("change", function(){
	//		console.log("I am in "+$(this).val()+" mode");
			self.mode = $(this).val();
			$(this).closest( ".column" ).find( ".column-header span" ).html(" - "+ucfirst(self.mode));
	
			if(self.current_page === undefined){
					return false;
			}
			
				//current_page  is defined, but the data is not loaded 
				if(self.ts_data[self.current_page] === undefined){
						self.load_transcript();
				}
				
					switch(self.mode) {
						case "plain":
								self.unrender_transcript();
							break;
						case "post":
								self.render_transcript();
							break;
						case "interactive":
								self.unrender_transcript();
								self.init_htr();
							break;
						default:
							console.log("mode not defined");
					}
		
		
			
		});
	}
	this.init_htr = function(){
		console.log("INIT HTR");

		require("jquery.editable.itp");
  
		// This lib may help to prevent unwanted asynchronous events.
		require("jquery.blockUI");
  
		// This is the editable target text field, 
		// which will enable interactive transcription facilities.
  
		// Start app on clicking on the source image.
//		$('img#source').one('click', self.connect_to_htr);

		// Check HTR engine availability.
		self.getAvailableSocket();

	/*	var $target = $('#my-target-element');
		var options = {
			// We must indicate the source element to read data from. This element has as text the image patch ID.
			sourceSelector: "#my-source-element",
			// We use the "at" symbol to indicate custom socket.io resources.
			itpServerUrl: "http://casmacat.prhlt.upv.es@" + socketPort + "/casmacat"
	};
   */
		//$target.on('ready', isReady).editableItp(options);
	}
	this.getAvailableSocket = function(){
		$.getJSON("http://casmacat.prhlt.upv.es/servers/status/poc?callback=?", function(portNums){
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
	      itpServerUrl:   "http://casmacat.prhlt.upv.es@" + self.htrSocketPort + "/casmacat"
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



	  /************* predictive text ***********/
	  //Works nicely as long as the cursor doesn't wander off and come back...
	  // need a method to re-find where we are in the suggested line...
	  // a comparison between e_words and s_words...
	this.init_suggestions = function(){
		self.s_line = self.ts_data[self.current_page][self.current_line_num].text;
		self.s_words = self.s_line.split(/\s/);
		self.e_words = self.cm.getLine(self.current_line_num).split(/\s/);
		self.word = 0;
		self.next_s_word = self.s_words[self.word];
		self.old_s_word = "";
		this.suggest_word();
	}
	this.suggest_word = function(){
		if(self.next_s_word === undefined) return;
		var cursor = self.cm.getCursor();
		//if what is infront of us is not whitespace... don't suggest!
		//console.log("line: "+self.current_line_num);
		var infront = self.cm.getRange({line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: null});
		console.log("*"+infront+"*");
		console.log(infront.length+" > 0 || "+infront.match(/^\s+$/g))
		
		if(infront != "" && infront.match(/^\s+$/g) == null){
			return;
		}
		
		console.log("NOThing or just WHITESPACE!");
		
//		if(infront.length > 0) return;
		//if(infront.length == 0 || infront.length.match(/\s+/)>=0) return;
						
		self.cm.replaceRange(self.next_s_word+" ", {line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+self.next_s_word.length});
		self.cm.markText({line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+self.next_s_word.length}, {className: "suggestion"});
		self.cm.setCursor({line:self.current_line_num, ch: cursor.ch});
	}
	this.reposition_suggestions = function(cursor){
		console.log("s_line: "+self.s_line.substr(cursor.ch));
/*		self.s_line = self.s_line.substr(cursor.ch);
		self.s_words = self.s_line.split(/\s/);
		self.word = 0;
		self.next_s_word = self.s_words[self.word];
*/
	/*	self.e_line = self.cm.getLine(self.current_line_num);
		self.e_words = self.e_line.split(/\s/);
		console.log(self.e_words);
		for(var i = 0; i<self.e_words.length; i++){
			if(self.e_words[i] === "") continue;
			console.log(self.s_words[i]+" == "+self.e_words[i]);
		}
		*/
	}
	this.tab_complete = function(){
		if(self.next_s_word === undefined) return;
		var cursor = self.cm.getCursor();
		console.log("tabbed...");
		self.cm.replaceRange(self.next_s_word+" ", {line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+self.next_s_word.length});
		self.word++;
		self.next_s_word = self.s_words[self.word];
		self.old_s_word = "";
		self.suggest_word();
	}
	this.space_complete = function(){
		if(self.next_s_word === undefined) return;
		//var cursor = self.cm.getCursor();
		console.log("spaced...");
		//self.cm.replaceRange(self.next_s_word+" ", {line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+self.next_s_word.length});
		if(self.next_s_word.length == 0){ //we are at end of word...
			self.word++;
			self.next_s_word = self.s_words[self.word];
			self.old_s_word = "";
		}else{
			//we are not at end of word... what do we do?
			//apparently nothing... just let the space shunt along the suggestion...?
		}
		self.suggest_word();
	}
	this.reject_suggestion = function(e){
		if(self.next_s_word === undefined) return;
		console.log("rejecting suggestion...");
		var cursor = self.cm.getCursor();
		//var letter = self.cm.getRange({line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+1});
		//console.log(letter+" == "+self.next_s_word.substr(0,1));
		//letter entered matches next letter of suggestion so move along and modify the next_s_word
		//this always matches.... but the outcome isn't too bad...?
		//if(letter == self.next_s_word.substr(0,1)){
			//console.log("Match");
			
			//so we just accept the letter (ie don't preventDefault) 
			//and remove the next letter from cm (ie first letter of 
			//the suggested word and modify the suggested word accordingly
			self.cm.replaceRange("", {line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+1});
			self.next_s_word = self.next_s_word.replace(/^(\w)/,"");
			if(RegExp.$1 != undefined){
				self.old_s_word = self.old_s_word+RegExp.$1;
			}
		//}else{
			//a different letter to the suggestion entered so bin the suggested word
		//	console.log("no Match");
		//	self.cm.replaceRange("", {line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+self.next_s_word.length});		
		//}
	}
	//ie delete
	this.reject_edit = function(){
		//repair the next_s_word ie stick the last letter of old_s_word to the end
		var cursor = self.cm.getCursor();
		console.log("old_s_word is "+self.old_s_word);
		self.old_s_word = self.old_s_word.replace(/(\w)$/,"");
		osw_last = RegExp.$1;
		console.log("putting "+osw_last+" back on "+self.next_s_word);
		self.next_s_word = osw_last+self.next_s_word;
		console.log("next_s_word is now: "+self.next_s_word);
		self.cm.replaceRange(osw_last, {line:self.current_line_num, ch: cursor.ch});
		self.cm.markText({line:self.current_line_num, ch: cursor.ch}, {line:self.current_line_num, ch: cursor.ch+1}, {className: "suggestion"});
		self.cm.setCursor({line:self.current_line_num, ch: cursor.ch});
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
			//do it this way first... obviously would prefer to keep this data no in the DOM if poss
			$("#htr_image").html('<img id="source" src="'+image+'"/>');

			$(img).attr('src', image).load(function() {

				$("#image-control").fadeIn();

				self.canvas_width = $("#image-canvas").width();
				self.image_width = img.width;
				self.image_height = img.height;
	//			console.log(self.canvas_width+" / "+img.width);
				self.ratio = self.canvas_width/img.width;
				self.canvas_height = self.ratio*img.height;
				
				self.load_transcript();

				$(this).remove(); // prevent memory leaks as @benweet suggested
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
	//only un-renders it really
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
	this.load_transcript = function() {
		
		if(self.local){
			var url = self.data_server+"page/"+self.current_page+".xml";
			console.log("Loading transcript: "+url);
				$.ajax({
  				  url: url,
				  data:  {JSESSIONID: self.sessionId},
				  crossDomain: true,
				    xhrFields: {
				        withCredentials: true
				    },
					done : function(data, textStatus, jqxhr){
						self.current_transcript = data;
						self.load_transcript_data();
					},
					fail : function(jqxhr,textStatus,error){
						var err = textStatus + ", " + error;
						console.log( "Request Failed: " + err );
					},
					always : function(){
//						$("#connection_message").remove();
					}
				});
/*
			$.get(url)
				.done(function( doc ) {
					self.current_transcript = doc;
					self.load_transcript_data();
				 })
				  .fail(function( jqxhr, textStatus, error ) {
					var err = textStatus + ", " + error;
					console.log( "Request Failed: " + err );
				});
*/
				
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
	this.load_transcript_data = function(){
		self.ts_data[self.current_page] = [];
		var line = 0;
		
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
					if(co[0]>rec.x.max) rec.x.max = co[0];
					if(co[0]<rec.x.min) rec.x.min = co[0];
					if(co[1]>rec.y.max) rec.y.max = co[1];
					if(co[1]<rec.y.min) rec.y.min = co[1];
				}
			});
			console.log("loading data for line: "+line+" ("+self.current_page_ref+")");
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
	this.render_transcript = function (){
		if(self.mode != "post") return false;
		for(var i =0; i<self.ts_data[self.current_page].length; i++){
		//	console.log("rendering line: "+i);
			self.cm.replaceRange(self.ts_data[self.current_page][i].text+"\n", {line:i, ch: 0});
		}
	}
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
			    },
				done : function(data, textStatus, jqxhr){
					self.current_transcript = data;
					self.load_transcript_data();
				},
				fail : function(jqxhr,textStatus,error){
					var err = textStatus + ", " + error;
					console.log( "Request Failed: " + err );
				},
				always : function(){
//					$("#connection_message").remove();
				}
			});
/*
		$.get(url, {JSESSIONID : self.sessionId}  )
			.done(function( doc ) {
				self.current_transcript = doc;
				self.load_transcript_data();
			 })
			  .fail(function( jqxhr, textStatus, error ) {
				var err = textStatus + ", " + error;
				console.log( "Request Failed: " + err );
*/			});

	}
	this.handle_transcript_list = function(transcripts){
		for(var i in transcripts){	
		//	console.log(transcripts[i].url);	
		}

	}
	/*
	this.get_wglist = function (){
		console.log("I will get the wglist from the "+this.data_server);
		console.log($("#text-area"));
	}
*/
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


