import { createRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/start/client';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<StartClient />);
}
