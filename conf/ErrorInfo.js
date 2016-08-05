var ErrorInfo = {
    SUCCESS_ZERO					: '0'     ,
    SUCCESS							: '1000'  ,
    SYSTEM_ERROR					: '2001'	,
    MONGODB_ERROR                   : '2002'  ,   //数据库级别错误

    RSA_CHECK_SIGN_FAILED           : '3001',     //验签不成功

    MOBILE_INVALID                  : '4001',     //手机号不合法
}

module.exports = ErrorInfo;