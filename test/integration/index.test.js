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
        expect(idxState.rawIdxState).toBeDefined();
        expect(typeof idxState.proceed).toBe('function');
        expect(idxState.neededToProceed).toMatchObject({
          identify: [ {
            name: 'identifier',
            label: 'Username'
          }],
          'select-enroll-profile': [],
        });
        expect(typeof idxState.actions.cancel).toBe('function');
        expect(idxState.context).toBeDefined();
      });
  });

  // Test exists for development, will replace before completion
  xit('can proceed()', async () => {
    const stateHandle = config.stateHandle;
    return idx.start({ domain: config.issuerUrl, stateHandle })
      .then( idxState => idxState.proceed('identify', { identifier: config.userIdentifier }) )
      .then( idxState => { 
        console.warn('identify results');
        console.warn(JSON.stringify(idxState, null, 2));
        return idxState.proceed('select-factor', { factorId: idxState.rawIdxState.remediation.value[0].value[0].options[0].value });
      })
      .then( idxState => { 
        console.warn('select-factor results');
        console.warn(JSON.stringify(idxState, null, 2));
      });
  });

});


