const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Specify the path to your Downloads folder
const downloadsPath = path.join(require("os").homedir(), "Downloads");

// Check if the directory exists; create it if it doesn't
if (!fs.existsSync(downloadsPath)) {
  fs.mkdirSync(downloadsPath, { recursive: true });
}
// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, downloadsPath); // Folder to save the files
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Filename format
  }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/; // Allowed file extensions
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extname && mimeType) {
    cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
};

// Initialize multer
const multerConfig = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: fileFilter,
});

module.exports = multerConfig;
