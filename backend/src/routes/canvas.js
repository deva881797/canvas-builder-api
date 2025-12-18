const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const router = express.Router();

// In-memory canvas storage
const canvases = {};

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ============================================
// POST /api/canvas/init - Initialize Canvas
// ============================================
router.post('/init', (req, res) => {
    try {
        const { width, height } = req.body;

        // Validate dimensions
        if (!width || !height) {
            return res.status(400).json({ error: 'Width and height are required' });
        }

        const w = parseInt(width);
        const h = parseInt(height);

        if (w <= 0 || h <= 0) {
            return res.status(400).json({ error: 'Dimensions must be positive numbers' });
        }

        if (w > 5000 || h > 5000) {
            return res.status(400).json({ error: 'Dimensions cannot exceed 5000px' });
        }

        const id = uuidv4();
        const canvas = createCanvas(w, h);
        const ctx = canvas.getContext('2d');

        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        canvases[id] = {
            canvas,
            width: w,
            height: h,
            elements: []
        };

        res.json({
            id,
            message: 'Canvas initialized successfully',
            width: w,
            height: h
        });
    } catch (error) {
        console.error('Error initializing canvas:', error);
        res.status(500).json({ error: 'Failed to initialize canvas' });
    }
});

// ============================================
// POST /api/canvas/:id/add/rectangle
// ============================================
router.post('/:id/add/rectangle', (req, res) => {
    try {
        const { id } = req.params;
        const { x, y, width, height, color = '#000000', isFilled = true } = req.body;

        if (!canvases[id]) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        if (x === undefined || y === undefined || !width || !height) {
            return res.status(400).json({ error: 'x, y, width, and height are required' });
        }

        const ctx = canvases[id].canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        if (isFilled) {
            ctx.fillRect(x, y, width, height);
        } else {
            ctx.strokeRect(x, y, width, height);
        }

        canvases[id].elements.push({
            type: 'rectangle',
            x, y, width, height, color, isFilled
        });

        res.json({ message: 'Rectangle added successfully' });
    } catch (error) {
        console.error('Error adding rectangle:', error);
        res.status(500).json({ error: 'Failed to add rectangle' });
    }
});

// ============================================
// POST /api/canvas/:id/add/circle
// ============================================
router.post('/:id/add/circle', (req, res) => {
    try {
        const { id } = req.params;
        const { x, y, radius, color = '#000000', isFilled = true } = req.body;

        if (!canvases[id]) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        if (x === undefined || y === undefined || !radius) {
            return res.status(400).json({ error: 'x, y, and radius are required' });
        }

        const ctx = canvases[id].canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        if (isFilled) {
            ctx.fill();
        } else {
            ctx.stroke();
        }

        canvases[id].elements.push({
            type: 'circle',
            x, y, radius, color, isFilled
        });

        res.json({ message: 'Circle added successfully' });
    } catch (error) {
        console.error('Error adding circle:', error);
        res.status(500).json({ error: 'Failed to add circle' });
    }
});

// ============================================
// POST /api/canvas/:id/add/text
// ============================================
router.post('/:id/add/text', (req, res) => {
    try {
        const { id } = req.params;
        const {
            text,
            x,
            y,
            fontSize = 16,
            fontFamily = 'Arial',
            color = '#000000',
            align = 'left'
        } = req.body;

        if (!canvases[id]) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        if (!text || x === undefined || y === undefined) {
            return res.status(400).json({ error: 'text, x, and y are required' });
        }

        const ctx = canvases[id].canvas.getContext('2d');
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = 'top';
        ctx.fillText(text, x, y);

        canvases[id].elements.push({
            type: 'text',
            text, x, y, fontSize, fontFamily, color, align
        });

        res.json({ message: 'Text added successfully' });
    } catch (error) {
        console.error('Error adding text:', error);
        res.status(500).json({ error: 'Failed to add text' });
    }
});

