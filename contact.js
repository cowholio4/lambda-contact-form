var nodemailer = require('nodemailer');
var qs = require('qs');

var ses = require('nodemailer-ses-transport');
var transporter = nodemailer.createTransport(ses({
    accessKeyId: "ACCESS_KEY_ID",
    secretAccessKey: 'ACCEESS_KEY_SECRET',
    region: 'REGION'
}));

exports.handler = function(event, context) {

    body = qs.parse(event.body)
    console.log(body);
    required = [ "name", "message", "email" ];
    for(var r in required) {
        if( body.hasOwnProperty(r) ) {
            return context.error( { "error" : "missing required field: " + r });
        }

    }
    text = "Name: " + body.name + "\n";
    if(body.hasOwnProperty("affiliation") && body.affiliation.length > 0) {
        text += "Affiliation: " + body.affiliation + "\n";
    }
    text += "Email: " + body.email + "\n\n\n"
    text += body.message;

    options = {
        from: 'lamdba-contact@yourdomain.com',
        to: 'your_email@yourdomain.com',
        replyTo: body.email,
        subject: 'Contact Form [' + body.name + ']',
        text: text
    };
    on_done = function(error, info){
        if(error){ return context.error({"error": error}); }
        console.log( info );
        context.succeed({"status" : "sent"});
    };
    r = transporter.sendMail(options, on_done);
};
