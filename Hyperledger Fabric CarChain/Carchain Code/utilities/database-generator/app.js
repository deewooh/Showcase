/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const sqlite3 = require('sqlite3');
const fs = require('fs');
const registrationDB = './registration.db';

const CUSTOMER_TABLE_SCHEMA=
`CREATE TABLE customers (
	crn TEXT PRIMARY KEY, 
	first_name TEXT NOT NULL, 
	last_name TEXT NOT NULL, 
	dob TEXT NOT NULL, 
	address TEXT NOT NULL, 
	email TEXT NOT NULL UNIQUE, 
	phone TEXT NOT NULL UNIQUE, 
	password TEXT NOT NULL, 
	role TEXT NOT NULL)`;

const NUMBER_PLATE_TABLE_SCHEMA=
`CREATE TABLE number_plates (
	firstLetter INTEGER NOT NULL, 
	secondLetter INTEGER NOT NULL, 
	thirdLetter INTEGER NOT NULL,
	numberPart INTEGER NOT NULL)`;

const DOCUMENTATION_TABLE_SCHEMA=
`CREATE TABLE documentation (
		regoID TEXT PRIMARY KEY,
		filePath TEXT NOT NULL,
		fileName TEXT NOT NULL)`;

const CUSTOMERS_INSERT_SQL='INSERT INTO customers (crn,first_name,last_name,dob,address,email,phone,password,role) VALUES(?,?,?,?,?,?,?,?,?)';
const NUMBER_PLATE_INSERT_SQL='INSERT INTO number_plates (firstLetter,secondLetter,thirdLetter,numberPart) VALUES(?,?,?,?)';

const customers = [
	['CRN000000001','Lloyd','Richardson','1971-06-28','10 Smith Street, Randwick, NSW, 2033','lloyd.richardson@student.unsw.edu.au','+61405777888','Test111', 'CUST'],
	['CRN000000002','Xavier','Poon','1964-01-12','23 Purple Road, Surry Hills, NSW, 2000','x.poon@unsw.edu.au','+61405111222','Test222', 'CUST'],
	['CRN000000003','Dennis','Bui','1955-10-28','100 Todman Avenue, Kensington, NSW, 2033','d.bui@student.unsw.edu.au','+61405123456','Test333', 'CUST'],
	['CRN000000004','David','Wu','1955-10-28','100 Todman Avenue, Kensington, NSW, 2033','d.s.wu@student.unsw.edu.au','+61405123555','Test444', 'CUST'],
	['EMP000000001','Scott','Morrison','1968-05-13','The Lodge, Canberra, ACT','scomo@pm.gov.au','+61402123456','Test111', 'ADMIN']
];

const number_plates = [
	[0, 0, 0, 0]
];

async function setupDatabase() {

	console.log(`\nCreating new ${registrationDB} ...`); 
	let db = new sqlite3.Database(registrationDB, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
		if(err) {
			throw err;
		}

		console.log('\nCreating customers table ...');
		db.run(CUSTOMER_TABLE_SCHEMA, (err) => {
			if(err) {
				throw err;
			}

			customers.map(custItem =>(
				db.run(CUSTOMERS_INSERT_SQL, custItem, (err) => {
					if(err) {
						throw err;
					}
					console.log('\t Row was added to the table.');
				})
			));
		});

		console.log('\nCreating number plates table ...');
		db.run(NUMBER_PLATE_TABLE_SCHEMA, (err) => {
			if(err) {
				throw err;
			}

			number_plates.map(plateItem =>(
				db.run(NUMBER_PLATE_INSERT_SQL, plateItem, (err) => {
					if(err) {
						throw err;
					}
					console.log('\t Row was added to the table.');
				})
			));
		});

		console.log('\nCreating documentation table ...');
		db.run(DOCUMENTATION_TABLE_SCHEMA, (err) => {
			if(err) {
				throw err;
			}
		});
	});
	return db;
}


async function main() {

	try {
		fs.unlinkSync(registrationDB);
		console.log(`\nDeleted old ${registrationDB} ...`);
	} catch (err) {
		// file does not exist. Do nothing.
	}

	try {
		let dataBase = await setupDatabase();
		dataBase.close();
	} catch (err) {
		console.log(err.message);
	}
}

main();
