// Apply saved preferences before the first paint. Storage can be unavailable.
try {
  const theme = localStorage.getItem('jw-theme');
  if (theme === 'light') document.documentElement.dataset.theme = 'light';
  const motion = localStorage.getItem('jw-motion');
  if (motion === 'reduced' || (!motion && matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    document.documentElement.dataset.motion = 'reduced';
  }
} catch (_) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.dataset.motion = 'reduced';
}
