const sqlite3 = require('sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '../', '../', '../', '../', 'utilities', 'database-generator', 'registration.db');

const GET_CUST_SQL = 'SELECT * from customers WHERE crn = ?';
const GET_NUMEBR_PLATE_SQL = 'SELECT * FROM number_plates ORDER BY rowid DESC LIMIT 1';
const NUMBER_PLATE_INSERT_SQL='INSERT INTO number_plates (firstLetter,secondLetter,thirdLetter,numberPart) VALUES(?,?,?,?)';
const UPDATE_CUST_SQL = 'UPDATE customers SET first_name = ?, last_name = ?, dob = ?, address = ?, email = ?, phone = ? WHERE crn = ?';
const DOCUMENTATION_INSERT_SQL='INSERT INTO documentation (regoID, filePath, fileName) VALUES(?,?,?)';
const GET_DOCUMENTATION_SQL = 'SELECT * from documentation WHERE regoID = ?';


/**
 * Used by the registration-portal to retrieve a Customer Record from the database.
 * @param {String} crn The Custiomer ID
 * @param {Function} callback The function to call to return error or results
 */
function getCustomerRecord(crn, callback) {

    let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          callback(err, null);
        }
        db.get(GET_CUST_SQL, [crn], (err, row) => {
          callback(err, row);
      });
    });
}

/**
 * Used by the registration-portal to update a Customer Record in te database.
 * @param {Object} customer Contains the customer details to update
 * @param {Function} callback The function to call to return error or results
 */
function updateCustomer(customer, callback) {

  let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        callback(err);
      }
      db.run(UPDATE_CUST_SQL, [
        customer.first_name, customer.last_name, customer.dob, customer.address, 
        customer.email, customer.phone, customer.crn], (err) => {
        callback(err);
    });
  });
}


/**
 * Used by registration-portal to retrieve the next available number plate from the database.
 * @param {Function} callback The function to call to return error or results
 */
function getNumberPlate(callback) {

  let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        callback(err, null);
      }
      db.get(GET_NUMEBR_PLATE_SQL, (err, row) => {
        callback(err, [row.firstLetter, row.secondLetter, row.thirdLetter, row.numberPart]);
    });
  });
}


/**
 * Used by registration-portal to update the database with the next available number plate.
 * @param {Array} regoArr An Array representing the next number plate e.g. [0,0,0,0]
 * @param {Function} callback The function to call to return error or results
 */
function insertNumberPlate(regoArr, callback) {

  let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        callback(err);
      }
      db.run(NUMBER_PLATE_INSERT_SQL, [regoArr[0],regoArr[1],regoArr[2],regoArr[3]], (err) => {
        callback(err);
    });
  });
}


/**
 * Used by registration-portal to store a reference to files uploaded by the customer.
 * @param {String} regoID The Registration ID that the document is related to 
 * @param {String} filePath The path to the document on the file system e.g. /uploads/71b4f452-0782-415a-a839-d4467be55d1d.png
 * @param {String} fileName The original file name e.g. 'MyBillOfSale.png'
 * @param {Function} callback The function to call to return error or results
 */
function insertDocumentation(regoID, filePath, fileName, callback) {

  let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        callback(err);
      }
      db.run(DOCUMENTATION_INSERT_SQL, [regoID, filePath, fileName], (err) => {
        callback(err);
    });
  });
}


/**
 * Used by registration-portal to retrieve documents related to a registration.
 * @param {String} regoID The Registration ID
 * @param {Function} callback The function to call to return error or results
 */
function getDocumentation(regoID, callback) {

  let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        callback(err);
      }
      db.get(GET_DOCUMENTATION_SQL, [regoID], (err, row) => {
        callback(err, row);
    });
  });
}

module.exports.getCustomerRecord = getCustomerRecord;
module.exports.getNumberPlate = getNumberPlate;
module.exports.insertNumberPlate = insertNumberPlate;
module.exports.updateCustomer = updateCustomer;
module.exports.insertDocumentation = insertDocumentation;
module.exports.getDocumentation = getDocumentation;