// Add event listener for the upload button in the async form:
window.onload = function() {
  document.getElementById('async-form').onsubmit = asyncUpload;
}

// This function will run when the async form is submitted:
async function asyncUpload(event) {
  
  // Prevent the form from actually being submitted
  // which would cause the page to reload.
  event.preventDefault();
  
  // Limited to one file for simplicity
  const file = document.getElementById('file-async').files[0];
  
  // Create a FormData object to hold the file
  var formData = new FormData();
  formData.append('file', file);
  
  // The API endpoint url we will be uploading to:
  const url = "/upload-image-async";
  
  // fetch options
  const options = {
    body: formData,
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  };
  
  // Make the request and process response:
  var response = await fetch(url, options);
  const responseJson = await response.json();
  
  // Display signed URL from response in input element (and label and img):
  const asyncUrlField = document.getElementById("async-url");
  asyncUrlField.value = responseJson.url;
  asyncUrlField.style.display = "block";
  
  const asyncUrlLabel = document.getElementById("async-url-label");
  asyncUrlLabel.style.display = "block";
  
  const asyncImg = document.getElementById("async-img");
  asyncImg.src = responseJson.url;
  asyncImg.style.display = "block";
  
  
  return;
}