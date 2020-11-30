import pkce from '../../src/pkce';

describe('pkce', () => {

  describe('makeCode', () => {
    it('returns a codeChallenge, codeChallengeMethod, and a codeVerifier', () => { 
      const { codeChallenge, codeChallengeMethod, codeVerifier } = pkce.makeCode();
      expect( codeChallenge ).toBeDefined();
      expect( codeChallengeMethod ).toBeDefined();
      expect( codeVerifier ).toBeDefined();
    });

    describe('codeChallengeMethod', () => { 

      it('always returns the one supported value', () => { 
        const { codeChallengeMethod } = pkce.makeCode();
        expect( codeChallengeMethod ).toBe('S256');
      });
    });

    describe('codeVerifier', () => { 
      it('is a random string', () => { 
        const { codeVerifier: code1 } = pkce.makeCode();
        const { codeVerifier: code2 } = pkce.makeCode();
        expect(typeof code1).toEqual('string');
        expect(code1).not.toEqual(code2);
      });

      it('is of the necessary length', () => { 
        const { codeVerifier } = pkce.makeCode();
        expect(codeVerifier.length).toBeGreaterThanOrEqual(43);
        expect(codeVerifier.length).toBeLessThanOrEqual(128);
      });

    });
  });
});

    // it('copies simple context items', () => {
    //   const { context } = parseNonRemediations( mockIdxResponse );
    //   expect( context ).toEqual({
// it('Computes and returns a code challenge', function() {
  // var codeChallengeMethod = 'fake';
  // var codeVerifier = 'alsofake';
  // var codeChallenge = 'ohsofake';

  // spyOn(OktaAuth.features, 'isPKCESupported').and.returnValue(true);
  // var sdk = new OktaAuth({ issuer: 'https://foo.com', pkce: true });
  // spyOn(oauthUtil, 'getWellKnown').and.returnValue(Promise.resolve({
    // 'code_challenge_methods_supported': [codeChallengeMethod]
  // }));
  // spyOn(pkce, 'generateVerifier').and.returnValue(codeVerifier);
  // spyOn(pkce, 'saveMeta');
  // spyOn(pkce, 'computeChallenge').and.returnValue(Promise.resolve(codeChallenge));
  // return token.prepareTokenParams(sdk, {
    // codeChallengeMethod: codeChallengeMethod
  // })
  // .then(function(oauthParams) {
    // expect(oauthParams.codeChallenge).toBe(codeChallenge);
  // });
// });
