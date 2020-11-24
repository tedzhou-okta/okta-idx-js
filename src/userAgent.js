/* SDK_VERSION is defined in webpack config */
/* global SDK_VERSION */

export const getUserAgent = () => { // TODO: Allow for extending
  return `okta-idx-js/${SDK_VERSION}`;
};

export const userAgentHeaders = () => {
  return {
    'X-Okta-User-Agent-Extended': getUserAgent(),
  };
};
