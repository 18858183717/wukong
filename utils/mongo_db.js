var config 	    = require('../conf/wukong_config.js');
var mongoose 	= require('mongoose');

var options = {
    db: { native_parser: true },
    server: { poolSize: 5 ,auto_reconnect: true},
    //replset: { rs_name: config.mongo.rs_name },
    user: config.mongo_wk.name,
    pass: config.mongo_wk.pass,
}
options.server.socketOptions /*= options.replset.socketOptions*/ = { keepAlive: 1 };

var uri = config.mongo_wk.uri;

mongoose.connect(uri, options);

mongoose.connection.on('connected', function (err) {
    if (err) {
        console.log(err);
    }

});

// Error handler
mongoose.connection.on('error', function (err) {
    if (err) {
        console.log(err);
    }
});


module.exports.mongoose = mongoose;
