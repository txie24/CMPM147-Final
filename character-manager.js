// character-manager.js

// 角色数据库 
const characterDatabase = [
  {
    id: "tom-nook",
    name: "Tom Nook",
    emoji: "🦝",
    image: "characters/tom-nook.png",
    personality: "businessman",
    defaultPitch: -5,
    color: "#8B4513",
    greeting: "Yes, yes! Welcome to Nook Inc.!"
  },
  {
    id: "isabelle",
    name: "Isabelle",
    emoji: "🐕",
    image: "characters/isabelle.png",
    personality: "peppy",
    defaultPitch: 8,
    color: "#FFD700",
    greeting: "Good morning, Mayor!"
  },
  {
    id: "kk-slider",
    name: "K.K. Slider",
    emoji: "🎸",
    image: "characters/kk-slider.png",
    personality: "cool",
    defaultPitch: -2,
    color: "#4169E1",
    greeting: "Hey there, cool cat!"
  },
  {
    id: "blathers",
    name: "Blathers",
    emoji: "🦉",
    image: "characters/blathers.png",
    personality: "scholarly",
    defaultPitch: -8,
    color: "#8B7355",
    greeting: "Hoo hoo! What a magnificent specimen!"
  },
  {
    id: "celeste",
    name: "Celeste",
    emoji: "⭐",
    image: "characters/celeste.png",
    personality: "dreamy",
    defaultPitch: 10,
    color: "#FF69B4",
    greeting: "Look at all the stars!"
  },
  {
    id: "timmy",
    name: "Timmy",
    emoji: "🦡",
    image: "characters/timmy.png",
    personality: "energetic",
    defaultPitch: 12,
    color: "#32CD32",
    greeting: "...buy something!"
  },
  {
    id: "tommy",
    name: "Tommy",
    emoji: "🦫",
    image: "characters/tommy.png",
    personality: "energetic",
    defaultPitch: 11,
    color: "#228B22",
    greeting: "...thing to buy!"
  },
  {
    id: "sable",
    name: "Sable",
    emoji: "🦔",
    image: "characters/sable.png",
    personality: "shy",
    defaultPitch: 3,
    color: "#DDA0DD",
    greeting: "Oh, hello..."
  },
  {
    id: "mabel",
    name: "Mabel",
    emoji: "🦔",
    image: "characters/mabel.png",
    personality: "friendly",
    defaultPitch: 6,
    color: "#FFB6C1",
    greeting: "Welcome to Able Sisters!"
  },
  {
    id: "kicks",
    name: "Kicks",
    emoji: "🦨",
    image: "characters/kicks.png",
    personality: "cool",
    defaultPitch: -1,
    color: "#2F4F4F",
    greeting: "Yo, check out these kicks!"
  },
  {
    id: "redd",
    name: "Redd",
    emoji: "🦊",
    image: "characters/redd.png",
    personality: "sly",
    defaultPitch: -3,
    color: "#FF4500",
    greeting: "Hey there, cousin!"
  },
  {
    id: "gulliver",
    name: "Gulliver",
    emoji: "🦜",
    image: "characters/gulliver.png",
    personality: "confused",
    defaultPitch: 0,
    color: "#87CEEB",
    greeting: "Where... where am I?"
  },
  {
    id: "brewster",
    name: "Brewster",
    emoji: "🦆",
    image: "characters/brewster.png",
    personality: "calm",
    defaultPitch: -10,
    color: "#654321",
    greeting: "...Coo. One coffee, coming up."
  },
  {
    id: "rover",
    name: "Rover",
    emoji: "🐱",
    image: "characters/rover.png",
    personality: "friendly",
    defaultPitch: 2,
    color: "#4682B4",
    greeting: "So, where are you headed?"
  },
  {
    id: "pascal",
    name: "Pascal",
    emoji: "🦦",
    image: "characters/pascal.png",
    personality: "philosophical",
    defaultPitch: -4,
    color: "#FF6347",
    greeting: "Maaan, scallops are groovy..."
  },
  {
    id: "zipper",
    name: "Zipper",
    emoji: "🐰",
    image: "characters/zipper.png",
    personality: "energetic",
    defaultPitch: 15,
    color: "#FFFF00",
    greeting: "Hip hop hooray! It's Bunny Day!"
  },
  {
    id: "jingle",
    name: "Jingle",
    emoji: "🦌",
    image: "characters/jingle.png",
    personality: "jolly",
    defaultPitch: -6,
    color: "#DC143C",
    greeting: "Ho ho ho! Merry Toy Day!"
  },
  {
    id: "pave",
    name: "Pavé",
    emoji: "🦚",
    image: "characters/pave.png",
    personality: "flamboyant",
    defaultPitch: 5,
    color: "#FF1493",
    greeting: "Viva Festivale! Let's dance!"
  },
  {
    id: "secret-kk",
    name: "DJ K.K.",
    emoji: "🎭",
    image: "characters/secret-kk.png",
    personality: "mysterious",
    defaultPitch: 0,
    color: "#9400D3",
    greeting: "♪ You've unlocked the secret groove... ♪",
    secret: true 
  }
];

