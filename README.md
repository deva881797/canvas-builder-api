# Canvas Builder API with PDF Export

A full-stack application for creating and manipulating a virtual canvas with shapes, text, and images, then exporting as a downloadable PDF.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running

### Start Development Environment

```bash
# Clone the repository
git clone https://github.com/deva881797/canvas-builder-api.git
cd canvas-builder-api

# Build and start containers
docker-compose up --build
```

### Access the Application
- **Live Demo**: https://canvas-builder-api-gray.vercel.app/
- **Frontend (Local)**: http://localhost:5173
- **Backend API (Local)**: http://localhost:3000

## 📁 Project Structure

```
canvas-builder-api/
├── docker-compose.yml          # Docker orchestration
├── backend/
│   ├── Dockerfile              # Backend container config
│   ├── package.json            # Node.js dependencies
│   └── src/
│       ├── index.js            # Express server entry point
│       └── routes/
│           └── canvas.js       # Canvas API endpoints
└── frontend/
    ├── Dockerfile              # Frontend container config
    ├── package.json            # React dependencies
    ├── vite.config.js          # Vite configuration
    ├── index.html              # HTML entry point
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Main application component
        └── index.css           # Styles
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/canvas/init` | Initialize canvas with dimensions |
| POST | `/api/canvas/:id/add/rectangle` | Add rectangle shape |
| POST | `/api/canvas/:id/add/circle` | Add circle shape |
| POST | `/api/canvas/:id/add/text` | Add text element |
| POST | `/api/canvas/:id/add/image` | Add image from URL |
| POST | `/api/canvas/:id/add/image-upload` | Upload and add image |
| GET | `/api/canvas/:id/preview` | Get canvas as PNG |
| GET | `/api/canvas/:id/export/pdf` | Export canvas as PDF |
| GET | `/api/canvas/:id/info` | Get canvas info |
| DELETE | `/api/canvas/:id` | Delete canvas |

## 📝 API Examples

### Initialize Canvas
```bash
curl -X POST http://localhost:3000/api/canvas/init \
  -H "Content-Type: application/json" \
  -d '{"width": 800, "height": 600}'
```

### Add Rectangle
```bash
curl -X POST http://localhost:3000/api/canvas/{id}/add/rectangle \
  -H "Content-Type: application/json" \
  -d '{"x": 50, "y": 50, "width": 100, "height": 80, "color": "#ff0000", "isFilled": true}'
```

### Add Circle
```bash
curl -X POST http://localhost:3000/api/canvas/{id}/add/circle \
  -H "Content-Type: application/json" \
  -d '{"x": 200, "y": 200, "radius": 50, "color": "#00ff00", "isFilled": true}'
```

### Add Text
```bash
curl -X POST http://localhost:3000/api/canvas/{id}/add/text \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello World", "x": 100, "y": 100, "fontSize": 24, "fontFamily": "Arial", "color": "#000000"}'
```

### Add Image from URL
```bash
curl -X POST http://localhost:3000/api/canvas/{id}/add/image \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/image.jpg", "x": 300, "y": 100, "width": 150, "height": 150}'
```

### Export as PDF
```bash
curl http://localhost:3000/api/canvas/{id}/export/pdf --output canvas.pdf
```

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **node-canvas** - Server-side canvas rendering
- **PDFKit** - PDF generation with compression
- **Multer** - File upload handling
- **UUID** - Unique identifier generation

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Axios** - HTTP client

### Development
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## ⚡ Features

- ✅ Server-side canvas rendering with node-canvas
- ✅ Add rectangles and circles (filled or stroked)
- ✅ Add text with custom font, size, and color
- ✅ Add images from URL or file upload
- ✅ Real-time canvas preview
- ✅ PDF export with compression
- ✅ Modern dark theme UI with glassmorphism effects
- ✅ Toast notifications for user feedback
- ✅ Hot-reload development environment

## 🔧 Environment Variables

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api/canvas` |

## 📄 License

For Academic Purpose Only.

## 👤 Author

Devashish Arvind Ghate

---

Made with ❤️ using Node.js and React
