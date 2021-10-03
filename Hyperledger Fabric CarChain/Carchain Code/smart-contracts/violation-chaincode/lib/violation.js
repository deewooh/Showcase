/*
 * SPDX-License-Identifier: Apache-2.0
 */

// Code adpated from- Hyperledger Fabric Samples
// https://github.com/hyperledger/fabric-samples


'use strict';

const { Contract } = require('fabric-contract-api');
const PermList = ['RegistryPortal', 'PolicePortal', 'VehicleAPI'];

class ViolationContract extends Contract {

    async InitLedger(ctx) {
        console.info('ViolationContract initialised.');
    }
    
    // AssetExists returns true when asset with given ID exists in world state.
    async ViolationExists(ctx, violation_id) {

        // Check if caller has permission to call function, unit tests will not have ctx.clientIdentity populted.
        if (ctx.clientIdentity) {
            let clientID = ctx.clientIdentity.attrs['hf.EnrollmentID']
            if (!PermList.includes(clientID)) {
                throw new Error('PermissionDenied: Client does not have permission to call AddViolation.');
            }
        }

        const violationJSON = await ctx.stub.getState(violation_id);
        if(violationJSON && violationJSON.length > 0) {
            return true;
        };
        return false;
    }

    // GetCounter retrieves the latest ID counter from the distributed ledger
    async GetCounter(ctx) {
        let counter = await ctx.stub.getState('counter');
        
        if (!counter || counter.length === 0) {
            counter = {
                next_counter: 1
            }
            return JSON.stringify(counter);
        } else {
            return counter.toString();
        }
    }

    // SetCounter stores the latest ID counter on the ditributed ledger
    async SetCounter(ctx, count) {

        if (!count || count === "" || count < 0) {
            throw new Error('InvalidInput: Missing or invalid arguments.');
        }

        const counter = {
            next_counter: count
        };

        let counterBuffer = Buffer.from(JSON.stringify(counter));

        // store the counter on the blockchain
        await ctx.stub.putState('counter', counterBuffer);
    }

    // AddViolations adds a new violations to the distributed ledger.
    // Assumes that rego_reference exists (checked in the api server)
    async AddViolation(ctx, code, description, occurred_date, fine_amount, rego_reference) {

        // Check if caller has permission to call function, unit tests will not have ctx.clientIdentity populted.
        if (ctx.clientIdentity) {
            let clientID = ctx.clientIdentity.attrs['hf.EnrollmentID']
            if (!PermList.includes(clientID)) {
                throw new Error('PermissionDenied: Client does not have permission to call AddViolation.');
            }
        }

        // If any of the args are empty string, then throw error
        for(let i = 1; i < arguments.length; i++) {
            if (arguments[i] === "" || arguments[i] < 0) {
                throw new Error('InvalidInput: Missing or invalid arguments.');
            }
        }

        // get the next violation counter ID from the ledger
        let counter = JSON.parse(await this.GetCounter(ctx));
        // console.log(JSON.stringify(counter));

        let violation_id = counter.next_counter.toString();

        const violation = {
            Violation_id: violation_id,
            Code: code,
            Description: description,
            Occurred_date: occurred_date,
            Fine_amount: fine_amount,
            Rego_reference: rego_reference,
            // Initial State is Unpaid (because it is new)
            // Different states: Unpaid, Paid, Disputed, Overdue
            Status: "Unpaid",
        };

        // update the ledger with the next counter
        await this.SetCounter(ctx, (counter.next_counter + 1));
        // update the ledger with the violation
        await ctx.stub.putState(violation_id, Buffer.from(JSON.stringify(violation)));
        return JSON.stringify(violation);
    }

