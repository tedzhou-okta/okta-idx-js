import idx from '../../src/index';
//  We must import before webpack to be able to mock
//  Integration tests will run against webpacked code

// Note: All network interactions should be mocked
// All stateHandles and similar are fake
// See the integration tests for the full back-and-forth

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery
const mockRequestIdentity = require('../mocks/request-identifier');
const { Response } = jest.requireActual('cross-fetch');

fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockRequestIdentity )) ) );

const stateHandle = 'FAKE_STATE_HANDLE';
const domain = 'http://okta.example.com';

describe('idx-js', () => { 
  it('loads', async () => { 
    const idxState = await idx.start({ domain, stateHandle });
    expect(idxState).toBeDefined();
    expect(idxState.proceed).toBeDefined();
    expect(idxState.rawIdxState).toMatchObject(mockRequestIdentity);
  });

  it('populates neededToProceed', async () => { 
    const idxState = await idx.start({ domain, stateHandle });
    expect(idxState.neededToProceed).toMatchObject({
      identify: [ { name: 'identifier', label: 'Username' } ],
      'select-enroll-profile': [],
    });
  });

});

