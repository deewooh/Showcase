/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const vehicleChainCode = require('./lib/vehicle');

module.exports.VehicleContract = vehicleChainCode;
module.exports.contracts = [vehicleChainCode];