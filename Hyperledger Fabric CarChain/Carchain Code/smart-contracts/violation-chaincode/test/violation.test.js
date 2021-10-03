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

const ViolationContract = require('../lib/violation.js');

let assert = sinon.assert;
chai.use(sinonChai);

describe('Violation Contract Tests', () => {
    let transactionContext, chaincodeStub;
    let fine1, violation1, violation1_disputed, violation1_paid, fine2, violation2, fine3;
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
        fine1 = {
            Code: 'Rule 20 - 2A',
            Description: "Driving 5km/h over limit",
            Occurred_date: '16-07-2021',
            Fine_amount: 123,
            Rego_reference: '123ABC',
        };

        // Another ticket that the police would write up
        fine2 = {
            Code: 'Rule 30 - 1B',
            Description: "Texting whilst driving",
            Occurred_date: '18-07-2021',
            Fine_amount: 420,
            Rego_reference: '123ABC',
        };

        fine3 = {
            Code: 'Rule 30 - 1B',
            Description: "Texting whilst driving",
            Occurred_date: '18-07-2021',
            Fine_amount: 420,
            Rego_reference: '246ABC',
        };

        //Violation that should be created from fine1
        violation1 = {
            Violation_id: "1",
            Code: "Rule 20 - 2A",
            Description: "Driving 5km/h over limit",
            Occurred_date: "16-07-2021",
            Fine_amount: 123,
            Rego_reference: "123ABC",
            Status: "Unpaid",
        };

        violation2 = {
            Violation_id: "2",
            Code: "Rule 30 - 1B",
            Description: "Texting whilst driving",
            Occurred_date: "18-07-2021",
            Fine_amount: 420,
            Rego_reference: "123ABC",
            Status: "Unpaid",
        };

        violation1_paid = {
            Violation_id: "1",
            Code: "Rule 20 - 2A",
            Description: "Driving 5km/h over limit",
            Occurred_date: "16-07-2021",
            Fine_amount: 123,
            Rego_reference: "123ABC",
            Status: "Paid",
        };

        violation1_disputed = {
            Violation_id: "1",
            Code: "Rule 20 - 2A",
            Description: "Driving 5km/h over limit",
            Occurred_date: "16-07-2021",
            Fine_amount: 123,
            Rego_reference: "123ABC",
            Status: "Disputed",
        };
        
        
    });

    // Begin unit tests
    describe('Test InitLedger', () => {
        it('should return success on InitLedger', async () => {
            let violationContract = new ViolationContract();
            try {
                await violationContract.InitLedger(transactionContext);
            } catch(err) {
                assert.fail('InitLedger should succeed')
            }
        });
    });

    describe('Test Add Violation', () => {

        it('should return success on AddVehicle', async () => {
            let violationContract = new ViolationContract();

            await violationContract.AddViolation(transactionContext, fine1.Code, 
                fine1.Description, fine1.Occurred_date, fine1.Fine_amount, fine1.Rego_reference);

            let ret = JSON.parse((await chaincodeStub.getState('1')));
            expect(ret).to.eql(violation1);
        });

    });

    describe('Test ViolationExists', () => {

        it('should return true on violationExists', async () => {
            let violationContract = new ViolationContract();

            await violationContract.AddViolation(transactionContext, fine1.Code, 
                fine1.Description, fine1.Occurred_date, fine1.Fine_amount, fine1.Rego_reference);

            let ret = await violationContract.ViolationExists(transactionContext, '1');
            expect(ret).to.eql(true);
        });

        it('should return false on VehicleExists', async () => {
            let violationContract = new ViolationContract();
            let ret = await violationContract.ViolationExists(transactionContext, '2');
            expect(ret).to.eql(false);
        });

    });
    

    describe('Test UpdateViolation', () => {

        it('should succeed and change status to paid', async () => {
            let violationContract = new ViolationContract();
            
            await violationContract.AddViolation(transactionContext, fine1.Code, 
                fine1.Description, fine1.Occurred_date, fine1.Fine_amount, fine1.Rego_reference);

            await violationContract.UpdateViolation(transactionContext, violation1.Violation_id,
                    violation1.Code, violation1.Description, violation1.Occurred_date,
                    violation1.Fine_amount, violation1.Rego_reference, 'Paid');
            
            let ret = JSON.parse((await chaincodeStub.getState('1')).toString())
            expect(ret).to.eql(violation1_paid);
    
        });
        
        
        it('should throw NotFound if the violation does not exist', async () => {
            let violationContract = new ViolationContract();
            try {
                let ret = await violationContract.UpdateViolation(transactionContext, violation1.Violation_id,
                        violation1.Code, violation1.Description, violation1.Occurred_date,
                        violation1.Fine_amount, violation1.Rego_reference, 'Paid');
                
                assert.fail('Should return error');
            } catch (err){
                expect(err.message).to.equal("NotFound: Violation 1 does not exist.");
            }
        });

    }); 
    
    describe('Test DisputeFine', () => {

        it('should return true if we are able to change the status', async () => {
            let violationContract = new ViolationContract();
            
            await violationContract.AddViolation(transactionContext, fine1.Code, 
                fine1.Description, fine1.Occurred_date, fine1.Fine_amount, fine1.Rego_reference);

            let ret = JSON.parse(await violationContract.DisputeFine(transactionContext, '1'));

            let updated_violation = JSON.parse((await chaincodeStub.getState('1')).toString())

            expect(ret).to.eql(violation1_disputed);
            expect(updated_violation).to.eql(violation1_disputed);
    
        });
        
        
        it('should throw NotFound when the violation does not exist', async () => {
            let violationContract = new ViolationContract();

            try {
                await violationContract.AddViolation(transactionContext, fine1.Code, 
                    fine1.Description, fine1.Occurred_date, fine1.Fine_amount, fine1.Rego_reference);
                await violationContract.DisputeFine(transactionContext, '2');
                assert.fail('DisputeFine should have failed');
            } catch(err) {
                expect(err.message).to.equal('NotFound: Violation 2 does not exist.');
            }
        });

    });
    
    describe('Test PayFine', () => {

        it('should return true if we are able to change the status', async () => {
            let violationContract = new ViolationContract();
            
            await violationContract.AddViolation(transactionContext, fine1.Code, 
                fine1.Description, fine1.Occurred_date, fine1.Fine_amount, fine1.Rego_reference);

            let ret = JSON.parse(await violationContract.PayFine(transactionContext, '1'));

            let updated_violation = JSON.parse((await chaincodeStub.getState('1')).toString())

            expect(ret).to.eql(violation1_paid);
            expect(updated_violation).to.eql(violation1_paid);
    
        });
        
        
        it('should throw NotFound when the violation does not exist', async () => {
            let violationContract = new ViolationContract();

            try {
                await violationContract.AddViolation(transactionContext, fine1.Code, 
                    fine1.Description, fine1.Occurred_date, fine1.Fine_amount, fine1.Rego_reference);
                let ret = await violationContract.PayFine(transactionContext, "2");
                assert.fail('PayFine should of failed');
            } catch(err) {
                expect(err.message).to.equal('NotFound: Violation 2 does not exist.');
            }
        });

    });


    describe('Test SetCounter / GetCounter', () => {

        it('should return the correct counter', async () => {
            let violationContract = new ViolationContract();
            let ret = JSON.parse(await violationContract.GetCounter(transactionContext));
            expect(ret).to.eql({"next_counter":1});

            await violationContract.SetCounter(transactionContext, 2);
            ret = JSON.parse(await violationContract.GetCounter(transactionContext));
            expect(ret).to.eql({"next_counter":2});            
            
            await violationContract.SetCounter(transactionContext, 3);
            ret = JSON.parse(await violationContract.GetCounter(transactionContext));
            expect(ret).to.eql({"next_counter":3});   

        });

        it('should return an error if invalid counter is set', async () => {
            let violationContract = new ViolationContract();

            try {
                await violationContract.SetCounter(transactionContext);  
                assert.fail('SetCounter should have failed');
            } catch (err) {
                expect(err.message).to.equal('InvalidInput: Missing or invalid arguments.');
            }

            try {
                await violationContract.SetCounter(transactionContext, -1);  
                assert.fail('SetCounter should have failed');
            } catch (err) {
                expect(err.message).to.equal('InvalidInput: Missing or invalid arguments.');
            }

        });

    });


    describe('Test GetViolationsByRego', () => {

        it('should return only 2 violations', async () => {
            let violationContract = new ViolationContract();
            
            await violationContract.AddViolation(transactionContext, fine1.Code, 
                fine1.Description, fine1.Occurred_date, fine1.Fine_amount, fine1.Rego_reference);

            await violationContract.AddViolation(transactionContext, fine2.Code, 
                fine2.Description, fine2.Occurred_date, fine2.Fine_amount, fine2.Rego_reference);

            await violationContract.AddViolation(transactionContext, fine3.Code, 
                fine3.Description, fine3.Occurred_date, fine3.Fine_amount, fine3.Rego_reference);

            let ret = JSON.parse(await violationContract.GetViolationsByRego(transactionContext, '123ABC'));

            expect(ret.length).to.equal(2);

            let expected = [
                            {Record: {Violation_id: '1', Code: 'Rule 20 - 2A', Description: 'Driving 5km/h over limit', Occurred_date: '16-07-2021', Fine_amount: 123, Rego_reference:'123ABC', Status: 'Unpaid'}},
                            {Record: {Violation_id: '2', Code: 'Rule 30 - 1B', Description: 'Texting whilst driving', Occurred_date: '18-07-2021', Fine_amount: 420, Rego_reference:'123ABC', Status: 'Unpaid'}}
                        ];

            expect(ret).to.eql(expected);
    
        });
    });

    describe('Test get all Violations', () => {

        it('should return only 3 violations', async () => {
            let violationContract = new ViolationContract();
            
            await violationContract.AddViolation(transactionContext, fine1.Code, 
                fine1.Description, fine1.Occurred_date, fine1.Fine_amount, fine1.Rego_reference);

            await violationContract.AddViolation(transactionContext, fine2.Code, 
                fine2.Description, fine2.Occurred_date, fine2.Fine_amount, fine2.Rego_reference);

            await violationContract.AddViolation(transactionContext, fine3.Code, 
                fine3.Description, fine3.Occurred_date, fine3.Fine_amount, fine3.Rego_reference);

            let ret = JSON.parse(await violationContract.GetAllViolations(transactionContext));
            expect(ret.length).to.equal(3);

            let expected = [
                            {Record: {Violation_id: '1', Code: 'Rule 20 - 2A', Description: 'Driving 5km/h over limit', Occurred_date: '16-07-2021', Fine_amount: 123, Rego_reference:'123ABC', Status: 'Unpaid'}},
                            {Record: {Violation_id: '2', Code: 'Rule 30 - 1B', Description: 'Texting whilst driving', Occurred_date: '18-07-2021', Fine_amount: 420, Rego_reference:'123ABC', Status: 'Unpaid'}},
                            {Record: {Violation_id: '3', Code: 'Rule 30 - 1B', Description: 'Texting whilst driving', Occurred_date: '18-07-2021', Fine_amount: 420, Rego_reference:'246ABC', Status: 'Unpaid'}}
                        ];

            expect(ret).to.eql(expected);
    
        });
        
    });
});
