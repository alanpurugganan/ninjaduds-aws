
// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let AWS = require("aws-sdk");
let response;
let dynamodb = null;
let docClient = null;

if(process.env.EnvType == 'xxLocalxx'){
    let config = {
      "region":"local",
      "endpoint": `http://${process.env.LocalIp}:${process.env.LocalDynamoDbPort}`
    };

    dynamodb = new AWS.DynamoDB(config);
    docClient = new AWS.DynamoDB.DocumentClient(config);
}else{
    dynamodb = new AWS.DynamoDB();
    docClient = new AWS.DynamoDB.DocumentClient(); 
}

exports.helloWorld = async (event, context) => {
    try {
        // const ret = await axios(url);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: `hello world2 ${process.env.EnvType}`
                // location: ret.data.trim()
            })
        }

        const s3 = new AWS.S3();

        let body = JSON.parse(event.body);

        const destparams = {
            Bucket: process.env.Bucket,
            Key: 'testing/test1.txt',
            Body: body.message,
            ContentType: "text/plain"
        };
        
        const putResult = await s3.putObject(destparams).promise();

        // Create DynamoDB document client
        var dbParams = {
            TableName: process.env.TableName,
            Item: {
                'PK': 'alan.purugganan@gmail.com',
                'SK': 'test',
                'message': body.message
            }
        }

        let dbResult = await docClient.put(dbParams).promise();
        let x = 9;




    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};

exports.helloWorld2 = async (event, context) => {
    try {
        // const ret = await axios(url);
        const s3 = new AWS.S3();

        var dbParams = {
            TableName: process.env.TableName,
            KeyConditionExpression: 'PK = :hkey', //and RangeKey > :rkey',
            ExpressionAttributeValues: {
              ':hkey': 'alan.purugganan@gmail.com'
            }
        };
        
        let dbResult = await docClient.query(dbParams).promise();

        const s3params = {
            Bucket: process.env.Bucket,
            Key: 'testing/test1.txt'
        };
        var s3Result = await s3.getObject(s3params).promise();
        

        let body = {};

        body.dbResult = dbResult.Items;
        body.s3Result = s3Result.Body.toString('utf-8');

        response = {
            'statusCode': 200,
            'body': JSON.stringify(body)
        }

    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};

