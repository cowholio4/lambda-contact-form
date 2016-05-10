# Lambda-Contact

A simple lambda function created to allow contact form posts from our static website hosted on S3/Cloudfront.

I made this in August 2015 for a startup I joined and haven't really looked at it since. So I'm sure there are some improvements to be made.

# Instructions

1. Ensure your ~/.aws/credentials file is created
2. Run the deploy script and record your ARN 
    * npm install .
    * WEBSITE=https://www.cowholio4.com/ TO_EMAIL_ADDRESS=youremail@domain.com FROM_EMAIL_ADDRESS=youremial@domain.com AWS_REGION=us-west-2 node deploy.js
    * AWS_REGION=us-west-2 node deploy.js
3. Deploy your APP from the Amazon API Gateway. https://us-west-2.console.aws.amazon.com/apigateway/home
4. Update your contact form with the host from step 3.

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

1. Fix permission issue for Lambda.
2. Auto deploy return html for form from the deploy script
