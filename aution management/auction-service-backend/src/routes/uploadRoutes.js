const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

// Single image upload
router.post('/image', upload.single('image'), uploadController.uploadImage);

// Multiple images upload
router.post('/images', upload.array('images', 10), uploadController.uploadMultiple);

// Delete image
router.delete('/image', uploadController.deleteImage);

module.exports = router;
