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

    const userInfo = JSON.parse(event.body);

    var timestamp = moment().valueOf();
    const secret = timestamp + " a secret 23g9823f98jg29";
    const hash = crypto.createHmac('sha256', secret);
        hash.update(userInfo.email);
    const data = {
        "apiKey": hash.digest('hex'),
    };


    callback(null, {
        statusCode: 200,
        body: JSON.stringify(data),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    });

};
