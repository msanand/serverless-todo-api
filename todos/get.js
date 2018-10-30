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


module.exports.get = (event, context, callback) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "X-Requested-With": "*",
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,x-api-key,x-requested-with,Cache-Control',
    };

    if (event.headers["x-api-key"] === undefined) {
        callback(null, { headers: headers, statusCode: 400, body: "Missing or invalid x-api-key header.", headers: { "Content-Type": "text/plain" } });
    } else if (event.headers["x-api-key"].length < 1) {
        callback(null, { headers: headers, statusCode: 400, body: "Empty x-api-key header value.", headers: { "Content-Type": "text/plain" } });
    } else if (event.pathParameters.id === undefined) {
        callback(null, { headers: headers, statusCode: 400, body: "Missing 'id' in URL path.", headers: { "Content-Type": "text/plain" } });
    }

    const params = {
        TableName: process.env.TODOS_TABLE,
        Key: {
            user: event.headers["x-api-key"],
            id: event.pathParameters.id,
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'Couldn\'t fetch the todo item.',
            });
            return;
        }

        if (result === undefined || result.Item === "") {
            callback(null, { statusCode: 400, body: "No item found. Check that the API key and item ID are correct.", headers: { "Content-Type": "text/plain" } });
        }

        callback(null, {
            headers: headers,
            statusCode: 200,
            body: JSON.stringify(result.Item),
        });
    });

};
