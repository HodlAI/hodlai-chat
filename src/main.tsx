// Highlight.js styles
import 'highlight.js/styles/github-dark.css';
// KaTeX styles
import 'katex/dist/katex.min.css';

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <App />
)