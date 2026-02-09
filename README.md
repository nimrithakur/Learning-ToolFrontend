# Learning Tool Frontend

Frontend for the Smart Video Learning Tool - a clean, responsive interface for processing educational videos and transcripts.

## 🚀 Quick Start

### Local Development

Simply open `index.html` in your browser, or use a local server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx http-server -p 8080
```

Then open: http://localhost:8080

## 📁 Files

- **index.html** - Main HTML structure
- **script.js** - JavaScript functionality
- **styles.css** - Styling

## 🔧 Configuration

Update the API endpoint in `script.js`:

```javascript
const API_BASE_URL = 'https://your-backend-url.vercel.app/api';
```

## 🌐 Deploy on Vercel

### Option 1: Via Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Deploy!

### Option 2: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

## ✨ Features

- Process YouTube videos by URL
- Process pasted transcripts
- View AI-generated summaries
- Interactive quiz generation
- Key points extraction
- Responsive design

## 🎨 Customization

Edit `styles.css` to customize:
- Colors
- Fonts
- Layout
- Animations

## 📝 License

MIT
