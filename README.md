# Lambda-Contact

A simple lambda function created to allow contact form posts from our static website hosted on S3/Cloudfront.

I made this in August 2015 for a startup I joined and haven't really looked at it since. So I'm sure there are some improvements to be made.

# Instructions

1. Upload to contact.js to Lamdba 
    * Record your ARN
2. Create a new API in the Amazon API Gateway. https://us-west-2.console.aws.amazon.com/apigateway/home?region=us-west-2#/apis/create 
    * Replace YOUR_LAMBDAS_ARN with your ARN from step 1.
    * Replace your Website with your website.
3. Update your contact form with the host from step 2.

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

1. Create deployment script. (easy wth aws-cli)
2. Instructions. :D 
3. Look into using policies instead of using tokens.
