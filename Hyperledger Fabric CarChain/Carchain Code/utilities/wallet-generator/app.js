/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const rimraf = require("rimraf");
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../fabric-sdk/test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../fabric-sdk/test-application/javascript/AppUtil.js');
const mspOrg1 = 'Org1MSP';

// create a directory for each client wallet
const walletsRoot               = path.join(__dirname,   'wallets');
const adminWalletPath           = path.join(walletsRoot, 'admin', 'wallet');
const vehicleAPIWalletPath      = path.join(walletsRoot, 'vehicle', 'wallet');
const policePortalWalletPath    = path.join(walletsRoot, 'police', 'wallet');
const customerPortalWalletPath  = path.join(walletsRoot, 'customer', 'wallet');
const registryPortalWalletPath  = path.join(walletsRoot, 'registry', 'wallet');

// create a User Id for each Client App
const vehicleAPIUserId         = 'VehicleAPI';
const policePortalUserId       = 'PolicePortal';
const cutomerPortalUserId      = 'CustomerPortal';
const registryPortalUserId     = 'RegistryPortal';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
	try {
		const ccp = buildCCPOrg1();
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
		
		// delete wallets if they already exist on file system
		rimraf.sync(walletsRoot);

		// build each wallet
		const adminWallet    = await buildWallet(Wallets, adminWalletPath);
		const vehicleWallet  = await buildWallet(Wallets, vehicleAPIWalletPath);
		const policeWallet   = await buildWallet(Wallets, policePortalWalletPath);
		const customerWallet = await buildWallet(Wallets, customerPortalWalletPath);
		const registryWallet = await buildWallet(Wallets, registryPortalWalletPath);

		// Register the admin user.
		await enrollAdmin(caClient, adminWallet, mspOrg1);

		// Register each Client Application Identity.
		await registerAndEnrollUser(caClient, adminWallet, vehicleWallet,  mspOrg1, vehicleAPIUserId,      'org1.department1');
		await registerAndEnrollUser(caClient, adminWallet, policeWallet,   mspOrg1, policePortalUserId,    'org1.department1');
		await registerAndEnrollUser(caClient, adminWallet, customerWallet, mspOrg1, cutomerPortalUserId,   'org1.department1');
		await registerAndEnrollUser(caClient, adminWallet, registryWallet, mspOrg1, registryPortalUserId,  'org1.department1');

	} catch (error) {
		console.error('Error Occurred: ' + error);
	}
}

main();
