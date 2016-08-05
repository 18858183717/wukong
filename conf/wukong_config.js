//var productNo = ['147029810079127423'];
var productNo = ['147029961674868493'];
var wukong = {
    //url         :   'http://wukong.com/',       //本地
    in_url : 'http://test.openapi.wkbins.com/openapi/commonMp/insureInterface',     //悟空保投保接口
    qu_url : 'http://test.openapi.wkbins.com/openapi/commonMp/policyQuery',         //悟空保查询保单接口
    cl_url : 'http://test.openapi.wkbins.com/openapi/commonMp/settleClaimQuery',

    //app_key     :   '146760323872501112',       //悟空保平台分配的唯一商户识别码
    app_key     :   '147029948870683963',
    charset     :   'UTF-8',
    signType    :   'RSA',
    format      :   'JSON',
    productNo   :   productNo,
};

var crypt = {
    maxEncrypt : 39,        //取117/3（中文转buf）（不采用待加密数据全部转buffer再分段加密的原因在于，假如刚好一个中文字符被截断，解密后会造成乱码，选此为折中方案）
    maxDecrypt : 128,
}

//日志管理器
var log4js  = require('log4js');
log4js.configure("./log4js.json");

var logs = {
    logInfo     :   log4js.getLogger('logInfo'),
};

//数据库
var local_mongo = {
    name : 'zcw',
    pass : 'zcw0227',
    uri  : 'mongodb://127.0.0.1:27017/insurance',
    rs_name : 'dingding-wukong',
};

//家庭保障内容
var insurance_contents = {
    basic   :   [
        {name:'房屋主体及附属设备',sumInsured:'100000'},
        {name:'盗抢造成的家庭财产损失（不含现金及电子设备）',sumInsured:'20000'},
    ],
    primary :   [
        {name:'室内装潢',sumInsured:'10000'},
        {name:'家具及其他生活用品',sumInsured:'10000'},
        {name:'家用电器和文化娱乐用品',sumInsured:'10000'},
        {name:'附加管道破裂及水渍保险',sumInsured:'10000'},
        {name:'盗抢造成现金、首饰损失',sumInsured:'10000'},
        {name:'盗抢造成电脑（含便携式）、摄像机、照相机、手机损失',sumInsured:'10000'},
    ],
    primary_premium :   {market_price:'75',preferential_price:'66'}
};

//证件类型
var user_id_type = ['占位','身份证','护照','军官证','港台通报','户口簿','士兵证','驾驶执照','返乡证','组织机构代码','港澳通行证','台湾通行证','其他'];
//保单状态
var policy_status = ['可免费激活','核保－提交资料','撤单','核保－核保中','核保－核保失败','核保－核保成功','承保－承保成功未生效','生效','理赔－申请理赔','理赔－核赔中','理赔－拒赔','理赔－同意理赔','理赔－待支付理赔金','终止－理赔终止','终止－过期终止','终止－违约终止','终止－投保人解除终止','终止－其他终止','失效'];

var config = {
    wukong  :   wukong,
    crypt   :   crypt,
    logs    :   logs,
    mongo_wk:   local_mongo,
    insurance_contents  :   insurance_contents,
    user_id_type    :   user_id_type,
    policy_status   :   policy_status,
};

module.exports = config;
