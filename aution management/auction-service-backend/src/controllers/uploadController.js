const supabase = require('../utils/supabase');

class UploadController {
  // Upload single image
  async uploadImage(req, res) {
    try {
      if (!req.file && !req.body.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const file = req.file || req.body.file;
      const fileName = `${Date.now()}-${file.originalname || 'image.jpg'}`;
      const filePath = `auction-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('auction-images')
        .upload(filePath, file.buffer || file, {
          contentType: file.mimetype || 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image', details: error.message });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('auction-images')
        .getPublicUrl(filePath);

      res.json({
        success: true,
        url: urlData.publicUrl,
        path: filePath
      });
    } catch (error) {
      console.error('Upload controller error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  // Upload multiple images
  async uploadMultiple(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      const uploadPromises = req.files.map(async (file) => {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
        const filePath = `auction-images/${fileName}`;

        const { data, error } = await supabase.storage
          .from('auction-images')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('auction-images')
          .getPublicUrl(filePath);

        return {
          url: urlData.publicUrl,
          path: filePath,
          originalName: file.originalname
        };
      });

      const results = await Promise.all(uploadPromises);

      res.json({
        success: true,
        images: results
      });
    } catch (error) {
      console.error('Multiple upload error:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }

  // Delete image
  async deleteImage(req, res) {
    try {
      const { path } = req.body;

      if (!path) {
        return res.status(400).json({ error: 'Image path required' });
      }

      const { error } = await supabase.storage
        .from('auction-images')
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return res.status(500).json({ error: 'Failed to delete image' });
      }

      res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
      console.error('Delete controller error:', error);
      res.status(500).json({ error: 'Failed to delete image' });
    }
  }
}

module.exports = new UploadController();
