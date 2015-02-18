/*

TSX

	TSXPage

		TSXTranscript

			TSXEditor
		
		TSXImage

			TSXViewer

*/

function TSX(config){

	var self = this;
	this.name ="TSX";
	//set default options here:
	self.defaults = {};
	this.init = function(config){
		this.set_options(config);	
//		console.log("Base init");
		self.a = "base thing";
	}
	this.set_options = function(config){
		//set any unset options that have defaults	
		for(var opt in self.defaults){
			if(config[opt] == undefined){
				config[opt] = defaults[opt];
			}
		}
		//then set config opts
		for(var opt in config){
			console.log("setting option - "+opt+":"+config[opt]);
			self[opt] = config[opt];
		}
	};
	this.load_xml = function(url, callback, args){
		self.rest(url, null, callback, "xml", "GET", args);
	}
	this.load_json = function(url, callback, args){
		self.rest(url, null, callback, "json", "GET", args);
	}
	this.save_xml = function(url, data, callback, args){
		self.rest(url, data, callback, "xml", "POST", args);
	}
	this.save_json = function(url, data, callback, args){
		self.rest(url, data, callback, "json", "POST", args);
	}

	this.rest = function(url, data, callback, dataType, type, args){
	
		var params = {crossDomain: true, xhrFields: {withCredentials: true}};
		if(type != undefined) //default to GET
			params.type = type;
		if(dataType != undefined){ //let it guess if not set (Can't send contentType as the allow headers doesn't include contentType)
//			params.dataType = dataType;
//			switch(dataType){
//				case "xml" : params.contentType = "text/xml; charset=utf-8"; break;
//				case "json" : params.contentType = "application/json; charset=utf-8"; break;
//			}
		}
//		params.data = data;
//		if($.cookie("TSX_session") != undefined)
//			params.data.JSESSIONID = $.cookie("TSX_session");
		$.ajax(url, params ).
		done(function(data, textStatus, jqxhr){
			//console.log("rest is done");
			callback(data, args);
		}).
		fail(function(jqxhr,textStatus,error){
				var err = textStatus + ", " + error;
				console.log( "**Request to "+url+" Failed: " + err );
				callback(false, args);
		}).
		always(function(){
//			$("#connection_message").remove();
		});
	};
	this.init(config);
}

function TSXUser( ){
	var self = this;
	this.name ="TSXUser";

	this.init = function() {
	//self.load_xml(self.data_server+"/users_session.xml", self.handle_user);
		console.log(self.name+" has been initialised");
		self.update_login_state();
		self.init_signin();
		self.init_signup();
		self.init_signout();
	}
	this.update_login_state = function(){
		if($.cookie("TSX_session") != undefined){
			console.log($.cookie("TSX_session"));
			$("#tsx-not-logged-in").hide();
			$("#tsx-logged-in").show();
		}else{
			$("#tsx-logged-in").hide();
			$("#tsx-not-logged-in").show();
	
		}	
	}
	this.handle_user = function(data){
		console.log(data);
	}
	this.init_signin = function() {
		$('#loginForm').validate({
			rules: {
				username: {
				required: true
			    },
			    password: {
				minlength: 5,
				required: true
			    }
			},
			highlight: function(element) {
			    $(element).closest('.form-group').addClass('has-error');
			},
			unhighlight: function(element) {
			    $(element).closest('.form-group').removeClass('has-error');
			},
			errorElement: 'span',
			errorClass: 'help-block',
			errorPlacement: function(error, element) {
			    if(element.parent('.input-group').length) {
				error.insertAfter(element.parent());
			    } else {
				error.insertAfter(element);
			    }
			}
	    	}); 
		$("#loginForm").on("submit", function(){
			var params = $(this).serialize();
			//TODO the real one is post
			self.load_xml(self.data_server+"auth/login_debug?"+params, function(data){
				if(data){
					$('#loginModal').modal("hide");
					$.cookie("TSX_session", $("trpUserLogin > sessionId",data).text());
					$("body").trigger('cookieUpdate');
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_SUCCESS,
						title: "Login successful",
						message: "<p>Welcome back "+$("trpUserLogin > userName",data).text()+"</p>",
						buttons: [{label: 'OK',
                						action: function(dialogItself){
                    							dialogItself.close();
                						}
            					}]
					});
				}else{
					
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_WARNING,
						title: "There was a problem",
						message: "<p>TSX could not log you in.</p>",
						buttons: [{label: 'OK',
                						action: function(dialogItself){
                    							dialogItself.close();
                						}
            					}]		
					});
				}
				self.update_login_state();
			});
			return false;
		});
	}
	this.init_signup = function() {
		
		$('#createAccountForm').validate({
       			rules: {
		    		username: {
				required: true
			    },
			    password: {
				minlength: 5,
				required: true
			    },
			    given: {
				required: true
			    },
			    family: {
				required: true
			    },
			    email: {
				required: true,
				email: true
			    },
			    affiliation: {
				required: false,
			    },
			    gender: {
				required: false,
			    }

			},
			highlight: function(element) {
			    $(element).closest('.form-group').addClass('has-error');
			},
			unhighlight: function(element) {
			    $(element).closest('.form-group').removeClass('has-error');
			},
			errorElement: 'span',
			errorClass: 'help-block',
			errorPlacement: function(error, element) {
			    if(element.parent('.input-group').length) {
				error.insertAfter(element.parent());
			    } else {
				error.insertAfter(element);
			    }
			}
	    	}); 
		$("#createAccountForm").on("submit", function(){
			var data = $(this).serializeArray();
			var xml = self.make_user_XML(data);
			//console.log("data_Store: "+self.data_server);
			self.save_xml(self.data_server+"user/register",xml, function(data){
				//console.log("here",data);
				$('#createAccountModal').modal("hide");
				if(data){
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_SUCCESS,
						title: "Created user (probably not)",
						message: "<p>TSX has saved your User data... maybe</p>"
					});
				}else{
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_WARNING,
						title: "There was a problem",
						message: "<p>TSX could not create an account for you.</p>"
					});
				}
			});
			return false;
		});

	}
	this.make_user_XML = function(data){
		var xml_str = "<trpUserLogin>\n";
		$(data).each(function(){
			xml_str += "	<" + this.name + ">" + this.value + "</" + this.name + ">\n";
		});
		xml_str += "</trpUserLogin>";
		return xml_str;
	}
	this.init_signout = function() {
		$("#tsx-sign-out").on("click", function(){
			BootstrapDialog.show({
					type: BootstrapDialog.TYPE_WARNING,
					title: "Sign out of TSX",
					message: "<p>Are you sure you would like to sign out of TSX.</p>",
					buttons: [{label: 'OK',
							action: function(dialogItself){
								self.save_xml(self.data_server+"auth/logout", {},  function(data){
									$.removeCookie("TSX_session");
									dialogItself.close();
									self.update_login_state();
									$("body").trigger('cookieUpdate');
								});
							}
						},
						{label: 'Cancel',
							action: function(dialogItself){
								dialogItself.close();
							}
					}]
				});
		});
	}
	
	self.init();
}

