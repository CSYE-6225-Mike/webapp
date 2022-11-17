// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: 'REGION' });

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

var params = {
    TableName: 'CUSTOMER_LIST',
    Item: {
        'CUSTOMER_ID': { N: '001' },
        'CUSTOMER_NAME': { S: 'Richard Roe' }
    }
};

// Call DynamoDB to add the item to the table
ddb.putItem(params, function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data);
    }
});


// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: 'REGION' });

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

var params = {
    TableName: 'TABLE',
    Key: {
        'KEY_NAME': { N: '001' }
    },
    ProjectionExpression: 'ATTRIBUTE_NAME'
};

// Call DynamoDB to read the item from the table
ddb.getItem(params, function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data.Item);
    }
});


// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({ region: 'REGION' });

// Create the DynamoDB service object
var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

var params = {
    TableName: 'TABLE',
    Key: {
        'KEY_NAME': { N: 'VALUE' }
    }
};

// Call DynamoDB to delete the item from the table
ddb.deleteItem(params, function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data);
    }
});