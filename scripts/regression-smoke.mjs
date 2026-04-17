import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const checks = [
  'src/features/central/CentralPage.tsx',
  'src/features/admin/AdminPage.tsx',
  'src/features/onboarding/OnboardingProvider.tsx',
  'src/features/onboarding/OnboardingChecklist.tsx',
  'src/features/pwa/PwaProvider.tsx',
  'src/features/central/export-utils.ts',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'public/icons/icon-maskable.png',
  'vercel.json',
  '.env.example',
];

const missing = checks.filter((entry) => !existsSync(resolve(root, entry)));
if (missing.length > 0) {
  console.error('Missing required files for release baseline:');
  missing.forEach((entry) => console.error(`- ${entry}`));
  process.exit(1);
}

const appRouter = readFileSync(resolve(root, 'src/app/AppRouter.tsx'), 'utf8');
const routes = readFileSync(resolve(root, 'src/app/routes.ts'), 'utf8');
const viteConfig = readFileSync(resolve(root, 'vite.config.ts'), 'utf8');
const readme = readFileSync(resolve(root, 'README.md'), 'utf8');

const assertions = [
  ['central admin route', routes.includes('centralAdmin') && appRouter.includes('routes.centralAdmin')],
  ['central page route', appRouter.includes('routes.central')],
  ['pwa provider wired', readFileSync(resolve(root, 'src/main.tsx'), 'utf8').includes('PwaProvider')],
  ['onboarding provider wired', readFileSync(resolve(root, 'src/main.tsx'), 'utf8').includes('OnboardingProvider')],
  ['vite pwa plugin enabled', viteConfig.includes('VitePWA') && viteConfig.includes('navigateFallback')],
  ['export note documented', readme.includes('Exportacao de dados')],
];

const failed = assertions.filter(([, passed]) => !passed);
if (failed.length > 0) {
  console.error('Regression smoke checks failed:');
  failed.forEach(([label]) => console.error(`- ${label}`));
  process.exit(1);
}

console.log('Regression smoke checks passed.');
