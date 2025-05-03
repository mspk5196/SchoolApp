export const fetchWithTimeout = (url, options, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, timeout);
  
      fetch(url, options)
        .then(response => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch(err => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };