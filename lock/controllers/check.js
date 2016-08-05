/*
 * 获取保险产品列表及产生保单
 * 2016.7.29
 * vino
 */
(function(){
var moment      = require('moment');
var insure      = require('./insure.js');
var policy      = require('./policy.js');

var ErrorInfo   = require('../../conf/ErrorInfo.js');
var config      = require('../../conf/wukong_config.js');

var logInfo = config.logs.logInfo;

//前端投保数据接收接口
var addPolicy = function(msg, callback) {
    var userPhone = msg.userPhone;
    var mobile_reg = /^((13[0-9])|((17[0-9]))|(14[5|7])|(15([0-3]|[5-9]))|(18[0,2,3,5-9]))\d{8}$/;
    if(!mobile_reg.test(userPhone)) {
        return callback(ErrorInfo.MOBILE_INVALID);
    }

    var insurance_type = msg.productNo;
    if(msg.productNo != 0) {
        insurance_type = 1;
    }
    msg.productNo = config.wukong.productNo[msg.productNo];

    var op = {lock_uuid:msg.lockUuid};
    policy.findPolicyInfo(op, function(docs){
        if(docs.length){
            return callback(ErrorInfo.SYSTEM_ERROR);
        }else{
            insure.lockInsure(msg, function(err, docs){
                if(err == ErrorInfo.SUCCESS) {
                    var policyContent = docs.bizContent.policyContent[0];
                    var fields = {
                        product_no      :   docs.bizContent.productNo,
                        insurance_code  :   policyContent.insuranceCode,
                        policy_no       :   policyContent.policyNo,
                        channel_order_no:   docs.bizContent.channelOrderNo,
                        lock_uuid       :   msg.lockUuid,
                        order_service_start_time   :    moment().format("YYYYMMDDHHmmss"),
                        policy_holder   :   msg.userid,
                        user_name       :   policyContent.userName,
                        user_phone      :   msg.userPhone,
                        user_id_type    :   msg.userIDType,
                        user_id_info    :   msg.userIDInfo,
                        address         :   msg.address,
                        insurance_type  :   insurance_type,
                        premium         :   policyContent.premium,
                        sum_insured     :   policyContent.sumInsured,
                        policy_begin_date   :   policyContent.policyBeginDate,
                        policy_end_date     :   policyContent.policyEndDate,
                        policy_status       :   policyContent.policyStatus,
                    };
                    policy.addPolicy(fields, function(err){
                        return callback(err);
                    });
                }else{
                    return callback(docs);
                }

            });
        }
    });
};

//前端保单查询接口
var findPolicy = function(msg, callback) {

  var op = {channelOrderNo : msg.channelOrderNo};
    insure.lockQuery(op, function(docs){
        var policyContent = docs.bizContent.policyContent[0];
        if(policyContent) {
            var policy_info;
            switch (policyContent.policyStatus){
                case 3:
                case 4:
                    policy_info = {channel_order_no:policyContent.channelOrderNo, order_service_start_time:policyContent.orderServiceStartTime, policy_status:policyContent.policyStatus};
                    break;
                default :
                    policy_info = {
                        channel_order_no    :   policyContent.channelOrderNo,
                        policy_no   :   policyContent.policyNo,
                        user_name   :   policyContent.userName,
                        premium     :   policyContent.premium/100,
                        sum_insured :   policyContent.sumInsured/100,
                        policy_begin_date   :   policyContent.policyBeginDate,
                        policy_end_date     :   policyContent.policyEndDate,
                        policy_status       :   policyContent.policyStatus,
                    };
                    break;
            }
            callback(policy_info);

            var query = {
                channel_order_no:policyContent.channelOrderNo
            };

            var tmp_rcd = {policy_status:policyContent.policyStatus};
            var update = {
                $set : tmp_rcd,
            };
            policy.updatePolicyStatus(query, update, function(err){
                logInfo.info(err);
            });
        }else{
            callback(ErrorInfo.SYSTEM_ERROR);
        }
    })
};

module.exports.addPolicy    = addPolicy;
module.exports.findPolicy   = findPolicy;
}());


