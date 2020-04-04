
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

exports.dbDelete = async (event, context) => {
    try {

        let requestBody = JSON.parse(event.body);
        
        let dbResult = await docClient.delete(requestBody).promise();
        
        //=================
        //Setup Response
        //=================
        response = {
            'statusCode': 200,
            'body': JSON.stringify("success")
        }
        
    } catch (err) {
        console.log(err);
       
        response = {
            'statusCode': 500,
            'body': JSON.stringify(err)
        }
    }

    return response;
};

exports.dbUpdate = async (event, context) => {
    try {

        let requestBody = JSON.parse(event.body);
        
        let dbResult = await docClient.update(requestBody).promise();
        
        //=================
        //Setup Response
        //=================
        response = {
            'statusCode': 200,
            'body': JSON.stringify("success")
        }
        
    } catch (err) {
        console.log(err);
       
        response = {
            'statusCode': 500,
            'body': JSON.stringify(err)
        }
    }

    return response;
};

exports.dbGet = async (event, context) => {
    try {

        let requestBody = JSON.parse(event.body);
        
        let dbResult = await docClient.get(requestBody).promise();
        
        //=================
        //Setup Response
        //=================
        response = {
            'statusCode': 200,
            'body': JSON.stringify(dbResult.Item)
        }
        
    } catch (err) {
        console.log(err);
       
        response = {
            'statusCode': 500,
            'body': JSON.stringify(err)
        }
    }

    return response;
};

exports.dbPut = async (event, context) => {
    try {

        let requestBody = JSON.parse(event.body);
        
        let dbResult = await docClient.put(requestBody).promise();
        
        //=================
        //Setup Response
        //=================
        response = {
            'statusCode': 200,
            'body': JSON.stringify(dbResult.Body)
        }
        
    } catch (err) {
        console.log(err);
        
        response = {
            'statusCode': 500,
            'body': JSON.stringify(err)
        }
    }

    return response;
};

exports.s3Download = async (event, context) => {
    try {

        let requestBody = JSON.parse(event.body);
        
        //=================
        //S3 Write examples
        //=================
        const s3 = new AWS.S3();

        let s3params = {
            Bucket: process.env.Bucket,
            Key: requestBody.Key
        };

        let s3Result = await s3.getObject(s3params).promise();

        data = s3Result.Body;

        if(!s3Result.ContentType.startsWith("text"))
            data = data.toString('base64');
 
        //=================
        //Setup Response
        //=================
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                content: data,
                contentType: s3Result.ContentType
            })
            
        }
        
    } catch (err) {
        console.log(err);
        
        response = {
            'statusCode': 500,
            'body': JSON.stringify(err)
        }
    }

    return response;
};

exports.s3Upload = async (event, context) => {
    try {

        let requestBody = JSON.parse(event.body);
        
        //=================
        //S3 Write examples
        //=================
        const s3 = new AWS.S3();

        data = requestBody.Content;

        if(requestBody.IsBase64Encoded){
            data = Buffer.from(data, 'base64');
        }
        
        let s3Params = {
            Bucket: process.env.Bucket,
            Key: requestBody.Key,
            Body: data,
            ContentType: requestBody.ContentType
        };
        
        let putResult = await s3.putObject(s3Params).promise();
        
        //=================
        //Setup Response
        //=================
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: `Data stored`,
                key: requestBody.Key
            })
        }
        
        
    } catch (err) {
        console.log(err);
        
        response = {
            'statusCode': 500,
            'body': JSON.stringify(err)
        }
    }

    return response;
};

exports.writeExamples = async (event, context) => {
    try {

        let requestBody = JSON.parse(event.body);
        
        //=================
        //S3 Write examples
        //=================
        const s3 = new AWS.S3();
        
        let s3Params = {
            Bucket: process.env.Bucket,
            Key: 'testing/test1.txt',
            Body: requestBody.message,
            ContentType: "text/plain"
        };
        
        let putResult = await s3.putObject(s3Params).promise();
        
        //=================
        //Db Write examples
        //=================
        let dbParams = {
            TableName: process.env.TableName,
            Item: {
                'PK': 'alan.purugganan@gmail.com',
                'SK': new Date().toISOString(),
                'message': requestBody.message
            }
        }
        
        let dbResult = await docClient.put(dbParams).promise();
        
        //=================
        //Setup Response
        //=================
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: `Data stored`
            })
        }
        
        
    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};

exports.readExamples = async (event, context) => {
    try {
       
        //=================
        //S3 Read examples
        //=================
        const s3 = new AWS.S3();

        let s3params = {
            Bucket: process.env.Bucket,
            Key: 'testing/test1.txt'
        };
        let s3Result = await s3.getObject(s3params).promise();

        //=================
        //Db Read examples
        //=================
        let dbParams = {
            TableName: process.env.TableName,
            KeyConditionExpression: 'PK = :hkey', //and RangeKey > :rkey',
            ExpressionAttributeValues: {
              ':hkey': 'alan.purugganan@gmail.com'
            }
        };
        
        let dbResult = await docClient.query(dbParams).promise();

        //=================
        //Setup Response
        //=================
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                dbResult : dbResult.Items,
                s3Result : s3Result.Body.toString('utf-8')
            })
        };

    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};

