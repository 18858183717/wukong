/*
 * 获取保险产品列表及产生保单
 * 2016.7.29
 * vino
 */
(function(){
var policyDao   = require('../../models/policy.js');
var ErrorInfo   = require('../../conf/ErrorInfo.js');
var config      = require('../../conf/wukong_config.js');

var logInfo = config.logs.logInfo;

//前端访问接口，获取用户设备（门锁）列表
var policyList = function(msg, callback) {
    var userid = msg.userid;
    var user_devices = {userid:userid,lock_uuid:['0cc53f7116517438cc91023fe5db0d38','21acc1e712defc51fb686d4ab800292c','6db1d788aa24e1bc14e954fa2e92876e']};
    findPolicy(user_devices, function(err, docs){
        callback(docs);
    })
};

var addPolicy = function(msg, callback) {
    policyDao.updatePolicy(msg, function(err){
        callback(err.toString());
        logInfo.warn('err%s',err.toString());
    });
};

//更新保单状态
var updatePolicyStatus = function(query, update, callback) {

    var option = {upsert : true};

    var param_msg = {
        query   : query,
        update  : update,
        option  : option,
    };

    policyDao.updateProRecord(param_msg, function(err){
        callback(err);
    });
};

var findPolicy = function(msg, callback) {

    //获取未激活保单
    var policys=[];
    var lock_uuid_a = msg.lock_uuid;
    var lg = lock_uuid_a.length;
    var i = 0;
    resv(i);

    function resv(i){
        var lock_uuid = lock_uuid_a[i];
        var op = {lock_uuid:lock_uuid};
        policyDao.findRecord(op, function(err, docs){       //根据lock_uuid于policy表查询保单
            if(err){
                logInfo.warn('[findPolicy] by lock_uuid');
                callback(ErrorInfo.MONGODB_ERROR, policys);
                return;
            }
            if(docs.length == 0) {      //未激活的设备
                var policy = {
                    lock_uuid       : lock_uuid,
                    address         : '',
                    policy_status   : 0,
                };
                policys.push(policy);
            }

            if(i < lg-1){
                resv(++i);
            }else{
                //获取用户保单，并合并未激活
                var policy_list = [];
                var policy_holder = msg.userid;
                var option = {
                    query   : {policy_holder:policy_holder},
                    fields  : {lock_uuid:1,address:1,policy_status:1,_id:0,policy_holder:1,channel_order_no:1}
                };
                policyDao.findRecord(option.query, option.fields, function(err, docs){
                    if(err){
                        logInfo.warn('[findPolicy] by userid');
                        callback(ErrorInfo.MONGODB_ERROR, policys);
                        return;
                    }else{console.log(docs);
                        policy_list = policys.concat(docs);
                        for(var p in policy_list){
                            policy_list[p].policy_status = config.policy_status[policy_list[p].policy_status];
                        }
                        callback(ErrorInfo.SUCCESS, policy_list);
                    }
                });

            }

        });
    }


};

var findPolicyInfo = function(msg, callback) {

    var lock_uuid = msg.lock_uuid;
    var op = {lock_uuid:lock_uuid};
    policyDao.findRecord(op, function(err, docs){
        if(err){
            logInfo.warn('err:%s',err.toString());
            callback(err.toString());
        }else{
            callback(docs);
        }
    });
}

module.exports.addPolicy    = addPolicy;
module.exports.findPolicy   = findPolicy;
module.exports.findPolicyInfo = findPolicyInfo;
module.exports.policyList   = policyList;
module.exports.updatePolicyStatus = updatePolicyStatus;
}());


