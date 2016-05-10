"use strict";
var AWS = require('aws-sdk');
var lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
var iam = new AWS.IAM({apiVersion: '2010-05-08'});
var apigateway = new AWS.APIGateway();
var file_system = require('fs');
var archiver = require('archiver');
var concat = require('concat-stream');

var config = {
    to: process.env.TO_EMAIL_ADDRESS,
    from: process.env.FROM_EMAIL_ADDRESS,
    website: process.env.WEBSITE
};

file_system.writeFile("config.json", JSON.stringify(config), function (err) {
    if (err) {
        console.log(err);
        process.exit(-1);
    }
});


if (config.to === "YOUR_EMAIL" || config.from === 'YOUR_EMAIL') {
    console.error("set your email address in config.js");
    process.exit(-1);
}


var role_arn = null;
var lambda_arn = null;
var account_id =  null;
var api_arn = null;
var api_id = null;
var region = 'us-west-2';

function giveApiLambdaPermissions() {
    var params = {
        Action: 'lambda:InvokeFunction',
        FunctionName: lambda_arn,
        Principal: 'apigateway.amazonaws.com',
        StatementId: '95aa6ba6-7a8a-fafa-2312-5f88aab70fa6',
        SourceArn: api_arn
    };
    lambda.removePermission({FunctionName: lambda_arn, StatementId: '95aa6ba6-7a8a-fafa-2312-5f88aab70fa6'}, function () {
        lambda.addPermission(params, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                console.log(data);
            }
        });
    });
}
function createAPI() {
    var swagger = require('./swagger.json'),
        uri = 'arn:aws:apigateway:us-west-2:lambda:path/2015-03-31/functions/' + lambda_arn + '/invocations',
        url = "'" + config.website + "?sent=true'";
    swagger.paths['/contact'].post['x-amazon-apigateway-integration'].uri = uri;
    swagger.paths['/contact'].post['x-amazon-apigateway-integration'].responses['application/json'].responseParameters['method.response.header.Location'] = url;
    swagger.paths['/contact'].post['x-amazon-apigateway-integration'].responses['application/x-www-form-urlencoded'].responseParameters['method.response.header.Location'] = url;

    apigateway.getRestApis({}, function (err, data) {
        if (err) {
            console.error(err);
        }
        var i = 0;
        for (i = 0; i < data.items.length; i += 1) {
            if (data.items[i].name === 'lambda-contact') {
                api_id = data.items[i].id;
                account_id = lambda_arn.split(':')[4];
                api_arn = 'arn:aws:execute-api:' + region + ':' + account_id + ':' + api_id + '/*/POST/'
                api_arn = 'arn:aws:execute-api:' + region + ':' + account_id + ':*/*/POST/'
                return giveApiLambdaPermissions();
            }
        }
        apigateway.importRestApi({body: JSON.stringify(swagger)}, function (err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                api_id = data.id;
                account_id = lambda_arn.split(':')[4];
                api_arn = 'arn:aws:execute-api:' + region + ':' + account_id + ':' + api_id + '/*/POST/'
                api_arn = 'arn:aws:execute-api:' + region + ':' + account_id + ':*/*/POST/'
                giveApiLambdaPermissions();
            }
        });
    });
}
function uploadZippedFile(zipped_file) {
    var params = {
        Code: {
            ZipFile: zipped_file
        },
        FunctionName: 'lambda-contact',
        Handler: 'contact.handler',
        Role: role_arn,
        Runtime: 'nodejs'
    };
    lambda.createFunction(params, function (err, data) {
        if (err) {
            lambda.updateFunctionCode({FunctionName: 'lambda-contact', ZipFile: zipped_file}, function (err, data) {
                if (err) {
                    console.log(err);
                    console.error("could not upload function");
                } else {
                    console.log(data);
                    lambda_arn = data.FunctionArn;
                    createAPI();
                }
            });
        } else {
            console.log(data);
            lambda_arn = data.FunctionArn;
            createAPI();
        }
    });
}
function uploadFunction() {
    // store the archive in a stream
    var archive = archiver.create('zip', {}),
        concatStream = concat(uploadZippedFile);
    archive.pipe(concatStream);
    archive.bulk([{
        expand: true,
        cwd: "./",
        src: ["**/*"],
        dot: false
    }]);
    archive.finalize();
}
function allowRoleToSendEmail() {
    var policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": ["ses:SendEmail", "ses:SendRawEmail"],
                "Resource": "*"
            }
        ]
    },
        params = {
            "PolicyDocument": JSON.stringify(policy),
            "PolicyName": 'lambda-email',
            "RoleName": 'lambda-contact'
        };
    iam.putRolePolicy(params, function (err) {
        if (err) {
            console.log(err, err.stack);
        } else {
            uploadFunction();
        }
    });

}
function createRole() {
    // Create role with email permissions
    var rolePolicy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "",
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "lambda.amazonaws.com"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        },
        params = {
            AssumeRolePolicyDocument: JSON.stringify(rolePolicy),
            RoleName: 'lambda-contact',
        };
    iam.createRole(params);
    iam.getRole({RoleName: 'lambda-contact'}, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log(data.Role.Arn);
            role_arn = data.Role.Arn;
            allowRoleToSendEmail();
        }
    });
}

createRole();