// 角色管理器类
class CharacterManager {
  constructor() {
    this.currentCharacter = null;
    this.characterPanel = null;
    this.characterImage = null;
    this.characterImg = null;
    this.characterPlaceholder = null;
    this.characterName = null;
    this.characterEmoji = null;
    this.isInitialized = false;
  }

  // 初始化DOM元素
  init() {
    this.characterPanel = document.querySelector('.character-panel');
    this.characterImage = document.getElementById('characterImage');
    this.characterImg = document.getElementById('characterImg');
    this.characterPlaceholder = document.getElementById('characterPlaceholder');
    this.characterName = document.getElementById('characterName');
    this.characterEmoji = document.querySelector('.character-emoji');
    
    if (!this.characterPanel) {
      console.warn('Character panel not found. Creating character display...');
      this.createCharacterDisplay();
    }
    
    this.isInitialized = true;
  }

  // 创建角色显示区域（如果不存在）
  createCharacterDisplay() {
    const appContainer = document.querySelector('.app-container');
    if (!appContainer) {
      console.error('App container not found!');
      return;
    }

    const characterHTML = `
      <div class="character-panel">
        <div class="character-display">
          <div class="character-wrapper">
            <div class="character-image" id="characterImage">
              <img src="" alt="Character" id="characterImg" style="display: none;">
              <div class="character-placeholder" id="characterPlaceholder">
                <span class="character-emoji">🦝</span>
              </div>
            </div>
            <div class="character-name-tag">
              <span id="characterName">Tom Nook</span>
            </div>
          </div>
          <div class="character-decoration">
            <div class="sparkle sparkle-1">✨</div>
            <div class="sparkle sparkle-2">⭐</div>
            <div class="sparkle sparkle-3">✨</div>
          </div>
        </div>
      </div>
    `;

    appContainer.insertAdjacentHTML('afterbegin', characterHTML);
    
    this.characterPanel = document.querySelector('.character-panel');
    this.characterImage = document.getElementById('characterImage');
    this.characterImg = document.getElementById('characterImg');
    this.characterPlaceholder = document.getElementById('characterPlaceholder');
    this.characterName = document.getElementById('characterName');
    this.characterEmoji = document.querySelector('.character-emoji');
  }

// 根据seed获取角色
getCharacterFromSeed(seed) {
  if (!seed) seed = "default";
  
  const seedStr = seed.toString();
  console.log(`Getting character for seed: ${seedStr}`);
  
  // 特殊处理 Secret 角色
  if (seedStr === "K.K.-Slider-Secret" || 
      seedStr.toLowerCase() === "secret" || 
      seedStr.toLowerCase().includes("secret")) {
    const secretCharacter = characterDatabase.find(char => char.id === "secret-kk");
    if (secretCharacter) {
      console.log("🎭 Secret character activated!");
      return secretCharacter;
    }
  }
  
  // 尝试从seed中提取角色名称（格式：角色名-数字）
  const parts = seedStr.split('-');
  
  if (parts.length >= 2) {
    // 检查最后一部分是否为数字
    const lastPart = parts[parts.length - 1];
    if (/^\d+$/.test(lastPart)) {
      // 如果最后一部分是数字，则前面的部分是角色名
      const characterNameParts = parts.slice(0, -1);
      const characterName = characterNameParts.join('-');
      
      console.log(`Extracted character name: ${characterName}`);
      
      // 在数据库中查找角色
      for (const character of characterDatabase) {
        // 方法1：直接匹配（忽略大小写）
        if (character.name.toLowerCase() === characterName.toLowerCase()) {
          console.log(`Direct match found: ${character.name}`);
          return character;
        }
        
        // 方法2：处理特殊格式（如 K.K. Slider）
        const possibleFormats = [
          character.name,                                    // 原始名称
          character.name.replace(/\s+/g, '-'),              // 空格变连字符
          character.name.replace(/\s+/g, '_'),              // 空格变下划线
          character.name.replace(/\./g, '.').replace(/\s+/g, '-'), // 保留点，空格变连字符
          character.name.replace(/\./g, ''),                // 移除点
          character.name.replace(/\./g, '').replace(/\s+/g, '-'), // 移除点，空格变连字符
        ];
        
        for (const format of possibleFormats) {
          if (format.toLowerCase() === characterName.toLowerCase()) {
            console.log(`Format match found: ${character.name} (matched format: ${format})`);
            return character;
          }
        }
      }
    }
  }
  
  const seedLower = seedStr.toLowerCase();
  
  // 尝试匹配任何包含角色名的seed
  for (const character of characterDatabase) {
    const nameLower = character.name.toLowerCase();
    
    // 检查seed是否以角色名开头
    if (seedLower.startsWith(nameLower) || 
        seedLower.startsWith(nameLower.replace(/\s+/g, '-')) ||
        seedLower.startsWith(nameLower.replace(/\./g, '').replace(/\s+/g, '-'))) {
      console.log(`Prefix match found: ${character.name}`);
      return character;
    }
  }
  
  // 如果所有方法都失败，使用hash作为后备
  console.log(`No match found for seed: ${seedStr}, using hash fallback`);
  
  let hash;
  if (typeof xxhash32 !== 'undefined') {
    hash = xxhash32(seedStr, 0);
  } else {
    hash = this.simpleHash(seedStr);
  }
  
  const index = hash % characterDatabase.length;
  const selectedCharacter = characterDatabase[index];
  console.log(`Hash fallback selected: ${selectedCharacter.name} (index: ${index})`);
  
  return selectedCharacter;
}

