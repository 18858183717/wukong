/*
* 投保接口
* 2016.7.18
* vino
*/
(function(){
var fs      = require('fs');
var moment  = require('moment');
var shortid = require('shortid');

var Rsa         = require('../commons/rsa.js');
var config      = require('../../conf/wukong_config.js');
var ErrorInfo   = require('../../conf/ErrorInfo.js');

var logInfo = config.logs.logInfo;

var key_pub_wk  =   'file/lock/rsa_public_key_wukong.pem';     //悟空保的公钥
//var key_pub_dd  =   'file/lock/rsa_public_key_dd.pem';         //丁盯的公钥
var key_pri_dd  =   'file/lock/rsa_private_key_dd.pem';        //丁盯的私钥
var in_url      =   config.wukong.in_url;
var qu_url      =   config.wukong.qu_url;
var cl_url      =   config.wukong.cl_url;

var product_id  =   '146760376502617405';
var pem_pub = fs.readFileSync(key_pub_wk);
var pem_pri = fs.readFileSync(key_pri_dd);

var lockInsure = function(msg, callback) {
    var biz_content = {                                 //投保参数
            productNo               :   msg.productNo,     //投保的产品ID
            channelOrderNo          :   '01'+shortid.generate(),      //订单号
            orderServiceStartTime   :   moment().format("YYYYMMDDHHmmss"),
            userInfoContent         :   [
                {
                    userKey     :   msg.lockUuid,     //用户唯一标识
                    userName    :   msg.userName,
                    userPhone   :   msg.userPhone,
                    userIDType  :   msg.userIDType,
                    userIDInfo  :   msg.userIDInfo,
                    userType    :   2,                      //用户类型【0：投保人；1：被保人；2：本人投保】
                    role        :   2,
                },
            ]
    };

    var biz_content_en  =   Rsa.rsaEncrypt(pem_pub, biz_content);       //加密

    var data = {        //公共参数
            appKey      :   config.wukong.app_key,
            serviceName :   'ddInsure',
            charset     :   config.wukong.charset,
            signType    :   config.wukong.signType,
            version     :   '1.0.0',
            bizContent  :   biz_content_en,
            timestamp   :   moment().format("YYYYMMDDHHmmss"),
            format      :   config.wukong.format,
    };

    var data_sign = Rsa.rsaSign(pem_pri, data);     //带签名数据
    Rsa.postForm(data_sign, in_url, function(text){    //发送投保请求

        var res_json    = JSON.parse(text);
        if(res_json.msgCode != 'SUCCESS') {
            var msgInfo = res_json.msgInfo;
            return callback(ErrorInfo.SYSTEM_ERROR, msgInfo);
        }

        var result      = Rsa.rsaCheckSign(pem_pub, res_json, res_json.sign);       //验签

        if(result) {
            var res_de_biz = Rsa.rsaDecrypt(pem_pri, res_json.bizContent);
            res_json.bizContent = JSON.parse(res_de_biz);
            callback(ErrorInfo.SUCCESS, res_json);
        }else {
            logInfo.info('[lockInsure]'+ErrorInfo.RSA_CHECK_SIGN_FAILED);
            callback(ErrorInfo.RSA_CHECK_SIGN_FAILED, res_json);
        }

    });

}

var lockQuery = function(msg, callback) {
    var biz_content = {
        channelOrderNo:msg.channelOrderNo,      //丁盯单据标示
        //policyNo:'',
    };

    var biz_content_en = Rsa.rsaEncrypt(pem_pub, biz_content);

    var data = {
            appKey      :   config.wukong.app_key,
            serviceName :   'ddQuery',
            charset     :   config.wukong.charset,
            signType    :   config.wukong.signType,
            version     :   '1.0.0',
            bizContent  :   biz_content_en,
            timestamp   :   moment().format("YYYYMMDDHHmmss"),
            format      :   config.wukong.format,
    };

    var data_sign = Rsa.rsaSign(pem_pri, data);
    Rsa.postForm(data_sign, qu_url, function(text){

        var res_json    = JSON.parse(text);
        var result      = Rsa.rsaCheckSign(pem_pub, res_json, res_json.sign);

        if(result) {
            var res_de_biz = Rsa.rsaDecrypt(pem_pri, res_json.bizContent);
            res_json.bizContent = JSON.parse(res_de_biz);
            callback(res_json);
        }else {
            callback('[lockQuery]'+ErrorInfo.RSA_CHECK_SIGN_FAILED);
        }
    });
}

var lockClaim = function(msg, callback) {
    var biz_content = {
        "channelOrderNo": "dingding12d24liangzai",
    };

    var biz_content_en = Rsa.rsaEncrypt(pem_pub, biz_content);

    var data = {
        appKey      :   config.wukong.app_key,
        serviceName :   'dingding',
        charset     :   config.wukong.charset,
        signType    :   config.wukong.signType,
        version     :   '1.0.0',
        bizContent  :   biz_content_en,
        timestamp   :   moment().format("YYYYMMDDHHmmss"),
        format      :   config.wukong.format,
    };

    var data_sign = Rsa.rsaSign(pem_pri, data);
    Rsa.postForm(data_sign, cl_url, function (text){

        var res_json    = JSON.parse(text);
        var result      = Rsa.rsaCheckSign(pem_pub, res_json, res_json.sign);

        if(result) {
            var res_de_biz = Rsa.rsaDecrypt(pem_pri, res_json.bizContent);
            res_json.bizContent = JSON.parse(res_de_biz);
            callback(res_json);
        }else {
            callback('[lockClaim]'+ErrorInfo.RSA_CHECK_SIGN_FAILED);
        }
    });

}

module.exports.lockInsure   = lockInsure;
module.exports.lockQuery    = lockQuery;
module.exports.lockClaim    = lockClaim;

}());
