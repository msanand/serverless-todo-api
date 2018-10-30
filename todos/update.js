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
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
        "X-Requested-With": "*",
        "Access-Control-Allow-Headers": 'Content-Type,X-Amz-Date,Authorization,x-api-key,x-requested-with,Cache-Control',
    };

    const todoItem = JSON.parse(event.body);

    if (event.headers["x-api-key"] === undefined) {
        callback(null, { headers: headers, statusCode: 400, body: JSON.stringify("Missing or invalid x-api-key header.")});
    } else if (event.headers["x-api-key"].length < 1) {
        callback(null, { headers: headers, statusCode: 400, body: JSON.stringify("Empty x-api-key header value.")});
    } else if (event.pathParameters.id === undefined) {
        callback(null, { headers: headers, statusCode: 400, body: JSON.stringify("Missing 'id' in URL path.")});
    }

    const updateNames = {};
    const updateValues = {};
    const updateArray = [];
    if (todoItem.completed !== undefined) {
        updateNames["#c"] = "completed";
        updateValues[":c"] = { BOOL: todoItem.completed };
        updateArray.push("#c = :c");
    }
    if (todoItem.text !== undefined) {
        updateNames["#t"] = "text";
        updateValues[":t"] = { S: todoItem.text };
        updateArray.push("#t = :t");
    }
    if (updateArray.length == 0) {
        callback(null, { statusCode: 400, body: "No properties passed to update. Supports 'completed' and 'text'.", headers: { "Content-Type": "text/plain" } });
    }
    const timestamp = Math.floor(new Date() / 1000);
    updateNames["#u"] = "updated";
    updateValues[":u"] = { N: timestamp.toString() };
    updateArray.push("#u = :u");

    const params = {
        ExpressionAttributeNames: updateNames,
        ExpressionAttributeValues: updateValues,
        Key: {
            "user": {
                S: event.headers["x-api-key"]
            },
            "id": {
                S: event.pathParameters.id
            }
        },
        ReturnValues: "ALL_NEW",
        TableName: process.env.TODOS_TABLE,
        UpdateExpression: "SET " + updateArray.join(', ')
    };

    dynamoDb.updateItem(params, (error, data) => {
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                headers: headers,
                body: JSON.stringify('Couldn\'t update the todo item.'),
            });
            return;
        }

        callback(null, {
            headers: headers,
            statusCode: 200
        });
    });

};
