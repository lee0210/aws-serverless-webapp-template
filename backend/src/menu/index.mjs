import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamo = DynamoDBDocument.from(
  process.env.ENV == 'local' ?
    new DynamoDB({endpoint: process.env.DYNAMODB_ENDPOINT}) :
    new DynamoDB()
);

const TableName = 'menu';

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
export const handler = async (event) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        switch (event.httpMethod) {
            case 'DELETE':
                body = await dynamo.delete({ TableName, ...JSON.parse(event.body)});
                break;
            case 'GET':
                body = await dynamo.scan({ TableName });
                break;
            case 'POST':
                body = await dynamo.put({ TableName, ...JSON.parse(event.body)});
                break;
            case 'PUT':
                body = await dynamo.update({ TableName, ...JSON.parse(event.body)});
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};

