let fs = require('fs');
let cacheObj = {};

// read from the cache, optionally reading cache contents from file
function readFromCache(inputKey, readCacheFromFile) {
  if (readCacheFromFile) {
    try {
      cacheObj = cacheFile ? JSON.parse(fs.readFileSync(process.env.GEMS_CACHE_FILE, 'utf8')) : {};
    } catch (error) {
      cacheObj = {};
    }
  }
  return cacheObj[inputKey];
}

// write to the cache, optionally writing cache contents to file
function writeToCache(inputKey, inputValue, writeCacheToFile) {
  cacheObj[inputKey] = inputValue;
  if (writeCacheToFile) {
    // do an async write here, we dont need to wait for it to finish
      fs.writeFile(process.env.GEMS_CACHE_FILE, JSON.stringify(cacheObj), () => { });
  }
}

module.exports = { readFromCache, writeToCache };