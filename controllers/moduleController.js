const Module = require('../models/Module');

exports.getModules = async (req, res) => {
  try {
    const modules = await Module.find().sort('order');
    res.json({ success: true, data: modules });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }
    res.json({ success: true, data: module });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createModule = async (req, res) => {
  try {
    const module = await Module.create(req.body);
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};