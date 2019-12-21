import generateIdxAction from '../../src/generateIdxAction';

const mockIdxResponse = require('../mocks/request-identifier');
const mockPollingIdxResponse = require('../mocks/poll-for-password');

jest.mock('cross-fetch');
const { Response } = jest.requireActual('cross-fetch');

import fetch from 'cross-fetch'; // import to target for mockery
fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );

describe('generateIdxAction', () => { 
  it('builds a function', () => {
    const actionFunction = generateIdxAction(mockIdxResponse.remediation.value[0]);
    expect(typeof actionFunction).toBe('function');
  });

  it('returns a function that returns a fetch result', async () => {
    const actionFunction = generateIdxAction(mockIdxResponse.remediation.value[0]);
    return actionFunction()
      .then( result => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( result ).toMatchObject( mockIdxResponse );
      });
  });

  // TODO: Conditions to decide if polling is finished are being discussed
  xit('generates a polling function when appropriate', () => { 
    const pollingFunction = generateIdxAction( mockPollingIdxResponse.factor.value.poll );
    fail('not done yet');
  });
});
