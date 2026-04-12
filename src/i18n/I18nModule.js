/**
 * I18nModule - Internationalization support for English, Spanish, Italian
 */

const TRANSLATIONS = {
  en: {
    'ui.feed': 'Feed',
    'ui.play': 'Play',
    'ui.talk': 'Talk',
    'ui.sleep': 'Sleep',
    'ui.settings': 'Settings',
    'ui.alarm': 'Alarm',
    'ui.reminders': 'Reminders',
    'ui.color': 'Color',
    'ui.language': 'Language',
    'dialogue.happy': 'Yay! So happy!',
    'dialogue.hungry': 'Hungry... feed me?',
    'dialogue.sleepy': 'Sleepy... night night!',
    'dialogue.angry': 'Grr! Not happy!',
    'dialogue.playing': 'Wheee! So fun!',
    'dialogue.feed': ['Yum yum!', 'Nom nom!', 'Tasty!', 'More please!', 'Yummy!'],
    'dialogue.sleep': ['Sweet dreams!', 'Night night!', 'Zzz...', 'Rest time!', 'Shhh...'],
    'dialogue.talk': ['I love you!', 'Tell me more!', 'Ooh interesting!', 'Really?!', 'Cool!'],
    'dialogue.play': ['Again again!', 'So fun!', 'Wee!', 'Best game!', 'More please!'],
    'notification.support': 'Enjoying Mochi? ☕ Support the project',
    'alarm.greeting.morning': 'Good morning! Love you!',
    'alarm.greeting.afternoon': 'Good afternoon! Time for fun!',
    'alarm.greeting.evening': 'Good evening! Sweet dreams!',
    'alarm.trigger': "It's {day} {time}! Wake up!",
    'alarm.reminder': "Don't forget: {text}",
    'error.weather.failed': "Couldn't get weather, sorry!",
    'error.weather.sunny': 'Sunny and warm!',
    'error.weather.cloudy': 'Cloudy skies...',
    'error.weather.rainy': 'Rainy day!',
    'error.network': 'Network hiccup! Try again?',
    'error.api_generic': 'Oopsie! Try again?',
    'error.rate_limit': 'Too many requests! Wait a bit!',
    'error.not_found': 'Hmm... not sure about that!',
    'weather.temp': 'Temperature',
    'weather.conditions': 'Conditions',
    'weather.sunny': 'Sunny',
    'weather.cloudy': 'Cloudy',
    'weather.rainy': 'Rainy',
    'weather.stormy': 'Stormy',
    'weather.snowy': 'Snowy',
    'news.headlines': 'Headlines',
    'support.link': 'Support Mochi ☕',
    'greeting.hello': 'Hello! I am Mochi!',
    'greeting bye': 'Bye bye! Come back soon!'
  },
  es: {
    'ui.feed': 'Alimentar',
    'ui.play': 'Jugar',
    'ui.talk': 'Hablar',
    'ui.sleep': 'Dormir',
    'ui.settings': 'Ajustes',
    'ui.alarm': 'Alarma',
    'ui.reminders': 'Recordatorios',
    'ui.color': 'Color',
    'ui.language': 'Idioma',
    'dialogue.happy': '¡Yay! ¡Tan feliz!',
    'dialogue.hungry': 'Hambre... ¡alimentame!',
    'dialogue.sleepy': 'Sueño... ¡buenas noches!',
    'dialogue.angry': '¡Grr! ¡No feliz!',
    'dialogue.playing': '¡Yupi! ¡Tan divertido!',
    'dialogue.feed': ['¡Nom nom!', '¡Rico!', '¡Más por favor!', '¡Delicioso!', '¡ Yum!'],
    'dialogue.sleep': ['¡Dulces sueños!', '¡Buenas noches!', '¡Zzz...!', '¡Descanso!', '¡Shh...!'],
    'dialogue.talk': ['¡Te quiero!', '¡Cuéntame más!', '¡Oh interesante!', '¿¡De verdad?!', '¡Qué cool!'],
    'dialogue.play': ['¡Otra vez!', '¡Tan divertido!', '¡Wee!', '¡Mejor juego!', '¡Más por favor!'],
    'notification.support': '¿Te gusta Mochi? ☕ Apoya el proyecto',
    'alarm.greeting.morning': '¡Buenos días! ¡Te quiero!',
    'alarm.greeting.afternoon': '¡Buenas tardes! ¡Hora de jugar!',
    'alarm.greeting.evening': '¡Buenas noches! ¡Dulces sueños!',
    'alarm.trigger': '¡Es {day} {time}! ¡Despierta!',
    'alarm.reminder': 'No olvides: {text}',
    'error.weather.failed': '¡No pude obtener el clima!',
    'error.weather.sunny': '¡Sol y calido!',
    'error.weather.cloudy': '¡Cielo nublado...',
    'error.weather.rainy': '¡Día de lluvia!',
    'error.network': '¡Error de red! ¿Intentar de nuevo?',
    'error.api_generic': '¡Ups! ¿Intentar de nuevo?',
    'error.rate_limit': '¡Demasiadas solicitudes! ¡Espera un poco!',
    'error.not_found': '¡Hmm... ¡no sé de eso!',
    'weather.temp': 'Temperatura',
    'weather.conditions': 'Condiciones',
    'weather.sunny': 'Soleado',
    'weather.cloudy': 'Nublado',
    'weather.rainy': 'Lluvioso',
    'weather.stormy': 'Tormentoso',
    'weather.snowy': 'Nevando',
    'news.headlines': 'Titulares',
    'support.link': 'Apoya a Mochi ☕',
    'greeting.hello': '¡Hola! ¡Soy Mochi!',
    'greeting bye': '¡Adiós! ¡Vuelve pronto!'
  },
  it: {
    'ui.feed': 'Nutrire',
    'ui.play': 'Giocare',
    'ui.talk': 'Parlare',
    'ui.sleep': 'Dormire',
    'ui.settings': 'Impostazioni',
    'ui.alarm': 'Sveglia',
    'ui.reminders': 'Promemoria',
    'ui.color': 'Colore',
    'ui.language': 'Lingua',
    'dialogue.happy': 'Evviva! Così felice!',
    'dialogue.hungry': 'Fame... dammi da mangiare!',
    'dialogue.sleepy': 'Sonno... buonanotte!',
    'dialogue.angry': 'Grr! Non felice!',
    'dialogue.playing': 'Evviva! Così divertente!',
    'dialogue.feed': ['Nom nom!', 'Squisito!', 'Ancora per favore!', 'Delizioso!', 'Yum!'],
    'dialogue.sleep': ['Sogni d\'oro!', 'Buonanotte!', 'Zzz...', 'Tempo di riposo!', 'Shh...!'],
    'dialogue.talk': ['Ti voglio bene!', 'Raccontami di più!', 'Oh interessante!', 'Davvero?!', 'Che figo!'],
    'dialogue.play': ['Ancora!', 'Così divertente!', 'Wee!', 'Miglior gioco!', 'Ancora per favore!'],
    'notification.support': 'Ti piace Mochi? ☕ Supporta il progetto',
    'alarm.greeting.morning': 'Buongiorno! Ti voglio bene!',
    'alarm.greeting.afternoon': 'Buon pomeriggio! Tempo di giocare!',
    'alarm.greeting.evening': 'Buonasera! Sogni d\'oro!',
    'alarm.trigger': 'È {day} {time}! Svegliati!',
    'alarm.reminder': 'Non dimenticare: {text}',
    'error.weather.failed': 'Non riesco a ottenere il meteo!',
    'error.weather.sunny': 'Soleggiato e caldo!',
    'error.weather.cloudy': 'Cielo nuvoloso...',
    'error.weather.rainy': 'Giorno di pioggia!',
    'error.network': 'Errore di rete! Riprova?',
    'error.api_generic': 'Ops! Riprova?',
    'error.rate_limit': 'Troppe richieste! Aspetta un po!',
    'error.not_found': 'Hmm... non so di quello!',
    'weather.temp': 'Temperatura',
    'weather.conditions': 'Condizioni',
    'weather.sunny': 'Soleggiato',
    'weather.cloudy': 'Nuvoloso',
    'weather.rainy': 'Piovoso',
    'weather.stormy': 'Tempesta',
    'weather.snowy': 'Nevicando',
    'news.headlines': 'Titoli',
    'support.link': 'Supporta Mochi ☕',
    'greeting.hello': 'Ciao! Sono Mochi!',
    'greeting bye': 'Ciao! Torna presto!'
  }
};

