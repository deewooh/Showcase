'use strict';

const { addVehicle, getAllVehicles } = require('./VehicleOracle.js');
const { respondWithCode } = require('../utils/writer')

/**
 * Used to add a Vehicle to the CarChain.
 *
 * returns newly added Vehicle
 **/
async function addVehicleService(body) {

  let result;
  try {
    result = await addVehicle(body);
  } catch (err) {
    if (err.message.includes('PermissionDenied')) {
      // return forbidden status code if PermissionDenied
      throw respondWithCode(403, { msg: err.message });
    } else if (err.message.includes('DuplicateVehicle')) {
      // return bad request status if DuplicateVehicle
      throw respondWithCode(400, { msg: err.message });
    } else if (err.message.includes('InvalidInput')) {
      // return bad request status if InvalidInput
      throw respondWithCode(400, { msg: err.message });
    } else {
      // throw 500 status code for any other errors
      throw respondWithCode(500, { msg: 'Internal server error. Service is temporarily unavailable.' });
    }
  }
  // if all OK, return the data, will return 200 status code
  return JSON.parse(result);
}


/**
 * Used to retrieve all Vehicles on CarChain.
 *
 * returns VehicleList
 **/
async function getVehiclesService(body) {

  let result;
  try {
    result = await getAllVehicles();
  } catch (err) {
    if (err.message.includes('PermissionDenied')) {
      // return forbidden status code if PermissionDenied
      throw respondWithCode(403, { msg: err.message });
    } else {
      // throw 500 status code for any other errors
      throw respondWithCode(500, { msg: 'Internal server error. Service is temporarily unavailable.' });
    }
  }
  // if all OK, return the data, will return 200 status code
  return JSON.parse(result);
}

module.exports.addVehicleService = addVehicleService;
module.exports.getVehiclesService = getVehiclesService;