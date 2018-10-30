'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
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

    const todoItem = JSON.parse(event.body);
    
    if (event.headers["x-api-key"] === undefined) {
        callback(null, { statusCode: 400, body: JSON.stringify("Missing or invalid x-api-key header.") });
    } else if (event.headers["x-api-key"].length < 1) {
        callback(null, { statusCode: 400, body: JSON.stringify("Empty x-api-key header value.") });
    } else if (todoItem.text === undefined) {
        callback(null, { statusCode: 400, body: JSON.stringify("Missing or malformed 'text' property in JSON object in request body.") });
    } else if (todoItem.text.length < 1) {
        callback(null, { statusCode: 400, body: JSON.stringify("Empty 'text' property in JSON object in request body.") });
    }
    
    const timestamp = Math.floor(new Date() / 1000);
    const params = {
        TableName: process.env.TODOS_TABLE,
        Item: {
            user: event.headers["x-api-key"],
            id: uuid.v1(),
            text: todoItem.text,
            completed: false,
            created: timestamp,
            updated: timestamp
        },
    };

    dynamoDb.put(params, (error) => {
        if (error) {
            console.log(error);
            callback(null, { headers: headers, statusCode: 400, body: JSON.stringify(error) });
        } else {
            callback(null, {
                headers: headers,
                statusCode: 200,
                body: JSON.stringify(params.Item),
            });
        }
    });

};
