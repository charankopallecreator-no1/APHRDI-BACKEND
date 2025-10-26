const { translate } = require('@vitalets/google-translate-api');

exports.translate = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    const result = await translate(text, { to: targetLanguage });
    res.json({ success: true, data: { translatedText: result.text } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};