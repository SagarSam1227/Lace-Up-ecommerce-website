const accountSid = "ACd7d7b88d45f96b18d618ca07a65686f4";
const authToken = "30c9cd36d53008b6f31ed7cf129ea13d";
const serviceSid = "VA4c3827ec5f9384b0e08ded1f5cb7d217";

const client = require("twilio")(accountSid, authToken);
module.exports = {
  // api for sending otp to the user mobile number....
  send_otp: (mobileNo) => {
    return new Promise((resolve, reject) => {
      client.verify
        .services(serviceSid)
        .verifications.create({
          to: `+91${mobileNo}`,
          channel: "sms",
        })
        .then((verifications) => {
          resolve(verifications.sid);
        });
    });
  },
  // api for verifying the otp recived by the user
  verifying_otp: (mobileNo, otp) => {
    return new Promise((resolve, reject) => {
      client.verify
        .services(serviceSid)
        .verificationChecks.create({
          to: `+91${mobileNo}`,
          code: otp,
        })
        .then((verifications) => {
          resolve(verifications);
        });
    });
  },
};
