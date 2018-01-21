# AWS Image Upload

Standalone AWS Image upload example app.

### NPM Dependencies

``` 
    "express": "^4.16.2",
    "aws-sdk": "^2.185.0",
    "multer": "^1.3.0",
    "uuid": "^3.2.1"
```


### Cors Configuration for S3 Bucket

```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedMethod>PUT</AllowedMethod>
        <AllowedMethod>DELETE</AllowedMethod>
        <AllowedMethod>HEAD</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>
```