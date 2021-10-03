const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const ejs = require('ejs');
const app = express();
const port = 3001;
const uploadPath = path.join(__dirname, '../', 'upload');
const { incrementRego, formatRego } = require("./util/NumberPlateHelper");
const {
  getCustomerRecord,
  updateCustomer,
  getNumberPlate,
  insertNumberPlate,
  insertDocumentation,
  getDocumentation } = require("./db/DBClient");
const { getAllVehicles, getVehicle } = require("./blockchain/VehicleOracle");
const { getViolationsByCRN, payFine } = require('./blockchain/ViolationOracle');
const {
  getRegistrationHistory,
  submitRegistration,
  getPendingRegistrations,
  getRegistrationByID,
  approveRegistration,
  cancelRegistration } = require("./blockchain/RegistrationOracle");
const { initRegoEventListener } = require("./blockchain/RegistrationEventListener");
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.static("upload"));
app.use(fileUpload());

// init the Registration Event Listener
initRegoEventListener();

app.use(session({
  secret: 'Keep it secret'
  , name: 'SessionID'
  , saveUninitialized: false
}))

// Routes for Cutomer Portal
app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
})

app.get('/home', (req, res) => {
  if (req.session.loggedIn) {
    res.render("home", { customer: req.session.customer });
  }
  else
    res.redirect('/login')
})

app.get('/vehicles', (req, res) => {
  if (req.session.loggedIn) {

    getAllVehicles()
      .then((response) => {
        res.render("vehicles", { customer: req.session.customer, data: response });
      })
      .catch((err) => {
        console.log(err);
        res.render("error", { customer: req.session.customer, error_message: err });
      });

  } else {
    res.redirect('/login');
  }
})

app.get('/fines', (req, res) => {
  if (req.session.loggedIn) {
    getViolationsByCRN(req.session.customer.crn)
      .then((response) => {
        res.render("fines", { customer: req.session.customer, data: response });
      })
      .catch((err) => {
        console.log(err);
        res.render("error", { customer: req.session.customer, error_message: err });
      });
  } else {
    res.redirect('/login');
  }
})

app.get('/pay/:violationId', (req, res) => {
  if (req.session.loggedIn) {
    payFine(req.params.violationId)
      .then(() => {
        res.redirect("/fines");
      })
      .catch((err) => {
        console.log(err);
        res.render("error", { customer: req.session.customer, error_message: err });
      })
  } else {
    res.redirect('/login');
  }
})

app.get('/registration', (req, res) => {
  if (req.session.loggedIn) {

    getRegistrationHistory(req.session.customer.crn)
      .then((response) => {
        res.render("registration_history", { customer: req.session.customer, data: response });
      })
      .catch((err) => {
        console.log(err);
        res.render("error", { customer: req.session.customer, error_message: err });
      });

  } else {
    res.redirect('/login');
  }
})

app.get('/registrationform1', (req, res) => {
  if (req.session.loggedIn) {
    res.render("registration_form_step1", { customer: req.session.customer });
  } else {
    res.redirect('/login');
  }
})

app.post('/registrationform1', bodyParser.urlencoded(), (req, res) => {

  // update the customer details
  let cust = req.session.customer;
  cust.first_name = req.body.inputGivenNames;
  cust.last_name = req.body.inputSurname;
  cust.dob = req.body.inputDOB;
  cust.address = req.body.inputAddress;
  cust.email = req.body.inputEmail;
  cust.phone = req.body.inputContractNumber;

  updateCustomer(cust, (err) => {
    if (err) {
      console.log(err);
      res.render("error", { customer: req.session.customer, error_message: err });
    } else {
      res.redirect('/registrationform2');
    }
  })
})

app.get('/registrationform2', (req, res) => {
  if (req.session.loggedIn) {
    res.render("registration_form_step2", { customer: req.session.customer });
  } else {
    res.redirect('/login');
  }
})

app.post('/registrationform2', bodyParser.urlencoded(), (req, res) => {
  if (req.session.loggedIn) {
    req.session.inputVIN = req.body.inputVIN;
    getVehicle(req.body.inputVIN)
      .then((response) => {
        res.render("registration_form_step2", {
          customer: req.session.customer,
          data: response, prevVin: req.session.inputVIN
        });
      })
      .catch((err) => {
        res.render("registration_form_step2", {
          customer: req.session.customer,
          error: err, prevVin: req.session.inputVIN
        });
      });
  } else {
    res.redirect('/login');
  }
})

app.get('/registrationform3', (req, res) => {
  if (req.session.loggedIn) {

    getNumberPlate((err, plate) => {
      if (err) {
        console.log(err);
        res.render("error", { customer: req.session.customer, error_message: err });
      } else {
        req.session.regoArr = plate;
        res.render("registration_form_step3", {
          customer: req.session.customer,
          inputVIN: req.session.inputVIN,
          numberPlate: formatRego(plate)
        });
      }
    });

  } else {
    res.redirect('/login');
  }
})

