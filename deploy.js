"use strict";
var config = require('./config.js');
var AWS = require('aws-sdk');
var lambda = new AWS.Lambda({apiVersion: '2015-03-31'});
var iam = new AWS.IAM({apiVersion: '2010-05-08'});
var file_system = require('fs');
var archiver = require('archiver');
var concat = require('concat-stream');

if (config.to === "YOUR_EMAIL" || config.from === 'YOUR_EMAIL') {
    console.error("set your email address in config.js");
    process.exit(-1);
}


var role_arn = null;

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
                }
            });
        } else {
            console.log(data);
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
