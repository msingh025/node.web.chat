/**
 * New node file
 */
module.exports = getDb;
 function getDb(dbType){
	 var sqlite3 	= require('sqlite3').verbose();
	 var db 		= new sqlite3.Database(__dirname+'/dev_chat.sqlite');
	  return db;
 }
 