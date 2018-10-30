'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
// set region if not set (as not set by the SDK by default). required for offline usage
if (!AWS.config.region) {
    AWS.config.update({
      region: 'us-east-1'
    });
}
const dynamoDb = new AWS.DynamoDB();


module.exports.update = (event, context, callback) => {

    const todoItem = JSON.parse(event.body);

    const params = {
        ExpressionAttributeNames: {
            "#c": "completed",
        },
        ExpressionAttributeValues: {
            ":c": {
                BOOL: todoItem.completed
            }
        },
        Key: {
            "user": {
                S: event.headers["X-Api-Key"]
            },
            "id": {
                S: event.pathParameters.id
            }
        },
        ReturnValues: "ALL_NEW",
        TableName: process.env.TODOS_TABLE,
        UpdateExpression: "SET #c = :c"
    };

    dynamoDb.updateItem(params, (error, data) => {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'Couldn\'t update the todo item.',
            });
            return;
        }

        callback(null, {
            statusCode: 200
        });
    });

};
