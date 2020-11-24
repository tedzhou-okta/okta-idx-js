import bootstrap from '../../src/bootstrap';

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery

const mockInteractResponse = require('../mocks/interact-response');
const { Response } = jest.requireActual('cross-fetch');

let domain = 'http://okta.example.com';
let stateHandle = 'FAKEY-FAKE';
let version = '1.0.0';
let clientId = 'CLIENT_ID';

describe('bootstrap', () => {
  it('fetches an interaction handle', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );
    return bootstrap({ clientId, domain, scope: 'openid email' }) 
      .then( result => {
        expect(result).toEqual('ZZZZZZZINTERACTZZZZZZZZ');
      });
  });
});

