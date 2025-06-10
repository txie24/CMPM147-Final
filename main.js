// main.js - Animal Crossing Themed Animalese Generator

// ---- xxhash32 + mulberry32 PRNG helpers ----
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

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- Enhanced AnimaleseSynth for Animal Crossing feel ----
class AnimaleseSynth {
  constructor(lettersUrl) {
    this.lettersUrl = lettersUrl;
    this.audioBuffer = null;
  }

  async loadLibrary() {
    if (this.audioBuffer) return;
    
    try {
      const resp = await fetch(this.lettersUrl);
      const arrayBuffer = await resp.arrayBuffer();
      const ctx = new AudioContext();
      this.audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      ctx.close();
    } catch (error) {
      console.warn('Audio library not found, creating Animal Crossing style synthetic voices');
      this.createAnimalCrossingSyntheticAudio();
    }
  }

  // Create Animal Crossing style synthetic audio
  createAnimalCrossingSyntheticAudio() {
    const sampleRate = 44100;
    const duration = 0.12; // Shorter, punchier sounds like AC
    const frames = Math.floor(duration * sampleRate);
    const totalFrames = frames * 26;
    
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioBuffer = ctx.createBuffer(1, totalFrames, sampleRate);
    const data = this.audioBuffer.getChannelData(0);
    
    // Generate Animal Crossing style sounds for each letter
    for (let letter = 0; letter < 26; letter++) {
      const startFrame = letter * frames;
      
      // Different character types based on letter
      const baseFreq = this.getAnimalCrossingFrequency(letter);
      const harmonic = this.getHarmonicPattern(letter);
      
      for (let i = 0; i < frames; i++) {
        const t = i / sampleRate;
        const envelope = this.getAnimalCrossingEnvelope(t, duration);
        
        // Create more complex, cute sounds
        let sample = 0;
        sample += Math.sin(2 * Math.PI * baseFreq * t) * 0.6;
        sample += Math.sin(2 * Math.PI * baseFreq * harmonic * t) * 0.3;
        sample += Math.sin(2 * Math.PI * baseFreq * 0.5 * t) * 0.1;
        
        // Add some character-specific modulation
        const vibrato = 1 + 0.05 * Math.sin(2 * Math.PI * 6 * t);
        sample *= vibrato;
        
        data[startFrame + i] = sample * envelope * 0.4;
      }
    }
    
    ctx.close();
  }

  // Get frequency that matches Animal Crossing character types
  getAnimalCrossingFrequency(letterIndex) {
    // Different frequency ranges for different "character types"
    const frequencies = [
      380, 420, 350, 480, 390, 360, 440, 410, // A-H
      450, 370, 460, 400, 430, 470, 340, 490, // I-P  
      320, 500, 380, 420, 460, 350, 440, 390, // Q-X
      480, 360 // Y-Z
    ];
    return frequencies[letterIndex] || 400;
  }

  // Get harmonic pattern for more interesting sounds
  getHarmonicPattern(letterIndex) {
    const patterns = [1.5, 2.0, 1.2, 1.8, 1.4, 1.6, 1.3, 1.7, 1.9, 1.1];
    return patterns[letterIndex % patterns.length];
  }

  // Animal Crossing style envelope (quick attack, gentle decay)
  getAnimalCrossingEnvelope(t, duration) {
    const attackTime = 0.01;
    const decayTime = duration * 0.3;
    const sustainLevel = 0.6;
    const releaseTime = duration * 0.7;
    
    if (t <= attackTime) {
      return t / attackTime;
    } else if (t <= attackTime + decayTime) {
      const decayProgress = (t - attackTime) / decayTime;
      return 1 - (1 - sustainLevel) * decayProgress;
    } else if (t <= duration - releaseTime) {
      return sustainLevel;
    } else {
      const releaseProgress = (t - (duration - releaseTime)) / releaseTime;
      return sustainLevel * (1 - releaseProgress);
    }
  }

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

