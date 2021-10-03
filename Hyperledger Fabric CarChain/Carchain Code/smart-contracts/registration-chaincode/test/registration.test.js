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

const RegistrationContract = require('../lib/registration'); //adjustable

let assert = sinon.assert;
chai.use(sinonChai);

describe('Registration Contract Tests', () => {
    let transactionContext, chaincodeStub;
    let newRego, newRego1, newRego2, newRego3, rego1, rego2;
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


        // A ticket that the police would write up
        newRego = {
            licensePlate: 'ZLD519',
            vin: '4Y1SL65848Z411439',
            person: '0452642686',
            auState: 'NSW'
        };
        
        newRego1 = {
            licensePlate: 'W',
            vin: '4Y1ZR65848Z411439',
            person: '0421862612',
            auState: 'VIC'
        };

        newRego2 = {
            licensePlate: 'AUN203',
            vin: '4Y1SL65674Z411439',
            person: '0452642686',
            auState: 'QLD'
        };

        newRego3 = {
            licensePlate: 'ZLD519',
            vin: '4Y1SL65848Z411439',
            person: '0452642686',
            auState: 'VIC'
        };

        rego1 = {
            registrationID: 'NSW-ZLD519',
            vin: '4Y1SL65848Z411439',
            person: '0452642686',
            registrationDate: '',
            expirationDate: '',
            status: 'Pending',
            comment: ''
        };

        rego2 = {
            registrationID: 'NSW-DQL123',
            vin: '4Y1SL65158Z411439',
            person: '0451461904',
            registrationDate: '2021-01-01',
            expirationDate: '2021-12-31',
            status: 'Approved',
            comment: ''
        };
        
    });

    // Begin unit tests


    describe('Test InitLedger', () => {
        it('should return success on InitLedger', async () => {
            let registrationContract = new RegistrationContract();
            try {
                await registrationContract.InitLedger(transactionContext);
            } catch(err) {
                assert.fail('InitLedger should succeed')
            }
        });
    });

    describe('Test query single registration', () => {
        it('should return true on regoExists', async () => {
            let registrationContract = new RegistrationContract();

            await registrationContract.startRegistration(transactionContext, newRego.vin, 
                newRego.auState, newRego.person, newRego.licensePlate);

            let ret = await registrationContract.GetRegistration(transactionContext, rego1['registrationID']);
            expect(ret).to.eql(JSON.stringify(rego1));
        });

    });


    // tartRegistration(ctx, vin, ausState, personID, licensePlate)
    describe('Test Add Rego', () => {

        it('should return success on AddVehicle', async () => {
            let registrationContract = new RegistrationContract();

            await registrationContract.startRegistration(transactionContext, newRego.vin, 
                newRego.auState, newRego.person, newRego.licensePlate);

            let ret = JSON.parse((await chaincodeStub.getState(newRego.auState + '-' + newRego.licensePlate)).toString());
            expect(ret).to.eql(rego1);
        });

        it('should return error on AddVehicle', async () => {
            let registrationContract = new RegistrationContract();

            try {
                await registrationContract.startRegistration(transactionContext, newRego.vin, 
                    newRego.auState, newRego.person, newRego.licensePlate);

                await registrationContract.startRegistration(transactionContext, newRego.vin, 
                    newRego.auState, newRego.person, newRego.licensePlate);

                assert.fail('Should return error.');
            } catch (err) {
                expect(err.toString()).to.eql("Error: 4Y1SL65848Z411439 has already been registered in NSW");
            }
        });

        it('should return error on AddVehicle, but different error message', async () => {
            let registrationContract = new RegistrationContract();

            try {
                await registrationContract.startRegistration(transactionContext, newRego.vin, 
                    newRego.auState, newRego.person, newRego.licensePlate);

                await registrationContract.startRegistration(transactionContext, newRego3.vin, 
                    newRego3.auState, newRego3.person, newRego3.licensePlate);

                assert.fail('Should return error.');
            } catch (err) {
                expect(err.toString()).to.eql("Error: 4Y1SL65848Z411439 is still pending a registration from another state");
            }
        });

    });

    describe('Test regoExists', () => {

        it('should return true on regoExists', async () => {
            let registrationContract = new RegistrationContract();

            await registrationContract.startRegistration(transactionContext, newRego.vin, 
                newRego.auState, newRego.person, newRego.licensePlate);

            let ret = await registrationContract.regoExists(transactionContext, newRego.licensePlate, newRego.auState);
            expect(ret).to.eql(true);
        });

        it('should return false on regoExists', async () => {
            let registrationContract = new RegistrationContract();
            let ret = await registrationContract.regoExists(transactionContext, rego2.licensePlate, rego2.auState);
            expect(ret).to.eql(false);
        });

    });



    describe('Test approveRego', () => {

        it('should a few diferent functions', async () => {


            let registrationContract = new RegistrationContract();

            await registrationContract.startRegistration(transactionContext, newRego.vin, 
                newRego.auState, newRego.person, newRego.licensePlate);
            await registrationContract.startRegistration(transactionContext, newRego1.vin, 
                newRego1.auState, newRego1.person, newRego1.licensePlate);            
            await registrationContract.startRegistration(transactionContext, newRego2.vin, 
                newRego2.auState, newRego2.person, newRego2.licensePlate);

            console.info('start testing');

            let ret = await registrationContract.queryRegoByProperty(transactionContext, 'person', '0452642686' );
            
            ret = JSON.parse(ret);
            expect(ret[1]['Record']['status']).to.eql('Pending');

            await registrationContract.approveRego(transactionContext, newRego.auState + '-' + newRego.licensePlate, '2020-08-15');
            await registrationContract.approveRego(transactionContext, newRego1.auState + '-' + newRego1.licensePlate, '2020-08-15');
            await registrationContract.approveRego(transactionContext, newRego2.auState + '-' + newRego2.licensePlate, '2020-08-15');
                
            let ret1 = await registrationContract.queryRegoByProperty(transactionContext, 'person', '0452642686' );
            ret1 = JSON.parse(ret1);
            expect(ret1[1]['Record']['status']).to.eql('Approved');

            await registrationContract.expireRego(transactionContext, 'QLD-AUN203');
            let ret2 = await registrationContract.queryRegoByProperty(transactionContext, 'person', '0452642686' );
            ret2 = JSON.parse(ret2);
            expect(ret2[1]['Record']['status']).to.eql('Expired');

            await registrationContract.cancelRego(transactionContext, 'QLD-AUN203', '2021-07-31', 'application does not look convincing');
            let ret3 = await registrationContract.queryRegoByProperty(transactionContext, 'person', '0452642686' );
            ret3 = JSON.parse(ret3);
            expect(ret3[1]['Record']['status']).to.eql('Cancelled');
            expect(ret3[1]['Record']['comment']).to.eql('application does not look convincing');
        });

        

    });


    describe('Test query by any status', () => {

        it('should a few diferent functions', async () => {


            let registrationContract = new RegistrationContract();

            await registrationContract.startRegistration(transactionContext, newRego.vin, 
                newRego.auState, newRego.person, newRego.licensePlate);

            let ret = JSON.parse(await registrationContract.queryRegoByProperty(transactionContext, 'registrationID', rego1['registrationID']));
            expect(ret[0].Record).to.eql(rego1);            
        });

        it('should a few diferent functions', async () => {

            try {
                let registrationContract = new RegistrationContract();

                await registrationContract.startRegistration(transactionContext, newRego.vin, 
                    newRego.auState, newRego.person, newRego.licensePlate);

                let ret = JSON.parse(await registrationContract.queryRegoByProperty(transactionContext, 'owner', rego1['registrationID']));
             
                assert.fail('Should return error.');
            } catch (err) {
                expect(err.toString()).to.eql("Error: Property owner does not exist!"); 
            }
        });

    });

    
});