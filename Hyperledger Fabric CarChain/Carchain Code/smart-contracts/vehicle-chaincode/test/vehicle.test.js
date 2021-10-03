/*
 * SPDX-License-Identifier: Apache-2.0
*/

'use strict';
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const { Context } = require('fabric-contract-api');
const { ChaincodeStub } = require('fabric-shim');

const VehicleContract = require('../lib/vehicle.js');

let assert = sinon.assert;
chai.use(sinonChai);

describe('Vehicle Contract Tests', () => {
    let transactionContext, chaincodeStub, vehicle, vehicle1;
    beforeEach(() => {
        transactionContext = new Context();

        chaincodeStub = sinon.createStubInstance(ChaincodeStub);
        transactionContext.setChaincodeStub(chaincodeStub);

        chaincodeStub.putState.callsFake((key, value) => {
            if (!chaincodeStub.states) {
                chaincodeStub.states = {};
            }
            chaincodeStub.states[key] = value;
        });

        chaincodeStub.getState.callsFake(async (key) => {
            let ret;
            if (chaincodeStub.states) {
                ret = chaincodeStub.states[key];
            }
            return Promise.resolve(ret);
        });

        chaincodeStub.deleteState.callsFake(async (key) => {
            if (chaincodeStub.states) {
                delete chaincodeStub.states[key];
            }
            return Promise.resolve(key);
        });

        chaincodeStub.getStateByRange.callsFake(async () => {
            function* internalGetStateByRange() {
                if (chaincodeStub.states) {
                    // Shallow copy
                    const copied = Object.assign({}, chaincodeStub.states);

                    for (let key in copied) {
                        yield {value: copied[key]};
                    }
                }
            }

            return Promise.resolve(internalGetStateByRange());
        });

        vehicle = {
            vin: '1G6CD6988G4334344',
            make: 'Honda', 
            model: 'Civic Touring', 
            model_year: 2021, 
            body_style: 'Sedan'
        };

        vehicle1 = {
            vin: '1G6CD6988G4334344',
            make: 'Tesla', 
            model: 'Series 3', 
            model_year: 2021, 
            body_style: 'Sedan'
        };
    });

    describe('Test InitLedger', () => {
        it('should return success on InitLedger', async () => {
            let vehicleContract = new VehicleContract();
            try {
                await vehicleContract.InitLedger(transactionContext);
            } catch(err) {
                assert.fail('InitLedger should succeed')
            }
        });
    });

    describe('Test AddVehicle', () => {
        it('should return error on AddVehicle (error inserting key)', async () => {
            chaincodeStub.putState.rejects('failed inserting key');

            let vehicleContract = new VehicleContract();
            try {
                await vehicleContract.AddVehicle(transactionContext, vehicle.vin, vehicle.make, vehicle.model, vehicle.model_year, vehicle.body_style);
                assert.fail('AddVehicle should have failed');
            } catch(err) {
                expect(err.name).to.equal('failed inserting key');
            }
        });

        it('should return success on AddVehicle', async () => {
            let vehicleContract = new VehicleContract();

            await vehicleContract.AddVehicle(transactionContext, vehicle.vin, vehicle.make, vehicle.model, vehicle.model_year, vehicle.body_style);

            let ret = JSON.parse((await chaincodeStub.getState("1G6CD6988G4334344")).toString());
            expect(ret).to.eql(vehicle);
        });

        it('should return Error on AddVehicle (duplicate vehicle)', async () => {
            let vehicleContract = new VehicleContract();

            try {
                await vehicleContract.AddVehicle(transactionContext, vehicle1.vin, vehicle1.make, vehicle1.model, vehicle1.model_year, vehicle1.body_style);
                await vehicleContract.AddVehicle(transactionContext, vehicle1.vin, vehicle1.make, vehicle1.model, vehicle1.model_year, vehicle1.body_style);
            } catch (err) {
                expect(err.message).to.equal('DuplicateVehicle: Vehicle already exists.');
            }
        });

        it('should return Error on AddVehicle (invalid args)', async () => {
            let vehicleContract = new VehicleContract();

            try {
                await vehicleContract.AddVehicle(transactionContext, '', vehicle1.make, vehicle1.model, vehicle1.model_year, vehicle1.body_style);
            } catch (err) {
                expect(err.message).to.equal('InvalidInput: Missing or invalid arguments.');
            }
        });

    });

    describe('Test VehicleExists', () => {

        it('should return true on VehicleExists', async () => {
            let vehicleContract = new VehicleContract();

            await vehicleContract.AddVehicle(transactionContext, vehicle.vin, vehicle.make, vehicle.model, vehicle.model_year, vehicle.body_style);

            let ret = await vehicleContract.VehicleExists(transactionContext, vehicle.vin);
            expect(ret).to.eql(true);
        });

        it('should return false on VehicleExists', async () => {
            let vehicleContract = new VehicleContract();
            let ret = await vehicleContract.VehicleExists(transactionContext, "ABCDEF");
            expect(ret).to.eql(false);
        });

    });    
    
    describe('Test GetAllVehicles', () => {
        it('should return success on GetAllVehicles', async () => {
            let vehicleContract = new VehicleContract();

            await vehicleContract.AddVehicle(transactionContext, 'VIN1', 'Make1', 'Model1', 2021, 'Body1');
            await vehicleContract.AddVehicle(transactionContext, 'VIN2', 'Make2', 'Model2', 2021, 'Body2');
            await vehicleContract.AddVehicle(transactionContext, 'VIN3', 'Make3', 'Model3', 2021, 'Body3');
            await vehicleContract.AddVehicle(transactionContext, 'VIN4', 'Make4', 'Model4', 2021, 'Body4');

            let ret = await vehicleContract.GetAllVehicles(transactionContext);
            ret = JSON.parse(ret);
            expect(ret.length).to.equal(4);

            let expected = [
                {Record: {vin: 'VIN1', make: 'Make1', model: 'Model1', model_year: 2021, body_style: 'Body1'}},
                {Record: {vin: 'VIN2', make: 'Make2', model: 'Model2', model_year: 2021, body_style: 'Body2'}},
                {Record: {vin: 'VIN3', make: 'Make3', model: 'Model3', model_year: 2021, body_style: 'Body3'}},
                {Record: {vin: 'VIN4', make: 'Make4', model: 'Model4', model_year: 2021, body_style: 'Body4'}}
            ];

            expect(ret).to.eql(expected);
        });
    });

    describe('Test GetVehicle', () => {
        it('should return success on GetVehicle', async () => {
            let vehicleContract = new VehicleContract();

            await vehicleContract.AddVehicle(transactionContext, 'VIN1', 'Make1', 'Model1', 2021, 'Body1');

            let ret = await vehicleContract.GetVehicle(transactionContext, 'VIN1');
            ret = JSON.parse(ret);

            let expected = {vin: 'VIN1', make: 'Make1', model: 'Model1', model_year: 2021, body_style: 'Body1'};

            expect(ret).to.eql(expected);
        });

        it('should return error on GetVehicle', async () => {
            let vehicleContract = new VehicleContract();

            try {
                let ret = await vehicleContract.GetVehicle(transactionContext, 'VIN1');
                assert.fail('Should return error.');
            } catch (err) {
                expect(err.message).to.equal('VehicleNotFound: Vehicle with VIN: VIN1 not found.');
            }
        });
    });

});
