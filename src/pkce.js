// Code verifier: Random URL-safe string with a minimum length of 43 characters.
// Code challenge: Base64 URL-encoded SHA-256 hash of the code verifier.
// var MIN_VERIFIER_LENGTH = 43;
// var MAX_VERIFIER_LENGTH = 128;
// var DEFAULT_CODE_CHALLENGE_METHOD = 'S256';

// function dec2hex (dec) {
//   return ('0' + dec.toString(16)).substr(-2);
// }

// function getRandomString(length) {
//   var a = new Uint8Array(Math.ceil(length / 2));
//   crypto.getRandomValues(a);
//   var str = Array.from(a, dec2hex).join('');
//   return str.slice(0, length);
// }

// function generateVerifier(prefix) {
//   var verifier = prefix || '';
//   if (verifier.length < MIN_VERIFIER_LENGTH) {
//     verifier = verifier + getRandomString(MIN_VERIFIER_LENGTH - verifier.length);
//   }
//   return encodeURIComponent(verifier).slice(0, MAX_VERIFIER_LENGTH);
// }

const makeCodePair = function makeCodePair() { 
  return { 
    codeChallenge: 'FAKE_PKCE_HASH', //FIXME
    codeVerifier: 'FAKE_PKCE_STRING',
  };
};

export default { 
  makeCodePair
};
