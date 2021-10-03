/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const WriteList = ['VehicleAPI', 'org1admin'];
const ReadList = ['RegistryPortal', 'PolicePortal', 'VehicleAPI', 'org1admin'];

/**
 * Contract used to manage creation and retrieval of Vehicle assets on the blockchain.
 */
class VehicleContract extends Contract {

    async InitLedger(ctx) {
        console.info('VehicleContract initialised.');
    }

    // AddVehicle adds a new vehicle to the distributed ledger.
    async AddVehicle(ctx, vin, make, model, model_year, body_style) {

        // Check if caller has permission to call function. 
        // Unit tests will not have ctx.clientIdentity populated hence need to check if undefined.
        if (ctx.clientIdentity) {
            let clientID = ctx.clientIdentity.attrs['hf.EnrollmentID']
            if (!WriteList.includes(clientID)) {
                throw new Error('PermissionDenied: Client does not have permission to call AddVehicle.');
            }
        }

        // If any of the args are empty string, then throw error
        for (let i = 1; i < arguments.length; i++) {
            if (arguments[i] === "") {
                throw new Error('InvalidInput: Missing or invalid arguments.');
            }
        }

        // If the vehicle already exists, then throw error
        if (await this.VehicleExists(ctx, vin)) {
            throw new Error('DuplicateVehicle: Vehicle already exists.');
        }

        const vehicle = {
            vin: vin,
            make: make,
            model: model,
            model_year: model_year,
            body_style: body_style
        };

        let vehicleBuffer = Buffer.from(JSON.stringify(vehicle));

        // store the vehicle on the blockchain
        await ctx.stub.putState(vin, vehicleBuffer);
        return JSON.stringify(vehicle);
    }

    // Returns true when Vehicle exists in the distribited ledger, false otherwise.
    async VehicleExists(ctx, vin) {
        
        const VehicleObj = await ctx.stub.getState(vin);
        if (VehicleObj && VehicleObj.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Returns the Vehicle for the provided VIN.
    async GetVehicle(ctx, vin) {

        // Check if caller has permission to call function. 
        // Unit tests will not have ctx.clientIdentity populated hence need to check if undefined.
        if (ctx.clientIdentity) {
            let clientID = ctx.clientIdentity.attrs['hf.EnrollmentID']
            if (!ReadList.includes(clientID)) {
                throw new Error('PermissionDenied: Client does not have permission to call GetVehicle.');
            }
        }

        const vehicleJSON = await ctx.stub.getState(vin);
        if (!vehicleJSON || vehicleJSON.length === 0) {
            throw new Error(`VehicleNotFound: Vehicle with VIN: ${vin} not found.`);
        }
        return vehicleJSON.toString();
    }

    // GetAllVehicles returns all vehicles found in the distributed ledger.
    // Note: this function was derived from the Hyperfabric Samples: "asset-transfer-basic/chaincode-javascript/lib/assetTransfer.js"
    async GetAllVehicles(ctx) {

        // Check if caller has permission to call function. 
        // Unit tests will not have ctx.clientIdentity populated hence need to check if undefined.
        if (ctx.clientIdentity) {
            let clientID = ctx.clientIdentity.attrs['hf.EnrollmentID']
            if (!ReadList.includes(clientID)) {
                throw new Error('PermissionDenied: Client does not have permission to call GetAllVehicles.');
            }
        }

        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = VehicleContract;