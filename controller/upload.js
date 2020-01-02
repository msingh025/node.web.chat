var fs = require('fs');
exports = module.exports = upload;

function upload(req ,res, params){
	 	var that = this;
	 	var fstream;
	 	var session =req['SESSION'];
		var authValue = session.get('auth');
	    req.pipe(req.busboy);
	    req.busboy.on('file', function (fieldname, file, filename) {
	    	var path = '/home/maneesh/Desktop/d/files/';
	    	//var path = __dirname+'/files/';
	    	fstream = fs.createWriteStream(path + filename);
	        file.pipe(fstream);
	        fstream.on('close', function () {
	        	authValue['success'] = true;
	        	authValue['filename'] = filename;
	            res.json(authValue);
	        });
	    });
}