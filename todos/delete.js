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

    const params = {
        TableName: process.env.TODOS_TABLE,
        Key: {
            user: event.headers["X-Api-Key"],
            id: event.pathParameters.id,
        },
    };

    dynamoDb.delete(params, (error) => {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'Couldn\'t delete todo.',
            });
            return;
        }


        callback(null, {
            statusCode: 200,
            body: JSON.stringify({})
        });
    });

};
