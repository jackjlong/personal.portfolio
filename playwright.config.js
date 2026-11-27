import { defineConfig } from '@playwright/test';

const port = Number(process.env.PORT) || 5174;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  timeout: 20000,
  expect: { timeout: 5000 },
  use: {
    baseURL: `http://localhost:${port}`,
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 5000,
  },
  projects: [{ name: 'chrome-desktop' }],
  webServer: {
    command: `npx http-server . -p ${port} -c-1 -s`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
  },
});
