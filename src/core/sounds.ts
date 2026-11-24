// Sound effects service. Loads WAV assets and plays on game events.
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

let initialized = false;

const players: Record<string, AudioPlayer | null> = {
  place: null,
  clear: null,
  combo: null,
  gameover: null,
};

const sources: Record<string, number> = {
  place: require('../../assets/sounds/place.wav'),
  clear: require('../../assets/sounds/clear.wav'),
  combo: require('../../assets/sounds/combo.wav'),
  gameover: require('../../assets/sounds/gameover.wav'),
};

async function init() {
  if (initialized) return;
  initialized = true;
  try {
    await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'duckOthers' });
  } catch {
    // non-critical
  }
  // Preload all sounds
  for (const key of Object.keys(sources)) {
    try {
      players[key] = createAudioPlayer(sources[key]);
    } catch {
      // ponytail: silently skip if asset fails to load (non-critical)
    }
  }
}

async function play(key: string) {
  if (!initialized) await init();
  const player = players[key];
  if (!player) return;
  try {
    await player.seekTo(0);
    player.play();
  } catch {
    // non-critical
  }
}

export async function playPlace() { await play('place'); }
export async function playClear() { await play('clear'); }
export async function playCombo() { await play('combo'); }
export async function playGameOver() { await play('gameover'); }
