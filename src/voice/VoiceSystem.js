/**
 * VoiceSystem - Handles speech recognition and synthesis using Web Speech API
 */

export class VoiceSystem {
  constructor(i18nModule) {
    this.i18n = i18nModule;
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.initRecognition();
  }

  /**
   * Initialize speech recognition
   */
  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
      
      // Set language based on i18n
      this.updateLanguage();
    }
  }

  /**
   * Update recognition language
   */
  updateLanguage() {
    if (!this.recognition) return;
    
    const langMap = {
      en: 'en-US',
      es: 'es-ES',
      it: 'it-IT'
    };
    
    const currentLang = this.i18n.getCurrentLanguage();
    this.recognition.lang = langMap[currentLang] || 'en-US';
  }

  /**
   * Start listening for voice input
   * @returns {Promise<string>} Recognized text
   */
  startListening() {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not available'));
        return;
      }
      
      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }
      
      this.isListening = true;
      
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };
      
      this.recognition.onerror = (event) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
      
      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * Speak text using synthesis
   * @param {string} text - Text to speak
   * @param {string} emotion - Current emotion (affects speech parameters)
   * @returns {Promise<void>}
   */
  speak(text, emotion = 'happy') {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }
      
      // Cancel any ongoing speech
      this.synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      const langMap = {
        en: 'en-US',
        es: 'es-ES',
        it: 'it-IT'
      };
      const currentLang = this.i18n.getCurrentLanguage();
      utterance.lang = langMap[currentLang] || 'en-US';
      
      // Adjust speech parameters based on emotion
      this.applyEmotionToSpeech(utterance, emotion);
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
      
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Apply emotion-based speech parameters
   * @param {SpeechSynthesisUtterance} utterance - Utterance object
   * @param {string} emotion - Emotion name
   */
  applyEmotionToSpeech(utterance, emotion) {
    // Make Mochi sound happier and cuter!
    switch (emotion) {
      case 'happy':
        utterance.rate = 1.15;  // Slightly faster = more energetic
        utterance.pitch = 1.25;  // Higher = cuter
        utterance.volume = 1.0;
        break;
      case 'hungry':
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;
        break;
      case 'sleepy':
        utterance.rate = 0.75;  // Slower = sleepy
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        break;
      case 'angry':
        utterance.rate = 1.1;
        utterance.pitch = 0.9;  // Lower = grumpy
        utterance.volume = 1.0;
        break;
      case 'playing':
        utterance.rate = 1.25;  // Fast = excited
        utterance.pitch = 1.35;  // High = excited
        utterance.volume = 1.0;
        break;
      default:
        // Default to happy/cute!
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
        utterance.volume = 1.0;
    }
  }

  /**
   * Check if Web Speech API is available
   * @returns {boolean} True if available
   */
  isAvailable() {
    return !!(this.recognition && this.synthesis);
  }

  /**
   * Display text-only message (fallback)
   * @param {string} text - Text to display
   */
  displayTextMessage(text) {
    // Create temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'voice-toast';
    toast.textContent = text;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: #fff;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
      animation: fadeInOut 3s ease-in-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Speak with fallback to text display
   * @param {string} text - Text to speak
   * @param {string} emotion - Current emotion
   */
  async speakWithFallback(text, emotion = 'happy') {
    if (this.isAvailable()) {
      try {
        await this.speak(text, emotion);
      } catch (error) {
        console.warn('Speech synthesis failed, falling back to text:', error);
        this.displayTextMessage(text);
      }
    } else {
      this.displayTextMessage(text);
    }
  }
}
