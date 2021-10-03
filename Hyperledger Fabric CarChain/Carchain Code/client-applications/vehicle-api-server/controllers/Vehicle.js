'use strict';
/** GENERATED-CODE by swagger-tools */
var utils = require('../utils/writer.js');
var Vehicle = require('../service/VehicleService');

module.exports.addVehicle = function addVehicle (req, res, next) {
  var body = req.swagger.params['body'].value;
  Vehicle.addVehicleService(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getVehicles = function getVehicles (req, res, next) {
  Vehicle.getVehiclesService()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
