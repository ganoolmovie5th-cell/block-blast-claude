// Sound effects service. Loads WAV assets and plays on game events.
import { Audio, AVPlaybackSource } from 'expo-av';

let initialized = false;
const loaded: Record<string, Audio.Sound | null> = {
  place: null,
  clear: null,
  combo: null,
  gameover: null,
};

const sources: Record<string, AVPlaybackSource> = {
  place: require('../../assets/sounds/place.wav'),
  clear: require('../../assets/sounds/clear.wav'),
  combo: require('../../assets/sounds/combo.wav'),
  gameover: require('../../assets/sounds/gameover.wav'),
};

async function init() {
  if (initialized) return;
  initialized = true;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: false,
    shouldDuckAndroid: true,
  });
  // Preload all sounds
  for (const key of Object.keys(sources)) {
    try {
      const { sound } = await Audio.Sound.createAsync(sources[key]);
      loaded[key] = sound;
    } catch {
      // ponytail: silently skip if asset fails to load (non-critical)
    }
  }
}

async function play(key: string) {
  if (!initialized) await init();
  const sound = loaded[key];
  if (!sound) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // non-critical
  }
}

export async function playPlace() { await play('place'); }
export async function playClear() { await play('clear'); }
export async function playCombo() { await play('combo'); }
export async function playGameOver() { await play('gameover'); }
