var express = require('express');
var app = express();


// S3 Variables and Config:
var AWS = require('aws-sdk');
var s3 = new AWS.S3({
  signatureVersion: 'v4'
});
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
var bucketName = process.env.S3BUCKET;
var multer = require("multer");
var memoryStorage = multer.memoryStorage();
var memoryUpload = multer({
	storage: memoryStorage,
	limits: {
		filesize: 20*1024*1024,
		files: 1
	}
}).single("file");

const uuidv1 = require('uuid/v1');

app.use(express.static('public'));

app.post("/upload", memoryUpload, function(req, res) {
  var error = false;
  var errorMessage = "";
  if (req.body.password == process.env.PASSWORD) {
    var file = req.file;
    var filetype = file.mimetype;
    var fileExtArr = file.mimetype.split("/");
    var fileExt = fileExtArr[fileExtArr.length - 1];
    var filename = file.originalname;
    var date = new Date;
    var id = uuidv1();
    
    var params = {
      Bucket: bucketName,
      Key: id + "." + fileExt,
      Body: file.buffer,
      ContentType: filetype
    };

    s3.putObject(params, function(err, data) {
      if (err) {
        resError(req, res, err);
        return;
      } else {
        
        /*
        If you want to do something with this:
        
        var newFile = {
          url: "https://" + bucketName + ".s3.amazonaws.com/" + params.Key,
          filetype: filetype,
          uploadDate: date
        }
        */
        
        res.redirect("/upload?u=" + params.Key);
        
        //res.send("<img src='" + newFile.url + "'><p><a href='" + newFile.url + "'>" + newFile.url + "</a></p>");
      }
    });    
  } else {
    resError(req, res, "wrong password");
    return;
  }
});


app.get("/upload", function(req, res) {
  var key = req.query.u;
  
  var params = {
    Bucket: bucketName,
    Key: key
  };
  
  // Using Pre Signed URL:
  var url = s3.getSignedUrl('getObject', params);
  res.send("<img src='" + url + "'><p><a href='" + url + "'>" + url + "</a></p>");
  
  
  
  /*
  To return actual data:
  
  s3.getObject(params, function(err, data) {
     if (err) {
       resError(req, res, "Can't get object " + key);
     } else {
       
       var newFile = {
          url: "https://" + bucketName + ".s3.amazonaws.com/" + key
        }
       res.send(data);
       //res.send("<img src='" + newFile.url + "'><p><a href='" + newFile.url + "'>" + newFile.url + "</a></p>");
     }

     //  data = {
     //   AcceptRanges: "bytes", 
     //   ContentLength: 3191, 
     //    ContentType: "image/jpeg", 
     //   ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
     //   LastModified: <Date Representation>, 
     //   Metadata: {
     //   }, 
     //   TagCount: 2, 
     //   VersionId: "null"
     //  }
   });
*/
});


function resError(req, res, message) {
  res.status(400);
  res.send("Error: " + message);
}

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
