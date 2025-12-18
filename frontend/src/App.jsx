import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// API URL: Uses environment variable or falls back to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/canvas';

function App() {
    // Canvas state
    const [canvasId, setCanvasId] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [elements, setElements] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    // Toast notifications
    const [toasts, setToasts] = useState([]);

    // Active tab for element forms
    const [activeTab, setActiveTab] = useState('rectangle');

    // Form states
    const [rectForm, setRectForm] = useState({
        x: 50, y: 50, width: 100, height: 80, color: '#6366f1', isFilled: true
    });

    const [circleForm, setCircleForm] = useState({
        x: 200, y: 200, radius: 50, color: '#10b981', isFilled: true
    });

    const [textForm, setTextForm] = useState({
        text: 'Hello Canvas!', x: 100, y: 100, fontSize: 24, fontFamily: 'Arial', color: '#e11d48', align: 'left'
    });

    const [imageForm, setImageForm] = useState({
        url: 'https://via.placeholder.com/150', x: 300, y: 100, width: 150, height: 150
    });

    // Toast helper
    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    // Refresh preview
    const refreshPreview = useCallback(async () => {
        if (!canvasId) return;
        try {
            // Add timestamp to prevent caching
            setPreviewUrl(`${API_URL}/${canvasId}/preview?t=${Date.now()}`);

            // Fetch elements info
            const res = await axios.get(`${API_URL}/${canvasId}/info`);
            setElements(res.data.elements || []);
        } catch (error) {
            console.error('Error refreshing preview:', error);
        }
    }, [canvasId]);

    // Initialize canvas
    const initCanvas = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/init`, dimensions);
            setCanvasId(res.data.id);
            setElements([]);
            showToast('Canvas initialized successfully!', 'success');

            // Set preview after a brief delay
            setTimeout(() => {
                setPreviewUrl(`${API_URL}/${res.data.id}/preview?t=${Date.now()}`);
            }, 100);
        } catch (error) {
            showToast('Failed to initialize canvas', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Add rectangle
    const addRectangle = async () => {
        if (!canvasId) {
            showToast('Please initialize canvas first', 'error');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/${canvasId}/add/rectangle`, rectForm);
            showToast('Rectangle added!', 'success');
            await refreshPreview();
        } catch (error) {
            showToast('Failed to add rectangle', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Add circle
    const addCircle = async () => {
        if (!canvasId) {
            showToast('Please initialize canvas first', 'error');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/${canvasId}/add/circle`, circleForm);
            showToast('Circle added!', 'success');
            await refreshPreview();
        } catch (error) {
            showToast('Failed to add circle', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Add text
    const addText = async () => {
        if (!canvasId) {
            showToast('Please initialize canvas first', 'error');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/${canvasId}/add/text`, textForm);
            showToast('Text added!', 'success');
            await refreshPreview();
        } catch (error) {
            showToast('Failed to add text', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Add image
    const addImage = async () => {
        if (!canvasId) {
            showToast('Please initialize canvas first', 'error');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/${canvasId}/add/image`, imageForm);
            showToast('Image added!', 'success');
            await refreshPreview();
        } catch (error) {
            showToast('Failed to add image', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Export PDF - same-origin request via Vite proxy
    const exportPdf = async () => {
        if (!canvasId) {
            showToast('Please initialize canvas first', 'error');
            return;
        }
        setLoading(true);
        showToast('Generating PDF...', 'info');

        try {
            const response = await fetch(`${API_URL}/${canvasId}/export/pdf`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const filename = `canvas-${canvasId.substring(0, 8)}.pdf`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showToast('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            showToast('Failed to export PDF', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Reset canvas
    const resetCanvas = async () => {
        if (canvasId) {
            try {
                await axios.delete(`${API_URL}/${canvasId}`);
            } catch (error) {
                console.error('Error deleting canvas:', error);
            }
        }
        setCanvasId(null);
        setPreviewUrl(null);
        setElements([]);
        showToast('Canvas reset', 'info');
    };

    return (
        <div className="app">
            {/* Header */}
            <header className="app-header">
                <h1>🎨 Canvas Builder</h1>
                <p>Create shapes, text, and images, then export as PDF</p>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {/* Controls Panel */}
                <aside className="controls-panel">
                    {/* Canvas Initialization */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon">📐</div>
                            <h2 className="card-title">Canvas Settings</h2>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Width (px)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={dimensions.width}
                                    onChange={e => setDimensions({ ...dimensions, width: parseInt(e.target.value) || 0 })}
                                    min="100"
                                    max="5000"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Height (px)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={dimensions.height}
                                    onChange={e => setDimensions({ ...dimensions, height: parseInt(e.target.value) || 0 })}
                                    min="100"
                                    max="5000"
                                />
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-block"
                            onClick={initCanvas}
                            disabled={loading}
                        >
                            {loading ? <span className="spinner"></span> : '✨'}
                            {canvasId ? 'Reinitialize Canvas' : 'Initialize Canvas'}
                        </button>
                    </div>

                    {/* Element Addition Cards */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon">🔷</div>
                            <h2 className="card-title">Add Elements</h2>
                        </div>

                        {/* Tabs */}
                        <div className="tabs">
                            <button
                                className={`tab ${activeTab === 'rectangle' ? 'active' : ''}`}
                                onClick={() => setActiveTab('rectangle')}
                            >
                                Rectangle
                            </button>
                            <button
                                className={`tab ${activeTab === 'circle' ? 'active' : ''}`}
                                onClick={() => setActiveTab('circle')}
                            >
                                Circle
                            </button>
                            <button
                                className={`tab ${activeTab === 'text' ? 'active' : ''}`}
                                onClick={() => setActiveTab('text')}
                            >
                                Text
                            </button>
                            <button
                                className={`tab ${activeTab === 'image' ? 'active' : ''}`}
                                onClick={() => setActiveTab('image')}
                            >
                                Image
                            </button>
                        </div>

                        {/* Rectangle Form */}
                        {activeTab === 'rectangle' && (
                            <div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">X Position</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={rectForm.x}
                                            onChange={e => setRectForm({ ...rectForm, x: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Y Position</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={rectForm.y}
                                            onChange={e => setRectForm({ ...rectForm, y: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Width</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={rectForm.width}
                                            onChange={e => setRectForm({ ...rectForm, width: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Height</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={rectForm.height}
                                            onChange={e => setRectForm({ ...rectForm, height: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Color</label>
                                    <div className="color-picker-wrapper">
                                        <input
                                            type="color"
                                            value={rectForm.color}
                                            onChange={e => setRectForm({ ...rectForm, color: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={rectForm.color}
                                            onChange={e => setRectForm({ ...rectForm, color: e.target.value })}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={rectForm.isFilled}
                                            onChange={e => setRectForm({ ...rectForm, isFilled: e.target.checked })}
                                        />
                                        <span>Fill shape</span>
                                    </label>
                                </div>
                                <button
                                    className="btn btn-success btn-block"
                                    onClick={addRectangle}
                                    disabled={loading || !canvasId}
                                >
                                    Add Rectangle
                                </button>
                            </div>
                        )}

                        {/* Circle Form */}
                        {activeTab === 'circle' && (
                            <div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">X Position (Center)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={circleForm.x}
                                            onChange={e => setCircleForm({ ...circleForm, x: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Y Position (Center)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={circleForm.y}
                                            onChange={e => setCircleForm({ ...circleForm, y: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Radius</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={circleForm.radius}
                                        onChange={e => setCircleForm({ ...circleForm, radius: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Color</label>
                                    <div className="color-picker-wrapper">
                                        <input
                                            type="color"
                                            value={circleForm.color}
                                            onChange={e => setCircleForm({ ...circleForm, color: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={circleForm.color}
                                            onChange={e => setCircleForm({ ...circleForm, color: e.target.value })}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={circleForm.isFilled}
                                            onChange={e => setCircleForm({ ...circleForm, isFilled: e.target.checked })}
                                        />
                                        <span>Fill shape</span>
                                    </label>
                                </div>
                                <button
                                    className="btn btn-success btn-block"
                                    onClick={addCircle}
                                    disabled={loading || !canvasId}
                                >
                                    Add Circle
                                </button>
                            </div>
                        )}

                        {/* Text Form */}
                        {activeTab === 'text' && (
                            <div>
                                <div className="form-group">
                                    <label className="form-label">Text Content</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={textForm.text}
                                        onChange={e => setTextForm({ ...textForm, text: e.target.value })}
                                        placeholder="Enter text..."
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">X Position</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={textForm.x}
                                            onChange={e => setTextForm({ ...textForm, x: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Y Position</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={textForm.y}
                                            onChange={e => setTextForm({ ...textForm, y: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Font Size</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={textForm.fontSize}
                                            onChange={e => setTextForm({ ...textForm, fontSize: parseInt(e.target.value) || 12 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Font Family</label>
                                        <select
                                            className="form-input"
                                            value={textForm.fontFamily}
                                            onChange={e => setTextForm({ ...textForm, fontFamily: e.target.value })}
                                        >
                                            <option value="Arial">Arial</option>
                                            <option value="Helvetica">Helvetica</option>
                                            <option value="Times New Roman">Times New Roman</option>
                                            <option value="Courier">Courier</option>
                                            <option value="Georgia">Georgia</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Color</label>
                                    <div className="color-picker-wrapper">
                                        <input
                                            type="color"
                                            value={textForm.color}
                                            onChange={e => setTextForm({ ...textForm, color: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={textForm.color}
                                            onChange={e => setTextForm({ ...textForm, color: e.target.value })}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <button
                                    className="btn btn-success btn-block"
                                    onClick={addText}
                                    disabled={loading || !canvasId}
                                >
                                    Add Text
                                </button>
                            </div>
                        )}

                        {/* Image Form */}
                        {activeTab === 'image' && (
                            <div>
                                <div className="form-group">
                                    <label className="form-label">Image URL</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={imageForm.url}
                                        onChange={e => setImageForm({ ...imageForm, url: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">X Position</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={imageForm.x}
                                            onChange={e => setImageForm({ ...imageForm, x: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Y Position</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={imageForm.y}
                                            onChange={e => setImageForm({ ...imageForm, y: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Width (optional)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={imageForm.width}
                                            onChange={e => setImageForm({ ...imageForm, width: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Height (optional)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={imageForm.height}
                                            onChange={e => setImageForm({ ...imageForm, height: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                                <button
                                    className="btn btn-success btn-block"
                                    onClick={addImage}
                                    disabled={loading || !canvasId}
                                >
                                    Add Image
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Export & Actions */}
                    <div className="card">
                        <div className="card-header">
                            <div className="card-icon">📄</div>
                            <h2 className="card-title">Export</h2>
                        </div>

                        <button
                            className="btn btn-primary btn-block"
                            onClick={exportPdf}
                            disabled={!canvasId || loading}
                            style={{ marginBottom: '0.75rem' }}
                        >
                            {loading ? <span className="spinner"></span> : '📥'} Download PDF
                        </button>

                        <button
                            className="btn btn-danger btn-block"
                            onClick={resetCanvas}
                            disabled={!canvasId}
                        >
                            🗑️ Reset Canvas
                        </button>
                    </div>
                </aside>

                {/* Preview Panel */}
                <section className="preview-panel">
                    {/* Status Bar */}
                    {canvasId && (
                        <div className="status-bar">
                            <div className="status-info">
                                <div className="status-item">
                                    <span className="status-dot"></span>
                                    <span>Connected</span>
                                </div>
                                <div className="status-item">
                                    <span>📐 {dimensions.width} × {dimensions.height}px</span>
                                </div>
                                <div className="status-item">
                                    <span>🔷 {elements.length} elements</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Canvas Preview */}
                    <div className="canvas-wrapper">
                        <div className="card-header" style={{ width: '100%', marginBottom: 0 }}>
                            <div className="card-icon">👁️</div>
                            <h2 className="card-title">Canvas Preview</h2>
                        </div>

                        <div className="canvas-container">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Canvas Preview"
                                    className="canvas-preview"
                                />
                            ) : (
                                <div className="canvas-placeholder">
                                    <div className="canvas-placeholder-icon">🎨</div>
                                    <p>Initialize a canvas to start creating!</p>
                                    <p style={{ fontSize: '0.85rem' }}>Set dimensions on the left and click "Initialize Canvas"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Elements List */}
                    {elements.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <div className="card-icon">📋</div>
                                <h2 className="card-title">Elements ({elements.length})</h2>
                            </div>
                            <div className="element-list">
                                {elements.map((el, idx) => (
                                    <div key={idx} className="element-item">
                                        <span className={`element-badge ${el.type}`}>{el.type}</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {el.type === 'text' ? `"${el.text}"` :
                                                el.type === 'image' ? 'External image' :
                                                    `(${el.x}, ${el.y})`}
                                        </span>
                                        <span
                                            style={{
                                                marginLeft: 'auto',
                                                width: 16,
                                                height: 16,
                                                borderRadius: 4,
                                                background: el.color || '#ccc',
                                                border: '1px solid var(--border-color)'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* Toast Notifications */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast ${toast.type}`}>
                        {toast.type === 'success' && '✅'}
                        {toast.type === 'error' && '❌'}
                        {toast.type === 'info' && 'ℹ️'}
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
