'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '../utils/registerSW';

export default function ClientInit() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
