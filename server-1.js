//  ========================== Using Mongoose with Express.js ========================== //
// This code sets up a simple Express.js server with Mongoose to manage products in a MongoDB database.
// It includes routes to create, read, update, and delete products, handling errors appropriately.

// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const Product = require('./models/Product');

// dotenv.config();
// const app = express();

// app.use(express.json());

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// // Routes

// // Create a product
// app.post('/api/products', async (req, res) => {
//   try {
//     const product = await Product.create(req.body);
//     res.status(201).json({ success: true, data: product });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// });

// // Get all products
// app.get('/api/products', async (req, res) => {
//   const products = await Product.find();
//   res.status(200).json({ success: true, data: products });
// });

// // Get single product
// app.get('/api/products/:id', async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
//     res.status(200).json({ success: true, data: product });
//   } catch (err) {
//     res.status(400).json({ success: false, message: 'Invalid ID format' });
//   }
// });

// // Update a product
// app.put('/api/products/:id', async (req, res) => {
//   try {
//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
//     res.status(200).json({ success: true, data: product });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// });

// // Delete a product
// app.delete('/api/products/:id', async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
//     res.status(200).json({ success: true, message: 'Product deleted', data: product });
//   } catch (err) {
//     res.status(400).json({ success: false, message: 'Invalid ID format' });
//   }
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//  ========================== Using Mongoose with Express.js ========================== //

// ################################################################################################## // 

// ========================== Using Express.js for CRUD Operations ========================== //
// This code sets up a simple Express.js server to handle CRUD operations on an in-memory array
// of user objects. It includes routes to create, read, update, and delete users, handling errors appropriately.

// const express = require('express');
// const app = express();

// const arrObject = [
//   {id: 1, name:'john-wick', age: 45,  city: 'newyork'},
//   {id: 2, name: 'sam', age: 46, city: 'new-jersy'}
// ]

// app.use(express.json());


// app.post('/user', async(req, res) =>{
//   try{
//     const  data = req.body;
//     arrObject.push(data);
//     return res.status(201).json({success: true, data: arrObject});
//   }
//   catch(err){
//     return res.status(500).json({success: false, message: err.message});
//   }
// })


// app.put('/user/:id', async(req, res) =>{
//   try{
//     const id  = req.params.id;
//     const data  = req.body;
//     const index  = arrObject.findIndex((element) => element.id  == id);
//     if(!index){
//       return res.status(404).json({success: false, message: `no data with that id:  ${id} `});
//     }
//     arrObject[index] = { ...arrObject[index], ...data};
//     return res.status(200).json({success: true, data: arrObject});
//   }
//   catch(err){
//     return res.status(500).json({success: false, message: err.message});

//   }
// })


// app.delete('/user/:id', async (req, res) =>{
//   try{
//     const id = req.params.id;
//     const index =arrObject.findIndex((element) => element.id == id);
  
//     if(index == -1){
//       return res.status(404).json({success: false,message: `no data with that id:  ${id} `});
//     }
  
//     arrObject.splice(index, 1);
//     return res.status(200).json({success: true,  data: arrObject});
//   }
//   catch(err){
//     return res.status(500).json({success: false, message: err.message});
//   }
// })


// app.get('/user', async(req, res) =>{
//   try{
//     return res.status(200).json({success: true, data: arrObject});

//   }catch(err){
//     return res.status(500).json({success: false, message: err.message});

//   }
// })

// const PORT  = 3001;
// app.listen(PORT, () => console.log(`server is listening on localhost:3001`));

// ========================== Using Express.js for CRUD Operations ========================== //



// ################################################################################################## // 


// ========================== Express.js + Mongoose  + Docker ========================== //

// This code sets up a simple Express.js server with Mongoose to manage products in a MongoDB database.
// It includes routes to create, read, update, and delete products, handling errors appropriately.

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();
const app = express();

app.use(express.json());

// Connect to MongoDB
mongoose.connect(`mongodb://admin:qwerty@mongo:27017/products?authSource=admin`)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes

// Create a product
app.post('/api/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get all products
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.status(200).json({ success: true, data: products });
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
});

// Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deleted', data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// ################################################################################################## // 