app.post('/registrationform3', bodyParser.urlencoded(), (req, res) => {

  // update blcokchain
  submitRegistration(req.body.inputVIN, req.body.inputState, req.body.inputCRN, req.body.inputPlateNumber)
    .then((response) => {

      // update number plate database
      let newRego = incrementRego(req.session.regoArr);
      insertNumberPlate(newRego, (err) => {
        if (err) {
          console.log(err);
          res.render("error", { customer: req.session.customer, error_message: err });
        } else {
          // upadate supporting documentation database
          if (req.files) {
            let poreFile = req.files.inputFile;
            let fileNameArr = poreFile.name.split(".");
            let fileName = uuidv4() + "." + fileNameArr[fileNameArr.length - 1];
            let filePath = path.join(uploadPath, fileName);
            // move the file to the uploads directory
            poreFile.mv(filePath, (err) => {
              if (err) res.render("error", { customer: req.session.customer, error_message: err });

              insertDocumentation(req.body.inputState + "-" + req.body.inputPlateNumber, fileName, poreFile.name, (err) => {
                if (err) {
                  res.render("error", { customer: req.session.customer, error_message: err });
                } else {
                  res.render("registration_success", { customer: req.session.customer });
                }
              });
            });
          } else {
            res.render("registration_success", { customer: req.session.customer });
          }
        }
      });
    })
    .catch((err) => {
      res.render("error", { customer: req.session.customer, error_message: err });
    });
})
// End Routes for Cutomer Portal

// Routes for Admin portal
app.get('/registrationsummary', (req, res) => {
  getPendingRegistrations()
    .then((response) => {
      res.render("./admin/registration_summary", { customer: req.session.customer, data: response });
    })
    .catch((err) => {
      console.log(err);
      res.render("error", { customer: req.session.customer, error_message: err });
    });
})

app.get('/registrationdetail/:regoID', (req, res) => {

  // store regID in user session
  req.session.regoToProcess = req.params.regoID;

  // Get the registration details
  getRegistrationByID(req.params.regoID)
    .then((registration) => {

      // get the vehicle details
      getVehicle(JSON.parse(registration).vin)
        .then((vehicle) => {

          // get the Person who lodged the registration      
          getCustomerRecord(JSON.parse(registration).person, (err, person) => {
            if (err) {
              console.log(err);
              res.render("error", { customer: req.session.customer, error_message: err });
            } else {
              // finally get any supprting documetation
              getDocumentation(req.params.regoID, (err, row) => {
                if (err) {
                  console.log(err);
                  res.render("error", { customer: req.session.customer, error_message: err });
                } 
                res.render("./admin/registration_detail", { 
                  customer: req.session.customer, 
                  registration_data: registration, 
                  vehicle_data: vehicle, 
                  person_data: person,
                  pore: row});
              });
            }
          })

        })
        .catch((err) => {
          console.log(err);
          res.render("error", { customer: req.session.customer, error_message: err });
        })

    })
    .catch((err) => {
      console.log(err);
      res.render("error", { customer: req.session.customer, error_message: err });
    });
})

app.get('/approve', (req, res) => {
  if (req.session.loggedIn) {

    approveRegistration(req.session.regoToProcess)
      .then((response) => {
        res.render("home", { customer: req.session.customer });
      })
      .catch((err) => {
        console.log(err);
        res.render("error", { customer: req.session.customer, error_message: err });
      });

  } else {
    res.redirect('/login');
  }
})

app.post('/reject', bodyParser.urlencoded(), (req, res) => {
  if (req.session.loggedIn) {

    let rejectionComment = req.body.inputRejectionComment
    cancelRegistration(req.session.regoToProcess, rejectionComment)
      .then((response) => {
        res.render("home", { customer: req.session.customer });
      })
      .catch((err) => {
        console.log(err);
        res.render("error", { customer: req.session.customer, error_message: err });
      });

  } else {
    res.redirect('/login');
  }
})
// End Routes for Admin Portal

// Routes for Login
app.get('/login', (req, res) => {
  res.render("login", {});
})

app.post('/login', bodyParser.urlencoded(), (req, res, next) => {
  getCustomerRecord(req.body.username, (err, cust) => {
    if (err) {
      console.log(err);
      res.redirect('/login');
    } else {
      if (cust && (req.body.password === cust.password)) {
        res.locals.customer = cust;
        next();
      }
      else {
        res.redirect('/login');
      }
    }
  });
}
  , (req, res) => {
    req.session.loggedIn = true;
    req.session.customer = res.locals.customer;
    console.log(req.session);
    res.redirect('/home');
  })

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    // do nothing
  });
  res.redirect('/login');
})

app.listen(port, () => { console.log(`Application started on port: ${port}`) });