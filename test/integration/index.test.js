import idx from '../../dist/idx';
import dotenv from 'dotenv';

dotenv.config();

// Note: idx-js provides no front end UI
// Thus, rather than testing a front end UI, these are integration tests
// where no network interactions are mocked

import idxBootstrap from './idxBootstrap';

const config = {};

beforeEach( async () => {
  config.issuerUrl = process.env.ISSUER_URL;
  config.clientId = process.env.CLIENT_ID;
  config.redirectUri = process.env.REDIRECT_URI;
  config.userIdentifier = process.env.USER_IDENTIFIER;
  config.stateHandle =  await idxBootstrap.getStateHandle({ ...config });
});

describe('idx-js', () => {
  it('returns an idxState on start()', async () => {
    const stateHandle = config.stateHandle;
    return idx.start({ domain: config.issuerUrl, stateHandle })
      .then( idxState => {
        expect(idxState).toBeDefined();
      });
  });

  // Test exists for development, will replace before completion
  xit('can proceed()', async () => {
    const stateHandle = config.stateHandle;
    return idx.start({ domain: config.issuerUrl, stateHandle })
      .then( idxState => idxState.proceed('identify', { identifier: config.userIdentifier }) )
      .then( idxResponse => console.warn(JSON.stringify(idxResponse, null, 2)) );
  });

});


