const Logger = {
  prefix: '[Medium→LinkedIn]',
  
  info(message, ...args) {
    console.log(`${this.prefix} ℹ️`, message, ...args);
  },
  
  success(message, ...args) {
    console.log(`${this.prefix} ✓`, message, ...args);
  },
  
  error(message, ...args) {
    console.error(`${this.prefix} ✗`, message, ...args);
  },
  
  warn(message, ...args) {
    console.warn(`${this.prefix} ⚠️`, message, ...args);
  },
  
  debug(message, ...args) {
    console.debug(`${this.prefix} 🔍`, message, ...args);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}

