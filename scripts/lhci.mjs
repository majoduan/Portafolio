#!/usr/bin/env node
/**
 * Lighthouse CI (`pnpm lhci`) con un Chrome propio en Windows.
 *
 * Problema: chrome-launcher (lo usa Lighthouse) crea un perfil temporal y lo
 * borra al terminar cada run; en Windows Chrome aún tiene bloqueados archivos
 * del perfil ("EPERM: unlink ... Account Web Data") y el proceso muere antes
 * de guardar el resultado. Pasar otro --user-data-dir por chromeFlags no
 * ayuda: Chrome se queda con el primero.
 *
 * Solución: arrancar aquí un Chrome headless con perfil propio y decirle a
 * Lighthouse que se conecte a él (`--collect.settings.port`); así no crea ni
 * borra perfiles. El perfil es nuevo en cada ejecución (Chrome fija el idioma
 * al crearlo) y se audita con `--lang=en-US`, el idioma del SSR: con otro
 * idioma la hidratación reescribe el hero bajo el intro y Lighthouse cuenta
 * ese salto como CLS aunque nadie lo vea. Los perfiles viejos se borran al
 * arrancar, con Chrome cerrado.
 *
 * En macOS/Linux se ejecuta lhci tal cual (chrome-launcher no tiene el bug).
 * `CHROME_PATH` permite forzar el binario.
 *
 * Uso: pnpm lhci [flags extra de lhci]   (p. ej. --collect.numberOfRuns=1)
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

const LHCI_ARGS = ['dlx', '@lhci/cli@0.15', 'autorun', ...process.argv.slice(2)];
const PROFILE_PREFIX = 'lhci-chrome-profile-';

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const candidates = [
    join(process.env.ProgramFiles || 'C:\\Program Files', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ];
  return candidates.find((p) => p && existsSync(p)) || null;
}

function freshProfileDir() {
  const base = tmpdir();
  for (const entry of readdirSync(base)) {
    if (!entry.startsWith(PROFILE_PREFIX)) continue;
    try { rmSync(join(base, entry), { recursive: true, force: true, maxRetries: 2 }); } catch { /* bloqueado: siguiente vez */ }
  }
  const dir = join(base, `${PROFILE_PREFIX}${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

async function waitForCdp(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch { /* aún no escucha */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Chrome no expuso el puerto de depuración ${port} en ${timeoutMs} ms`);
}

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('exit', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}

async function main() {
  if (process.platform !== 'win32') {
    process.exit(await run('pnpm', LHCI_ARGS));
  }

  const chrome = findChrome();
  if (!chrome) {
    console.error('No se encontró chrome.exe. Define CHROME_PATH o instala Google Chrome.');
    process.exit(1);
  }

  const profile = freshProfileDir();
  const port = await freePort();

  // Los tres --disable-*background* evitan que Chrome trate la pestaña de
  // Lighthouse como pestaña en segundo plano (timers y rAF throttled).
  const chromeProc = spawn(chrome, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--lang=en-US',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true });

  const killChrome = () => { if (!chromeProc.killed) { try { chromeProc.kill(); } catch { /* ya cerrado */ } } };
  process.on('SIGINT', () => { killChrome(); process.exit(130); });
  process.on('SIGTERM', () => { killChrome(); process.exit(143); });

  let code = 1;
  try {
    await waitForCdp(port);
    console.log(`Lighthouse CI → Chrome headless en 127.0.0.1:${port} (perfil ${profile})`);
    code = await run('pnpm', [...LHCI_ARGS, `--collect.settings.port=${port}`]);
  } finally {
    killChrome();
  }
  process.exit(code);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