  // 简单的hash函数（备用）
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  // 更新角色显示
  // 替换 character-manager.js 中的 updateCharacter 方法

// 更新角色显示（修复版）
async updateCharacter(seed) {
  if (!this.isInitialized) {
    this.init();
  }

  const newCharacter = this.getCharacterFromSeed(seed);
  console.log(`updateCharacter: Got character ${newCharacter.name} for seed ${seed}`);
  
  // 强制更新，移除相同角色检查
  // if (this.currentCharacter?.id === newCharacter.id) {
  //   return; // 如果是同一个角色，不需要更新
  // }

  // 添加切换动画
  if (this.characterImage) {
    this.characterImage.classList.add('switching');
  }
  
  // 立即更新当前角色引用
  this.currentCharacter = newCharacter;
  
  // 等待动画到一半时更换角色
  setTimeout(() => {
    this.displayCharacter(newCharacter);
  }, 300);

  // 移除动画类
  setTimeout(() => {
    if (this.characterImage) {
      this.characterImage.classList.remove('switching');
    }
  }, 600);
}

// 同时修复 displayCharacter 方法，添加更多日志
displayCharacter(character) {
  if (!this.isInitialized) return;
  
  console.log(`displayCharacter: Displaying ${character.name}`);

  // 更新角色名称
  if (this.characterName) {
    this.characterName.textContent = character.name;
  }
  
  // 更新data属性（用于CSS样式）
  if (this.characterPanel) {
    this.characterPanel.setAttribute('data-character', character.id);
  }
  
  // 直接使用emoji，简化逻辑
  this.useEmojiPlaceholder(character);
  
  // 尝试加载图片
  if (character.image && this.characterImg) {
    const img = new Image();
    img.onload = () => {
      // 确保当前角色仍然是这个角色
      if (this.currentCharacter.id === character.id) {
        this.characterImg.src = character.image;
        this.characterImg.style.display = 'block';
        if (this.characterPlaceholder) {
          this.characterPlaceholder.style.display = 'none';
        }
      }
    };
    img.onerror = () => {
      // 图片加载失败，保持emoji显示
      console.log(`Failed to load image for ${character.name}`);
    };
    img.src = character.image;
  }

  // 更新音调
  this.updatePitchIfNeeded(character);
}

