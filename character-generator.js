// character-generator.js

class CharacterGenerator {
  constructor() {
    // 名字部分
    this.namePrefixes = ["Mr.", "Ms.", "Dr.", "Captain", "Chief", "Elder", "Young", "Big", "Little", "DJ"];
    this.nameRoots = ["Fluffy", "Sparkle", "Thunder", "Shadow", "Sunny", "Moon", "Star", "Cloud", "Wave", "Leaf", "Berry", "Honey"];
    this.nameSuffixes = ["kins", "bert", "worth", "ton", "shire", "bell", "wood", "stone", "heart", "paw"];
    
    // 物种
    this.species = [
      { emoji: "🐻", type: "bear", pitchRange: [-10, -5] },
      { emoji: "🐰", type: "rabbit", pitchRange: [5, 15] },
      { emoji: "🐸", type: "frog", pitchRange: [-5, 5] },
      { emoji: "🦊", type: "fox", pitchRange: [-3, 3] },
      { emoji: "🐨", type: "koala", pitchRange: [-8, -2] },
      { emoji: "🐼", type: "panda", pitchRange: [-6, 0] },
      { emoji: "🦁", type: "lion", pitchRange: [-12, -6] },
      { emoji: "🐯", type: "tiger", pitchRange: [-10, -4] },
      { emoji: "🐮", type: "cow", pitchRange: [-8, -2] },
      { emoji: "🐷", type: "pig", pitchRange: [0, 8] },
      { emoji: "🐵", type: "monkey", pitchRange: [2, 10] },
      { emoji: "🦝", type: "raccoon", pitchRange: [-2, 4] },
      { emoji: "🦒", type: "giraffe", pitchRange: [-4, 2] },
      { emoji: "🦘", type: "kangaroo", pitchRange: [0, 6] },
      { emoji: "🦙", type: "llama", pitchRange: [-3, 3] },
      { emoji: "🦦", type: "otter", pitchRange: [-1, 5] },
      { emoji: "🦥", type: "sloth", pitchRange: [-15, -8] },
      { emoji: "🦫", type: "beaver", pitchRange: [-4, 2] }
    ];
    
    // 性格类型
    this.personalities = [
      "peppy", "lazy", "normal", "jock", "cranky", "snooty", 
      "smug", "sisterly", "energetic", "dreamy", "shy", "cool",
      "scholarly", "philosophical", "confused", "sly"
    ];
    
    // 颜色
    this.colors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
      "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52BE80",
      "#F1948A", "#73C6B6", "#D7BDE2", "#A9DFBF", "#F9E79F"
    ];
    
    // 爱好和职业
    this.hobbies = [
      "fishing", "bug catching", "gardening", "cooking", "singing",
      "dancing", "reading", "painting", "photography", "astronomy",
      "collecting", "crafting", "exercising", "sleeping", "eating"
    ];
    
    this.occupations = [
      "shopkeeper", "musician", "artist", "chef", "athlete",
      "teacher", "scientist", "farmer", "fisher", "carpenter",
      "designer", "writer", "doctor", "pilot", "detective"
    ];
  }
  
  // 生成随机名字
  generateName(rng) {
    const usePrefix = rng() > 0.7;
    const useSuffix = rng() > 0.3;
    
    let name = "";
    
    if (usePrefix) {
      name += this.namePrefixes[Math.floor(rng() * this.namePrefixes.length)] + " ";
    }
    
    name += this.nameRoots[Math.floor(rng() * this.nameRoots.length)];
    
    if (useSuffix) {
      name += this.nameSuffixes[Math.floor(rng() * this.nameSuffixes.length)];
    }
    
    return name;
  }
  
  // 生成唯一ID
  generateId(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  
  // 生成角色
  generateCharacter(seed = null) {
    // 如果没有提供seed，使用时间戳
    if (!seed) {
      seed = Date.now().toString();
    }
    
    // 创建随机数生成器
    const hash = xxhash32(seed.toString(), 0);
    const rng = mulberry32(hash);
    
    // 选择物种
    const species = this.species[Math.floor(rng() * this.species.length)];
    
    // 生成名字
    const name = this.generateName(rng);
    const id = this.generateId(name);
    
    // 选择性格
    const personality = this.personalities[Math.floor(rng() * this.personalities.length)];
    
    // 选择颜色
    const color = this.colors[Math.floor(rng() * this.colors.length)];
    
    // 生成音调（基于物种）
    const pitchRange = species.pitchRange;
    const defaultPitch = Math.floor(pitchRange[0] + rng() * (pitchRange[1] - pitchRange[0]));
    
    // 生成爱好和职业
    const hobby = this.hobbies[Math.floor(rng() * this.hobbies.length)];
    const occupation = this.occupations[Math.floor(rng() * this.occupations.length)];
    
    // 生成独特的问候语
    const greetingTemplates = [
      `Hi! I'm ${name}, the ${occupation}!`,
      `${species.emoji} *${species.type} noises* Welcome!`,
      `Oh, a visitor! I was just ${hobby}!`,
      `Hello there! Care to join me for some ${hobby}?`,
      `${name}'s the name, ${occupation}'s my game!`,
      `What a lovely day for ${hobby}, don't you think?`
    ];
    
    const greeting = greetingTemplates[Math.floor(rng() * greetingTemplates.length)];
    
    // 构建角色对象
    const character = {
      id: `pcg-${id}`,
      name: name,
      emoji: species.emoji,
      species: species.type,
      personality: personality,
      defaultPitch: defaultPitch,
      color: color,
      greeting: greeting,
      hobby: hobby,
      occupation: occupation,
      generated: true,
      seed: seed
    };
    
    return character;
  }
  
  // 批量生成角色
  generateMultipleCharacters(count = 5) {
    const characters = [];
    const usedNames = new Set();
    
    for (let i = 0; i < count; i++) {
      let character;
      let attempts = 0;
      
      // 确保生成的名字是唯一的
      do {
        character = this.generateCharacter(`batch-${Date.now()}-${i}-${attempts}`);
        attempts++;
      } while (usedNames.has(character.name) && attempts < 10);
      
      if (!usedNames.has(character.name)) {
        usedNames.add(character.name);
        characters.push(character);
      }
    }
    
    return characters;
  }
}

// 创建全局实例
window.CharacterGenerator = new CharacterGenerator();