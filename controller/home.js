/**
 * New node file
 */
exports = module.exports = index;

function index(req ,res,io){
	 var sessionAuth = req['SESSION'].get('auth');
	// var sessionAuth = req['SESSION'].get('auth');
	 if(!sessionAuth){
		 sessionAuth = {isLog:false, user:"", pass:"",exist:false};
	 }
	res.render('home', {data:sessionAuth});
}