/**
 * New node file
 */
exports = module.exports = userlist;
function userlist(req ,res, io){
	 req.accepts('application/json');
	 var that = this;
	 var session =req['SESSION'];
	 var authValue = session.get('auth');
	 var user = req.param('user');
	 var password = req.param('password');
	 authValue.user = user;
	 userList();
	 function userList(){
		 that.db.serialize(function(){
				that.db.all("SELECT id,user,created,name,islogin from chat_user WHERE user<>'"+user+"'", function(err, row) {
					try{
					 if(err) throw err;
					 res.send(row);
					}catch(ex){
						 authValue.isLog = false;
						 authValue['success']= false;
						 authValue['message']=ex;
						 authValue.exist = false;
						 session.set('auth',authValue);
						 res.send(authValue);
					}
				 });
				
			 	
		});
		 
	 }
}