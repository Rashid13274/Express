<!--========================================== Multer ================================================ -->

#### How Multer Works:- 
1. Install Multer: First, you need to install Multer via npm:
`npm install multer`

2. Set Up Multer in Your Application: Import Multer in your application and configure it. You can specify storage options, file size limits, and file filters.

3. Define Storage: You can choose to store files either in memory (memoryStorage) or on the disk (diskStorage).

4. Configure Middleware: Create a middleware using multer() and specify the storage options.
Storage Options:

**destination**:
  Specifies the folder where files will be saved.
**filename**: 
 Defines how files will be named when saved.
**File Limits**:
You can set limits like fileSize to restrict the size of uploaded files.
**File Filtering:**
fileFilter allows you to restrict the types of files that can be uploaded.

<!--===================================================================================================== -->
