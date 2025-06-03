// main.js

// ---- tiny xxhash32 + mulberry32 PRNG helpers ----

/**
 * A minimal xxhash32 implementation over UTF‑8 string → 32‑bit unsigned.
 */
function xxhash32(str, seed = 0) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let h = seed ^ data.length;
  for (let i = 0; i < data.length; i++) {
    h = Math.imul(h ^ data[i], 0x165667919);
    h = (h << 13) | (h >>> 19);
  }
  h = (h ^ (h >>> 16)) * 0x85ebca6b;
  h = (h ^ (h >>> 13)) * 0xc2b2ae35;
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * A tiny 32‑bit integer → PRNG that returns numbers in [0,1).
 */
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- AnimaleseSynth class (uses seed **and** pitch) ----
class AnimaleseSynth {
  constructor(lettersUrl) {
    this.lettersUrl = lettersUrl;
    this.audioBuffer = null;
  }

  // Load and decode the single WAV that has 26 consecutive “A→Z” letter samples.
  async loadLibrary() {
    if (this.audioBuffer) return;
    const resp = await fetch(this.lettersUrl);
    const arrayBuffer = await resp.arrayBuffer();
    const ctx = new AudioContext();
    this.audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    ctx.close();
  }

  // If “shorten” is checked, reduce each word to first+last letter; else return raw.
  _processScript(text, shorten) {
    if (!shorten) return text;
    return text
      .replace(/[^a-zA-Z]+/g, " ")
      .split(/\s+/)
      .map((w) => {
        if (w.length > 1) return w[0] + w[w.length - 1];
        return w;
      })
      .join("");
  }

  /**
   * Synthesize a “seeded” Animalese clip.
   * Same seed → all parameters are the same, the generated WAV bit level is the same.
   * pitch ∈ [-12, +12] Chromatic offset, 0 means original.
   *
   * @param {string} text
   * @param {{shorten: boolean, seed: string|number, pitch: number}} opts
   * @returns {Promise<Blob>} a 16‑bit PCM WAV Blob
   */
  async synthesize(
    text,
    { shorten = false, seed = "", pitch = 0 } = {}
  ) {
    await this.loadLibrary();
    const raw = this._processScript(text, shorten).toUpperCase();
    const L = raw.length;

    // Each letter‑sample in the library is exactly (totalDuration / 26) seconds long:
    const libraryDuration = this.audioBuffer.duration; // e.g. ~26 × 0.15 ≈ 3.9s
    const libraryLetterDur = libraryDuration / 26; // ≈0.15s / letter
    const outputLetterDur = libraryLetterDur / 2; // base x2 speed‑up
    const sampleRate = this.audioBuffer.sampleRate; // e.g. 44100
    const libFrames = Math.floor(libraryLetterDur * sampleRate);

    // ---- Derive a single PRNG from the seed string/int ----
    // We stringify the seed, hash it to 32‑bit, then feed it to mulberry32.
    // That PRNG’s first output (rnd()) is used to produce “jitter” in [0.8, 1.2].
    const seedStr = seed.toString();
    const hashVal = xxhash32(seedStr, 0);
    const rnd = mulberry32(hashVal);
    const jitter = 0.5 + rnd(); // ∈ [0.5, 1.5]

    // ---- Convert pitch (semitones) → playback‑rate multiplier ----
    const pitchFactor = Math.pow(2, pitch / 12);

    // Total length of final buffer in frames:
    const totalFrames = Math.ceil(L * outputLetterDur * sampleRate);

    // Create an OfflineAudioContext to “compile” everything ahead of time:
    const offline = new OfflineAudioContext(1, totalFrames, sampleRate);

    let playTime = 0;
    for (let i = 0; i < L; i++) {
      const ch = raw[i];
      if (ch >= "A" && ch <= "Z") {
        const letterIndex = ch.charCodeAt(0) - 65; // ‘A’→0, ‘B’→1, … ‘Z’→25

        // Copy exactly libFrames samples from the library for this letter:
        const letterBuf = offline.createBuffer(1, libFrames, sampleRate);
        const tmp = new Float32Array(libFrames);
        this.audioBuffer.copyFromChannel(tmp, 0, letterIndex * libFrames);
        letterBuf.copyToChannel(tmp, 0, 0);

        const src = offline.createBufferSource();
        src.buffer = letterBuf;

        // Base speed is (2×) because we want to shrink ~0.15s→~0.075s.
        // Then *= jitter so that seed actually warps pitch/speed.
        // Finally *= pitchFactor to respect user slider.
        src.playbackRate.value = 2 * jitter * pitchFactor;

        src.connect(offline.destination);
        src.start(playTime);
      }
      // If ch is not A–Z (e.g. space or punctuation), we just leave silence:
      playTime += outputLetterDur;
    }

    // Render everything via OfflineAudioContext:
    const rendered = await offline.startRendering();
    return this._encodeWAV(rendered);
  }

