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
		self.init_GA();
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
	this.post_data = function(url, data, callback, args){
		console.log("posting data");
		self.rest(url, data, callback, "xml", "POST", args);
	}
	this.save_xml = function(url, data, callback, args){
		self.rest(url, data, callback, "xml", "POST", args, true);
	}

	this.save_json = function(url, data, callback, args){
		self.rest(url, data, callback, "json", "POST", args);
	}

	this.rest = function(url, data, callback, dataType, type, args, postfile){
			
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
		params.data = data;
		if(postfile){
			console.log("Setting contentType to false");
			params.processData = false;
			params.contentType = false;
		}
//		if($.cookie("TSX_session") != undefined)
//			params.data.JSESSIONID = $.cookie("TSX_session");
		console.log(url, params);
		$.ajax(url, params ).
		done(function(data, textStatus, jqxhr){
			//console.log("rest is done");
			callback(data, args);
		}).
		fail(function(jqxhr,textStatus,error){
			if(error === "Unauthorized"){
				BootstrapDialog.show({
					type: BootstrapDialog.TYPE_WARNING,
					title: "Session expired?",
					message: "<p>It seems that your TRP session has expired.</p>",
					buttons: [{label: 'OK',
                					action: function(dialogItself){
                    						dialogItself.close();
                					}
            				}]		
				});	
				$.removeCookie("TSX_session");
				$("body").trigger('cookieUpdate');
			}
			var err = textStatus + ", " + error;
			console.log( "**Request to "+url+" Failed: " + err );
			callback(false, args);
		}).
		always(function(){
//			$("#connection_message").remove();
		});
	};
	this.init_GA = function(){
		//need to do this from proper url not my faje dev one
	/*	
  		(function(i,s,o,g,r,a,m){
			i['GoogleAnalyticsObject']=r;
			i[r]=i[r]||function(){
			  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
*/
//:		console.log("Send pageview to GA");
//  		ga('create', 'UA-60990649-1', 'auto');
  //		ga('send', 'pageview');

	}
	this.log_action = function(){
		//push some metrics to GA
		//two broad types of metric:
			// system (for performance monitoring, ajax requests etc) 
			// user (To track user interaction with TSX, build a narrative of TSX use)

		
	}
	this.init(config);
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
	this.Blocker = function(selector) {
		require("jquery.blockUI");
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

	this.load_thumbnails = function(data){
		console.log(data);
		//rubbish code alert
		if(data.pageList == undefined){ //assume that means we've got an xml object
			console.log(xml2json(data).replace(/undefined/,""));
			var pages = $.parseJSON(xml2json(data).replace(/undefined/,""));
			//console.log(pages);
		}else{
			var pages = data.pageList.pages;
		}
		self.unload_thumbnails();
		for(var i in pages){
			console.log(pages[i]);		
			var thumb = '<div class="tsx-thumbbox col-sm-6 col-md-3">'+
				'<a href="./transcribe#'+self.col_ref+'/'+pages[i].docId+'/'+pages[i].pageNr+'" class="thumbnail">'+
					'<img src="'+pages[i].thumbUrl+'" alt="Tumbnail for '+pages[i].thumbUrl+'"/>';
					if(pages[i].tsList != undefined)
					thumb = thumb + ' <div class="caption">Page '+pages[i].pageNr+' ('+self.humanise(pages[i].tsList.transcripts[0].status)+')</div>';
				thumb = thumb + '</a>'+
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


	self.init();
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
		console.log(window.location.pathname);
		if(window.location.pathname === "/userarea"){
			self.recent_activity();
		}
		
	}
	this.update_login_state = function(){
		if($.cookie("TSX_session") != undefined){
			//console.log($.cookie("TSX_session"));
			$(".tsx-not-logged-in").hide();
			console.log(localStorage.userdata);
			self.userdata = $.parseJSON(localStorage.userdata).trpUserLogin;
			var possessive = "'s";
			if(self.userdata.firstname.slice(-1) === "s") possessive = "'"; //Just in case Chris Morris or Optimus Prime sign up
			$("ul#tsx-salutation > li > a").html(self.userdata.firstname+possessive+" TSX");
			$("ul#tsx-salutation").show();
			$(".tsx-logged-in").show();
		}else{
			$(".tsx-logged-in").hide();
			$("ul#tsx-salutation").hide();
			$(".tsx-not-logged-in").show();
	
		}	
	}
	/*
	this.handle_user = function(data){
		console.log(data);
	}
	*/
	this.recent_activity = function(){
		console.log(self.userdata);
		//might be an array, might be an object... sigh
		var collections = self.userdata.collectionList.colList;
		if(typeof self.userdata.collectionList.colList == "object")
			collections = [ self.userdata.collectionList.colList];
		for(var i in collections){
			
			var col = collections[i];
			console.log(col);
			var url = self.data_server+"collections/"+col.colId+"/recent";
			console.log(url);	
			//TODO make load_thumbnails more generic and promote it to TSXPage
			self.load_json(url, self.load_thumbnails);
		}
	}
	this.init_signin = function() {
		$('#loginForm').validate({
			rules: {
				user: {
				required: true
			    },
			    pw: {
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
//			self.load_xml(self.data_server+"auth/login_debug?"+params, function(data){
			self.post_data(self.data_server+"auth/login", params, function(data){
				console.log("userdata", data);
				if(data){
					$('#loginModal').modal("hide");
					$.cookie("TSX_session", $("trpUserLogin > sessionId",data).text(), {expires: null});
					$("body").trigger('cookieUpdate');
					var greeting = $("trpUserLogin > userName",data).text();
					if($("trpUserLogin > firstname",data).length != 0) greeting = $("trpUserLogin > firstname",data).text();
					console.log(data);
					localStorage['userdata'] = xml2json(data).replace(/undefined/,""); //xml2json sticks a random undefined in at start of object
 					
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_SUCCESS,
						title: "Login successful",
						message: "<p>Welcome back "+greeting+"</p>",
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
		$("#forgotPw").on("click", function(){
			params = {application: "TSX", user: $("#loginForm input[name='user']").val()};
			self.post_data(self.data_server+"user/forgotPw", params, function(data){
				console.log("forgotPw", data);
			});

		});

	}
	this.init_signup = function() {
		
		$('#createAccountForm').validate({
       			rules: {
		    	    user: {
				required: true,
				email: true,
				remote: {
        				url: self.data_server+"user/isUserAvailable?"+$("input[name='user']",this).val(),
        				type: "get"
        			} 
			    },
			    pw: {
				minlength: 7,
				required: true
			    },
			    firstName: {
				required: true
			    },
			    lastName: {
				required: true
			    },
	/*		    affiliation: {
				required: false,
			    },*/
			    gender: {
				required: false,
			    }
			},
			messages: {
			    user: {
			      remote: "This email address is already registered",
			      required: "We need your email address so you can activate your account",
			    },
			    pw: { required: "Please enter a password of at least 7 characters" },
			    firstName: "Please tell us you first name",
			    lastName: "Please tell us you last name",
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
		$("#createAccountForm").on("submit", function(e){
			e.preventDefault();
			var invalid = false;
        		if(!$("#createAccountForm").valid())
        		{
				invalid = true;
			}
			//just test the g-recaptcha exists. This could easily be spoofed but...
			// the server will do the proper verification when the data is sent
			var data = $(this).serializeObject();
			if(data['g-recaptcha-response'] == undefined || data['g-recaptcha-response'] === ""){
				 $('<span class="has-error"><span id="user-error" class="help-block" style="display: block;">Please confirm you are not a robot.</span></span>').insertAfter(".g-recaptcha").fadeOut(5000);
				invalid = true;
			}
			if(invalid)
				return false;

			var params = $(this).serialize();
			params = params.replace(/g-recaptcha-response/, "token");
			self.post_data(self.data_server+"user/register",params, function(data){
				console.log("registeref: ",data);
				$('#createAccountModal').modal("hide");
				if(data !== false){
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_SUCCESS,
						title: "You have successfully registered for TSX",
						message: "<p>Please check your email and follow the link to activate you account.</p>"
					});
				}else{
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_WARNING,
						title: "There was a problem",
						message: '<p>TSX could not create an account for you.</p><p>If the problem persists please contact <a href="mailto:transcribe.bentham@ucl.ac.uk">transcribe.bentham@ucl.ac.uk</a></p>'
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
								self.post_data(self.data_server+"auth/logout", {},  function(data){
									$.removeCookie("TSX_session");
									$("body").trigger('cookieUpdate');
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
			/*calls.push(*/self.load_json(url, self.handle_docslist, {colId: data[i].colId, i: i})/*)*/;
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

		if((parseInt(args.i)+1) == self.filetree.children.length){
			console.log("rendering filetree");
			self.render_filetree();
		}
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
	/*
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
	*/
	self.init();
}





// Create sub-class and extend base class.
//TSXImage.prototype = new TSXPage();
//TSXImage.constructor = TSXImage;

function TSXDocument( ){
	var self = this;	
	this.name ="TSXDocument";

	this.init = function(){
		//self.i_lock = new self.Blocker('#tsx-image');
		//self.i_lock.blockUI("Loading Image");
//		var url = self.data_server+"docs/"+self.doc_ref+"/"+self.page_ref;
//		self.load_xml(url, self.load_image);
		self.update_state();
		$("body").on('cookieUpdate', function(){ //check again after (homemade) event
			self.update_state();
		});


	}
	this.update_state = function(){

		if($.cookie("TSX_session") != undefined){
			var url = self.data_server+"docs/"+self.doc_ref+"/"+self.page_ref;
			self.load_xml(url, self.load_image);
		}else{
			$("#tsx-edit-panel").html("<p>Please sign in to continue transcribing.</p>");
			self.unload_image();
		}
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
	this.unload_image = function(data){
		$("#tsx-image").empty();
	}
	this.load_image = function(data){
		self.pageData = data;
		self.img_path = $("trpPage > url", data).text();
		var img = new Image();
		$(img).attr('src', self.img_path).load(function() {
			// Read, scale and set the dimensions based on image and available space in panel 
			self.set_dimensions(img);
			self.init_viewer();
			//self.i_lock.ublockUI();
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
		
		self.lock = new self.Blocker('#tsx-transcript-editor');
		self.lock.blockUI("Loading transcription data");
		self.load_xml(self.xml_path, self.handle_transcript);
		self.cm = CodeMirror(document.getElementById("tsx-transcript-editor"),{
				lineNumbers: true, 
				mode: "xml", 
				lineWrapping: true,
				gutters: ["CodeMirror-linenumbers", "tsx-htr-available"]
			});
		self.cm.setSize("auto", self.edit_height);		
		self.cm.setOption("extraKeys", {
  			Enter: "goLineDown" ,
			"Ctrl-Enter": function(cm){ cm.replaceSelection("\n"); },
			Tab: function(cm){ 
				self.tsxHTR.get_HTR_data(undefined, 1);
				//console.log("tab pressed");
			},
			"Shift-Tab": function(cm){ 
				self.tsxHTR.get_HTR_data(undefined);
				console.log("tab pressed");
			}
		});
	}
	this.unload_transcript = function(){
		
	}
	this.removeNSAttr = function(ele){
		if(ele == undefined) return "";
		return ele.toString().replace(/ xmlns=\"[^\"]*\"/,""); 
	}
	this.handle_transcript = function(data){	
		
		$(window).bind('beforeunload', function(){
			if(!self.cm.isClean()) return 'There are unsaved changes to this transcript';
		});
		self.xmlData = data;
		//The raph set for the line polygons
		tsxDoc.poly_set = tsxDoc.raph.set();
		self.text = "";
		self.lines = ""; //this will be a bunch of newlines to scope out the no-transcript-load scenario
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
			raw_text_line = raw_text_line.replace(/&apos;/g, "'")
								   .replace(/&quot;/g, '"')
								   .replace(/&gt;/g, '>')
								   .replace(/&lt;/g, '<');
								   //.replace(/&amp;/g, '&');
							   
			//line ref
			var line_ref = self.removeNSAttr($(this).attr("id"));
			//make text block for codemirror
			self.text += raw_text_line;
			//add new line if not last line
			if((i+1)!=$("TextLine", data).length){
				self.text +="\n";
				self.lines +="\n";
			}
			//store this stuff in the poly object
			poly.text = raw_text_line;
			poly.ref = line_ref;
			self.polys[i]=poly;
		});

		//	self.cm.setValue(self.text);
		self.cm.setValue(self.lines);
		self.cm.markClean();
		
		self.lock.unblockUI();
		
		//assign refs to cm line objects
		var i=0;
		self.cm.eachLine(function(cm_line){
			cm_line.ref=self.polys[i].ref;
			i++;
		});	
		
		//as soon as we have some parsed transcript data we init HTR
		self.tsxHTR = new TSXHTR(self);

		//here to start with.... until I think of somewhere better
		self.render_wysiwyg();

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
		
		//we will automagically keep the ampersands in line
		self.cm.on("change", function(cm, changeObj){
			var new_text = changeObj.text[0]; //not sure what situation would cause more than one item in this array			
			//will only replace & !not &amp;... this is important otherwise we would have runaway replacement!!
			var re = /&(?!amp;)/g;
			if(re.exec(new_text)){
//				console.log("change ampersand");
	//			console.log(changeObj.from, changeObj.to);
				self.cm.replaceRange(new_text.replace(re, "&amp;"), changeObj.from, {line: changeObj.to.line, ch: changeObj.to.ch+new_text.length});
			}
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
				tsxDoc.reset_view();

			}else{
				self.cm.setValue(self.text);
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
				var open_tei = [];
				self.cm.eachLine(function(cm_line){
				
					var lineObj = self.cm.lineInfo(cm_line);
					if(!self.validateXML(cm_line.text, true)){ //we have a possible multi line tei tag to close...
						var re = /<\/[^>]+>/g;
						if(cm_line.text.match(re)){
							var open = open_tei.pop();
							console.log("use this to open", open);
							self.cm.replaceRange(open, {line: lineObj.line, ch:0}, null);
						}else{

							//we need to close any multi line open tags in this line
							var re = /(<([^\/\s]+)[^>]*>)/g;
							if(cm_line.text.match(re)){
								var tag_name = RegExp.$2;
								var tag = RegExp.$1;
								var close = "</"+tag_name+">";
								self.cm.replaceRange(close, {line: lineObj.line, ch:cm_line.text.length}, null);
								open_tei.push(tag);
							}
						}
					}
					//check xml validity
					if(self.validateXML(cm_line.text)){
							
							
						
						line_index = lineObj.line;
						from_xml = $("TextLine:eq("+line_index+") > TextEquiv Unicode", self.xmlData).html();
						//if so did the actual text change
						if(cm_line.text.localeCompare(self.removeNSAttr(from_xml))){
							//lets encode (after all that)
							cm_line.text = cm_line.text.replace(/</g, '&lt;')
							   .replace(/>/g, '&gt;')
							   .replace(/"/g, '&quot;')
							   .replace(/'/g, '&apos;');
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
				console.log(self.xmlData);
				var url = self.data_server+"docs/"+self.doc_ref+"/"+self.page_ref+"/text";
				self.save_xml(url,self.xmlData, function(data){
					console.log(data);
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_SUCCESS,
						title: "Saved Transcript",
						message: "<p>Transcript changes have been saved.</p>"
					});
				});
				
				}
		});
	}
	
	this.tei = {
			"tsx-tei-underscore": {open: '<hi rend="underscore">', close: '</hi>'},
			"tsx-tei-super": {open: '<hi rend="superscript">', close: '</hi>'},
			"tsx-tei-comment": {open: '<!--', close: '-->'},
			"tsx-tei-amp": {insert: '&amp;'},
			"tsx-tei-longdash": {insert: '&#x2014;'},
			"tsx-tei-gap": {insert: '<gap/>'},

		};
	
	this.init_buttons = function(){
		$("#tsx-suggest").on("click", function(){self.tsxHTR.get_HTR_data(undefined);});

			$(".tsx-tei-insert").on("click",function(){			
				self.cm.replaceSelection(self.tei[$(this).attr("id")].insert);
				self.cm.focus();
			});
			//wrap TEI tags around selected content
			$(".tsx-tei-wrap").on("click",function(){
				var text = self.cm.getSelection();
				//check for special case
				if(self.tei[$(this).attr("id")] != undefined){
					var open = self.tei[$(this).attr("id")].open;
					var close = self.tei[$(this).attr("id")].close;
				}else{
					open ='<'+$(this).attr("id").replace(/^tsx-tei-/,"")+'>';
					close = open.replace(/^</, "</");
				}
				self.cm.replaceSelection(open+text+close);
				self.cm.focus();
			});

			
			$("#tsx-tei-underscore").on("click", self.do_tei);
		
		
/*		$("#tsx-suggest-word").on("click", function(){self.tsxHTR.get_HTR_data(undefined, self.suggest_word);});
		$("#tsx-suggest-line").on("click", function(){self.tsxHTR.get_HTR_data(undefined, self.suggest_line);});*/
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
	this.validateXML = function (str, no_moan){
		try{
			$.parseXML("<div>"+str+"</div>");
			return true;
		} catch(err){
			if(no_moan) return false;
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
	this.render_wysiwyg = function(){
	//	console.log("Here");
		$("#tsx-w-transcript-editor").height(50);
/*		new Medium({
                	element: document.getElementById('tsx-w-transcript-editor'),
			mode: Medium.richMode
            	});	*/

/*		(function(){
	var article = document.getElementById('rich_with_invoke_element'),
		container = article.parentNode,
	    medium = new Medium({
	        element: article,
	        mode: Medium.richMode,
	        placeholder: 'Your Article',
	        attributes: null,
	        tags: null,
		    pasteAsText: false
	    });

		article.highlight = function() {
		if (document.activeElement !== article) {
			medium.select();
		}
	};


	container.querySelector('.bold').onmousedown = function() {
		article.highlight();
		medium.invokeElement('b', {
		    title: "I'm bold!",
		    style: "color: #66d9ef"
	    });
		return false;
	};

	container.querySelector('.underline').onmousedown = function() {
		article.highlight();
		medium.invokeElement('u', {
			title: "I'm underlined!",
			style: "color: #a6e22e"
		});
		return false;
	};

	container.querySelector('.italic').onmousedown = function() {
		article.highlight();
		medium.invokeElement('i', {
			title: "I'm italics!",
			style: "color: #f92672"
		});
		return false;
	};

	container.querySelector('.strike').onmousedown = function() {
		article.highlight();
		medium.invokeElement('strike', {
			title: "I've been struck!",
			style: "color: #e6db74"
		});
		return false;
	};
})();
*/
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
		var rendered = text.
			//replace(/<hi/g, "<span").
			//replace(/<\/hi/g,"</span").
			replace(/<([^\/][^(hi)>]+)/g, '<span class="tei-$1"').
			replace(/<hi rend="/g,"<span class=\"tei-").
			replace(/<\/[^>]+/g, '</span').
			replace(/\n/g,"<br/>");

		//console.log(rendered);
		return rendered;
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
	
	
	self.init();
}

function TSXHTR( tsxTranscript ){

	var self = this;
	this.name ="TSXHTR";

	this.init = function(){
		self.wordgraph_url = self.data_server+"/collections/"+self.col_ref+"/"+self.doc_ref+"/"+self.page_ref+"/wordgraphs";
		console.log(self.wordgraph_url);
		self.load_json(self.wordgraph_url, self.handle_wordgraphs);
		
	}
	this.handle_wordgraphs = function(data){
		//TODO here we check the available wordgraph refs against what is in the transcript
		//console.log(data);
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
		
			if(ids.length){
				tsxTranscript.cm.setGutterMarker(cm_line,"tsx-htr-available",self.makeMarker());
//TODO Maybe add the line_ref as a class to the code mirror line... 
//to at lest distinguish it from user added lines
//we should also be tracking the polys by ref not by index...
//				tsxTranscript.cm.addLineClass(cm_line, cm_line.ref);
			}
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

	this.get_HTR_data = function(line_ref, num_words){
		if(line_ref == undefined){
			line_ref = self.get_line_ref();
		}
		var url = $("> nBestUrl", self.wordgraphs[line_ref]).text();
		//console.log("wordgrpahs here: ", $("> nBestUrl", self.wordgraphs[line_ref]).text());
		self.load_xml(url, self.handle_suggestions, {line_ref: line_ref, num_words: num_words});
	}	
	this.get_full_line_ref = function(){
		return tsxTranscript.polys[tsxTranscript.cm.getCursor().line].full_line_ref;
	}
	this.get_line_ref = function(){
		return tsxTranscript.polys[tsxTranscript.cm.getCursor().line].line_ref;
	}
	this.get_line = function(){
		return tsxTranscript.cm.getLine(tsxTranscript.cm.getCursor().line);
	}

	this.suggestions = function(cm, sug) {

		var edit_line = self.get_line();
		var edit_re = new RegExp('^'+edit_line+'(.*)');
		var edit_words = edit_line.split(/\s+/);
		var last_word_ind = edit_words.length-1;
		//top matches have an exact match (at the start) with the token
		var top_match = [];
		// next matches don't
		var next_match = [];
		for(var i in sug.lines){
		//	console.log(sug.lines[i]);
			var sug_line = sug.lines[i].replace(/^.*<s>\s*(.*)<\/s>.*$/, '$1');
			var sug_words = sug_line.split(/\s+/);
			if(edit_re.test(sug_line)){
				//console.log("Match", sug_line);
				var match_str = RegExp.$1;
				//only return num_words words
				if(sug.num_words != undefined)
					match_str = match_str.split(/\s+/).slice(0,sug.num_words).join(" ");
								
				top_match.push(match_str);
			}else{
				//imperfect way of getting what we think the remainder of the suggestion is
				var remains = sug_words.slice(last_word_ind).join(" ");
				var last_word_re = new RegExp('^'+edit_words[last_word_ind]+'(.*)');
				if(last_word_re.test(remains)){
					match_str = RegExp.$1;
					if(sug.num_words != undefined)	
						match_str = match_str.split(/\s+/).slice(0,sug.num_words).join(" ");

					next_match.push(match_str);
				}
			}
		}
		//turns out $.unqiue is only ment for DOM elements...!
		var matches = self.removeDupes(top_match.concat(next_match));
//		console.log("matches", matches);
		
		if(matches.length == 0) {
			tsxTranscript.lock.blockUI("Sorry, no suggestions");
			setTimeout(tsxTranscript.lock.unblockUI, 1000);
			return false;
		}
  		var inner = {from: cm.getCursor(), to: cm.getCursor(), list: matches};
  		return inner;
	}
	
	this.handle_suggestions = function(data, args){
		var sug_lines = data.split(/\n/);
		var edit_line = self.get_line();
		CodeMirror.showHint(tsxTranscript.cm, self.suggestions, {lines: sug_lines, num_words: args.num_words});
	}
	//poss a utility
	this.removeDupes = function(arr) {
		var result = [], map = {}, item;
		for (var i = 0; i < arr.length; i++) {
			item = arr[i];
			if (!map[item]) {
				result.push(item);
				map[item] = true;
			}
		}
		return(result);
	}
	
	self.init();
}
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

	}
	this.init(config);
}

/*Utility*/
String.prototype.capitalise = function() {
	var str = this.toLowerCase();
	return str.charAt(0).toUpperCase() + str.slice(1);
}
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
	if (o[this.name] !== undefined) {
	    if (!o[this.name].push) {
		o[this.name] = [o[this.name]];
	    }
	    o[this.name].push(this.value || '');
	} else {
	    o[this.name] = this.value || '';
	}
    });
    return o;
};

