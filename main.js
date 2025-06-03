// main.js

// ---- AnimaleseSynth ----
// Loads a single WAV file that contains 26 equal-length letter samples (A→Z).
// Then, given some text, it “shortens” words (if requested), 
// slices the correct portion for each letter, sequences them in an OfflineAudioContext,
// encodes the result as a WAV Blob, and returns it.

class AnimaleseSynth {
  constructor(lettersUrl) {
    this.lettersUrl = lettersUrl;
    this.audioBuffer = null;
  }

  // 1) Load the letters WAV file and decode to AudioBuffer
  async loadLibrary() {
    if (this.audioBuffer) return;

    const resp = await fetch(this.lettersUrl);
    const arrayBuffer = await resp.arrayBuffer();
    const ctx = new AudioContext();
    this.audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    ctx.close();
  }

  // 2) “Shorten” each word to first+last letter if checkbox is checked
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

  // 3) Given a string (and options), produce a WAV Blob
  async synthesize(text, { shorten = false, pitch = 1.0 } = {}) {
    await this.loadLibrary();
    const raw = this._processScript(text, shorten).toUpperCase();
    const L = raw.length;

    // Calculate durations
    const libraryDuration = this.audioBuffer.duration;      // e.g. 0.15 * 26 = ~3.9s
    const libraryLetterDur = libraryDuration / 26;          // ~0.15s each
    const outputLetterDur = libraryLetterDur / 2;           // ~0.075s each
    const sampleRate = this.audioBuffer.sampleRate;         // e.g. 44100
    const libFrames = Math.floor(libraryLetterDur * sampleRate);

    // Final buffer length in frames:
    const totalFrames = Math.ceil(L * outputLetterDur * sampleRate);

    // Create OfflineAudioContext
    const offline = new OfflineAudioContext(
      1,
      totalFrames,
      sampleRate
    );

    let playTime = 0; // current time in seconds

    for (let i = 0; i < L; i++) {
      const ch = raw[i];
      if (ch >= "A" && ch <= "Z") {
        const letterIndex = ch.charCodeAt(0) - 65; // 'A'→0, 'B'→1, …

        // Slice that segment from the library AudioBuffer
        const letterBuf = offline.createBuffer(
          1,
          libFrames,
          sampleRate
        );
        // copy from channel 0:
        const tmp = new Float32Array(libFrames);
        this.audioBuffer.copyFromChannel(
          tmp,
          0,
          letterIndex * libFrames
        );
        letterBuf.copyToChannel(tmp, 0, 0);

        // Make a BufferSource for this letter
        const src = offline.createBufferSource();
        src.buffer = letterBuf;
        src.playbackRate.value = 2 * pitch; 
        // (2 = libraryLetterDur/outputLetterDur, so it compresses 0.15s → 0.075s, then *pitch)

        src.connect(offline.destination);
        src.start(playTime);
      }
      // else (spaces, punctuation) → silence: do nothing, just advance time

      playTime += outputLetterDur;
    }

    // Render!
    const rendered = await offline.startRendering();
    // rendered is an AudioBuffer of length totalFrames

    // Convert to WAV Blob
    return this._encodeWAV(rendered);
  }

  // 4) Encode a mono AudioBuffer into a standard 16-bit PCM WAV Blob
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

    // RIFF chunk
    this._writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + dataSize, true); // file length - 8
    this._writeString(view, 8, "WAVE");

    // fmt  sub-chunk
    this._writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);              // subchunk1 size (16 for PCM)
    view.setUint16(20, 1, true);               // audio format = PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(
      28,
      sampleRate * numChannels * bytesPerSample,
      true
    ); // byte rate
    view.setUint16(
      32,
      numChannels * bytesPerSample,
      true
    ); // block align
    view.setUint16(34, bitsPerSample, true);

    // data sub-chunk
    this._writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // PCM samples
    let offset = 44;
    for (let i = 0; i < numFrames; i++) {
      // clamp to [-1,1], then scale to 16-bit signed
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

// ---- Wiring up UI ----
window.addEventListener("DOMContentLoaded", () => {
  const synth = new AnimaleseSynth("animalese.wav");
  const previewBtn = document.getElementById("preview");
  const downloadBtn = document.getElementById("download");
  const txt = document.getElementById("text");
  const shortenChk = document.getElementById("shorten");
  const pitchSlider = document.getElementById("pitch");
  const pitchVal = document.getElementById("pitchVal");

  // Update pitch label
  pitchSlider.addEventListener("input", () => {
    pitchVal.textContent = pitchSlider.value;
  });

  // Once library is loaded, enable buttons
  synth.loadLibrary().then(() => {
    previewBtn.disabled = false;
    downloadBtn.disabled = false;
  });

  // Preview → play the generated Blob via a transient <audio>
  previewBtn.addEventListener("click", async () => {
    previewBtn.disabled = true;
    previewBtn.textContent = "Rendering…";
    try {
      const blob = await synth.synthesize(txt.value, {
        shorten: shortenChk.checked,
        pitch: parseFloat(pitchSlider.value),
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

  // Download → trigger a download of the Blob
  downloadBtn.addEventListener("click", async () => {
    downloadBtn.disabled = true;
    downloadBtn.textContent = "Rendering…";
    try {
      const blob = await synth.synthesize(txt.value, {
        shorten: shortenChk.checked,
        pitch: parseFloat(pitchSlider.value),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "animalese_clone.wav";
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
