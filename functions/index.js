const functions = require("firebase-functions");

exports.helloWorld = functions.https.onRequest(async (req, res) => {
   res.json({ result: "hola" })
})