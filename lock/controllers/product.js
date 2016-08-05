/*
 * 获取保险产品列表
 * 2016.7.29
 * vino
 */
(function(){
var productDao = require('../../models/product.js');
var config     = require('../../conf/wukong_config.js');

var logInfo = config.logs.logInfo;

var addProduct = function(msg, callback){
    productDao.updateProduct(msg, function(err){
        callback(err.toString());
        logInfo.warn('err%s',err.toString());
    });
}

module.exports.addProduct = addProduct;
}());


