const express = require('express');
const app = express();
const uploadRoutes = require('./route/multer');



app.use('/api/uploads', uploadRoutes); // Use the upload routes

// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000'); //http://localhost:3000/api/uploads/ratelimit
});
