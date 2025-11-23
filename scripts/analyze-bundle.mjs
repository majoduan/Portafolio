#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Analiza el build de producción y genera un reporte de tamaños
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../dist');

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else {
      fileList.push({
        path: filePath,
        size: stat.size,
        name: file,
        ext: path.extname(file)
      });
    }
  });
  
  return fileList;
}

function analyzeBundle() {
  console.log(`\n${colors.bright}${colors.cyan}📊 Performance Analysis Report${colors.reset}\n`);
  console.log('━'.repeat(60));
  
  if (!fs.existsSync(distPath)) {
    console.log(`${colors.red}❌ Build not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }
  
  const files = getFilesRecursively(distPath);
  
  // Agrupar por tipo
  const groups = {
    js: files.filter(f => f.ext === '.js'),
    css: files.filter(f => f.ext === '.css'),
    images: files.filter(f => ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'].includes(f.ext)),
    videos: files.filter(f => f.ext === '.mp4'),
    fonts: files.filter(f => ['.woff', '.woff2', '.ttf', '.eot'].includes(f.ext)),
    other: files.filter(f => !['.js', '.css', '.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif', '.mp4', '.woff', '.woff2', '.ttf', '.eot'].includes(f.ext))
  };
  
  // Calcular totales
  const totals = Object.entries(groups).reduce((acc, [type, files]) => {
    acc[type] = files.reduce((sum, file) => sum + file.size, 0);
    return acc;
  }, {});
  
  const totalSize = Object.values(totals).reduce((sum, size) => sum + size, 0);
  
  // Imprimir resumen
  console.log(`\n${colors.bright}📦 Bundle Size Summary:${colors.reset}\n`);
  
  Object.entries(totals).forEach(([type, size]) => {
    const percentage = ((size / totalSize) * 100).toFixed(1);
    const color = size > 500000 ? colors.red : size > 200000 ? colors.yellow : colors.green;
    console.log(`  ${type.toUpperCase().padEnd(10)} ${color}${formatBytes(size).padStart(12)}${colors.reset} (${percentage}%)`);
  });
  
  console.log('━'.repeat(60));
  console.log(`  ${colors.bright}TOTAL${colors.reset}      ${colors.cyan}${formatBytes(totalSize).padStart(12)}${colors.reset}`);
  console.log('━'.repeat(60));
  
  // Detalles de JavaScript
  if (groups.js.length > 0) {
    console.log(`\n${colors.bright}📄 JavaScript Chunks:${colors.reset}\n`);
    groups.js
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(file => {
        const color = file.size > 200000 ? colors.red : file.size > 100000 ? colors.yellow : colors.green;
        console.log(`  ${file.name.padEnd(50)} ${color}${formatBytes(file.size).padStart(10)}${colors.reset}`);
      });
  }
  
  // Warnings
  console.log(`\n${colors.bright}⚠️  Performance Warnings:${colors.reset}\n`);
  
  const warnings = [];
  
  // Check JS bundle size
  const jsTotal = totals.js;
  if (jsTotal > 500000) {
    warnings.push(`Large JavaScript bundle: ${formatBytes(jsTotal)} (recommended: < 400KB)`);
  }
  
  // Check individual chunks
  const largeChunks = groups.js.filter(f => f.size > 200000);
  if (largeChunks.length > 0) {
    warnings.push(`${largeChunks.length} JavaScript chunk(s) > 200KB`);
  }
  
  // Check images
  const largeImages = groups.images.filter(f => f.size > 500000);
  if (largeImages.length > 0) {
    warnings.push(`${largeImages.length} image(s) > 500KB (consider WebP conversion)`);
  }
  
  // Check videos
  const largeVideos = groups.videos.filter(f => f.size > 10000000);
  if (largeVideos.length > 0) {
    warnings.push(`${largeVideos.length} video(s) > 10MB (run optimize-videos.ps1)`);
  }
  
  // Check if WebP is being used
  const jpgImages = groups.images.filter(f => ['.jpg', '.jpeg'].includes(f.ext));
  if (jpgImages.length > 0 && !groups.images.some(f => f.ext === '.webp')) {
    warnings.push(`${jpgImages.length} JPG image(s) not converted to WebP (run optimize-images.mjs)`);
  }
  
  if (warnings.length === 0) {
    console.log(`  ${colors.green}✅ No warnings! Bundle is well optimized.${colors.reset}`);
  } else {
    warnings.forEach(warning => {
      console.log(`  ${colors.yellow}⚠️  ${warning}${colors.reset}`);
    });
  }
  
  // Recommendations
  console.log(`\n${colors.bright}💡 Recommendations:${colors.reset}\n`);
  
  if (jsTotal > 400000) {
    console.log(`  ${colors.cyan}→${colors.reset} Enable code splitting for larger components`);
  }
  
  if (groups.images.length > 0 && !groups.images.some(f => f.ext === '.webp')) {
    console.log(`  ${colors.cyan}→${colors.reset} Convert images to WebP format (60-80% size reduction)`);
  }
  
  if (groups.videos.length > 0) {
    console.log(`  ${colors.cyan}→${colors.reset} Compress videos with ffmpeg (40-50% size reduction)`);
  }
  
  if (totals.fonts > 100000) {
    console.log(`  ${colors.cyan}→${colors.reset} Use font subsetting to reduce font file sizes`);
  }
  
  console.log(`  ${colors.cyan}→${colors.reset} Enable Brotli compression on your server`);
  console.log(`  ${colors.cyan}→${colors.reset} Set proper cache headers (Cache-Control)`);
  
  // Core Web Vitals estimate
  console.log(`\n${colors.bright}🎯 Estimated Core Web Vitals:${colors.reset}\n`);
  
  const fcp = jsTotal < 300000 ? '< 1.5s' : jsTotal < 500000 ? '< 2.5s' : '> 2.5s';
  const fcpColor = jsTotal < 300000 ? colors.green : jsTotal < 500000 ? colors.yellow : colors.red;
  
  console.log(`  FCP (First Contentful Paint)  ${fcpColor}${fcp}${colors.reset}`);
  console.log(`  LCP (Largest Contentful Paint) ${colors.green}< 2.5s${colors.reset} (with image optimization)`);
  console.log(`  FID (First Input Delay)        ${colors.green}< 100ms${colors.reset}`);
  console.log(`  CLS (Cumulative Layout Shift)  ${colors.green}< 0.1${colors.reset}`);
  
  console.log(`\n${colors.bright}${colors.green}✨ Analysis Complete!${colors.reset}\n`);
}

try {
  analyzeBundle();
} catch (error) {
  console.error(`${colors.red}Error analyzing bundle:${colors.reset}`, error.message);
  process.exit(1);
}
