// The regular Node/Express stuff:
const express = require('express');
const app = express();
app.use(express.static('public'));

// I will use the UUID package for s3 file names
const { v4: uuidv4 } = require('uuid');

// The AWS functionality is isolated for clarity:
const aws = require('./aws.js');

// Multer processes the file in the request body
// This allows one file to be uploaded at a time.
var multer = require('multer');

var memoryStorage = multer.memoryStorage();
var memoryUpload = multer({
	storage: memoryStorage,
	limits: {
		//fileSize: 4*1024, // 4KB filesize limit
    fileSize: 10*1024*1024, // 10 Mb filesize limit
		files: 1
	}
}).single('file');


// This route accepts a POST request from a regular HTML form:
app.post('/upload-image-form', memoryUpload, async function(req, res) {

  try {
    const file = req.file;
    
    /*
    The file object has the following fields:
    
    fieldname: 'file' // This was specified in the file input field in the HTML
    originalname:     // The original name of the file
    encoding:         // The encoding of the file, don't worry about
                         this unless you want to look at the bytes.
    mimetype:         // This will tell you what the filetype is, even if there
                         is no extension, or if it's wrong.
    buffer:           // This is the actual data from the file
    size:             // Only some files will have this, the file's size in bytes
    */
    
    
    // This is optional, but a way to find the extension
    // of an image file.
    //const fileExt = file.mimetype.split("/");

    // These
    const upload = {
      file: file,
      
      /* You may want to store this metadata in S3, but it's optional */
      filetype: file.mimetype,
      
      /* You may want to add this to the filename */
      //fileExt: fileExt[fileExt.length - 1],
      
      /* You may want to use the original filename */
      //filename: file.originalname,
      
      /* We're going to use a random UUID file name in this example.
         One thing that this does is makes sure it is unique.
         If you upload a file with the same name it will overwrite the
         existing file! */
      id: uuidv4()
    }
  
    // Upload the file, see ./helpers/aws.js
    const response = await aws.upload(upload);

    // Confirm upload succeeded:
    if (!response.success || response.error) {
      throw "Reponse Error: " + response.error;
    }
    
    /* - - - - -
      You might want to do something with the response.key or
      response.url here.
    - - - - - */
    
    
    // Because our bucket is not publically viewable we need to
    // get a signed URL to view the uploaded file. You DO NOT want
    // to store this signed URL in a DB, it will expire. You will
    // want to store either the key or url from the AWS response
    // above.
    
    // Get a new signed URL now that the file is uploaded:
    // Getting a signed URL requires the Bucket Name and the
    // file id, but we are using the same bucket name for everything
    // in this example. See ./helpers/aws.js for how this works.
    const url = await aws.getSignedUrl(upload.id);

    // Very simple HTML response containing the URL and it rendered
    // as an image (if the file is not an image this will look like
    // a broken image).
    res.status(200).send(`
      <p>
        <strong>Signed URL:</strong> <a href="${url}">${url}</a>
      </p>
      <h4>If it's an image:</h4>
      <img src="${url}" width="400" />
    `);
    
  } catch (err) {
    console.log("ERROR:", err)
    res.status(500).send({error: 'Error'})
    return;
  }

})


// This route accepts accepts a POST request from a JavaScript frontend app:
app.post('/upload-image-async', memoryUpload, async function(req, res) {
  
  /*
    This is very similar to the route above, see that for more detailed comments
  */

  try {
    const file = req.file;
    const fileExtArr = file.mimetype.split("/");

    // Object for ./helpers/aws.js
    const upload = {
      file: file,
      filetype: file.mimetype,
      id: uuidv4()
    }
  
    // Upload happens in ./helpers/aws.js:
    const response = await aws.upload(upload);

    if (!response.success || response.error) {
      throw "Reponse Error: " + response.error;
    }
    
    /* - - - - -
      You might want to do something with the response.key or
      response.url here.
    - - - - - */
    
      
    // Get a new signed URL now that the file is uploaded:
    const url = await aws.getSignedUrl(upload.id);

    // Return JSON:
    res.status(200).json({url: url});
    
  } catch (err) {
    console.log("ERROR:", err)
    res.status(500).send({error: 'Error'})
    return;
  }

})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
