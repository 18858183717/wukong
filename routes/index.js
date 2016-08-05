var express = require('express');
var app = express.Router();
var Insure    = require('../lock/controllers/insure.js');
var Policy    = require('../lock/controllers/policy.js');
var Check     = require('../lock/controllers/check.js');

/* GET home page. */
app.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* 投保接口 */
app.post('/insure',function(req, res) {
  Insure.lockInsure(req.body, function(a, b) {
    res.send(b);
  });
});

/* 查询保单接口 */
app.post('/query',function(req, res) {
  Insure.lockQuery(req.body, function(a) {
    res.send(a);
  });
});

/* 理赔接口 */
app.post('/claim',function(req, res) {
  Insure.lockClaim(req.body, function(a) {
    res.send(a);
  });
});


/* 产生保单 */
app.post('/addpolicy',function(req, res) {
  Policy.addPolicy(req.body, function(a) {
    res.send(a);
  });
});

/* 前端调用接口 获取保单列表 */
app.post('/policy_list',function(req, res) {
  Policy.policyList(req.body, function(a) {
    res.send(a);
  });
});

/* 前端调用接口 投保 */
app.post('/add_policy',function(req, res) {
  Check.addPolicy(req.body, function(a) {
    var msg = {msg:a};
    res.send(msg);
  });
});

/* 前端调用接口 查询保单 */
app.post('/find_policy',function(req, res) {
  Check.findPolicy(req.body, function(a) {
    res.send(a);
  });
});

/* 查询保单详情 */
app.post('/findpolicyinfo',function(req, res) {
  Policy.findPolicyInfo(req.body, function(a) {
    res.send(a);
  });
});

module.exports = app;
