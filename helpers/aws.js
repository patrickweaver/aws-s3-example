// The AWS package is used for all AWS services,
// we only need the S3 part:
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
  signatureVersion: 'v4'
});

// Store your AWS creds in ENV variables:
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Your bucket isn't secret, but you may want to use
// different buckets for dev and production so it's
// helpful to store in an ENV variable.
var bucketName = process.env.S3BUCKET;


// This function is called from both upload routes,
// see server.js for the structure of the upload object
async function upload(uploadObject) {
  
  try {
    
    // AWS S3 Upload params:
    var params = {
      // S3 stores files in buckets, each bucket
      // has a globally unique name.
      Bucket: bucketName,

      // This will be the filename in AWS
      Key: uploadObject.id,

      // This is the contents of the file.
      Body: uploadObject.file.buffer,

      // This is optional, but your file in S3 won't have Content-Type
      // metadata unless you include it.
      ContentType: uploadObject.filetype
    };
  
  
    const responseData = await s3.putObject(params).promise();
    
    // Likely this won't happen because an error will be thrown,
    // but it's good to check just in case. ¯\_(ツ)_/¯ 
    if (!responseData) {
      throw "Upload failed"
    }
      
    // The response data has a single property, "ETag",
    // you probably won't need to do anything with it.

    const s3Data = {
      success: true,

      // This key is what you would store in a DB, we didn't
      // get this back from S3, but since there wasn't an error
      // we trust that it is saved.
      key: params.Key

      // Or, the url below could be stored if the permissions on the bucket
      // or the upload are publically viewable.
      //url: "https://" + bucketName + ".s3.amazonaws.com/" + params.Key
    }

    // Send the object with success and the key back to server.js
    return(s3Data)
      
    
  } catch(error) {
    console.log("AWS S3 Error:", error)
    return {error: true, success: false}
  }
    
}

// This function will get a signed URL which allows
// access to non public objects, and objects in non
// public buckets for a limited time.
async function getSignedUrl(key) {
  
  // We are already authenticated so we just need the
  // bucket name and the object's key.
  var params = {
    Bucket: bucketName,
    Key: key
  };
  
  // The getSignedUrl method returns the url.
  const url = await s3.getSignedUrl('getObject', params);
  return url
}

module.exports = {
  upload: upload,
  getSignedUrl: getSignedUrl
}