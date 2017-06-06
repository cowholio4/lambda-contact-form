# Lambda-Contact

A simple aws-lambda function that allows you to have a contact form on your static website. (hosted on S3/Cloudfront) 
Currently, emails are sent via SES.

I made this aws-lambda function in August 2015 for a startup I joined and in 2017 I modified it to use serverless.

# Instructions

1. Install [serverless](https://serverless.com/)
2. Run `npm install`
3. Change the config.json file to match your 'from' to 'to'.
4. Run `serverless deploy`
5. Copy the URL from the output of the previous command and use it in your contact form.

## Exmaple Form
```
<form method="post" action="https://API_GATEWAY/contact">
    <input name="name" required="true" placeholder="Name" type="text" id="name">
    <input name="affiliation" placeholder="Affiliation" type="text">
    <input name="email" placeholder="E-mail Address" type="email" required="true">
    <textarea name="message" required="true" placeholder="Your message" maxlength="999"></textarea>
    <button type="submit">Send</button>
</form>
```

# TODO
1. Add more robust spam protection
