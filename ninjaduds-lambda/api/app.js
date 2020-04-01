
// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let AWS = require("aws-sdk");
let response;
let dynamodb = null;

if(process.env.EnvType == 'xxLocalxx'){
    let config = {
      "region":"local",
      "endpoint": `http://${process.env.LocalIp}:${process.env.LocalDynamoDbPort}`
    };

    dynamodb = new AWS.DynamoDB(config);
}else{
    dynamodb = new AWS.DynamoDB(); 
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

        const destparams = {
            Bucket: process.env.Bucket,
            Key: 'testing/test1.txt',
            Body: event.Body.message,
            ContentType: "text/plain"
        };

        const putResult = await s3.putObject(destparams).promise();

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
        
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: `hello world2`
                // location: ret.data.trim()
            })
        }

        let table = process.env.TableName;
        let params = {
            TableName: table,
            Key: {
                'PK': {S:"alan.purugganan@gmail.com"},
                'SK': {S:"ORDER#1"}
            }
        };

        let result = await dynamodb.getItem(params).promise()
        console.log(JSON.stringify(result))

        const s3params = {
            Bucket: process.env.Bucket,
            Key: 'testing/test1.txt'
        };
        var data = await s3.getObject(s3params).promise();
        console.log(data.Body.toString('utf-8'))



        

    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};

