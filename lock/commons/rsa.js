var crypto      =   require('crypto');
var constants   =   require('constants');
var superagent  =   require('superagent');
var config      =   require('../../conf/wukong_config.js');

var logInfo     =   config.logs.logInfo;

/**
 * 公钥加密
 * @param $key  buffer  公钥
 * @param $data obj     待加密数据
 * return       string base64   加密结果
 */
function rsaEncrypt(key, data) {
    var pubKey = key.toString('ascii');

    var offSet = 0;
    var i = 0;
    var maxEncryptBlock = config.crypt.maxEncrypt;

    var data_s = JSON.stringify(data);
    var inputLen = data_s.length;

    var buf_a = [];
    var buf_l = 0;
    var en = '';

    // 对数据分段加密
    while (inputLen - offSet > 0) {
        var data_buf = new Buffer(data_s.substr(offSet, maxEncryptBlock));
        var cache;

        cache = crypto.publicEncrypt({key:pubKey,padding:constants.RSA_PKCS1_PADDING}, data_buf);       //此处的padding设置可谓一波三折。key为String类型时，padding默认为RSA_PKCS1_OAEP_PADDING，应设置为constants.RSA_PKCS1_PADDING才可与其它接口对接。此前参考网上代码，使用crypto.RSA_PKCS1_PADDING，导致失败，调试很久才发现问题。
        buf_a.push(cache);
        buf_l += cache.length;

        i++;
        offSet = i * maxEncryptBlock;
    }

    en = Buffer.concat(buf_a, buf_l).toString('base64');
    return en;
  }

/**
 * 私钥解密
 * @param $key  buffer  公钥
 * @param $data string base64     待解密数据
 * return       string  解密结果
 */
function rsaDecrypt(key, data) {
    var priKey = key.toString('ascii');

    var maxDecryptBlock = config.crypt.maxDecrypt;
    var data_buf = new Buffer(data, 'base64');
    var num = Math.ceil(data_buf.length/maxDecryptBlock);

    var data_part = '';
    var decrypted = '';
    for (var i = 0; i < num; i++) {

        data_part 	= 	data_buf.slice(i * maxDecryptBlock, (i+1) * maxDecryptBlock);       //slice方法第二个参数指终止位置，但输出不包括这个位置。A big trap,waste a lot of time.
        var de 		= 	'';
        de          =   crypto.privateDecrypt({key:priKey,padding:constants.RSA_PKCS1_PADDING},data_part);
        decrypted 	+= 	de;
    }
    if(decrypted == '' || decrypted == null) {
        logInfo.info('[rsaDecrypt] decrypted is null');
    }

    return decrypted;
}

/**
 * 私钥加签
 * @param $key  buffer  私钥
 * @param $data obj     待签名数据
 * return       string  带有签名字段的数据
 */
function rsaSign(key, data) {

    var priKey = key.toString('ascii');
    var data_sign = _handleSignData(data);
    var signer = crypto.createSign('RSA-SHA1');
    signer.update(data_sign);
    var sign = signer.sign(priKey, 'base64');
    var data_signed = data_sign+'&sign='+sign;
    return data_signed.replace(/\+/g,'%2B');
}

/**
 * 公钥验签
 * @param $key  buffer  私钥
 * @param $data json    待验证数据
 * @param $sign string  base64    签名
 * return       bool
 */
function rsaCheckSign(key, data, sign) {

    if(data.hasOwnProperty('sign')) {
        delete data.sign;
    }else {
        logInfo.info('[rsaCheckSign] the key is not own property');
    }

    var pubKey = key.toString('ascii');
    var data_sign = _handleSignData(data);

    var verify = crypto.createVerify('RSA-SHA1');
    verify.update(data_sign,'utf8');                        //此方法的第二个参数，API中并没有显示给出，又是一个big trap
    var result = verify.verify(pubKey, sign, 'base64');
    if(!result) {
        logInfo.info('[rsaCheckSign] check sign error');
    }
    return result;
}

/**
 * 格式化待加签数据
 * @param $data obj     待格式化数据
 * return       string  格式化结果
 */
function _handleSignData(data) {

    var arr = [];
    for(var p in data) {
        arr.push(p);
    }
    arr.sort();

    var str = '';
    for(var q in arr){
        str += arr[q]+'='+data[arr[q]]+'&';
    }

    return str.substring(0,str.length-1);
}

/**
 * post form
 * @param $data obj     待格式化数据
 * return       string  格式化结果
 */
function postForm(data, url, callback) {

    superagent
        .post(url)
        .type('form')
        .send(data)
        .end(function(err, res){
            if(res.error) {
                logInfo.info('[postForm] error');
            }
            else if(res.ok) {
                callback(res.text);
            }else {
                callback(res.text);
            }
    });
}

module.exports.rsaEncrypt   = rsaEncrypt;
module.exports.rsaDecrypt   = rsaDecrypt;
module.exports.rsaSign      = rsaSign;
module.exports.rsaCheckSign = rsaCheckSign;
module.exports.postForm     = postForm;
