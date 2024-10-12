/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: './public.env' });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const vision = require('@google-cloud/vision');

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Create a new instance of the Vision API client
const client = new vision.ImageAnnotatorClient();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '10mb' }));

// Get the public directory path from the environment variable
const publicDir = process.env.PUBLIC_DIR || path.join(__dirname, 'public');

// Make the public folder available
app.use(express.static(publicDir));

// List all folders in the public directory
app.get('/api/folders', (req, res) => {
  fs.readdir(publicDir, { withFileTypes: true }, (err, files) => {
    if (err) return res.status(500).send(err);

    const foldersPromises = files
      .filter(file => file.isDirectory())
      .map(folder => {
        const folderPath = path.join(publicDir, folder.name);
        return new Promise((resolve) => {
          fs.readdir(folderPath, (err, files) => {
            if (err) return resolve({ folderName: folder.name, files: [] }); // Handle no file error
            resolve({ folderName: folder.name, files });
          });
        });
      });

    // Wait for all folder promises to resolve
    Promise.all(foldersPromises).then(folders => {
      res.json(folders);
    });
  });
});

// Endpoint to serve thumbnail image
app.get('/api/thumbnail/:folderName/:fileName', (req, res) => {
  const { folderName, fileName } = req.params;
  const epubPath = path.join(publicDir, folderName, fileName);

  // Check if the file exists
  fs.stat(epubPath, (err) => {
    if (err) return res.status(404).send('EPUB file not found.');

    // Load the EPUB file as a ZIP archive
    const zip = new AdmZip(epubPath);
    const zipEntries = zip.getEntries(); // Get all entries in the ZIP

    // Filter the entries to find the first .jpg file
    const jpgEntry = zipEntries.find(entry => entry.entryName.endsWith('.jpg'));

    if (!jpgEntry) {
      return res.status(404).send('No JPG image found in EPUB.');
    }

    // Read the image file as a buffer
    const imageBuffer = zip.readFile(jpgEntry);

    if (!imageBuffer) {
      return res.status(500).send('Failed to extract image.');
    }

    // Send the image buffer
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  });
});

// POST /ocr route to process base64 image and return OCR results
app.post('/api/ocr', async (req, res) => {
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
