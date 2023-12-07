const { onRequest } = require("firebase-functions/v2/https");
// const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const AdmZip = require("adm-zip");
const request = require("request");
const util = require("util");
const { XMLParser } = require("fast-xml-parser");
const express = require('express');
const app = express();

app.post('/', async (req, res) => {
    try {
        logger.info("Hello logs!");
        const fileUrl = "https://firebasestorage.googleapis.com/v0/b/d-360-7e9d0.appspot.com/o/invoice%2Fcdr%2FR-10237098931-01-F001-30.zip?alt=media&token=d58bd9d2-cf49-4c8d-a49d-7d6d347e579a";

        const requestPromise = util.promisify(request);
        const response = await requestPromise({ url: fileUrl, encoding: null });
        const zip = new AdmZip(response.body);
        for (const zipEntry of zip.getEntries()) {
            const ext = zipEntry.name.split(".").pop().toLowerCase();
            if (ext == "xml") {
                const parser = new XMLParser();
                const jObj = parser.parse(zipEntry.getData().toString("utf8"));
                console.log(jObj["ar:ApplicationResponse"]["cac:DocumentResponse"]);
            }
        }
        logger.info("Termino!", { structuredData: true });
        res.status(200).send("Hello from Firebase!");
    } catch (e) {
        console.error(`An error has occurred. More info: ${e.message}`);
        res.status(500).send({
            message: e.message,
        });
    }
});

exports.readCdr = onRequest(app);