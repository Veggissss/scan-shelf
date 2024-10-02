require('dotenv').config({ path: './public.env' });

const express = require('express');
const bodyParser = require('body-parser');
const vision = require('@google-cloud/vision');

// Create a new instance of the Vision API client
const client = new vision.ImageAnnotatorClient();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '10mb' }));

// POST /ocr route to process base64 image and return OCR results
app.post('/ocr', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided in the request body' });
    }

    // Send base64 image to Google Vision API
    const [result] = await client.textDetection({
      image: { content: image }
    });

    const detections = result.textAnnotations;
    if (!detections.length) {
      return res.status(400).json({ error: 'No text detected' });
    }

    // Return the text detection result to the requester
    res.json({ text: detections[0].description });
  } catch (error) {
    console.error('Error processing OCR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
