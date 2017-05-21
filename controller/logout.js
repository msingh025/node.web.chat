exports = module.exports = logout;
function logout(req ,res, params){
	
	 var that = this;
	 req.accepts('application/json');
	 var auth = {isLog:false, user:"", pass:"",exist:false,isLogout:true};
	 var session =req['SESSION'];
	 var authinfo = session.get('auth');
	 that.db.run("UPDATE chat_user set islogin='n' WHERE user='"+authinfo.user+"'");
	 
	 params['socketsClient'].forEach(function(v,i){
		 if(v.user != authinfo.user){
			 params.io.to(v.id).emit('remove',authinfo.user); 
		 }else{
			 params['socketsClient'].splice(i,1)
		 }
		  
	 });
	 session.set('auth', auth);
	 res.send(auth);

}