//test line llll
//test line8
To debug through API gateway:
1) First run the following in the terminal:
a) sam local start-api -d 5858
b) then start up the debugger with this configuration:
  {
    "version": "0.2.0",
    "configurations": [

      {
        "name": "Attach to SAM CLI",
        "type": "node",
        "request": "attach",
        "address": "localhost",
        "port": 5858,
        "localRoot": "${workspaceRoot}/my-sam-app-nodejs/hello-world",
        "remoteRoot": "/var/task",
        "protocol": "inspector",
        "stopOnEntry": false
      }
    ]
  }

To start up local dyanmodb:
1) navigate in Terminal to C:\Users\blank\Documents\dynamodb_local_latest
2) Use the following command: java -D"java.library.path=./DynamoDBLocal_lib" -jar DynamoDBLocal.jar
