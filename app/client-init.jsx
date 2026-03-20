'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '../utils/registerSW';
import { initTelemetry } from '../utils/telemetry';

export default function ClientInit() {
  useEffect(() => {
    registerServiceWorker();
    initTelemetry();
  }, []);

  return null;
}
