/**
 * ColorSystem - Manages theme and color presets for Mochi
 */

const COLOR_PALETTES = {
  white: {
    primary: '#FFFFFF',
    secondary: '#FFB6C1',
    background: '#F0F0F0',
    text: '#333333'
  },
  black: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
    background: '#0A0A0A',
    text: '#FFFFFF'
  },
  pink: {
    primary: '#FF69B4',
    secondary: '#FFB6C1',
    background: '#FFF0F5',
    text: '#333333'
  },
  blue: {
    primary: '#4169E1',
    secondary: '#87CEEB',
    background: '#F0F8FF',
    text: '#333333'
  },
  green: {
    primary: '#32CD32',
    secondary: '#90EE90',
    background: '#F0FFF0',
    text: '#333333'
  },
  yellow: {
    primary: '#FFD700',
    secondary: '#FFFFE0',
    background: '#FFFACD',
    text: '#333333'
  },
  purple: {
    primary: '#9370DB',
    secondary: '#DDA0DD',
    background: '#F8F0FF',
    text: '#333333'
  },
  orange: {
    primary: '#FF8C00',
    secondary: '#FFA500',
    background: '#FFF8DC',
    text: '#333333'
  },
  cyan: {
    primary: '#00CED1',
    secondary: '#AFEEEE',
    background: '#E0FFFF',
    text: '#333333'
  },
  peach: {
    primary: '#FFDAB9',
    secondary: '#FFE4B5',
    background: '#FFF5EE',
    text: '#333333'
  },
  lime: {
    primary: '#00FF00',
    secondary: '#ADFF2F',
    background: '#F5FFFA',
    text: '#333333'
  },
  lavender: {
    primary: '#E6E6FA',
    secondary: '#D8BFD8',
    background: '#FFF0F5',
    text: '#333333'
  }
};

export class ColorSystem {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.currentColor = this.stateManager.getState('colorPreset') || 'black';
  }

  /**
   * Set color preset
   * @param {string} preset - Color preset name
   */
  setColor(preset) {
    if (COLOR_PALETTES[preset]) {
      this.currentColor = preset;
      this.stateManager.updateState('colorPreset', preset);
      this.applyColorToDOM();
    }
  }

  /**
   * Get current color
   * @returns {string} Current color preset name
   */
  getCurrentColor() {
    return this.currentColor;
  }

  /**
   * Get color palette for preset
   * @param {string} preset - Color preset name
   * @returns {Object} Color palette object
   */
  getPalette(preset) {
    return COLOR_PALETTES[preset] || COLOR_PALETTES.pink;
  }

  /**
   * Apply color to DOM (CSS variables)
   */
  applyColorToDOM() {
    const palette = this.getPalette(this.currentColor);
    const root = document.documentElement;
    
    // Only apply Mochi's color - keep app background dark
    root.style.setProperty('--mochi-primary', palette.primary);
    root.style.setProperty('--mochi-secondary', palette.secondary);
  }

  /**
   * Get all available color presets
   * @returns {Array<string>} Array of color preset names
   */
  getAvailableColors() {
    return Object.keys(COLOR_PALETTES);
  }
}
