// starts http-server on a free port for the shots and record scripts
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { createRequire } from 'node:module';

const bin = createRequire(import.meta.url).resolve('http-server/bin/http-server');

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

export async function startServer() {
  const port = await freePort();
  const base = `http://localhost:${port}`;
  const child = spawn(process.execPath, [bin, '.', '-p', String(port), '-c-1', '-s'], { stdio: 'ignore' });
  let exited = null;
  child.on('exit', (code) => (exited = code));
  for (let i = 0; i < 50; i++) {
    if (exited !== null) break;
    try {
      await fetch(base);
      return { base, stop: () => child.kill() };
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  child.kill();
  console.error(`couldn't start the static server on port ${port} (exit ${exited ?? 'timed out'}). is http-server installed? try npm install`);
  process.exit(1);
}
