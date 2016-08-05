
(function() {
    "use strict";
    var util            = require('util');
    var mongodb         = require('../utils/mongo_db.js');
    var ErrorInfo       = require('../conf/ErrorInfo.js');
    var config          = require('../conf/wukong_config.js');

    var logInfo = config.logs.logInfo;

    var policy_schema = new mongodb.mongoose.Schema({
        product_no          : {type : String},
        insurance_code      : {type : String, unique: true},
        policy_no           : {type : String, unique: true},
        channel_order_no    : {type : String, unique: true},
        lock_uuid           : {type : String, unique: true, index : true},
        order_service_start_time   :  {type : String},
        policy_holder       : {type : String, index : true},
        user_name           : {type : String},
        user_phone          : {type : String},
        user_id_type        : {type : String},
        user_id_info        : {type : String},
        address             : {type : String},
        insurance_type      : {type : String},
        premium             : {type : String},
        sum_insured         : {type : String},
        policy_begin_date   : {type : String},
        policy_end_date     : {type : String},
        policy_status       : {type : String},

    });
    //索引
//    policy_schema.index({lockUuid : 1, policyHolder : 1}, {unique : true});
    var policy_model = mongodb.mongoose.model('policy', policy_schema);

    function PolicyDAO(){

    }

    PolicyDAO.init = function(){

    };

    //查询设备是否已激活
    PolicyDAO.findRecord = function(query, fields, callback) {
        callback = callback || fields;

        if(typeof fields != "object"){
            fields = {};
        }

        policy_model
            .find(query)
            .select(fields)
            .lean()
            .exec(function(err, docs){
                if (err) {
                    logInfo.warn('PolicyDAO.findRecord failed with error ' + err);
                }
                return callback(err, docs);
            });
    };

    PolicyDAO.updatePolicy = function(msg, callback) {

        var tmp_rcd = {
            product_no       : msg.product_no,
            insurance_code   : msg.insurance_code,
            policy_no        : msg.policy_no,
            channel_order_no : msg.channel_order_no,
            lock_uuid        : msg.lock_uuid,
            order_service_start_time   : msg.order_service_start_time,
            policy_holder    : msg.policy_holder,
            user_name        : msg.user_name,
            user_phone       : msg.user_phone,
            user_id_type     : msg.user_id_type,
            user_id_info     : msg.user_id_info,
            address          : msg.address,
            insurance_type   : msg.insurance_type,
            premium          : msg.premium,
            sum_insured      : msg.sum_insured,
            policy_begin_date : msg.policy_begin_date,
            policy_end_date   : msg.policy_end_date,
            policy_status     : msg.policy_status,
        };

        var query = {
            lock_uuid : msg.lock_uuid,
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

        PolicyDAO.updateProRecord(param_msg, callback);
    };

    PolicyDAO.updateProRecord = function(msg, callback) {
        var query   = msg.query;
        var update  = msg.update;
        var option  = msg.option;

        PolicyDAO.updateRecord(query, update, option, function(err, affected, raw){
            if (err) {
                logInfo.warn('[updateProRecord] failed with [err %s]', err.toString());
                return callback(ErrorInfo.MONGODB_ERROR);
            }
            return callback(ErrorInfo.SUCCESS);
        });
    };

    PolicyDAO.updateRecord = function(query, update, option, callback) {
        function cb(err, raw){
            if (err) {
                logInfo.warn('PolicyDAO.updateRecord failed with error [err: %s]', err.toString());
            }
            return callback(err, raw.nModified, raw);
        }
        if (option) {
            policy_model.update(query, update, option, cb);
        } else {
            policy_model.update(query, update, cb);
        }
    };

    PolicyDAO.init();
    module.exports = PolicyDAO;

}());
