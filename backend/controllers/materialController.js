import Material from '../models/materialModel.js';

export const uploadMaterial = async (req, res) => {
  try {
    const { title, description } = req.body;
    const courseId = req.params.courseId;
    const uploadedBy = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const material = new Material({
      title,
      description,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      courseId,
      uploadedBy,
    });

    await material.save();

    res.status(201).json({
      success: true,
      data: material,
      message: 'Material uploaded successfully',
    });
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload material',
      error: error.message,
    });
  }
};

export const getMaterialsByCourse = async (req, res) => {
  try {
    const materials = await Material.find({ courseId: req.params.courseId })
      .populate('uploadedBy', 'name email')
      .sort('-uploadedAt');

    res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get materials',
      error: error.message,
    });
  }
};