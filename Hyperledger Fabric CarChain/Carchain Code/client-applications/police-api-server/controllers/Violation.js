'use strict';

var utils = require('../utils/writer.js');
var Violation = require('../service/ViolationService');

module.exports.addViolation = function addViolation (req, res, next) {
  var body = req.swagger.params['body'].value;
  Violation.addViolation(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.disputeFine = function disputeFine (req, res, next) {
  var violationId = req.swagger.params['violationId'].value;
  Violation.disputeFine(violationId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAllViolations = function getAllViolations (req, res, next) {
  Violation.getAllViolations()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getViolationByViolationId = function getViolationByViolationId (req, res, next) {
  var violationId = req.swagger.params['violationId'].value;
  Violation.getViolationByViolationId(violationId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      console.log(`in controller: ${JSON.stringify(response)}`);
      utils.writeJson(res, response);
    });
};

module.exports.getViolationsByRegoId = function getViolationsByRegoId (req, res, next) {
  var regoId = req.swagger.params['regoId'].value;
  Violation.getViolationsByRegoId(regoId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.payFine = function payFine (req, res, next) {
  var violationId = req.swagger.params['violationId'].value;
  Violation.payFine(violationId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
