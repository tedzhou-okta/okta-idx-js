/* global btoa crypto */

// Code verifier: Random URL-safe string with a minimum length of 43 characters.
// Code challenge: Base64 URL-encoded SHA-256 hash of the code verifier.
const MIN_VERIFIER_LENGTH = 43;
const MAX_VERIFIER_LENGTH = 128;
const DEFAULT_CODE_CHALLENGE_METHOD = 'S256';
const CODE_CHALLENGE_ALGORITHM = {
  S256: 'SHA-256',
};

// converts a standard base64-encoded string to a "url/filename safe" variant
function base64ToBase64Url(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// converts a string to base64 (url/filename safe variant)
function stringToBase64Url(str) {
  const b64 = btoa(str);
  return base64ToBase64Url(b64);
}

function dec2hex(dec) {
  return ('0' + dec.toString(16)).substr(-2);
}

function getRandomString(length) {
  const a = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(a);
  const str = Array.from(a, dec2hex).join('');
  return str.slice(0, length);
}

function generateVerifier(prefix) {
  let verifier = prefix || '';
  if (verifier.length < MIN_VERIFIER_LENGTH) {
    verifier = verifier + getRandomString(MIN_VERIFIER_LENGTH - verifier.length);
  }
  return encodeURIComponent(verifier).slice(0, MAX_VERIFIER_LENGTH);
}

async function computeChallenge(str, codeChallengeMethod = DEFAULT_CODE_CHALLENGE_METHOD) {
  const buffer = new TextEncoder().encode(str);
  const algorithm = CODE_CHALLENGE_ALGORITHM[codeChallengeMethod];

  return crypto.subtle.digest(algorithm, buffer).then(function(arrayBuffer) {
    const hash = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer));
    const b64u = stringToBase64Url(hash); // url-safe base64 variant
    return b64u;
  });
}

export const makeCode = async function makeCode() {
  const codeVerifier = generateVerifier();
  const codeChallenge = await computeChallenge(codeVerifier);
  return {
    codeChallenge,
    codeVerifier,
    codeChallengeMethod: DEFAULT_CODE_CHALLENGE_METHOD,
  };
};

export default {
  makeCode
};
