/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: './public.env' });

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = process.env.PUBLIC_DIR || path.join(__dirname, 'public');
const client = new vision.ImageAnnotatorClient();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(publicDir));

/**
 * List all folders and their files in the public directory
 */
app.get('/api/folders', (req, res) => {
  fs.readdir(publicDir, { withFileTypes: true }, (err, entries) => {
    if (err) return res.status(500).send(err);

    const folderPromises = entries
      .filter(entry => entry.isDirectory())
      .map(entry => {
        const folderPath = path.join(publicDir, entry.name);
        return new Promise(resolve => {
          fs.readdir(folderPath, (err, files) => {
            resolve({
              folderName: entry.name,
              files: err ? [] : files,
            });
          });
        });
      });

    // Wait for all folder promises to resolve
    Promise.all(folderPromises).then(folders => res.json(folders));
  });
});

/**
 * Serve a thumbnail image from an EPUB file inside a folder
 */
app.get('/api/thumbnail/:folderName/:fileName', (req, res) => {
  const { folderName, fileName } = req.params;
  const epubPath = path.join(publicDir, folderName, fileName);

  fs.stat(epubPath, err => {
    if (err) return res.status(404).send('EPUB file not found.');

    const zip = new AdmZip(epubPath);
    const imageEntry = zip.getEntries().find(entry => {
      const ext = path.extname(entry.entryName).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.bmp'].includes(ext);
    });
    if (!imageEntry) {
      return res.status(404).send('No thumbnail image found in EPUB.');
    }

    const imageBuffer = zip.readFile(imageEntry);
    if (!imageBuffer) {
      return res.status(500).send('Failed to extract image.');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  });
});

/**
 * Perform OCR on a base64 image using Google Vision API
 */
app.post('/api/ocr', async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'No image provided in the request body' });
  }

  try {
    const [result] = await client.textDetection({ image: { content: image } });
    const detections = result.textAnnotations;
    if (!detections.length) {
      return res.status(400).json({ error: 'No text detected' });
    }

    res.json({ text: detections[0].description });
  } catch (error) {
    console.error('Error processing OCR:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
