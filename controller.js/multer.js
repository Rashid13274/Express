exports.uploadSingleFile = (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file selected!');
    }
    res.status(200).send(`File uploaded: ${req.file.filename}`);
  };
  
  exports.uploadMultipleFiles = (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send('No files selected!');
    }
    const filenames = req.files.map(file => file.filename);
    res.status(200).send(`Files uploaded: ${filenames.join(', ')}`);
  };

  exports.customRateLimitTest = (req, res, next) =>{
    res.status(200).send(`custom rate limit request made !`);
  }
  