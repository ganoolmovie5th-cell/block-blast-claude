// Sound effects service. Lazy-loads audio to not block startup.
import { Audio } from 'expo-av';

// ponytail: no external sound files — synthesize simple beeps via Audio API
// is not practical in expo-av; use silent stubs that can be replaced with real
// .mp3 assets in /assets/sounds/ later. For now, haptics carry the feedback.
// Upgrade path: add .mp3 files, loadAsync here, play on each event.

let initialized = false;

async function init() {
  if (initialized) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: false,
    shouldDuckAndroid: true,
  });
  initialized = true;
}

// Stubs — replace with real sound file playback when assets are added.
export async function playPlace() {
  await init();
  // ponytail: placeholder — add Audio.Sound.createAsync(require('...')) when asset ready
}

export async function playClear() {
  await init();
}

export async function playCombo() {
  await init();
}

export async function playGameOver() {
  await init();
}