  // 显示角色
  displayCharacter(character) {
    if (!this.isInitialized) return;

    // 更新角色名称
    if (this.characterName) {
      this.characterName.textContent = character.name;
    }
    
    // 更新data属性（用于CSS样式）
    if (this.characterPanel) {
      this.characterPanel.setAttribute('data-character', character.id);
    }
    
    // 尝试加载图片
    if (character.image && this.characterImg) {
      const img = new Image();
      img.onload = () => {
        // 图片加载成功
        this.characterImg.src = character.image;
        this.characterImg.style.display = 'block';
        if (this.characterPlaceholder) {
          this.characterPlaceholder.style.display = 'none';
        }
      };
      img.onerror = () => {
        // 图片加载失败，使用emoji占位符
        this.useEmojiPlaceholder(character);
      };
      img.src = character.image;
    } else {
      // 没有图片路径，使用emoji
      this.useEmojiPlaceholder(character);
    }

    // 可选：根据角色调整音调
    this.updatePitchIfNeeded(character);
  }

  // 使用emoji占位符
  useEmojiPlaceholder(character) {
    if (this.characterImg) {
      this.characterImg.style.display = 'none';
    }
    if (this.characterPlaceholder) {
      this.characterPlaceholder.style.display = 'flex';
    }
    if (this.characterEmoji) {
      this.characterEmoji.textContent = character.emoji;
    }
    
    // 更新占位符背景色
    if (this.characterPlaceholder) {
      this.characterPlaceholder.style.background = 
        `linear-gradient(45deg, ${character.color}, ${this.lightenColor(character.color, 20)})`;
    }
  }

  // 更新音调（如果需要）
  updatePitchIfNeeded(character) {
    const pitchSlider = document.getElementById('pitch-slider');
    const pitchDisplay = document.getElementById('pitchDisplay');
    
    if (pitchSlider && !pitchSlider.hasAttribute('data-user-modified')) {
      // 如果用户没有手动调整过音调，使用角色默认音调
      pitchSlider.value = character.defaultPitch;
      
      // 触发音调显示更新
      if (typeof updatePitchDisplay === 'function') {
        updatePitchDisplay();
      } else if (pitchDisplay) {
        // 备用更新方法
        const pitchVal = parseInt(pitchSlider.value, 10);
        let displayText = "Normal";
        
        if (pitchVal <= -15) displayText = "Deep & Gruff";
        else if (pitchVal <= -8) displayText = "Low & Calm";
        else if (pitchVal <= -3) displayText = "Slightly Deep";
        else if (pitchVal <= 3) displayText = "Normal";
        else if (pitchVal <= 8) displayText = "Slightly High";
        else if (pitchVal <= 15) displayText = "High & Peppy";
        else displayText = "Very High";
        
        pitchDisplay.textContent = displayText;
      }
    }
  }

  // 颜色变亮函数
  lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }

  // 角色说话动画
  startSpeaking() {
    if (this.characterImage) {
      this.characterImage.classList.add('speaking');
    }
  }

  stopSpeaking() {
    if (this.characterImage) {
      this.characterImage.classList.remove('speaking');
    }
  }

  // 显示问候语
  showGreeting() {
    if (!this.currentCharacter) return;
    
    // 创建或更新语音气泡
    let speechBubble = document.querySelector('.speech-bubble');
    if (!speechBubble && this.characterWrapper) {
      speechBubble = document.createElement('div');
      speechBubble.className = 'speech-bubble';
      this.characterWrapper.insertBefore(speechBubble, this.characterImage);
    }
    
    if (speechBubble) {
      speechBubble.textContent = this.currentCharacter.greeting;
      speechBubble.classList.add('show');
      
      setTimeout(() => {
        speechBubble.classList.remove('show');
      }, 3000);
    }
  }

  // 获取当前角色
  getCurrentCharacter() {
    return this.currentCharacter;
  }

  // 获取所有角色列表
  getAllCharacters() {
    return characterDatabase;
  }

  // 根据名称查找角色
  findCharacterByName(name) {
    return characterDatabase.find(char => 
      char.name.toLowerCase() === name.toLowerCase()
    );
  }
}

// 创建全局实例
const characterManager = new CharacterManager();

// 导出给其他脚本使用
window.ACCharacterManager = characterManager;