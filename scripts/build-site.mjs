import { cp, mkdir, rm } from 'node:fs/promises';

const output = '_site';

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await cp('index.html', `${output}/index.html`);
await cp('styles.css', `${output}/styles.css`);
await cp('dist', `${output}/dist`, { recursive: true });
