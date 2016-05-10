"use strict";
var config = require('./config.js'),
    qs = require('qs'),
    nodemailer = require('nodemailer'),
    AWS = require('aws-sdk'),
    sesTransport = require('nodemailer-ses-transport');
var ses = new AWS.SES();
var transporter = nodemailer.createTransport(sesTransport({ ses: ses }));


exports.handler = function (e, context) {
    var body = qs.parse(e.body),
        required = [ "name", "message", "email" ],
        options = {},
        i = null,
        r = null,
        text = null,
        on_done = null;
    console.log(body);
    // make sure we have all the needed fields
    for (i = 0; i < required.length; i += 1) {
        r = required[i];
        if (!body.hasOwnProperty(r)) {
            return context.error({ "error" : "missing required field: " + r });
        }
    }

    text = "Name: " + body.name + "\n";
    if (body.hasOwnProperty("affiliation") && body.affiliation.length > 0) {
        text += "Affiliation: " + body.affiliation + "\n";
    }
    text += "Email: " + body.email + "\n\n\n";
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
            return context.error({"error": error});
        }
        console.log(info);
        context.succeed({"status" : "sent"});
    };
    r = transporter.sendMail(options, on_done);
};