  // Convert a mono AudioBuffer into a standard 16‑bit PCM WAV Blob
  _encodeWAV(audioBuffer) {
    const numChannels = 1;
    const sampleRate = audioBuffer.sampleRate;
    const samples = audioBuffer.getChannelData(0);
    const numFrames = samples.length;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const dataSize = numFrames * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    this._writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true); // file size minus 8
    this._writeString(view, 8, "WAVE");

    // fmt subchunk
    this._writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // PCM subchunk size
    view.setUint16(20, 1, true); // audio format = 1 (PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, bitsPerSample, true);

    // data subchunk
    this._writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // PCM samples (16‑bit signed, little‑endian)
    let offset = 44;
    for (let i = 0; i < numFrames; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, s, true);
      offset += 2;
    }

    return new Blob([view], { type: "audio/wav" });
  }

  _writeString(dataview, offset, str) {
    for (let i = 0; i < str.length; i++) {
      dataview.setUint8(offset + i, str.charCodeAt(i));
    }
  }
}

// ---- UI wiring: seed‑field + pitch‑slider binding ----
window.addEventListener("DOMContentLoaded", () => {
  const synth = new AnimaleseSynth("animalese.wav");
  const previewBtn = document.getElementById("preview");
  const downloadBtn = document.getElementById("download");
  const txt = document.getElementById("text");
  const shortenChk = document.getElementById("shorten");
  const seedInput = document.getElementById("seed-input");
  const pitchSlider = document.getElementById("pitch-slider");

  // 1) If seed-input is empty on load, pick a large random integer (unbounded now)
  if (!seedInput.value.trim()) {
    seedInput.value = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
  }

  // 2) Load the library once, then enable buttons.
  synth.loadLibrary().then(() => {
    previewBtn.disabled = false;
    downloadBtn.disabled = false;
  });

  // 3) “Preview” → render & play the WAV in an <audio> tag:
  previewBtn.addEventListener("click", async () => {
    previewBtn.disabled = true;
    previewBtn.textContent = "Rendering…";
    try {
      const seedVal = seedInput.value.trim();
      const pitchVal = parseInt(pitchSlider.value, 10) || 0;
      const blob = await synth.synthesize(txt.value, {
        shorten: shortenChk.checked,
        seed: seedVal,
        pitch: pitchVal,
      });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        previewBtn.disabled = false;
        previewBtn.textContent = "Preview";
      };
      audio.play();
    } catch (err) {
      console.error(err);
      previewBtn.disabled = false;
      previewBtn.textContent = "Preview";
    }
  });

  // 4) “Download” → render & force‑download the WAV:
  downloadBtn.addEventListener("click", async () => {
    downloadBtn.disabled = true;
    downloadBtn.textContent = "Rendering…";
    try {
      const seedVal = seedInput.value.trim();
      const pitchVal = parseInt(pitchSlider.value, 10) || 0;
      const blob = await synth.synthesize(txt.value, {
        shorten: shortenChk.checked,
        seed: seedVal,
        pitch: pitchVal,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `animalese_seed_${seedVal}_pitch_${pitchVal}.wav`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        downloadBtn.disabled = false;
        downloadBtn.textContent = "Download WAV";
      }, 100);
    } catch (err) {
      console.error(err);
      downloadBtn.disabled = false;
      downloadBtn.textContent = "Download WAV";
    }
  });
});
