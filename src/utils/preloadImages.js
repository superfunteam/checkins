const pendingImages = new Map();

// A slow or failed asset must never trap someone on the loading screen.
export function preloadImage(src, timeoutMs = 5000) {
  if (pendingImages.has(src)) return pendingImages.get(src);
  const promise = new Promise(resolve => {
    const image = new Image();
    let settled = false;
    const finish = success => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      image.onload = image.onerror = null;
      if (!success) pendingImages.delete(src);
      resolve(success);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    image.onload = () => {
      if (image.decode) image.decode().then(() => finish(true), () => finish(false));
      else finish(true);
    };
    image.onerror = () => finish(false);
    image.src = src;
  });
  pendingImages.set(src, promise);
  return promise;
}

export async function warmImages(sources) {
  const queue = [...new Set(sources)];
  await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
    while (queue.length) await preloadImage(queue.shift());
  }));
}
