/**
 * WebLLMModule - Optional in-browser LLM for personality enhancement
 * Lazy-loaded to minimize initial bundle size
 */

const TEMPLATE_RESPONSES = {
  happy: [
    'Yay! So happy!', 'I love you!', 'Best friend!', 'Hee hee!', 'You the best!',
    'So cute!', 'My favorite!', 'Yay yay yay!', 'Wheee!', 'Love love love!'
  ],
  hungry: [
    'Hungry... feed me?', 'Tummy rumble...', 'Need snacks!', 'So hungryyyy!', 'Food time?',
    'Mochi hungry!', 'Nom nom?', 'Feed me please!', 'Empty tummy...', 'Need energy!'
  ],
  sleepy: [
    'Sleepy time...', 'Night night!', 'So tired...', 'Zzz...', 'Rest time!',
    'Goodnight!', 'Shhhh...', 'Dreaming...', 'Resting eyes...', 'Nighty night!'
  ],
  angry: [
    'Not happy!', 'Grrr!', 'Meanie!', 'Hmph!', 'Mochi mad!',
    'Noo!', 'Why like that?!', 'So rude!', 'Stop it!', 'Not fair!'
  ],
  playing: [
    'Wheee so fun!', 'Again again!', 'This the best!', 'Yay gametime!', 'So exciting!',
    'I win!', 'One more try!', 'So cool!', 'Love this game!', 'Fun fun fun!'
  ]
};

const MOCHI_PERSONALITY_PREFIXES = {
  happy: ['Yay! ', 'Hehe! ', 'Whee! ', 'Cool! ', 'Nice! '],
  hungry: ['Um... ', 'Hmm... ', 'Yum! ', 'Ooh! ', 'Finally! '],
  sleepy: ['Okay... ', 'Zzz... ', 'Shh... ', 'Mmhm... ', 'Sure... '],
  angry: ['Hmpf! ', 'Grr! ', 'Ugh! ', 'Seriously?! ', 'Wow! '],
  playing: ['Wow! ', 'Yay! ', 'Cool! ', 'Awesome! ', 'Ooh! ']
};

const MOCHI_EMOJI_REACTIONS = {
  happy: ['😊', '🥰', '✨', '🎉', '💖'],
  hungry: ['🥺', '😋', '🍡', '🤤', '😫'],
  sleepy: ['😴', '😪', '💤', '🛏️', '🌙'],
  angry: ['😤', '😠', '💢', '😾', '⬆️'],
  playing: ['🤩', '🎮', '⭐', '🔥', '💫']
};

export class WebLLMModule {
  constructor() {
    this.loaded = false;
    this.model = null;
    this.responsive = true;
  }

  /**
   * Lazy-load the WebLLM module
   * @returns {Promise<WebLLMModule>} Loaded module instance
   */
  static async load() {
    const instance = new WebLLMModule();
    
    try {
      // Note: Actual WebLLM integration would go here
      // For now, we'll use template responses as fallback
      console.log('WebLLM loading skipped - using template responses');
      instance.loaded = false;
    } catch (error) {
      console.warn('WebLLM load failed:', error);
      instance.loaded = false;
    }
    
    return instance;
  }

  /**
   * Check if module is loaded
   * @returns {boolean} True if loaded
   */
  isLoaded() {
    return this.loaded;
  }

  /**
   * Check if module is responsive
   * @returns {boolean} True if responsive
   */
  isResponsive() {
    return this.responsive;
  }

  /**
   * Rewrite tool output to add personality
   * @param {string} toolOutput - Tool output text
   * @param {string} emotion - Current emotion
   * @returns {Promise<string>} Rewritten text
   */
  async rewriteWithPersonality(toolOutput, emotion) {
    if (!this.loaded) {
      return this.formatCuteResponse(toolOutput, emotion);
    }
    
    // Actual WebLLM generation would go here
    return this.formatCuteResponse(toolOutput, emotion);
  }

  /**
   * Generate conversational reply
   * @param {string} userInput - User input
   * @param {string} emotion - Current emotion
   * @returns {Promise<string>} Generated reply
   */
  async generateReply(userInput, emotion) {
    if (!this.loaded) {
      const reply = this.getTemplateResponse(emotion);
      const emoji = this.getEmojiReaction(emotion);
      return `${reply} ${emoji}`;
    }
    
    // Actual WebLLM generation would go here
    return this.formatCuteResponse(userInput, emotion);
  }

  /**
   * Get template response for emotion
   * @param {string} emotion - Emotion name
   * @returns {string} Template response
   */
  getTemplateResponse(emotion) {
    const responses = TEMPLATE_RESPONSES[emotion] || TEMPLATE_RESPONSES.happy;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Add Mochi personality prefix to message
   * @param {string} message - Original message
   * @param {string} emotion - Current emotion
   * @returns {string} Enhanced message
   */
  addPersonalityPrefix(message, emotion) {
    const prefixes = MOCHI_PERSONALITY_PREFIXES[emotion] || MOCHI_PERSONALITY_PREFIXES.happy;
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + message;
  }

  /**
   * Get Mochi emoji reaction
   * @param {string} emotion - Current emotion
   * @returns {string} Emoji
   */
  getEmojiReaction(emotion) {
    const emojis = MOCHI_EMOJI_REACTIONS[emotion] || MOCHI_EMOJI_REACTIONS.happy;
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  /**
   * Format a complete cute response
   * @param {string} message - Original message
   * @param {string} emotion - Current emotion
   * @returns {string} Cute formatted response
   */
  formatCuteResponse(message, emotion) {
    const responses = TEMPLATE_RESPONSES[emotion] || TEMPLATE_RESPONSES.happy;
    const intro = responses[Math.floor(Math.random() * responses.length)];
    return `${intro} ${message}`;
  }

  /**
   * Unload module to free memory
   */
  unload() {
    this.model = null;
    this.loaded = false;
  }
}
