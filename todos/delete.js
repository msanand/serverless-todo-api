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


module.exports.delete = (event, context, callback) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
        "X-Requested-With": "*",
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,x-api-key,x-requested-with,Cache-Control',
    };

    if (event.headers["x-api-key"] === undefined) {
        callback(null, { headers: headers, statusCode: 400, body: JSON.stringify("Missing or invalid x-api-key header.")});
    } else if (event.headers["x-api-key"].length < 1) {
        callback(null, { headers: headers, statusCode: 400, body: JSON.stringify("Empty x-api-key header value.")});
    } else if (event.pathParameters.id === undefined) {
        callback(null, { headers: headers, statusCode: 400, body: JSON.stringify("Missing 'id' in URL path.")});
    }

    const params = {
        TableName: process.env.TODOS_TABLE,
        Key: {
            user: event.headers["x-api-key"],
            id: event.pathParameters.id,
        },
    };

    dynamoDb.delete(params, (error) => {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: headers,
                body: JSON.stringify('Couldn\'t delete todo.'),
            });
            return;
        }


        callback(null, {
            headers: headers,
            statusCode: 200,
            body: JSON.stringify({})
        });
    });

};
