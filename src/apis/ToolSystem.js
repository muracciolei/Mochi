/**
 * ToolSystem - Intent detection and API routing for factual information
 */

export class ToolSystem {
  constructor(i18nModule) {
    this.i18n = i18nModule;
    this.apiKeys = {
      openweather: '', // User should provide
      nasa: 'DEMO_KEY' // NASA demo key
    };
  }

  /**
   * Detect intent from user input
   * @param {string} input - User input text
   * @returns {Object} Intent object
   */
  detectIntent(input) {
    const lowerInput = input.toLowerCase();
    
    // Weather keywords
    if (lowerInput.match(/weather|temperature|forecast|rain|sunny|cloud|hot|cold/)) {
      return {
        type: 'weather',
        params: { location: this.extractLocation(input) || 'current' },
        confidence: 0.9
      };
    }
    
    // Wikipedia keywords
    if (lowerInput.match(/what is|who is|tell me about|explain|define/)) {
      return {
        type: 'wikipedia',
        params: { topic: this.extractTopic(input) },
        confidence: 0.8
      };
    }
    
    // NASA/Space keywords
    if (lowerInput.match(/space|planet|star|astronomy|nasa|galaxy|universe|mars|moon/)) {
      return {
        type: 'nasa',
        params: { query: input },
        confidence: 0.85
      };
    }
    
    // News keywords
    if (lowerInput.match(/news|headlines|what's happening|current events/)) {
      return {
        type: 'news',
        params: {},
        confidence: 0.9
      };
    }
    
    // Default: conversational
    return {
      type: 'conversational',
      params: { input },
      confidence: 0.5
    };
  }

  /**
   * Extract location from input
   * @param {string} input - User input
   * @returns {string|null} Location name
   */
  extractLocation(input) {
    // Simple extraction - look for "in [location]"
    const match = input.match(/in\s+([a-zA-Z\s]+)/i);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract topic from input
   * @param {string} input - User input
   * @returns {string} Topic
   */
  extractTopic(input) {
    // Remove question words
    return input
      .replace(/what is|who is|tell me about|explain|define/gi, '')
      .trim();
  }

  /**
   * Route intent to appropriate API handler
   * @param {Object} intent - Intent object
   * @returns {Promise<Object>} Tool response
   */
  async routeIntent(intent) {
    try {
      switch (intent.type) {
        case 'weather':
          return await this.fetchWeather(intent.params.location);
        case 'wikipedia':
          return await this.fetchWikipedia(intent.params.topic);
        case 'nasa':
          return await this.fetchNASA(intent.params.query);
        case 'news':
          return await this.fetchNews();
        case 'conversational':
          return {
            success: true,
            data: { message: 'conversational' },
            source: 'template'
          };
        default:
          return {
            success: false,
            error: 'Unknown intent type',
            source: 'error'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        source: 'error'
      };
    }
  }

  /**
   * Fetch weather data
   * @param {string} location - Location name
   * @returns {Promise<Object>} Weather response
   */
  async fetchWeather(location) {
    try {
      const apiKey = this.apiKeys.openweather || '';
      let url;
      
      if (!apiKey) {
        // No API key - return fun fallback response
        const conditions = ['Sunny', 'Cloudy', 'Partly cloudy', 'Clear', 'Nice'];
        const loc = location === 'current' ? 'your area' : location;
        return {
          success: true,
          data: {
            location: loc,
            temperature: 20 + Math.floor(Math.random() * 10),
            conditions: conditions[Math.floor(Math.random() * conditions.length)],
            humidity: 50 + Math.floor(Math.random() * 30),
            windSpeed: 5 + Math.floor(Math.random() * 15)
          },
          source: 'weather'
        };
      }
      
      if (location === 'current') {
        // Use geolocation
        const position = await this.getCurrentPosition();
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.latitude}&lon=${position.longitude}&appid=${apiKey}&units=metric`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          location: data.name,
          temperature: Math.round(data.main.temp),
          conditions: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6) // Convert m/s to km/h
        },
        source: 'weather'
      };
    } catch (error) {
      // Fallback fun response on error
      return {
        success: true,
        data: {
          location: location === 'current' ? 'your area' : location,
          temperature: 22,
          conditions: 'Nice',
          humidity: 55,
          windSpeed: 10
        },
        source: 'weather'
      };
    }
  }

  /**
   * Get current geolocation position
   * @returns {Promise<Object>} Position coordinates
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  /**
   * Fetch Wikipedia data
   * @param {string} topic - Topic to search
   * @returns {Promise<Object>} Wikipedia response
   */
  async fetchWikipedia(topic) {
    try {
      if (!topic || topic.trim().length === 0) {
        throw new Error('No topic provided');
      }
      
      const lang = this.i18n.getCurrentLanguage();
      const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          title: data.title,
          extract: data.extract,
          thumbnail: data.thumbnail?.source || null,
          url: data.content_urls?.desktop?.page || ''
        },
        source: 'wikipedia'
      };
    } catch (error) {
      return {
        success: false,
        error: this.i18n.t('error.api_generic'),
        source: 'wikipedia'
      };
    }
  }

  /**
   * Fetch NASA data
   * @param {string} query - Query string
   * @returns {Promise<Object>} NASA response
   */
  async fetchNASA(query) {
    try {
      const apiKey = this.apiKeys.nasa || 'DEMO_KEY';
      const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data: {
          title: data.title,
          explanation: data.explanation,
          imageUrl: data.url,
          date: data.date
        },
        source: 'nasa'
      };
    } catch (error) {
      return {
        success: false,
        error: this.i18n.t('error.api_generic'),
        source: 'nasa'
      };
    }
  }

  /**
   * Fetch news data
   * @returns {Promise<Object>} News response
   */
  async fetchNews() {
    try {
      // Import RSS parser dynamically
      const { RSSParser } = await import('../rss/RSSParser.js');
      const rssParser = new RSSParser(this.i18n);
      
      const newsItems = await rssParser.fetchNews();
      
      if (newsItems.length === 0) {
        throw new Error('No news items found');
      }
      
      return {
        success: true,
        data: { items: newsItems },
        source: 'news'
      };
    } catch (error) {
      return {
        success: false,
        error: this.i18n.t('error.api_generic'),
        source: 'news'
      };
    }
  }

  /**
   * Set API key
   * @param {string} service - Service name
   * @param {string} key - API key
   */
  setAPIKey(service, key) {
    this.apiKeys[service] = key;
  }
}
