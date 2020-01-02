/**
 * New node file
 */
exports = module.exports = userlist;
function userlist(req ,res, io){
	 req.accepts('application/json');
	 var that = this;
	 var session =req['SESSION'];
	 var authValue = session.get('auth');
	 var toUser = req.param('toUser');
	 var messageModel = that.getModel('message');
	 messageModel.getMessage(toUser,authValue.user,function(rows){
		 res.json(rows);
	 });
	
}