/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const propertyList = ['registrationID', 'vin', 'person', 'status']; 

class RegistrationContract extends Contract {

    async InitLedger(ctx) {
        console.info('RegistrationContract initialised.');
    }

    // Returns true when rego exists in global ledger
    async regoExists(ctx, licensePlate, ausState) {
        const regoID = ausState + '-' + licensePlate;
        const regoAsBytes = await ctx.stub.getState(regoID);
        if (regoAsBytes && regoAsBytes.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Returns the Registration for the provided Registration ID
    async GetRegistration(ctx, regoID) {
        const regoJSON = await ctx.stub.getState(regoID);
        if (!regoJSON || regoJSON.length === 0) {
            throw new Error(`NotFound: Registration with ID: ${regoID} not found`);
        }
        return regoJSON.toString();
    }

    // AddRegistration adds a new registration to the distributed ledger.
    // personID can be either driver license or an ID registered with the corporation
    async startRegistration(ctx, vin, ausState, personID, licensePlate) {

        const resultIter = await ctx.stub.getStateByRange('','');
        let results = await this._GetAllReults(resultIter);

        //results = JSON.parse(results);
        if (results.length != 0) {
            results = results.filter(function(rego){
                return (rego['vin'] === vin);
            });
        }

        const regoID = ausState + '-' + licensePlate

        const registration = {
            registrationID: ausState + '-' + licensePlate,
            vin: vin,
            person: personID,
            registrationDate: '',
            expirationDate: '',
            status: 'Pending',
            comment: ''
        };

        if (results.length != 0) {
            let resultsIneffective = results.filter(function(rego){
                return (rego['status'] === 'Cancelled' || rego['status'] === 'Expired');
            });

            let resultsEffective = results.filter(function(rego){
                return (rego['status'] === 'Approved' || rego['status'] === 'Pending');
            });

            if (results.length - resultsIneffective.length === 1) {
                if (resultsEffective[0]['registrationID'].slice(0,3) === ausState) {
                    throw new Error(`${vin} has already been registered in ${ausState}`);
                } else {
                    if (resultsEffective[0]['status'] = 'Pending') {
                        throw new Error(`${vin} is still pending a registration from another state`);
                    } else {
                        registration['status'] = 'Approved';
                        await ctx.stub.putState(regoID, Buffer.from(JSON.stringify(registration)));
                        return JSON.stringify(registration);
                    }
                }
            } else {
                await ctx.stub.putState(regoID, Buffer.from(JSON.stringify(registration)));
                return JSON.stringify(registration);
            }
        } else {
            await ctx.stub.putState(regoID, Buffer.from(JSON.stringify(registration)));
            return JSON.stringify(registration);
        }

        

    }

    // START: set of all rego related functions: approve, cancel, and expire
    async approveRego(ctx, regoID, stringdate) {
        
        //set up dates
        var dateApproved = new Date(stringdate);
        var dateExpired = new Date(stringdate);
        dateExpired.setDate(dateApproved.getDate() + 365);

        //get the registration from chaincode state
        const regoAsBytes = await ctx.stub.getState(regoID);
        const rego = JSON.parse(regoAsBytes.toString());
        rego.status = 'Approved';
        rego.registrationDate = dateApproved.toISOString().slice(0,10);
        rego.expirationDate = dateExpired.toISOString().slice(0,10);

        // emit an event when registration is approved
        let regoBuffer = Buffer.from(JSON.stringify(rego))
        ctx.stub.setEvent('ApproveRego', regoBuffer);

        await ctx.stub.putState(regoID, regoBuffer);
    }

    async cancelRego(ctx, regoID, stringdate, comment) {
        
        var cancelledDate = new Date(stringdate);
        const regoAsBytes = await ctx.stub.getState(regoID); //get the registration from chaincode state

        const rego = JSON.parse(regoAsBytes.toString());
        rego.status = 'Cancelled';
        rego.expirationDate = cancelledDate.toISOString().slice(0,10);
        rego.comment = comment;

        // emit an event when registration is cancelled
        let regoBuffer = Buffer.from(JSON.stringify(rego))
        ctx.stub.setEvent('CancelRego', regoBuffer);

        await ctx.stub.putState(regoID, regoBuffer);
    }

    async expireRego(ctx, regoID) {
        
        const regoAsBytes = await ctx.stub.getState(regoID); //get the registration from chaincode state

        const rego = JSON.parse(regoAsBytes.toString());
        rego.status = 'Expired';

        await ctx.stub.putState(regoID, Buffer.from(JSON.stringify(rego)));
    }
    // End

    // to query onchain data by different properties, ex date property
    async queryRegoByProperty(ctx, propertyName, propertyValue) {

        if (!propertyList.includes(propertyName)) {
            throw new Error(`Property ${propertyName} does not exist!`)
        }

        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            var buf = JSON.parse(strValue);
            let record;
            try {
                if (buf[propertyName].toString() === propertyValue) {
                    record = JSON.parse(strValue);
                    allResults.push({Key: buf['registrationID'], Record: record});
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            result = await iterator.next();
        }

        return JSON.stringify(allResults);
    }
   
    //supporting function for adding new rego
    async _GetAllReults(iterator) {
        let allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                jsonRes.Key = res.value.key;
                try {
                    jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Value = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes.Value);
            }
            res = await iterator.next();
        }

        return allResults;
    }
    
}

module.exports = RegistrationContract;