  async synthesize(text, { shorten = false, seed = "", pitch = 0 } = {}) {
    await this.loadLibrary();
    const raw = this._processScript(text, shorten).toUpperCase();
    const L = raw.length;

    if (L === 0) {
      return this._createSilentWAV(0.1);
    }

    const libraryDuration = this.audioBuffer.duration;
    const libraryLetterDur = libraryDuration / 26;
    // Animal Crossing style: quicker pace
    const outputLetterDur = libraryLetterDur / 2.5;
    const sampleRate = this.audioBuffer.sampleRate;
    const libFrames = Math.floor(libraryLetterDur * sampleRate);

    // Enhanced seed-based character generation
    const seedStr = seed.toString();
    const hashVal = xxhash32(seedStr, 0);
    const rnd = mulberry32(hashVal);
    
    // Create character personality based on seed
    const personality = this.generatePersonality(rnd);
    const jitter = personality.speedVariation;

    // Enhanced pitch control with character personality
    const basePitchFactor = Math.pow(2, pitch / 12);
    const characterPitch = personality.basePitch;
    const finalPitchFactor = basePitchFactor * characterPitch;

    const totalFrames = Math.ceil(L * outputLetterDur * sampleRate);
    const offline = new OfflineAudioContext(1, totalFrames, sampleRate);

    let playTime = 0;
    for (let i = 0; i < L; i++) {
      const ch = raw[i];
      if (ch >= "A" && ch <= "Z") {
        const letterIndex = ch.charCodeAt(0) - 65;

        const letterBuf = offline.createBuffer(1, libFrames, sampleRate);
        const tmp = new Float32Array(libFrames);
        this.audioBuffer.copyFromChannel(tmp, 0, letterIndex * libFrames);
        letterBuf.copyToChannel(tmp, 0, 0);

        const src = offline.createBufferSource();
        src.buffer = letterBuf;

        // Apply character personality to playback
        const baseRate = 2.5 * jitter * finalPitchFactor;
        const letterVariation = 1 + (rnd() - 0.5) * personality.variation;
        src.playbackRate.value = baseRate * letterVariation;

        src.connect(offline.destination);
        src.start(playTime);
      }
      
      // Add slight pauses between words for more natural speech
      if (ch === ' ') {
        playTime += outputLetterDur * 0.5;
      } else {
        playTime += outputLetterDur * personality.pacing;
      }
    }

    const rendered = await offline.startRendering();
    return this._encodeWAV(rendered);
  }

  // Generate Animal Crossing character personality from seed
  generatePersonality(rnd) {
    const personalities = [
      { // Peppy
        speedVariation: 0.8 + rnd() * 0.4,
        basePitch: 1.1 + rnd() * 0.3,
        variation: 0.15,
        pacing: 0.9
      },
      { // Normal
        speedVariation: 0.9 + rnd() * 0.2,
        basePitch: 0.95 + rnd() * 0.1,
        variation: 0.1,
        pacing: 1.0
      },
      { // Lazy
        speedVariation: 1.1 + rnd() * 0.3,
        basePitch: 0.8 + rnd() * 0.2,
        variation: 0.05,
        pacing: 1.2
      },
      { // Snooty
        speedVariation: 0.7 + rnd() * 0.2,
        basePitch: 1.0 + rnd() * 0.15,
        variation: 0.08,
        pacing: 0.95
      },
      { // Cranky
        speedVariation: 1.0 + rnd() * 0.2,
        basePitch: 0.75 + rnd() * 0.15,
        variation: 0.12,
        pacing: 1.1
      }
    ];
    
    const personalityIndex = Math.floor(rnd() * personalities.length);
    return personalities[personalityIndex];
  }

  _createSilentWAV(duration) {
    const sampleRate = 44100;
    const frames = Math.floor(duration * sampleRate);
    const buffer = new ArrayBuffer(44 + frames * 2);
    const view = new DataView(buffer);

    this._writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + frames * 2, true);
    this._writeString(view, 8, "WAVE");
    this._writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this._writeString(view, 36, "data");
    view.setUint32(40, frames * 2, true);

    for (let i = 44; i < buffer.byteLength; i += 2) {
      view.setInt16(i, 0, true);
    }

    return new Blob([view], { type: "audio/wav" });
  }

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
    view.setUint32(4, 36 + dataSize, true);
    this._writeString(view, 8, "WAVE");

    // fmt subchunk
    this._writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, bitsPerSample, true);

    // data subchunk
    this._writeString(view, 36, "data");
    view.setUint32(40, dataSize, true);

    // PCM samples
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

