'use client';
import { useSyncExternalStore } from 'react';
import { bootStore } from '../lib/boot/bootStore';

const getSnapshot = () => bootStore.get().done;
const getServerSnapshot = () => false;

/**
 * true cuando el boot screen ya desapareció (o nunca se mostró en esta sesión
 * SPA). Las animaciones de entrada del hero (typewriter, contadores, typeface
 * cycle) se gatillan con esto para no competir con la carga de la escena 3D
 * mientras el overlay aún tapa la página.
 */
export function useBootDone(): boolean {
  return useSyncExternalStore(bootStore.subscribe, getSnapshot, getServerSnapshot);
}
