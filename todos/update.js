'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');
// set region if not set (as not set by the SDK by default). required for offline usage
if (!AWS.config.region) {
    AWS.config.update({
      region: 'eu-central-1'
    });
}
const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports.update = (event, context, callback) => {

    const todoItem = JSON.parse(event.body);

    const params = {
        TableName: process.env.TODOS_TABLE,
        Item: {
            id: todoItem.id,
            text: todoItem.text,
            completed: todoItem.completed
        },
    };

    dynamoDb.put(params, (error) => {
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
            statusCode: 200,
            body: JSON.stringify(params.Item),
        });
    });

};