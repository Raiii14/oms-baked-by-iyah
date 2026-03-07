import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// React.StrictMode intentionally double-mounts components in development,
// which creates two Supabase auth instances competing for the same Web Lock
// (lock:sb-...-auth-token). The second instance steals the lock and breaks
// all auth operations. StrictMode is removed to prevent this.
root.render(<App />);