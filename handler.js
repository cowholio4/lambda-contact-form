"use strict";
var config = require('./config.json'),
    qs = require('qs'),
    nodemailer = require('nodemailer'),
    AWS = require('aws-sdk'),
    sesTransport = require('nodemailer-ses-transport');
var ses = new AWS.SES();
var transporter = nodemailer.createTransport(sesTransport({ ses: ses }));

module.exports.contact =  function(e, context, callback) {
    var referrer = config.website;

    const error_response = {
      statusCode: 500,
      body: 'Could not send message' 
    };
    const response = {
      statusCode: 301,
      headers: {
         'Location': referrer + "?sent=true"
      },
      body: 'Redirecting you back to ' + referrer 
    }


    var body = qs.parse(e.body),
        required = [ "name", "message", "email" ],
        options = {},
        i = null,
        r = null,
        text = null,
        on_done = null;
    // make sure we have all the needed fields
    for (i = 0; i < required.length; i += 1) {
        r = required[i];
        if (!body.hasOwnProperty(r)) {
            console.log("missing data for " + r)
            return callback(null, error_response);
        }
    }

    text = "Name: " + body.name + "\n";
    if (body.hasOwnProperty("affiliation") && body.affiliation.length > 0) {
        text += "Affiliation: " + body.affiliation + "\n";
    }
    text += "Email: " + body.email + "\n";
    text += "Source IP: " + e.requestContext.identity.sourceIp + "\n";
    text += "User Agent: " + e.requestContext.identity.userAgent + "\n";
    text +=  "\n\n\n";
    text += body.message;

    options = {
        from: config.from,
        to: config.to,
        replyTo: body.email,
        subject: 'Contact Form [' + body.name + ']',
        text: text
    };
    on_done = function (error, info) {
        if (error) {
	    console.log(error)
	    return callback(null, error_response);
        }
        console.log(info);
	callback(null, response);
    };
    r = transporter.sendMail(options, on_done);
};