// ============================================
// POST /api/canvas/:id/add/image (URL-based)
// ============================================
router.post('/:id/add/image', async (req, res) => {
    try {
        const { id } = req.params;
        const { url, x, y, width, height } = req.body;

        if (!canvases[id]) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        if (!url || x === undefined || y === undefined) {
            return res.status(400).json({ error: 'url, x, and y are required' });
        }

        const img = await loadImage(url);
        const ctx = canvases[id].canvas.getContext('2d');

        const drawWidth = width || img.width;
        const drawHeight = height || img.height;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        canvases[id].elements.push({
            type: 'image',
            url, x, y,
            width: drawWidth,
            height: drawHeight
        });

        res.json({ message: 'Image added successfully' });
    } catch (error) {
        console.error('Error adding image:', error);
        res.status(500).json({ error: 'Failed to load or add image' });
    }
});

// ============================================
// POST /api/canvas/:id/add/image-upload (File upload)
// ============================================
router.post('/:id/add/image-upload', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { x = 0, y = 0, width, height } = req.body;

        if (!canvases[id]) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required' });
        }

        const img = await loadImage(req.file.buffer);
        const ctx = canvases[id].canvas.getContext('2d');

        const drawWidth = width ? parseInt(width) : img.width;
        const drawHeight = height ? parseInt(height) : img.height;

        ctx.drawImage(img, parseInt(x), parseInt(y), drawWidth, drawHeight);

        canvases[id].elements.push({
            type: 'image',
            x: parseInt(x),
            y: parseInt(y),
            width: drawWidth,
            height: drawHeight
        });

        res.json({ message: 'Image uploaded and added successfully' });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload or add image' });
    }
});

// ============================================
// GET /api/canvas/:id/export/pdf
// ============================================
router.get('/:id/export/pdf', (req, res) => {
    try {
        const { id } = req.params;

        if (!canvases[id]) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        const { canvas, width, height } = canvases[id];

        // Get canvas as PNG buffer
        const buffer = canvas.toBuffer('image/png');

        // Create PDF with compression enabled
        const doc = new PDFDocument({
            size: [width, height],
            compress: true,
            info: {
                Title: 'Canvas Export',
                Author: 'Canvas Builder API',
                Creator: 'Canvas Builder API'
            }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=canvas-${id}.pdf`);

        // Pipe PDF to response
        doc.pipe(res);

        // Add the canvas image to PDF
        doc.image(buffer, 0, 0, {
            width: width,
            height: height
        });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({ error: 'Failed to export PDF' });
    }
});

// ============================================
// GET /api/canvas/:id/preview - Get canvas as PNG
// ============================================
router.get('/:id/preview', (req, res) => {
    try {
        const { id } = req.params;

        if (!canvases[id]) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        const { canvas } = canvases[id];
        const buffer = canvas.toBuffer('image/png');

        res.setHeader('Content-Type', 'image/png');
        res.send(buffer);

    } catch (error) {
        console.error('Error getting preview:', error);
        res.status(500).json({ error: 'Failed to get preview' });
    }
});

// ============================================
// GET /api/canvas/:id/info - Get canvas info
// ============================================
router.get('/:id/info', (req, res) => {
    try {
        const { id } = req.params;

        if (!canvases[id]) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        const { width, height, elements } = canvases[id];

        res.json({
            id,
            width,
            height,
            elementCount: elements.length,
            elements
        });

    } catch (error) {
        console.error('Error getting canvas info:', error);
        res.status(500).json({ error: 'Failed to get canvas info' });
    }
});

// ============================================
// DELETE /api/canvas/:id - Delete canvas
// ============================================
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;

        if (!canvases[id]) {
            return res.status(404).json({ error: 'Canvas not found' });
        }

        delete canvases[id];

        res.json({ message: 'Canvas deleted successfully' });

    } catch (error) {
        console.error('Error deleting canvas:', error);
        res.status(500).json({ error: 'Failed to delete canvas' });
    }
});

module.exports = router;