    // Function to update status
    async UpdateViolation(ctx, violation_id, code, description, occurred_date, 
        fine_amount, rego_reference, status) {
        // Check if caller has permission to call function, unit tests will not have ctx.clientIdentity populted.
        if (ctx.clientIdentity) {
            let clientID = ctx.clientIdentity.attrs['hf.EnrollmentID']
            if (!PermList.includes(clientID)) {
                throw new Error('PermissionDenied: Client does not have permission to call AddViolation.');
            }
        }

        let exists = await this.ViolationExists(ctx, violation_id);
        if (!exists) {
            throw new Error(`NotFound: Violation ${violation_id} does not exist.`);
        };

        const updatedViolation = {
            Violation_id: violation_id,
            Code: code,
            Description: description,
            Occurred_date: occurred_date,
            Fine_amount: fine_amount,
            Rego_reference: rego_reference,
            Status: status,
        };
        // Override the old key value
        return ctx.stub.putState(violation_id, Buffer.from(JSON.stringify(updatedViolation)));
    }

    // Pay fine function - Full payment
    // Params: Violation ID
    // Currently just calls the update function to change state to "Paid"
    async PayFine(ctx, violation_id) {

        // Check if caller has permission to call function, unit tests will not have ctx.clientIdentity populted.
        if (ctx.clientIdentity) {
            let clientID = ctx.clientIdentity.attrs['hf.EnrollmentID']
            if (!PermList.includes(clientID)) {
                throw new Error('PermissionDenied: Client does not have permission to call AddViolation.');
            }
        }

        const violationAsBytes = await ctx.stub.getState(violation_id); // get the car from chaincode state
        if (!violationAsBytes || violationAsBytes.length === 0) {
            throw new Error(`NotFound: Violation ${violation_id} does not exist.`);
        };

        const violation = JSON.parse(violationAsBytes.toString());

        violation.Status = "Paid";
        await ctx.stub.putState(violation_id, Buffer.from(JSON.stringify(violation)));
        return JSON.stringify(violation);
    }
    
    // Add function to dispute violation
    // Params: Violation_id
    // Currently just changes the state to "Disputed" 
    // We can add more business logic in if needed
    async DisputeFine(ctx, violation_id) {
        // Check if caller has permission to call function, unit tests will not have ctx.clientIdentity populted.
        if (ctx.clientIdentity) {
            let clientID = ctx.clientIdentity.attrs['hf.EnrollmentID']
            if (!PermList.includes(clientID)) {
                throw new Error('PermissionDenied: Client does not have permission to call AddViolation.');
            }
        }

        const violationAsBytes = await ctx.stub.getState(violation_id); // get the car from chaincode state
        if (!violationAsBytes || violationAsBytes.length === 0) {
            throw new Error(`NotFound: Violation ${violation_id} does not exist.`);
        }
        
        const violation = JSON.parse(violationAsBytes.toString());
        
        violation.Status = "Disputed";
        await ctx.stub.putState(violation_id, Buffer.from(JSON.stringify(violation)));
        return JSON.stringify(violation);
    }


    // Function to get all the violations of a certain rego
    // returns an array of array of results
    // if nothing is found returns empty array
    async GetViolationsByRego(ctx, regoID) {

        // Check if caller has permission to call function, unit tests will not have ctx.clientIdentity populted.
        if (ctx.clientIdentity) {
            let clientID = ctx.clientIdentity.attrs['hf.EnrollmentID']
            if (!PermList.includes(clientID)) {
                throw new Error('PermissionDenied: Client does not have permission to call AddViolation.');
            }
        }

        const allResults = [];

        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            var buf = JSON.parse(strValue);
            let record;
            try {
                if (buf['Rego_reference'] && (buf['Rego_reference'].toString() == regoID)) {
                    record = JSON.parse(strValue);
                    allResults.push({Key: result.value.key, Record: record});
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            result = await iterator.next();
        }

        return JSON.stringify(allResults);
    }
    
    
    
    //GetAllVehicles returns all vehicles found in the world state.
    // Not too useful for our needs
    async GetAllViolations(ctx) {

        // Check if caller has permission to call function, unit tests will not have ctx.clientIdentity populted.
        if (ctx.clientIdentity) {
            let clientID = ctx.clientIdentity.attrs['hf.EnrollmentID']
            if (!PermList.includes(clientID)) {
                throw new Error('PermissionDenied: Client does not have permission to call AddViolation.');
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
            // don't add the counter record to the result set
            if (record.Violation_id) {
                allResults.push({ Key: result.value.key, Record: record });
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = ViolationContract;


