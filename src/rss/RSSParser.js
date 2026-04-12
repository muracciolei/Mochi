/**
 * RSSParser - Fetches and parses RSS news feeds
 */

const DEFAULT_FEEDS = {
  en: 'https://rss.cnn.com/rss/edition.rss',
  es: 'https://cnnespanol.cnn.com/feed/',
  it: 'https://www.rainews.it/rss/homepage.xml'
};

export class RSSParser {
  constructor(i18nModule) {
    this.i18n = i18nModule;
  }

  /**
   * Fetch news from default feed based on language
   * @returns {Promise<Array>} Array of news items
   */
  async fetchNews() {
    const lang = this.i18n.getCurrentLanguage();
    const feedUrl = DEFAULT_FEEDS[lang] || DEFAULT_FEEDS.en;
    return await this.fetchCustomFeed(feedUrl);
  }

  /**
   * Fetch news from custom RSS URL
   * @param {string} url - RSS feed URL
   * @returns {Promise<Array>} Array of news items
   */
  async fetchCustomFeed(url) {
    try {
      // Use CORS proxy for RSS feeds
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const xmlText = await response.text();
      return this.parseRSS(xmlText);
    } catch (error) {
      console.error('RSS fetch error:', error);
      return [];
    }
  }

  /**
   * Parse RSS XML to NewsItem array
   * @param {string} xmlString - RSS XML string
   * @returns {Array} Array of news items
   */
  parseRSS(xmlString) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('XML parsing error');
      }
      
      const items = xmlDoc.querySelectorAll('item');
      const newsItems = [];
      
      // Get top 5 headlines
      const maxItems = Math.min(items.length, 5);
      
      for (let i = 0; i < maxItems; i++) {
        const item = items[i];
        
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        
        if (title) {
          newsItems.push({
            title: this.cleanText(title),
            description: this.cleanText(description),
            pubDate,
            link
          });
        }
      }
      
      return newsItems;
    } catch (error) {
      console.error('RSS parse error:', error);
      return [];
    }
  }

  /**
   * Clean HTML/CDATA from text
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    // Remove CDATA tags
    text = text.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
    
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    text = textarea.value;
    
    return text.trim();
  }
}