// ---- UI Control with Animal Crossing Theme ----
// ---- UI Control with Animal Crossing Theme ----
window.addEventListener("DOMContentLoaded", () => {
  const synth = new AnimaleseSynth("animalese.wav");
  const previewBtn = document.getElementById("preview");
  const downloadBtn = document.getElementById("download");
  const txt = document.getElementById("text");
  const shortenChk = document.getElementById("shorten");
  const seedInput = document.getElementById("seed-input");
  const pitchSlider = document.getElementById("pitch-slider");
  const pitchDisplay = document.getElementById("pitchDisplay");
  const randomSeedBtn = document.getElementById("randomSeed");
  const livePreviewChk = document.getElementById("livePreview");
  const liveIndicator = document.getElementById("liveIndicator");

  let livePreviewTimeout = null;
  let currentAudio = null;

  // Animal Crossing character names for seeds
  const characterNames = [
    "Tom Nook", "Isabelle", "K.K. Slider", "Blathers", "Celeste", 
    "Timmy", "Tommy", "Sable", "Mabel", "Kicks", "Redd", "Gulliver",
    "Brewster", "Rover", "Pascal", "Zipper", "Jingle", "Pavé"
  ];

  // 角色管理器集成
  if (typeof window.ACCharacterManager !== 'undefined') {
    window.ACCharacterManager.init();
    
    // 初始显示角色 - 确保在页面加载完成后执行
    setTimeout(() => {
      const initialSeed = seedInput.value.trim() || generateRandomSeed();
      console.log(`Initial seed: ${initialSeed}`);
      seedInput.value = initialSeed; // 确保seed输入框有值
      window.ACCharacterManager.updateCharacter(initialSeed);
    }, 100); // 给一点延迟确保DOM完全加载

    // 修改随机种子按钮的点击事件
    randomSeedBtn.onclick = null; // 清除原有的onclick
    
    randomSeedBtn.addEventListener("click", () => {
      const newSeed = generateRandomSeed();
      console.log(`New random seed: ${newSeed}`);
      seedInput.value = newSeed;
      
      // 更新角色显示
      window.ACCharacterManager.updateCharacter(newSeed);
      
      // 触发实时预览
      triggerLivePreview();
      
      // 动画反馈
      randomSeedBtn.style.transform = "scale(0.95)";
      setTimeout(() => {
        randomSeedBtn.style.transform = "scale(1)";
      }, 150);
    });

    // 监听seed输入变化 - 添加防抖
    let inputTimeout;
    seedInput.addEventListener("input", () => {
      clearTimeout(inputTimeout);
      inputTimeout = setTimeout(() => {
        const seed = seedInput.value.trim();
        if (seed) {
          console.log(`Seed input changed to: ${seed}`);
          window.ACCharacterManager.updateCharacter(seed);
        }
      }, 300); // 300ms 防抖
    });

    // 监听音调滑块，标记用户是否手动修改
    pitchSlider.addEventListener("input", () => {
      pitchSlider.setAttribute('data-user-modified', 'true');
    });

    // 修改预览按钮事件，添加说话动画
    previewBtn.addEventListener("click", async () => {
      // Start talking animation
      window.ACCharacterManager.startSpeaking();
      
      previewBtn.disabled = true;
      previewBtn.innerHTML = '<span>🎵</span> Creating Voice...';
      
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
        
        previewBtn.innerHTML = '<span>🔊</span> Playing...';
        
        audio.onended = () => {
          URL.revokeObjectURL(url);
          previewBtn.disabled = false;
          previewBtn.innerHTML = '<span>🎵</span> Preview Voice';
          // Stop talking animation
          window.ACCharacterManager.stopSpeaking();
        };
        audio.onerror = () => {
          console.error("Audio playback failed");
          previewBtn.disabled = false;
          previewBtn.innerHTML = '<span>🎵</span> Preview Voice';
          window.ACCharacterManager.stopSpeaking();
        };
        await audio.play();
      } catch (err) {
        console.error("Preview generation failed:", err);
        previewBtn.disabled = false;
        previewBtn.innerHTML = '<span>🎵</span> Preview Voice';
        window.ACCharacterManager.stopSpeaking();
      }
    });

    // 修改实时预览函数，添加说话动画
    window.triggerLivePreview = function() {
      if (!livePreviewChk.checked) return;
      
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      
      clearTimeout(livePreviewTimeout);
      livePreviewTimeout = setTimeout(async () => {
        if (txt.value.trim()) {
          try {
            // 开始说话动画
            window.ACCharacterManager.startSpeaking();
            
            const seedVal = seedInput.value.trim();
            const pitchVal = parseInt(pitchSlider.value, 10) || 0;
            const blob = await synth.synthesize(txt.value, {
              shorten: shortenChk.checked,
              seed: seedVal,
              pitch: pitchVal,
            });
            const url = URL.createObjectURL(blob);
            currentAudio = new Audio(url);
            currentAudio.volume = 0.6;
            currentAudio.onended = () => {
              URL.revokeObjectURL(url);
              currentAudio = null;
              // 停止说话动画
              window.ACCharacterManager.stopSpeaking();
            };
            currentAudio.play().catch(err => {
              console.warn("Live preview play failed:", err);
              window.ACCharacterManager.stopSpeaking();
            });
            
            // 2秒后停止动画（以防音频很短）
            setTimeout(() => {
              window.ACCharacterManager.stopSpeaking();
            }, 2000);
          } catch (err) {
            console.error("Live preview error:", err);
            window.ACCharacterManager.stopSpeaking();
          }
        }
      }, 600);
    };

    // future 点击角色显示问候语
    const characterImage = document.getElementById('characterImage');
    if (characterImage) {
      characterImage.addEventListener('click', () => {
        window.ACCharacterManager.showGreeting();
      });
    }

  } else {
    console.warn('Character Manager not loaded. Please include character-manager.js');
  }
  
  function generateRandomSeed() {
    // 如果 character-manager 已加载，使用它的角色列表
    if (window.ACCharacterManager && window.ACCharacterManager.getAllCharacters) {
    // skip characters that are flagged secret / hidden
    const pool = window.ACCharacterManager
        .getAllCharacters()
        .filter(c => !c.secret && !/^secret-/.test(c.id));   // fallback if you don’t add the flag

    const randomCharacter = pool[Math.floor(Math.random() * pool.length)];
    const randomNumber    = Math.floor(Math.random() * 9999);
     return `${randomCharacter.name}-${randomNumber}`;
   }
    
    // 备用方案：使用本地数组
    const randomName = characterNames[Math.floor(Math.random() * characterNames.length)];
    const randomNumber = Math.floor(Math.random() * 9999);
    return `${randomName}-${randomNumber}`;
  }

  // Initialize with Animal Crossing style seed
  if (!seedInput.value.trim()) {
    seedInput.value = generateRandomSeed();
  }

  // Enhanced pitch display with Animal Crossing character descriptions
  function updatePitchDisplay() {
    const pitchVal = parseInt(pitchSlider.value, 10);
    let displayText = "Normal";
    
    if (pitchVal <= -15) {
      displayText = "Deep & Gruff";
    } else if (pitchVal <= -8) {
      displayText = "Low & Calm";
    } else if (pitchVal <= -3) {
      displayText = "Slightly Deep";
    } else if (pitchVal <= 3) {
      displayText = "Normal";
    } else if (pitchVal <= 8) {
      displayText = "Slightly High";
    } else if (pitchVal <= 15) {
      displayText = "High & Peppy";
    } else {
      displayText = "Very High";
    }
    
    pitchDisplay.textContent = displayText;
  }

  // Enhanced live preview with Animal Crossing feel
  function triggerLivePreview() {
    if (!livePreviewChk.checked) return;
    
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    
    clearTimeout(livePreviewTimeout);
    livePreviewTimeout = setTimeout(async () => {
      if (txt.value.trim()) {
        try {
          const seedVal = seedInput.value.trim();
          const pitchVal = parseInt(pitchSlider.value, 10) || 0;
          const blob = await synth.synthesize(txt.value, {
            shorten: shortenChk.checked,
            seed: seedVal,
            pitch: pitchVal,
          });
          const url = URL.createObjectURL(blob);
          currentAudio = new Audio(url);
          currentAudio.volume = 0.6;
          currentAudio.onended = () => {
            URL.revokeObjectURL(url);
            currentAudio = null;
          };
          currentAudio.play().catch(err => {
            console.warn("Live preview play failed:", err);
          });
        } catch (err) {
          console.error("Live preview error:", err);
        }
      }
    }, 600);
  }

  // Event Listeners
  pitchSlider.addEventListener("input", () => {
    updatePitchDisplay();
    triggerLivePreview();
  });

  livePreviewChk.addEventListener("change", () => {
    liveIndicator.style.display = livePreviewChk.checked ? "flex" : "none";
    if (!livePreviewChk.checked && currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  });

  txt.addEventListener("input", triggerLivePreview);
  shortenChk.addEventListener("change", triggerLivePreview);
  seedInput.addEventListener("input", triggerLivePreview);

  // Initialize
  updatePitchDisplay();

  // Load audio library with Animal Crossing style feedback
  synth.loadLibrary().then(() => {
    previewBtn.disabled = false;
    downloadBtn.disabled = false;
    console.log("🏝️ Animal Crossing voice library ready!");
  }).catch(err => {
    console.error("Voice library error:", err);
    previewBtn.disabled = false;
    downloadBtn.disabled = false;
  });

  // Enhanced download button
  downloadBtn.addEventListener("click", async () => {
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<span>💾</span> Saving...';
    
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
      a.download = `animalese_${seedVal.replace(/[^a-zA-Z0-9]/g, '_')}_pitch_${pitchVal}.wav`;
      document.body.appendChild(a);
      a.click();
      
      // Success feedback
      downloadBtn.innerHTML = '<span>✅</span> Saved!';
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<span>💾</span> Save Audio';
      }, 1500);
    } catch (err) {
      console.error("Download generation failed:", err);
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = '<span>💾</span> Save Audio';
    }
  });

  // Add some fun Easter eggs
  let konamiCode = [];
  const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  
  document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    konamiCode = konamiCode.slice(-10);
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
      txt.value = "Secret Animal Crossing message unlocked!";
      seedInput.value = "K.K.-Slider-Secret";
      pitchSlider.value = "5";
      updatePitchDisplay();
      triggerLivePreview();
    }
    seedInput.dispatchEvent(new Event("input", { bubbles: true }))
  });
});