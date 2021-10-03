const nodemailer = require('nodemailer');

// The username and password for the gmail account
const senderEmail = 'carchaindemo@gmail.com';
const senderPassword = 'tufnew-sogcaC-tojdy6';

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: senderEmail,
    pass: senderPassword
  }
});

/**
 * Used by the RegistrationEventListener to send emails when a Registration is 'Approved' or 'Cancelled'.
 * @param {String} recipient The email address of the recipient 
 * @param {String} subject The email subject
 * @param {String} html The email body in html
 */
function sendEmail(recipient, subject, html) {
    let mailOptions = {
        from: senderEmail,
        to: recipient,
        subject: subject,
        html: html
      };

      transport.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

/**
 * Used by the RegistrationEventListener to format the body of the 'Approve' email.
 * @param {String} regoID The Registration ID
 * @param {String} name The Customer's name
 * @returns {String} Email body formatted as html
 */
function formatApproveEmail(regoID, name) {
    return `<h1>Hi ${name},</h1><p>Congratulations, your registration ${regoID} has been approved.</p><p>Happy driving from the CarRego team</p>`;
}

/**
 * Used by the RegistrationEventListener to format the body of the 'Cancel' email.
 * @param {String} regoID The Registration ID
 * @param {String} name The Customer's name
 * @param {String} reason The reason for the cancellation
 * @returns {String} Email body formatted as html
 */
function formatCancelEmail(regoID, name, reason) {
    return `<h1>Hi ${name},</h1><p>Unfortunately, your registration ${regoID} has been cancelled for the following reason: ${reason}.</p>
    <p>Please contact CarRego if you need further information</p>`;
}

module.exports.sendEmail = sendEmail;
module.exports.formatApproveEmail = formatApproveEmail;
module.exports.formatCancelEmail = formatCancelEmail;