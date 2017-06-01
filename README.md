# Lambda-Contact

A simple lambda function created to allow contact form posts from our static website hosted on S3/Cloudfront.

I made this in August 2015 for a startup I joined. In 2017, I modified it to use serverless.

# Instructions

1. Install [serverless](https://serverless.com/)
2. Run `npm install`
3. Change the config.json file to match your 'from' to 'to'.
4. serverless deploy  

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

1. Auto deploy return html for form from the deploy script
