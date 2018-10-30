'use strict';

const AWS = require('aws-sdk');
var moment = require('moment');
var crypto = require('crypto');
// set region if not set (as not set by the SDK by default). required for offline usage
if (!AWS.config.region) {
    AWS.config.update({
        region: 'us-east-1'
    });
}
const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports.create = (event, context, callback) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
        "X-Requested-With": "*",
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,x-api-key,x-requested-with,Cache-Control',
    };

    const userInfo = JSON.parse(event.body);

    if (userInfo.email === undefined) {
        callback(null, { headers: headers, statusCode: 400, body: JSON.stringify("Missing or malformed 'email' property in JSON object in request body.") });
    } else if (userInfo.name === undefined) {
        callback(null, { headers: headers, statusCode: 400, body: JSON.stringify("Missing or malformed 'name' property in JSON object in request body.") });
    }

    var timestamp = moment().valueOf();
    const secret = timestamp + " a secret 23g9823f98jg29";
    const hash = crypto.createHmac('sha256', secret);
        hash.update(userInfo.email);
    const data = {
        "apiKey": hash.digest('hex'),
    };


    callback(null, {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(data),
    });

};
