// "Umva": plays the clips that read questions and explanations aloud. One clip at a time. Each is fetched whole
// (not streamed with range requests), so the service worker keeps it and it plays again without a connection.

let player: HTMLAudioElement | null = null;
let current: string | null = null;
let objectUrl: string | null = null;
const listeners = new Set<() => void>();

function changed() {
  for (const listener of listeners) listener();
}

export function subscribePlaying(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The clip playing now (or loading), or null. */
export function playingNow(): string | null {
  return current;
}

export function stopClip() {
  player?.pause();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  current = null;
  changed();
}

export async function playClip(url: string) {
  stopClip();
  current = url;
  changed();
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    if (current !== url) return; // another clip was asked for meanwhile
    objectUrl = URL.createObjectURL(blob);
    player ??= new Audio();
    player.src = objectUrl;
    player.onended = () => {
      if (current === url) stopClip();
    };
    await player.play();
  } catch (error) {
    if (current === url) stopClip();
    throw error;
  }
}
