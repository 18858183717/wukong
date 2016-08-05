
(function() {
    "use strict";
    var util            = require('util');
    var mongodb         = require('../utils/mongo_db.js');
    var ErrorInfo       = require('../conf/ErrorInfo.js');
    var config          = require('../conf/wukong_config.js');

    var logInfo = config.logs.logInfo;

    var product_schema = new mongodb.mongoose.Schema({
        product_no      : {type : String, index : true, unique : true},
        price           : {type : Number},
        dis_price       : {type : Number},
        info            : {type : String},
    });

    var product_model = mongodb.mongoose.model('product', product_schema);

    function ProductDAO(){

    }

    ProductDAO.init = function(){

    };

    ProductDAO.findRecord = function(query, callback) {
        product_model
            .find(query)
            .lean()
            .exec(function(err, docs){
                if (err) {
                    logInfo.warn('PolicyDAO.findRecord failed with error ' + err);
                }
                return callback(err, docs);
            });
    }

    ProductDAO.updateProduct = function(msg, callback) {
        var product_no      = msg.product_no;
        var price           = msg.price;
        var dis_price       = msg.dis_price;
        var info            = msg.info;

        var tmp_rcd = {
            product_no      : product_no,
            price           : price,
            dis_price       : dis_price,
            info            : info,
        };

        var query = {
            product_no : product_no,
        };

        var update = {
            $set : tmp_rcd,
        };

        var option = {upsert : true};

        var param_msg = {
            query   : query,
            update  : update,
            option  : option,
        };

        ProductDAO.updateProRecord(param_msg, callback);
    }

    ProductDAO.updateProRecord = function(msg, callback) {
        var query   = msg.query;
        var update  = msg.update;
        var option  = msg.option;

        ProductDAO.updateRecord(query, update, option, function(err, affected, raw){
            if (err) {
                logInfo.warn('[updateProRecord] failed with [err %s]', err.toString());
                return callback(ErrorInfo.SYSTEM_ERROR);
            }
            return callback(ErrorInfo.SUCCESS);
        });
    }

    ProductDAO.updateRecord = function(query, update, option, callback) {
        function cb(err, raw){
            if (err) {
                logInfo.warn('ProductDAO.updateRecord failed with error [err: %s]', err.toString());
            }
            return callback(err, raw.nModified, raw);
        }
        if (option) {
            product_model.update(query, update, option, cb);
        } else {
            product_model.update(query, update, cb);
        }
    }

    ProductDAO.init();
    module.exports = ProductDAO;

}());
