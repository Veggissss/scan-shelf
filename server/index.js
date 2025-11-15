/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './public.env') });

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const sharp = require('sharp');
const vision = require('@google-cloud/vision');
const AdmZip = require('adm-zip');

const app = express();
const PORT = process.env.PORT || 3001;
const publicDir = process.env.PUBLIC_DIR || path.join(__dirname, 'public');
const client = new vision.ImageAnnotatorClient();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(publicDir));

/**
 * List all folders and their files in the public directory
 */
app.get('/api/folders', (_, res) => {
    fs.readdir(publicDir, { withFileTypes: true }, (err, entries) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read public directory' });
        }

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
app.get('/api/thumbnail/:folderName/:fileName', async (req, res) => {
    const { folderName, fileName } = req.params;

    // Require .epub files only
    if (path.extname(fileName).toLowerCase() !== '.epub') {
        return res.status(400).send('Invalid file type. Only .epub files are supported.');
    }

    // Validate path
    const base = path.resolve(publicDir);
    const epubPath = path.resolve(base, folderName, fileName);
    if (!epubPath.startsWith(base + path.sep)) {
        return res.status(400).send('Invalid path.');
    }

    try {
        await fs.promises.stat(epubPath);
    } catch {
        return res.status(404).send('EPUB file not found.');
    }

    try {
        const zip = new AdmZip(epubPath);
        const imageEntry = zip.getEntries().find(entry => {
            if (entry.isDirectory) {
                return false;
            }
            const ext = path.extname(entry.entryName).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.bmp', '.webp'].includes(ext);
        });

        if (!imageEntry) {
            return res.status(404).send('No thumbnail image found in EPUB.');
        }

        const imageBuffer = zip.readFile(imageEntry);
        if (!imageBuffer) {
            return res.status(500).send('Failed to extract image.');
        }

        const resized = await sharp(imageBuffer)
            .resize(1125, 1600, { fit: 'cover', position: 'center', withoutEnlargement: true })
            .jpeg({ quality: 100, })
            .toBuffer();

        // Cache for a week
        const cacheTime = 60 * 60 * 24 * 7
        const headers = {
            'Content-Type': 'image/jpeg',
            'Cache-Control': `public, max-age=${cacheTime}, immutable`,
        };
        res.set(headers);
        res.send(resized);
    } catch (err) {
        console.error('Error generating thumbnail:', err);
        res.status(500).send('Failed to generate thumbnail.');
    }
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
        const detections = result && result.textAnnotations;
        if (!Array.isArray(detections) || detections.length === 0) {
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
