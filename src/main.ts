import { createApp } from './ui/app.js';

const root = document.createElement('div');
root.id = 'root';
document.body.append(root);

createApp(root, {
  now: () => Date.now(),
  random: () => Math.random(),
});
