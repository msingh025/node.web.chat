var fs = require('fs');
var path = require('path');
var mime = require('mime');
exports = module.exports = download;

function download(req ,res, params){
	 	var that = this;
	 	var fstream;
	 	var session =req['SESSION'];
		var authValue = session.get('auth');
		var fileName = req.param('file');
		var pathFile = '/home/maneesh/Desktop/d/files/';
    	//var path = __dirname+'/files/';
		var file = pathFile + fileName;
		var filename = path.basename(file);
		var mimetype = mime.lookup(file);
		//authValue['p'] =file;
		
		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
		res.setHeader('Content-type', mimetype);
		var filestream = fs.createReadStream(file);
		filestream.pipe(res);
		
}

