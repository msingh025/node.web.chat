/**
 * New node file
 */
function chat(data){
	 this.config = data;
	 this.socket = io.connect();
	 this.color = 'black';
	 this.start = {x:0,y:0};
	 this.isDrawStart = false;
	 this.canvasContext =null;
	 this.canvas = null;
	 this.isCanvasMessage = false;
	 this.messageType = 'text';  // text/canvas/file
	 this.currentUser;
	 this.classOnline = {'n':'label-warning','y':'label-success'};
	 this.user;
	 this.form;
	 this.boot();
}
chat.prototype = {
		boot:function(){
			var that = this;
			this.bindSocket();
			 $(document).ready(function(){
				 $("#message").hide();
				  that.showLogin(); 
				 $('#smilye_on_off').attr({'checked':false});
				 $('#message_box').on('keyup', function(e){
					 
					 if(e.keyCode === 13 && !e.shiftKey){
						 that.isCanvasMessage =false;
						 that.messageType = 'text';
						 var date = new Date();
						 var dateString = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
						 //that.storeMessage(dateString,$(this).val(), that.config.user ,that.isCanvasMessage);
						 that.messageBody($(this).val(), that.config.user, that.messageType,dateString);
						 that.socket.emit('hello', $(this).val(), that.config.user, that.messageType,that.currentUser, function(response){
							  console.log(response);
						 });
						 $(this).val('');
					 } 
				 });
				 
				 $('#smilye_on_off').on('change', function(e){
					 that.smilyeOnOff(this);
				 });
				 $('.color_box').on('click',function(e){
					   if($(this).attr('data') =='send'){
						   that.sendCanvasData();
					   }else{
						   that.color = $(this).attr('data');   
					   }
				 });
				 
				 $('#canvas').on('click', function(e){
					  that.isDrawStart = (that.isDrawStart) ?false:true;
					  var cord = that.getPosition(that.canvas, e);
					  that.start['x'] =cord['x'];
					  that.start['y'] = cord['y'];
					  if(that.isDrawStart){
						  var context = that.canvasContext;
						  context.beginPath();
					      context.moveTo(that.start['x'],that.start['y']);
					  }
				 });
				 $('#canvas').on('mousemove', function(e){
					 if(that.isDrawStart){
						 var cord = that.getPosition(that.canvas, e);
						  that.drawing(cord,that.canvasContext); 
					 }
					  
				 });
				
				  var file_drop = document.getElementById('contents');
				  file_drop.addEventListener(
				    'dragover',
				    function handleDragOver(evt) {
				      evt.stopPropagation()
				      evt.preventDefault()
				      evt.dataTransfer.dropEffect = 'copy'
				    },
				    false
				  )
				  file_drop.addEventListener(
				    'drop',
				    function(evt) {
				      evt.stopPropagation()
				      evt.preventDefault()
				      var files = evt.dataTransfer.files  // FileList object.
				      var form = new FormData();
				      for (var i = 0; i < files.length; i++) {
				    	  console.log(files[i]);
				    	  form.append('file', files[i]);
				        }
				       that.upload(form);

				    },
				    false
				  );
				  
				 $('#login').on('click', function(e){
					 that.login(e);
				 });
				 $('body').on('click','#logout', function(e){
					 that.logout();
				 });
				 $('#register').on('click', function(e){
					 that.register();
				 });
				 $('#rg_password').on('keyup', function(e){
					 if(e.keyCode === 13){
						 $('#register').click(); 
					 }
				 });
				 $('#password').on('keyup', function(e){
					 if(e.keyCode === 13){
						$('#login').click(); 
					 }
				 });
				 
			 });
			
		},
		getBase64: function(){
			var that = this;
			var base64 = that.canvas.toDataURL("image/jpeg",6);
			return base64;
		},
		sendCanvasData:function(){
			
			var that = this;
			if(!that.currentUser) {alert("sorry no user selected");
			  return;
			}
			var base64 = that.getBase64();
			that.isCanvasMessage = true;
			that.messageType ='canvas';
			var date = new Date();
			
			var dateString = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
			that.storeMessage(dateString,base64, that.config.user,that.messageType);
			that.messageBody(base64,that.config.user,that.messageType, dateString);
			that.socket.emit('hello', base64,that.config.user, that.messageType,that.currentUser, function(response){
				 console.log(response);
			});
		},
		getPosition: function(element, e) {
			var that = this;
			var xPosition = e.pageX;
		    var yPosition = e.pageY;
		    var rect = element.getBoundingClientRect();
		    xPosition -=rect.left;
		    yPosition -=rect.top;
		    return { x: xPosition-12, y: yPosition };
		},
		 drawing:function(cord, canvasContext){
			 var that =this;
			 
			 canvasContext.lineTo(cord['x'], cord['y']);
			 canvasContext.lineWidth = 5;
			 canvasContext.strokeStyle = that.color;
			 canvasContext.stroke();
		      
		 },
		 cleanCanvas:function(){
			 var that = this;
			 var ctx = that.canvasContext;
			 var w = $(that.canvas).width();
			 var h = $(that.canvas).height();
			 ctx.fillStyle = "#ffffff";
			 ctx.fillRect(0,0,w,h);
			 
		 },
		smilyeOnOff:function(context){
			var that = this;
			if($(context).is(':checked')){
				
				 $('.color_box').show();
				 $('#canvas').show()
				 .attr({
					 'width':$('#message_box').width()+'px',
					 'height':$('#message_box').height()+'px'
				 });
				 $('#message_box').hide();
				 that.canvas = document.getElementById('canvas');
				 that.canvasContext = that.canvas.getContext('2d');
				 that.cleanCanvas();
			  }else{
				  $('#message_box').show();
				  $('.color_box').hide();
				  $('#canvas').hide();
				  
			  }
		},
		messageBody:function(message, userName, messageType,dateString, isMulti){
			var that = this;
			/*if(!that.currentUser) {alert("sorry no user selected");
			  return;
			}*/
			 console.log(messageType);
			var newLine = message.split('\n');
			
			var flagWrite = false;
			for(var i=0; i<newLine.length; i++ ){
				if(newLine[i] !="") flagWrite =true;
			}
			if(flagWrite ==false) return;
			var li = $(document.createElement('li'))
						.addClass('list-group-item chat_message')
					    .data('userName',userName);
			var sp1 = $(document.createElement('span')).text('['+dateString+']');  
			var nElement = $('#message_display_panel .list-group li').length;
			var sp2 = $(document.createElement('span'));
			if($('#message_display_panel .list-group li').eq(nElement-1).data('userName')!=userName){
				sp2.addClass('blue_label');
				var sp2 = sp2.html(userName+':&nbsp;');  
			}
			
			if(messageType =='canvas'){
				var img = new Image();
				img.src= message;
				message = $(img)
			}else if(messageType =='text'){
				var mess =[];
				for(var i=0; i<newLine.length; i++ ){
					if(newLine[i] !="") {
						if(i>0 && i<newLine.length){
							mess.push($(document.createElement('br')))
						}
						mess.push(document.createTextNode(newLine[i]));
					}
				}
				message = mess; //document.createTextNode(messgae);
			}else{
				
				 var div = $(document.createElement('span'));
				 var img = $(new Image()).attr({
			    	  src:'/public/image/document.png',
			    	  height:"30px",
			    	  width:"30px"
			     }).data('name',message)
			     .click(function(){
			    	  that.download(this);
			     });
				     div.append(
				      img
				     , message);
				     message = div;
				     console.log(message);
			}
			console.log(message);
			li.append(sp1,sp2,message);
			//that.storeMessage(dateString,messgae, userName);
			$('#message_display_panel .list-group').append(li);
			if(!isMulti)
			$('#message_display_panel').animate({ scrollTop: $('#message_display_panel .list-group').outerHeight()}, 500);
		},
		download:function(cntx){
			window.location.href = '/download/'+$(cntx).data('name');
		},
		badgeUpdate:function(user){
			var that = this;
			
			if(user !=that.currentUser){
				var info = that.getuserId(user);
				var cnt = ($('#'+info.id+' span').data('count'))?$('#'+info.id+' span').data('count'):0;
				$('#'+info.id+' span').data('count',cnt+1);
				$('#'+info.id+' span').text(cnt+1);
			}
		},
		getuserId:function(user){
			var id=0;
			var that = this;
			var name = '';
			that.config['userlist'].forEach(function(v,i){
				  if(user ==v.user){
					  id = v.id;
					  name=v.name;
					  return;
				  }
			});
			return {id:id,name:name};
		},
		bindSocket:function(){
			var sk = this.socket;
			var that = this;
			sk.on('message', function(data, k, messageType, to){
				
				var date = new Date();
				 var dateString = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
				// that.storeMessage(dateString,data, k,isCanvas);
				 
				 if(that.currentUser ==k){
					 that.messageBody(data,k, messageType,dateString);
				 }else{
					 that.badgeUpdate(k);
				 }
				
				 
			});
			sk.on('joined', function(data){
				var action = 'online'; 
				 if(data.register){
					 that.updatePanelSingle(data.id,data.user, 'y'); 
				 }
				 else{
					 var info = that.getuserId(data.user);
					$('#'+info.id+' span').removeClass('label-warning');
					$('#'+info.id+' span').addClass('label-success');
				}
				 that.onlineOffline(data.user,action);
			});
			sk.on('remove', function(user){
				    var action = 'offline'; 
					var info = that.getuserId(user);
					$('#'+info.id+' span').removeClass('label-success');
					$('#'+info.id+' span').addClass('label-warning');
					that.onlineOffline(user, action);
			});
			if(that.config){
				if(that.config.isLog==true)
				sk.emit('updatelist',that.config.user, function(data){
					 return true;
				});
			}
			
		},
		setAppScreen:function(){
			 var windowH = $(window).height();
			 var messageBoxH = $('#message_box').outerHeight(); 
			 var tophead = $('.tg_head_split').outerHeight();
			 var progressBar = $('.progress').outerHeight();
			 var titleH = $(".label-green").outerHeight();//$('#panel-heading-title').outerHeight();
			 var xH = $('#smilye_area').height();
			 $(".left_user_list").height((windowH-tophead-4)+'px');
			 var mH = windowH -messageBoxH-titleH-xH-tophead-progressBar-2;
			 $('#message_display_panel').height(mH+'px');
			 
		},
		showLogin: function(){
			var that = this;
			if(that.config.isLog==false){
				$('#modal-content').modal({
	    			show: true,
	    			keyboard:false,
	    			backdrop:false
			    });
				$('#logout').hide();
				$('#content').hide();
				$('#reg_log_form')[0].reset();
				
				$('#error_message').text('');
			}else{
				$('#content').show();
				that.updateUserList();
			}
		},
		updatePanelSingle:function(id,userName, isLogin){
			var that = this;
			var li = $(document.createElement('li'))
					 .addClass('list-group-item');
			var dp = $(new Image())
					 .attr({
						 width:"70px",
						 height:"70px",
						 src:"/public/image/default_pic.png"
			 });
			
			var classval = 'label '+that.classOnline[isLogin]+' label-as-badge';
			var span = $(document.createElement('span'))
			 .addClass(classval).text('O');
			if(that.config['user'] ==userName){
				$('#user_list .list-group').empty();
				li.append(dp,span,userName, '<a href="#" class="btn" id="logout" style:"float:right;">Logout !</a>');
			}else{
				li.append(dp,span,userName);
				
			}
			li.click(function(){
				if($(this).hasClass('actives')){
					return false;
				}
				if(that.config.user==$(this).data('user')){
					that.welcome(this);
					return ;
				} 
				$('#welcome').hide();
				$('#messgae_editor').show();
				that.currentUser=$(this).data('user');
				$('#user_list .list-group-item').removeClass('actives');
				$(this).addClass('actives');
				 $(this).find('span').eq(0).data('count',0);
				 $(this).find('span').eq(0).html(0);
				  that.updateMessagePanel(this);
				  document.getElementById('message_box').focus();
				  $('#message_box').val('');
				  that.setAppScreen();
			})
			.data('user',userName)
			.attr({id:id});
			$('#user_list .list-group').append(li);
		},
		updateMessagePanel:function(context){
			var that = this;
			var info = that.getuserId(that.currentUser);
			$('.label-green span').text('hello '+info.name);
			$('#message_display_panel .list-group').empty();
			var that = this;
			var url = "/message";
			var info = {'toUser':that.currentUser};
			var mulit = true;
			that.xhrReq('post',url,info,function(data){
					
	        	    if(data.length >0){
	        	    	$.each(data, function(i,v){
							 that.messageBody(v.message,v.from_name,v.messageType,v.created,mulit);
						 });
						 $('#message_display_panel').animate({ scrollTop: $('#message_display_panel .list-group').outerHeight()}, 500);
	        	    }
				
			});
			
			/*var messagerows = localStorage.getItem('row');
			
			if(typeof(messagerows) !='undefined'){
				var m = JSON.parse(messagerows);
				if(!m) return;
				 if(m[that.currentUser]){
					 				 }
			}*/
			
		},
		storeMessage:function(dateString,messgae,userName,isCan ){
			var that = this;
			if(localStorage.getItem('row')){
				var message = localStorage.getItem('row');
				var m = JSON.parse(message);
				  if(!m[userName]){
					  m[userName] = [{

							date:dateString,
							message:messgae,
							user:userName,
							isCanvas:isCan
					}]
				  }else{
					  m[userName].push({
							date:dateString,
							message:messgae,
							user:userName,
							isCanvas:isCan
					});
				  }
				  localStorage.setItem('row',JSON.stringify(m));
			}else{
				var x ={};
				x[that.currentUser] = [{
						date:dateString,
						message:messgae,
						user:userName,
						isCanvas:isCan
				}];
				localStorage.setItem('row',JSON.stringify(x));
			}
			
		},
		updateUserPanel:function(userName, isAppend, sockId){
			that.socket.emit('getUserSocketList',userName, function(userList){
			});
		},
		login:function(e){
			/*var strWindowFeatures = "location=yes,height=570,width=520,scrollbars=yes,status=yes";
			var URL = "http://10.0.32.213:8009";
			var win = window.open(URL, "_blank", strWindowFeatures);
			return;*/
			e.preventDefault();
			var that = this;
			var url = "/login";
			var info = {"userName":$('#txtname').val(),'password':$('#password').val()};
			that.user = $('#txtname').val();
			that.xhrReq('post',url,info,function(data){
				if(data.isLog == true){
	        		that.config = data;
	        		$('#modal-content').modal('hide');
	        		$('#logout').show();
	        		that.updatePanelSingle(0,$('#txtname').val(),'y');
	        		//that.updateUserList();
					that.showLogin();
	        		that.socket.emit('updatelist',that.user, function(userList){
	        			 console.log(userList);
						 return true;
					});
	        	}else{
	        		 $('#error_message').text(data.message);
	        	}
			});	
		},
		updateUserList:function(){
			var that = this;
			var url = "/userlist";
			var info = that.config;
			
			that.xhrReq('post',url,info,function(data){
					that.config['userlist'] =data; 
	        	    if(data.length >0){
	        	    	$.each(data, function(i,v){
	        	    		that.updatePanelSingle(v.id, v.user, v.islogin);
	        	    	});
	        	    }
				
			});	
		},
		upload:function(data){
			var that = this;
			$('.progress').show();
			var url = "/upload"; 
			$.ajax({
			    url: url,
			    data: data,
			    cache: false,
			    contentType: false,
			    processData: false,
			    type: 'POST',
			    success: function(data){
			    	 var date = new Date();
					 var dateString = date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
			    	that.isCanvasMessage = false;
			    	that.messageType = 'files';
			    	 that.messageBody(data.filename, data.user, that.messageType,dateString);
					 that.socket.emit('hello', data.filename, data.user, that.messageType,that.currentUser, function(response){
						  console.log(response);
					 });
			    },
			    xhr: function(){
			    	
			        // get the native XmlHttpRequest object
			        var xhr = $.ajaxSettings.xhr() ;
			        // set the onprogress event handler
			        xhr.upload.onprogress = function(evt){ 
			        	
			        	var percentage =Math.floor((evt.loaded/evt.total)*100);
			        	 $('div.progress-bar').attr({
			            	 width:percentage+'%'
			             }).css({
			            	  width:percentage+'%'
			             }).text(percentage+'%');
			           
			        } ;
			        // set the onload event handler
			        xhr.upload.onload = function(){ 
			        	 $('div.progress-bar').attr({
			            	 width:0+'%'
			             }).css({
			            	  width:0+'%'
			             }).text(0+'%');
			        	   $('.progress').hide();
			        	} ;
			        // return the customized object
			        return xhr ;
			    }
			});
			
		},
		xhrReq:function(method, url, jsonData,cb){
			var that = this;
			console.log(jsonData);
	        var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
	        if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
	               var data = JSON.parse(xhr.responseText);
	        	   cb.call(this, data);
	        } 
		};  xhr.open(method, url,true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify(jsonData));
        },
		logout:function(){
			var that = this;
			var url = "/logout"; 
			var data = {};
			that.xhrReq('post',url,data,function(data){
				if(data.isLogout == true){
	        		that.config = data;
	        		$('#logout').hide();
	        		$('#user_list .list-group').empty();
	        		$('.label-green span').text('');
	        		that.showLogin();
				}
			});	
		},
		register:function(){
			var that = this;
			var uname = $('#rg_user_txtname').val();
			var name = $('#rg_txtname').val();
			var pass = $('#rg_password').val();
			 if(!uname){
				 alert('Empty user name');
				 return;
			 }
			 if(!name){
				 alert('Empty name');
				 return;
			 }
			 if(!pass){
				 alert('Empty password!');
				 return;
			 }
			var url = "/register"; 
			that.user = $('#rg_user_txtname').val();
			var info = {"rg_name":$('#rg_txtname').val(), 'rg_userName':$('#rg_user_txtname').val(),'rg_password':$('#rg_password').val()};
			that.xhrReq('post',url,info,function(data){
				if(data.isLog == true){
	        		that.config = data;
	        		$('#modal-content').modal('hide');
	        		$('#logout').show();
	        		that.updatePanelSingle(0, $('#rg_user_txtname').val(),'y');
	        		that.showLogin();
	        		//that.updateUserList();
	        		that.socket.emit('updatelist',that.user, function(userList){
	        			 //console.log(userList);
						 return true;
					});
	        	}else{
	        		 $('#error_message').text(data.message);
	        	}
			});
		},
		onlineOffline:function(userName, action){
			       $('#onlineAlert').html(userName +' is '+action);
			        $("#message").alert();
	                $("#message").fadeTo(2000, 500).slideUp(500,
	                function(){
	                	$("#message").hide();
	                });   
		},
		welcome:function(cnt){
			$('#user_list .list-group-item').removeClass('actives');
			$(cnt).addClass('actives');
			 $('#welcome').show();
			 $('#messgae_editor').hide();
		}
		
}