function TSXFiles( ){
	var self = this;
	this.name ="TSXFiles";

	this.init = function() {
		console.log(self.name+" has been initialised");
		console.log(self.data_server);
		//NB this will be reset everytime a new "doc" is opened in the tree!
		self.pages = {};
		self.update_state();
		$("body").on('cookieUpdate', function(){ //check again after (homemade) event
			console.log("CookieUpdated!!!");
			self.update_state();
		});
	}
	this.update_state = function(){

		if($.cookie("TSX_session") != undefined)
			self.load_json(self.data_server+"/collections/list", self.handle_collections);
		else{
			$("#tsx-file-panel").html("<p>Please sign in to select a collection</p>");
			self.unload_thumbnails();
		}

	
	}
	this.handle_collections = function(data){
		self.filetree = {
				text: "Collections", 
				icon: "glyphicon glyphicon-folder-close", 
				li_attr: { "data-node-info": "Collections of handwritten documents available for transcription with TSX"},
				state : {opened: true},
				children : []
				};
		var calls = [];
		for(var i in data){
			var node = {
				text: data[i].colName, 
				icon: "glyphicon glyphicon-folder-close", 
				li_attr : {
					"data-colid": data[i].colId, 
					"data-node-info": "Some information about "+data[i].colId,
				},
				children: [],
			};

			if(self.col_ref != undefined && self.col_ref == data[i].colId){
				node.state={opened: true};
			}
			self.filetree.children.push(node);
			var url = self.data_server+"/collections/"+data[i].colId+"/list"; //gets json 
			calls.push(self.load_json(url, self.handle_docslist, {colId: data[i].colId, i: i}));
		}
	}
	this.handle_docslist = function(data, args){
		
		for(var i in data){
			var node = {
				text: data[i].title +" ("+data[i].nrOfPages+")", 
				icon: "glyphicon glyphicon-folder-close", 
				li_attr : {
					"data-docid": data[i].docId, 
					"data-colid": args.colId, 
					"data-node-info": "Some information about "+data[i].docId,
					"class" : "tsx-page" 
				},
				children: [],
			};
			if(self.doc_ref != undefined && self.doc_ref == data[i].docId){
				node.state={opened: true, selected: true};
			}
			self.filetree.children[args.i].children.push(node);			
		}
	//	console.log(self.filetree.children[args.i]);

		if((parseInt(args.i)+1) == self.filetree.children.length)
			self.render_filetree();
	}
	this.render_filetree = function(){
	//	console.log(self.filetree);
		
		$('#tsx-file-panel').jstree("destroy");
		$('#tsx-file-panel').jstree({'core' : {'data' : self.filetree}});

		$(window).on("hashchange", function(){
			self.set_refs();
		});
		
		$('#tsx-file-panel').on('open_node.jstree', function (e, data) {
			$("#" + data.node.id + " > a > i").removeClass("glyphicon-folder-close").addClass("glyphicon-folder-open");
			self.update_hash(data.node.id);			
		});
		$('#tsx-file-panel').on('close_node.jstree', function (e, data) {
			$("#" + data.node.id + " > a > i").removeClass("glyphicon-folder-open").addClass("glyphicon-folder-close");
			self.update_hash(data.node.id);
		});
		$('#tsx-file-panel').on('select_node.jstree', function (e, data) {
			var info = $("#" + data.node.id ).attr("data-node-info");
			$("#tsx-thumb-panel > .container-fluid > .row").html("<h2>"+$("#"+data.node.id+" > a ").text()+"</h2><p>"+info+"</p>");
			if($("#"+data.selected).hasClass("tsx-page")){
				$(".tsx-page > a > i").removeClass("glyphicon-folder-open").addClass("glyphicon-folder-close");
				$("#" + data.node.id + " > a > i").removeClass("glyphicon-folder-close").addClass("glyphicon-folder-open");
				var url = self.data_server+"/docs/"+data.node.li_attr["data-docid"]+"/fulldoc"; //gets json 
				self.update_hash(data.node.id);			
				self.load_json(url, self.load_thumbnails);
			}
		});

		$('#tsx-file-panel').on('loaded.jstree', function (e, data) {
			if($("#tsx-thumb-panel > .container-fluid > .row").children().length == 0 &&
				self.doc_ref != undefined){
				var url = self.data_server+"/docs/"+self.doc_ref+"/fulldoc"; //gets json 
				self.load_json(url, self.load_thumbnails);
			}
		});
	}
	this.update_hash = function(node_id){
		var hash_str = "";
		self.ref_array  = [];
		if($("#" + node_id ).attr("data-colid") != undefined)
			self.ref_array[0] = $("#" + node_id ).attr("data-colid");
		if($("#" + node_id ).attr("data-docid") != undefined)
			self.ref_array[1] = $("#" + node_id ).attr("data-docid");
		if($("#" + node_id ).attr("data-pageid") != undefined)
			self.ref_array[2] = $("#" + node_id ).attr("data-pageid");

		for (var i = 0;  i<self.ref_array.length; i++){
			if(self.ref_array[i] != undefined)
				hash_str += self.ref_array[i]+"/";
		}
		hash_str = hash_str.replace(/\/$/,"");
		if(hash_str != undefined) window.location.hash = window.location.hash.replace(/(|[\d]+)(|\/[\d]+)+$/,hash_str); 	
	}
	this.load_thumbnails = function(data){
//		console.log(data);
		var pages = data.pageList.pages;
		self.unload_thumbnails();
		for(var i in pages){
//			console.log(self.pages[pages[i]]);		
			var thumb = '<div class="tsx-thumbbox col-sm-6 col-md-3">'+
				'<a href="./transcribe#'+self.col_ref+'/'+pages[i].docId+'/'+pages[i].pageNr+'" class="thumbnail">'+
					'<img src="'+pages[i].thumbUrl+'" alt="Tumbnail for '+pages[i].thumbUrl+'"/>'+
					' <div class="caption">Page '+pages[i].pageNr+' ('+self.humanise(pages[i].tsList.transcripts[0].status)+')</div>'+
				'</a>'+
			'</div>';
			$("#tsx-thumb-panel > .container-fluid > .row").append(thumb);
		}
	}
	this.unload_thumbnails = function(){
		$("#tsx-thumb-panel > .container-fluid > .row").html("");
	}
	this.humanise = function(str){
		str = str.replace(/_/g," ");
		return str.capitalise();
	}
	String.prototype.capitalise = function() {
		var str = this.toLowerCase();
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	self.init();
}


/* ------------------------------------- */
//TSXPage.prototype = new TSX();
//TSXPage.constructor = TSXPage;


function TSXPage( ){
	var self = this;
	this.name ="TSXPage";

	this.init = function() {
		self.data_store = self.data_server+"/"+self.ref;
		self.set_refs();
		self.init_image_panel();		
		self.init_edit_panel();	
		self.init_file_panel();	
		self.init_thumb_panel();
	}
	this.set_refs = function(){
		self.ref_array = [];
		self.ref_array = window.location.hash.replace(/^#/, "").split('/');

		if(self.ref_array[0] != undefined) self.col_ref = self.ref_array[0];
		if(self.ref_array[1] != undefined) self.doc_ref = self.ref_array[1];
		if(self.ref_array[2] != undefined) self.page_ref = self.ref_array[2];
/*
		console.log("COL REF: "+self.col_ref);
		console.log("DOC REF: "+self.doc_ref);
		console.log("PAGE REF: "+self.page_ref);
		
		console.log(self.ref_array);
*/	
	}
	this.init_image_panel = function(){	
		if(self.image_panel == undefined) return false;
		
		//set height (according to page (NB assumes no scrolling.. errk)
		self.image_panel_height = $(window).height() - $(self.image_panel).offset().top - $(self.image_panel).siblings(".panel-heading").offset().top;
		//$(window).height() - $(self.edit_panel).offset().top - $(self.edit_panel).siblings(".panel-heading").offset().top
		$(self.image_panel).height( self.image_panel_height );
	}

	this.init_edit_panel = function(){	
		if(self.edit_panel == undefined) return false;
		//set height (according to page (NB assumes no scrolling.. errk)
		self.edit_panel_height = $(window).height() - $(self.edit_panel).offset().top - $(self.edit_panel).siblings(".panel-heading").offset().top;
		//$(window).height() - $(self.edit_panel).offset().top - $(self.edit_panel).siblings(".panel-heading").offset().top
		$(self.edit_panel).height( self.edit_panel_height );

		self.edit_height = self.edit_panel_height - $("ul.nav-tabs", self.edit_panel).height() - $("#tsx-tei-buttons", self.edit_panel).height();		
	}

	this.init_file_panel = function(){	
		if(self.file_panel == undefined) return false;
		
		//set height (according to page (NB assumes no scrolling.. errk)
		self.file_panel_height = $(window).height() - $(self.file_panel).offset().top - $(self.file_panel).siblings(".panel-heading").offset().top;
		//$(window).height() - $(self.edit_panel).offset().top - $(self.edit_panel).siblings(".panel-heading").offset().top
		$(self.file_panel).height( self.file_panel_height );
	}
	this.init_user_panel = function(){	
		if(self.user_panel == undefined) return false;
		
		//set height (according to page (NB assumes no scrolling.. errk)
		self.user_panel_height = $(window).height() - $(self.user_panel).offset().top - $(self.user_panel).siblings(".panel-heading").offset().top;
		//$(window).height() - $(self.edit_panel).offset().top - $(self.edit_panel).siblings(".panel-heading").offset().top
		$(self.user_panel).height( self.user_panel_height );
	}
	this.init_thumb_panel = function(){	
		if(self.thumb_panel == undefined) return false;
		
		//set height (according to page (NB assumes no scrolling.. errk)
		self.thumb_panel_height = $(window).height() - $(self.thumb_panel).offset().top - $(self.thumb_panel).siblings(".panel-heading").offset().top;
		//$(window).height() - $(self.edit_panel).offset().top - $(self.edit_panel).siblings(".panel-heading").offset().top
		$(self.thumb_panel).height( self.thumb_panel_height );
	}

	self.init();
}



// Create sub-class and extend base class.
//TSXImage.prototype = new TSXPage();
//TSXImage.constructor = TSXImage;

function TSXDocument( ){
	var self = this;	
	this.name ="TSXDocument";

	this.init = function(){
		var url = self.data_server+"docs/"+self.doc_ref+"/"+self.page_ref;
		self.load_xml(url, self.load_image);
	}
	
	this.set_dimensions = function(img){
		self.img = { orig : {x: 0, y: 0, w:0, h: 0},
					scale: 0,
					scaled : {x: 0, y: 0, w:0, h: 0},
				};
	
		//record the original image dimensions
		self.img.orig.w = img.width;
		self.img.orig.h = img.height;
		//calculate the scale factor needed to fit it in the view_box
		self.img.scale = $(self.view_box).innerWidth()/self.img.orig.w;
		self.img.scaled.w = self.img.orig.w*self.img.scale;
		self.img.scaled.h = self.img.orig.h*self.img.scale;					

	}

	this.load_image = function(data){
		self.pageData = data;
		self.img_path = $("trpPage > url", data).text();
		var img = new Image();
		$(img).attr('src', self.img_path).load(function() {
			// Read, scale and set the dimensions based on image and available space in panel 
			self.set_dimensions(img);
			self.init_viewer();
			self.tsxTranscript = new TSXTranscript(self);
		});
	}

	this.init_viewer = function(){
			
		//Make Raphael "paper" object
		self.raph = Raphael("tsx-image", $(self.view_box).width(), $("#tsx-image-panel").height());	

		//Load image into it
		self.paper = self.raph.image(self.img_path, 0, 0, $(self.view_box).width(), self.img.scaled.h).attr({
				cursor: "move"
			});
		//make a set to keep our elements
		self.set = self.raph.set();
		self.set.push(self.paper); 

		//Set dimensions used for zooming
		self.paper.viewBoxX = 0;
		self.paper.viewBoxY = 0;
		self.paper.scale = 1;		
		self.paper.viewBoxWidth = self.raph.width;
		self.paper.viewBoxHeight = self.raph.height;
		
		self.paper.xs = 0;
		self.paper.ys = 0;
		
		// Init the listeners to update self.raphsetViewBox... 
		// native seems to be a little easier than using than jquery mousewheel plugin
		if ($(self.view_box).addEventListener){
			// Mozilla
			$(self.view_box).addEventListener('DOMMouseScroll', self.wheel, false);
		}
		// The rest
		$(self.view_box).onmousewheel = document.getElementById(self.view_box.replace(/^#/,"")).onmousewheel = self.wheel;

		// Draggable panning
		self.paper.drag(self.move,self.start,self.up);

		//buttons for image control									
		self.mid_zoom($("#tsx-zoom-in"));
		self.mid_zoom($("#tsx-zoom-out"));
		$("#tsx-zoom-reset").on('click',function(e) { 
			self.reset_view();
		});			

		//default to...
		self.zoom_flag = true;
		$("#tsx-zoom-pause").on('click',function(e) { 
			if(!self.zoom_flag || self.zoom_flag == undefined){
				self.zoom_flag = true;
				$("span", this).removeClass("glyphicon-play").addClass("glyphicon-pause");								
			}else{
				self.zoom_flag = false;
				$("span", this).removeClass("glyphicon-pause").addClass("glyphicon-play");
			}

		});			
	}
	
	this.reset_view = function(){

		// reset zoom
		self.paper.viewBoxWidth = self.raph.width;
		self.paper.viewBoxHeight = self.raph.height;
		self.paper.scale = 1;
		self.paper.viewBoxX = 0;
		self.paper.viewBoxY = 0;
		self.raph.setViewBox(self.paper.viewBoxX, self.paper.viewBoxY, self.paper.viewBoxWidth, self.paper.viewBoxHeight);
		
		// and pan
		self.paper.xs = 0;
		self.paper.ys = 0;
		self.paper.oBB = self.paper.getBBox();
		self.set.translate(0-self.paper.oBB.x,  0-self.paper.oBB.y);	
	}
	this.mid_zoom = function(element){
	
		var interval;
		$(element).on('mousedown',function(e) {
			interval = setInterval(function() {
				var midX = $(self.view_box).offset().left + ($(self.view_box).width()/2);
				var midY = $(self.view_box).offset().top + ($(self.view_box).height()/2);
				if($(element).attr("id").match(/-in$/))
					self.handle_zoom(1,midX,midY);
				else
					self.handle_zoom(-1,midX,midY);
				
			},50); 
		});
		$(element).on('mouseup',function(e) {
			clearInterval(interval);
		});
	}
	// Zoom handler
	this.handle_zoom  = function (delta, mousex, mousey) {
		mousex -= $(self.view_box).offset().left; //adjust for paper div offset
		mousey -= $(self.view_box).offset().top; //adjust for paper div offset
		
		//mouse coordinates to viewbox coordinates at current scale
		x = self.paper.viewBoxX + mousex / self.paper.scale; 
		y = self.paper.viewBoxY + mousey / self.paper.scale;
		
		// Make this configurable?
		var multiplier = 1.05;
		if (delta < 0)
			multiplier = 0.95;
		
		self.paper.scale *= multiplier;
		
		//scale the view box   
		self.paper.viewBoxWidth = self.raph.width / self.paper.scale;
		self.paper.viewBoxHeight = self.raph.height / self.paper.scale;    
		//new coordinates to new viewbox coordinates at new scale
		self.paper.viewBoxX = x - mousex / self.paper.scale;
		self.paper.viewBoxY = y - mousey / self.paper.scale;
		
		self.raph.setViewBox(self.paper.viewBoxX, self.paper.viewBoxY, self.paper.viewBoxWidth, self.paper.viewBoxHeight);
	}

	// Event handler mouse wheel event. Sorts out and returns delta (may replace with jquery version of this?)
	this.wheel = function(event) {
	
		var delta = 0;
		if (!event) // For IE. 
			event = window.event;
		if (event.wheelDelta) { // IE/Opera. 
			delta = event.wheelDelta / 120;
		} else if (event.detail) { // Mozilla case. 
			delta = -event.detail / 3;
		}
		if (delta) self.handle_zoom(delta, event.x, event.y);
		if (event.preventDefault) event.preventDefault();
		event.returnValue = false;
	}

	// Panning actions for self.raph.drag
	this.start = function(){
		self.paper.oBB = self.paper.getBBox();    
		self.paper.xs = self.paper.ys = 0;
	}
	//TODO double move/pan is not tracked so breaks go_to_line if pan and then pan again...
	this.move = function(dx, dy) {
		self.set.translate(dx - self.paper.xs, dy - self.paper.ys);
		self.paper.xs = dx;
		self.paper.ys = dy;	
	}            
	this.up = function(){}
	
	this.hoverIn = function() {	
		this.attr({opacity:"0.3"});
		this.data("cm").addLineClass(this.line_index, "text", "tsx-line-hovered");
	};
    
	this.hoverOut = function() {
		this.attr({opacity:"0"});    
		this.data("cm").removeLineClass(this.line_index, "text", "tsx-line-hovered");
   	}
    
	//Init the TSXImage object
	//if(init)
	this.init();

}


/* ------------------------------------- */
//TSXTranscript.prototype = new TSXPage();
//TSXTranscript.constructor = TSXTranscript;


function TSXTranscript( tsxDoc ){

	var self = this;
	this.name ="TSXTranscript";

	this.init = function(){
		var timestamps = $.map($("tsList transcripts timestamp",tsxDoc.pageData).toArray(), function(val, i){
			return $(val).text();
		});
		var latest = Math.max.apply(Math,timestamps);
		self.xml_path = $("tsList transcripts timestamp:contains("+latest+")",tsxDoc.pageData).parent("transcripts").find("url").text();
		console.log("We should load the transcript from ", self.xml_path);
		self.load_xml(self.xml_path, self.handle_transcript);
		self.cm = CodeMirror(document.getElementById("tsx-transcript-editor"),{lineNumbers: true, gutters: ["CodeMirror-linenumbers", "tsx-htr-available"]});
		self.cm.setSize("auto", self.edit_height);		
	}
	this.removeNSAttr = function(ele){
		if(ele == undefined) return "";
		return ele.toString().replace(/ xmlns=\"[^\"]*\"/,""); 
	}
	this.handle_transcript = function(data){
		
		self.xmlData = data;
		//The raph set for the line polygons
		tsxDoc.poly_set = tsxDoc.raph.set();
		self.text = "";
		self.polys = {};
		$("TextLine", data).each(function(i){

			var poly = self.draw_polygon(this,i);
			//TODO fix this for IE
			var raw_text_line = self.removeNSAttr($(" > TextEquiv Unicode",this).html());
			//for cases where the text is *only* in Word tags :|
			if(raw_text_line === "" && $(" > Word",this).length > 0){
				$(" > Word",this).each(function(){
					raw_text_line += self.removeNSAttr($(" > TextEquiv Unicode",this).html()) +" ";
				});
				raw_text_line = raw_text_line.replace(/\s+$/, "");
			}
			//line ref
			var line_ref = self.removeNSAttr($(this).attr("id"));
			//make text block for codemirror
			self.text += raw_text_line;
			//add new line if not last line
			if((i+1)!=$("TextLine", data).length) self.text +="\n";
			//store this stuff in the poly object
			poly.text = raw_text_line;
			poly.ref = line_ref;
			self.polys[i]=poly;
		});
		
		self.cm.setValue(self.text);
		self.cm.markClean();
		
		//assign refs to cm line objects
		var i=0;
		self.cm.eachLine(function(cm_line){
			cm_line.ref=self.polys[i].ref;
			i++;
		});	
		
		//as soon as we have some parsed transcript data we init HTR
		self.tsxHTR = new TSXHTR(self);

		//set preview
		self.render_preview();
		//set diffs
		self.render_diffs();
		
		self.init_buttons();
		
		//store the code mirror object in the raphael data for access in the TSXDocument
		tsxDoc.poly_set.data({cm:self.cm});
		//set image hover highlighting
		tsxDoc.poly_set.hover(tsxDoc.hoverIn, tsxDoc.hoverOut);
		//put the poly_Set in the main set
		tsxDoc.set.push(tsxDoc.poly_set);
		//keep polygons in line with position of cursor in editor
		self.cm.on("cursorActivity", function(){
			var line = self.cm.getCursor().line;
			//console.log(polys[line].rec.y.min+" > "+tsxDoc.paper.getBBox().y2);
			//TODO detect when polygons are outside the *current* view box and force zoom flag
			//if(polys[line].rec.y.min > tsxDoc.raph.height/* - some adjustment... */){
			//	self.go_to_line(polys[line], line, true);
			//}else{
				self.go_to_line(self.polys[line], line);
			//}
		});
		$("#tsx-toggle-transcript").on("click", function(e){
			var button = this;
			if($(button).find("span").hasClass("glyphicon-file")){
				self.cm.eachLine(function(cm_line){
					self.cm.replaceRange("",{line: self.cm.getLineNumber(cm_line), ch:0}, {line: self.cm.getLineNumber(cm_line), ch:null});
					$(button).attr("title","Load transcript").find("span").removeClass("glyphicon-file").addClass("glyphicon-list-alt");
				});	
				//set preview
				self.render_tei("");

			}else{
				self.cm.setValue(self.text);//This breaks the gutterMarks... for some reason
				var i=0;// This is why!!
				self.cm.eachLine(function(cm_line){
					cm_line.ref=self.polys[i].ref;
					i++;
				});	
				self.tsxHTR.handle_wordgraphs(self.tsxHTR.wordgraph_data);
				
				$(button).attr("title","Clear transcript").find("span").removeClass("glyphicon-list-alt").addClass("glyphicon-file");
				//set preview
				self.render_tei(self.text);
			}
			//TODO work out what happens when this is used mid-edit...?!
			self.cm.markClean();
			//TODO stop cm cursor activity
			e.preventDefault();
			return false;
		});
		$("#tsx-save-tei").on("click", function(){
			if(!self.cm.isClean()){ // any change whatsoever
				var errors = false;
				self.cm.eachLine(function(cm_line){
					//check xml validity
					if(self.validateXML(cm_line.text)){
					
						line_index = self.cm.lineInfo(cm_line).line;
						from_xml = $("TextLine:eq("+line_index+") > TextEquiv Unicode", self.xmlData).html();
						//if so did the actual text change
						if(cm_line.text.localeCompare(self.removeNSAttr(from_xml))){
							$("TextLine:eq("+line_index+") > TextEquiv Unicode", self.xmlData).html(cm_line.text);
							//now loop through each word... let's hope not
							/*
							var word_ind = 0;
							$("TextLine:eq("+line_index+") > Word", self.xmlData).each(function(){
								//TODO strip our tags when considering just words
								//or detect and wrap each word in own tag until detect end tag... christ I can't be bothered with that!
								var ed_words = cm_line.text.split(/\s/); //not ideal
								console.log("word: "+word_ind, ed_words[word_ind]);
								//doesn't really handle empty words... I'm hoping the whole word updating thing will go away....
								$(" > TextEquiv Unicode", this).html(ed_words[word_ind]);
								
								word_ind++;
							});
							*/
						}
						//TODO update <Words> too?
					}else{
						errors = true;
					}
				});
			}
			if(!errors){
				//console.log(self.xmlData);
				self.save_xml(self.data_store,self.xmlData, function(){
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_SUCCESS,
						title: "Saved XML",
						message: "<p>TSX has saved your XML... maybe</p>"
					});
				});
			}
		});
		
		
	}
	this.init_buttons = function(){
		$("#tsx-suggest-word").on("click", function(){self.tsxHTR.get_HTR_data(undefined, self.suggest_word);});
		$("#tsx-suggest-line").on("click", function(){self.tsxHTR.get_HTR_data(undefined, self.suggest_line);});
	}
	this.suggest_line = function(data){
		var this_line = self.cm.getCursor().line;
		self.cm.replaceRange(data.target, {line: this_line, ch: 0}, {line: this_line, ch: null});
		self.cm.setCursor({line: (this_line+1), ch: 0});
	}
	this.suggest_word = function(data){
		console.log("suggest word", data.target);
		var this_line = self.cm.getCursor().line;
		var ed_line = self.cm.getLine(this_line);
		//		var ed_words = ed_line.split(/[\s]+/); //not ideal	
		//so instead lets use the targetSegmentation data
		var ed_words = [];
		for(i in data.targetSegmentation){
			if(data.targetSegmentation[i][0]>ed_line.length) break;
			
			//but we need to take into account what has already been entered which may bear no relation to suggested...
			//better if we can get a from point suggestion from the HTR...
			ed_words.push(ed_line.slice(data.targetSegmentation[i][0],data.targetSegmentation[i][1]));
		}
		ed_words = ed_words.filter(Boolean); //take out empty strings
		
//		console.log(ed_words.length, ed_words);
		//next word at end of line...
		var w = data.targetSegmentation[ed_words.length];
		
		//or wherever the cursor is...?
//		console.log(data.target[self.cm.getCursor().ch]);
		
		//var w = data.targetSegmentation[];
		
//		console.log(w);
		var slice_end = w[1];
		var range_end = w[1];
		var ed_line_end = (ed_line.length + w[1] - w[0]+1);
		if((data.target[w[1]] != undefined && data.target[w[1]].match(/\s/)) || data.target.length == ed_line_end){
			slice_end++;
//			console.log("last char of sug is a space");
		}else{
//			console.log("last char of sug is NOT a space");
			range_end--;
		}
//		console.log(w[0], slice_end);
		var sug_word = data.target.slice(w[0],slice_end);
//		console.log("*"+sug_word+"*");
//		console.log("{line: "+this_line+", ch: "+w[0]+"}, {line: "+this_line+", ch: "+range_end+"}");
		
		self.cm.replaceRange(sug_word, {line: this_line, ch: w[0]}, {line: this_line, ch: range_end});
		//if we have reached the end of the line go to next line...
//		console.log(ed_line_end+" >= "+data.target.length);
		if(ed_line_end >= data.target.length){
//			console.log("moving cursor");
			self.cm.setCursor({line: (this_line+1), ch: 0});
		}
	}
	this.render_diffs = function(){
		  var target = "";
		  target.innerHTML = "";
		  //TODO works but I have to click to make test appear...?
		  
			self.diffs = CodeMirror.MergeView(document.getElementById("tsx-transcript-diffs"),{
			value: self.cm.getDoc().getValue(),
			readOnly: true,
			origLeft: self.text,
			lineNumbers: true,
			mode: "text/html",
			highlightDifferences: true,
			connect: null,
			collapseIdentical: false, //setting this to true has no effect :(
			revertButtons: false
		});
		//each time the diffs tab is activated we will reset the edit value and refresh the diff editors
		$('a[data-toggle="tab"][href="#tsx-diffs"]').on('shown.bs.tab', function (e) {
			setTimeout(function() {
				self.diffs.edit.setValue(self.cm.getDoc().getValue());
				self.diffs.edit.refresh();
				self.diffs.left.orig.refresh();
			},10 );

		});
	}
	this.validateXML = function (str){
		try{
			$.parseXML("<div>"+str+"</div>");
			return true;
		} catch(err){
			console.log("Invalid XML in transcript: "+err);
			err_str = err+'';
			BootstrapDialog.show({
                type: BootstrapDialog.TYPE_DANGER,
                title: "Invalid XML in transcript ",
                message: "<p>TSX could not save the transcript because it found some errors.</p><pre>"+err_str.replace(/</g,"&lt;")+"</pre>"
            });     
			return false;
		}
	}
	this.render_preview = function(){
		var tei = self.render_tei(self.cm.getDoc().getValue());	
		$('#tsx-preview').html(tei);
	
		//each time the diffs tab is activated we will reset the edit value and refresh the diff editors
		$('a[data-toggle="tab"][href="#tsx-preview"]').on('shown.bs.tab', function (e) {
			setTimeout(function() {
					var tei = self.render_tei(self.cm.getDoc().getValue());	
					$('#tsx-preview').html(tei);
			},10 );

		});

	}
	this.render_tei = function(text){
		//yuk but...
//		console.log(text);
		return text.replace(/\n/g,"<br/>").replace(/<hi/g, "<span").replace(/<\/hi/g,"</span").replace(/<span rend="/,"<span class=\"tei-");
		//need to use a bona fide tei xslt here, but first attempts failed miserably so replaces and css...
	}
	this.draw_polygon = function(textLine, line){
		var svg_str = self.coords_to_svg($(" > Coords",textLine).attr("points"));
		//TODO proper consistent references (names and value syntax)
		var line_ref = $(textLine).attr("id");
		var page_ref = $(textLine).parents("Page").attr("imageFilename").replace(/\.jpg$/,""); 
		var region_ref = $(textLine).parent("TextRegion").attr("id");
		
		//TODO inverse and grey out the rest of the doc...or not?
		var poly = tsxDoc.raph.path(svg_str);
		//we will hide some refs in here... maybe use them for hovers, clicks etc?
		poly.line_ref = line_ref;
		poly.region_ref = region_ref;
		poly.page_ref = page_ref;
		poly.full_line_ref = "JB."+page_ref+"."+region_ref+"."+line_ref;
		poly.line_index  = line;
		poly.rec = self.get_poly_limits($(" > Coords",textLine).attr("points"));
				
		poly.mouseup(function(e){		
			self.go_to_line(this, line);
			self.cm.setCursor(line);
			self.cm.focus();
		});
		tsxDoc.poly_set.push(poly.attr({"stroke":"none", "fill":"white", opacity: 0}));	
		return poly;
	}
	this.go_to_line = function(poly, line){
		if(poly == undefined) return;
//		if(poly.line_ref != undefined) self.tsxHTR.do_HTR(poly.full_line_ref);
		if(tsxDoc.zoom_flag){
			//use line width to set scale
			tsxDoc.paper.scale =  tsxDoc.raph.width / (poly.rec.x.max-poly.rec.x.min);
			//scale the view box   
			tsxDoc.paper.viewBoxWidth = tsxDoc.raph.width / tsxDoc.paper.scale;
			tsxDoc.paper.viewBoxHeight = tsxDoc.raph.height / tsxDoc.paper.scale;    
			//new coordinates are the line start coords coordinates adjusted on the 
			//y axis to move the line to the centre of the viewbox
			tsxDoc.paper.viewBoxX =  poly.rec.x.min;
			tsxDoc.paper.viewBoxY =  poly.rec.y.min - tsxDoc.paper.viewBoxHeight/2 + (poly.rec.y.max-poly.rec.y.min)/2;
			//set viewbox
			tsxDoc.raph.setViewBox(tsxDoc.paper.viewBoxX, tsxDoc.paper.viewBoxY, tsxDoc.paper.viewBoxWidth, tsxDoc.paper.viewBoxHeight);
			//call move to update the paper.xs/ys values etc
			tsxDoc.move(0,0);
		}
		//rebind hover for whole set
		tsxDoc.poly_set.hover(tsxDoc.hoverIn, tsxDoc.hoverOut);
		//reset opacity for whole set...
		tsxDoc.poly_set.attr({opacity: 0});
		//reset cm lines styles
		self.cm.eachLine(function(cm_line){
			self.cm.removeLineClass(cm_line, "text", "tsx-line-selected");
			self.cm.removeLineClass(cm_line, "text", "tsx-line-hovered");
		});

		//unbind hover and set opacity for selected item
		poly.unhover();
		poly.attr({opacity:"0.35", stroke: "grey"});
		self.cm.addLineClass(line, "text", "tsx-line-selected");

	}
	this.coords_to_svg = function(coords){
		
		return coords.replace(/([0-9.]+),([0-9.]+)/g, function($0, x, y) {
			x = Math.floor(x)*tsxDoc.img.scale;
			y = Math.floor(y)*tsxDoc.img.scale;
			return 'L ' + x + ',' + y + ' ';
		}).replace(/^L/, 'M') + " z"; // replace first L with M (moveTo)
	}
	this.get_poly_limits = function(coords){

		var rec = {x: {max: 0, min: 1.7976931348623157E+10308}, y: {max: 0, min: 1.7976931348623157E+10308}};
		coords.replace(/([0-9.]+),([0-9.]+)/g, function($0, x, y) {
			x = Math.floor(x)*tsxDoc.img.scale;
			y = Math.floor(y)*tsxDoc.img.scale;
			if(x>rec.x.max) rec.x.max = x;
			if(x<rec.x.min) rec.x.min = x;
			if(y>rec.y.max) rec.y.max = y;
			if(y<rec.y.min) rec.y.min = y;
		});
		return rec;
	}
	
	this.Blocker = function(selector) {
		var $elem = $(selector);
    
		this.blockUI = function(msg) {
			$elem.block({
				message: msg,
				centerY: false,
				css: {
			//          fontSize: "150%", 
					  top: $(document).scrollTop() + 50,
					  width: $elem.width() * 0.6,
					  padding: "1% 2%", 
					  borderWidth: "3px", 
					  borderRadius: "10px", 
					  '-webkit-border-radius': "10px", 
					  '-moz-border-radius': "10px" 
				}
			});  
		};
    
		this.unblockUI = function() {
			$elem.unblock();
		};
	}

	
	self.init();
}

function TSXHTR( tsxTranscript ){

	var self = this;
	this.name ="TSXHTR";

	this.init = function(){

		self.wordgraph_url = self.data_server+"docs/"+self.doc_ref+"/"+self.page_ref+"/wordgraphs";
		self.load_json(self.wordgraph_url, self.handle_wordgraphs);

	}
	this.handle_wordgraphs = function(data){
		//TODO here we check the available wordgraph refs against what is in the transcript
		self.wordgraph_data = data;
		self.wordgraphs = {};
		lineIds = [];
		$("trpWordgraph", data).each(function(){
			var lineId = $("lineId", this).text();
			self.wordgraphs[lineId] = this;
			lineIds.push(lineId);
		});

		lineIds = $.unique(lineIds);
		var htr_available = false;
		tsxTranscript.cm.eachLine(function(cm_line){			
			var ref_re = new RegExp(cm_line.ref+'$');
			var ids = $.grep( lineIds, function( wg, i ) {
				return ref_re.test(wg);
			});
		
			if(ids.length) tsxTranscript.cm.setGutterMarker(cm_line,"tsx-htr-available",self.makeMarker());	
		});
		//fix gutter marker snafu
		$(".CodeMirror-gutter-wrapper").css({width: "39px", left: "-39px" });

	}
	
	this.makeMarker = function() {
		var marker = document.createElement("div");
		marker.style.color = "#282";
		marker.innerHTML = "●";
		return marker;
	}

	this.get_HTR_data = function(line_ref, callback){
		if(line_ref == undefined){
			line_ref = self.get_line_ref();
		}
		var url = $("> nBestUrl", self.wordgraphs[line_ref]).text();
		console.log("wordgrpahs here: ", $("> nBestUrl", self.wordgraphs[line_ref]).text());
		self.load_xml(url, self.handle_suggestions);
	}	
	this.get_full_line_ref = function(){
		return tsxTranscript.polys[tsxTranscript.cm.getCursor().line].full_line_ref;
	}
	this.get_line_ref = function(){
		return tsxTranscript.polys[tsxTranscript.cm.getCursor().line].line_ref;
	}
	this.handle_suggestions = function(data){
		console.log(data);
	}

	self.init();
}
/*
function TSXHTR( tsxTranscript ){

	var self = this;
	this.name ="TSXHTR";

	this.init = function(){
		self.wordgraph_url = "/HTR_proxy.php?ref=JB."+self.ref;
		self.load_json(self.wordgraph_url, self.handle_wordgraphs);

		require("jquery.editable.itp");  
		// This lib may help to prevent unwanted asynchronous events.
		require("jquery.blockUI");

		// Check HTR engine availability.
		self.getAvailableSocket();		
	}
	this.handle_wordgraphs = function(data){
		console.log(data);
		//TODO here we check the available wordgraph refs against what is in the transcript
		self.wordgraph_data = data;
		console.log(data);
		console.log(tsxTranscript.polys);
		data.iids = $.unique(data.iids);
		var htr_available = false;
		tsxTranscript.cm.eachLine(function(cm_line){			
			var ref_re = new RegExp(cm_line.ref+'$');
			var ids = $.grep( data.iids, function( wg, i ) {
				return ref_re.test(wg);
			});
		
			if(ids.length) tsxTranscript.cm.setGutterMarker(cm_line,"tsx-htr-available",self.makeMarker());	
		});
		//fix gutter marker snafu
		$(".CodeMirror-gutter-wrapper").css({width: "39px", left: "-39px" });

	}
	
	this.makeMarker = function() {
		console.log("making marker");
		var marker = document.createElement("div");
		marker.style.color = "#282";
		marker.innerHTML = "●";
		return marker;
	}
	
	// getAvailableSocket() gets a valid port to usse for HTR socket
	this.getAvailableSocket = function(){
		var url = "http://casmacat.prhlt.upv.es/servers/status/bentham-batches?callback=?";
		self.load_json(url, self.set_port);
	}
	this.set_port = function(portNums){
		var howMany = Object.keys(portNums).length,
		nTested = 0;
		for (var n in portNums) {
			if (portNums[n] === true) {
				self.htrSocketPort = n;
				break;
			}
			nTested++;
		}
		if (nTested == howMany) console.log("No HTR engines are available!");
		console.log("Using engine at port", self.htrSocketPort);
		self.connect_to_HTR();
	}
	
	this.get_full_line_ref = function(){
		return tsxTranscript.polys[tsxTranscript.cm.getCursor().line].full_line_ref;
	}
	// We will farm use hidden elements in page htr_image, htr_target etc 
	// to interact with HTR. suggestion fcuntions will pick up data from 
	// htr_target
	this.connect_to_HTR = function(){
			console.log("connecting to HTR");
			$("#htr_stuff").html('<p class="source-text"></p>');
			self.lock = new tsxTranscript.Blocker('#tsx-transcript-editor');
			var htr_server= "http://casmacat.prhlt.upv.es";
			$("#htr_target").editableItp({
					sourceSelector: ".source-text",
					itpServerUrl:   htr_server + "@" + self.htrSocketPort + "/casmacat"

				})
			// Now we can attach some event listeners, this one is mandatory.
			.on('ready', self.isReady)
			// We can attach different callbacks to the same event, of course.
			.on('ready', function(ev, msg) {
				self.lock.unblockUI();
			})
			.on('unready', function(ev, msg) {
				console.log("unready");
				self.lock.blockUI(msg);
			});
	}
	this.do_HTR = function(full_line_ref, callback){
		if(full_line_ref == undefined){
			full_line_ref = self.get_full_line_ref();
		}
		
		//Let's pretend when no connection (on train or abroad) we will send back a pretend token.target response
		if(self.HTR_is_ready){
			console.log("sending ref: "+full_line_ref);
//			$("#htr_target").editableItp('endSession');	
			$("#htr_target").data("itp").$source.text(full_line_ref);
//			$("#htr_target").empty();
			$("#htr_target").text(tsxTranscript.cm.getLine(tsxTranscript.cm.getCursor().line));			
			$("#htr_target").data("itp").$target = $("#htr_target");
			self.htr_callback = callback;
			var transcription = $("#htr_target").text();
			console.log("decoding with some text in place: "+ transcription);
			if(transcription === ""){
				$("#htr_target").editableItp('decode');
			}else{
				//we assume that whatever we have is valid...
				$("#htr_target").editableItp('setPrefix',3);
				$("#htr_target").editableItp('decode');
			}
		}else{
			console.log("HTR not ready yet");
		}
	}
	
	this.isReady = function(){
			console.log("READY");
		 // At this point, the server has initialized the wordgraph 
	    // the connection has been successfully stablished.
	    self.HTR_is_ready = true;
	    // Let's change some server-side settings.
	    var settings = $("#htr_target").editableItp('getConfig');
	    // For instance, the editing mode will be Interactive Text Prediction.
	    settings.mode = "ITP";
	    $("#htr_target").editableItp('updateConfig', settings);
	    
	    // Now attach a number of callbacks (more to come).
	    $("#htr_target").on('decode', function(ev, data, err) {
	      if (err.length > 0) console.error("Error!", err);
	      // The server has decoded a given source image ID.
	      console.log(ev.type, data);
		  console.log("STARTING INTERACTIVE SESSION");
	      $("#htr_target").editableItp('startSession');
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
		  self.htr_callback(data);			
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
	    }).on('getTokensResult', function(ev, data, err) {
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

	self.init();
}
*/
function TSXController (config){

	this.init = function(config){
		
		TSXPage.prototype = new TSX(config);
		TSXPage.constructor = TSXPage;

		TSXDocument.prototype = new TSXPage();
		TSXDocument.constructor = TSXDocument;

		TSXTranscript.prototype = new TSXPage();
		TSXTranscript.constructor = TSXTranscript;

		TSXUser.prototype = new TSXPage();
		TSXUser.constructor = TSXUser;

		TSXFiles.prototype = new TSXPage();
		TSXFiles.constructor = TSXFiles;

		TSXHTR.prototype = new TSXPage();
		TSXHTR.constructor = TSXHTR;
		
		var tsxUser = new TSXUser();
		if(config.image_panel != undefined){
			var tsxDoc = new TSXDocument();
		}
		if(config.file_panel != undefined){
			var tsxFiles = new TSXFiles();
		}

//		tsxTranscript = new TSXTranscript();

		
/*		TSXViewer.prototype = new TSXImage();
		TSXViewer.constructor = TSXViewer;

		tsxviewer = new TSXViewer();
		tsxviewer.init();
	*/	
//		tsxPage = new (true, config);
	//	tsxImage = new TSXImage(true);
		//tsxViewer = new TSXViewer(true);
		//tsxTranscript = new TSXTranscript(true);
	}
	this.init(config);
}
