const fetch = require('cross-fetch');

export default {
  getStateHandle: function({ issuerUrl, clientId, redirectUri }) {

    // Screen scrape until bootstrap API is public
    const params = [
      `client_id=${clientId}`,
      `redirect_uri=http://localhost:8080/implicit/callback`,
      `scope=openid+profile+email`,
      `response_mode=fragment`,
      `response_type=id_token`,
      `nonce=someNonce`,
      `state=someState`,
    ].join('&');

    const target = `${issuerUrl}/oauth2/v1/authorize?${params}`;
    return fetch(target, {
      method: 'GET',
    })
      .then( response => response.ok ? response.text() : Promise.reject(response.statusCode) )
      .then( html => {
        const matches = html.match(/var stateToken = ["']([^"']*)['"]/);
        const unconverted = matches && matches[1];
        // Because we are scraping text that is intended to be read from files by the JS engine,
        // the text is "raw" e.g. \x2D ("-") is in the string as separate characters
        // So lets forcably convert that:
        const handle = unconverted && unconverted.replace(/\\x([0-9A-F]{2})/g, (_,encoding) => String.fromCharCode(parseInt(encoding, 16)));
        return handle;
      })
      .catch( err => console.warn(err) );
  }
};
