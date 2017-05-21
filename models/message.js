/**
 * New node file
 */

exports = module.exports = init;
function message(db,config){
	this.config = config;
	this.db =db;
}
message.prototype.insert = function(to, from,message,messageType){
	 var that = this;
	 var f = that.db.prepare("INSERT into chat_message(to_name,from_name,message, created, messageType) VALUES (?,?,?,datetime(), ?)").run(to, from,message, messageType ).finalize();
     return true;
}
message.prototype.getMessage = function(to, from, cb){
	 var that = this;
	 that.db.serialize(function(){
		  var qery = "SELECT id,to_name,from_name,message, created,messageType from chat_message WHERE " +
		  		"(to_name ='"+to+"' and from_name='"+from+"') " +
		  		"|| " +
		  		"(to_name ='"+from+"' and from_name='"+to+"') " +
		  		"order by created asc";
			that.db.all(qery, function(err, row) {
				 if(err) throw err;
				 cb.call(null, row);
				
			 });
		//SELECT *  FROM chat_message where (to_name ='y' and from_name='x') || (to_name ='x' and from_name='y')  order by created asc	
		 	
	});
	 
}

function init(config){
	  var that = this;
	 return new message(this.db,config);
}