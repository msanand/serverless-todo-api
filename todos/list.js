'use strict';

const AWS = require('aws-sdk');
// set region if not set (as not set by the SDK by default). required for offline usage
if (!AWS.config.region) {
    AWS.config.update({
      region: 'us-east-1'
    });
}
const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports.list = (event, context, callback) => {
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
    }

    const params = {
        TableName: process.env.TODOS_TABLE,
        FilterExpression: '#user = :user',
        ExpressionAttributeNames: { "#user": "user" },
        ExpressionAttributeValues: { ':user': event.headers["x-api-key"] }
    };


    dynamoDb.scan(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                headers: headers,
                statusCode: error.statusCode || 501,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'Couldn\'t fetch the todos.',
            });
            return;
        }

        // create a response
        const response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(result.Items)
        };
        callback(null, response);
    });
};