export class I18nModule {
  constructor() {
    this.currentLanguage = this.detectLanguage();
  }

  /**
   * Detect language from browser
   * @returns {string} Language code (en, es, it)
   */
  detectLanguage() {
    const browserLang = navigator.language.toLowerCase().split('-')[0];
    
    if (browserLang === 'es') return 'es';
    if (browserLang === 'it') return 'it';
    return 'en'; // Default to English
  }

  /**
   * Set language
   * @param {string} lang - Language code
   */
  setLanguage(lang) {
    if (['en', 'es', 'it'].includes(lang)) {
      this.currentLanguage = lang;
    }
  }

  /**
   * Get current language
   * @returns {string} Current language code
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  /**
   * Translate key
   * @param {string} key - Translation key
   * @param {Object} params - Optional parameters for interpolation
   * @returns {string} Translated text
   */
  t(key, params = {}) {
    const translations = TRANSLATIONS[this.currentLanguage] || TRANSLATIONS.en;
    let text = translations[key] || key;
    
    // If it's an array (for dialogue), pick random
    if (Array.isArray(text)) {
      text = text[Math.floor(Math.random() * text.length)];
    }
    
    // If it's still not a string, return key
    if (typeof text !== 'string') {
      return key;
    }
    
    // Simple parameter interpolation
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  }

  /**
   * Get random dialogue for action
   * @param {string} action - Action name (feed, sleep, talk, play)
   * @returns {string} Random dialogue
   */
  getDialogue(action) {
    return this.t(`dialogue.${action}`);
  }

  /**
   * Get localized date/time format
   * @param {Date} date - Date to format
   * @returns {string} Formatted date/time string
   */
  formatDateTime(date) {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const locales = {
      en: 'en-US',
      es: 'es-ES',
      it: 'it-IT'
    };
    
    return date.toLocaleString(locales[this.currentLanguage] || 'en-US', options);
  }

  /**
   * Get day of week name
   * @param {Date} date - Date
   * @returns {string} Day name
   */
  getDayName(date) {
    const days = {
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      it: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
    };
    return days[this.currentLanguage][date.getDay()];
  }
}
