import pkce from '../../src/pkce';

describe('pkce', () => {

  describe('makeCode', () => {
    it('returns a codeChallenge, codeChallengeMethod, and a codeVerifier', async () => { 
      const { codeChallenge, codeChallengeMethod, codeVerifier } = await pkce.makeCode();
      expect( codeChallenge ).toBeDefined();
      expect( codeChallengeMethod ).toBeDefined();
      expect( codeVerifier ).toBeDefined();
    });

    describe('codeChallengeMethod', () => { 

      it('always returns the one supported value', async () => { 
        const { codeChallengeMethod } = await pkce.makeCode();
        expect( codeChallengeMethod ).toBe('S256');
      });
    });

    describe('codeVerifier', () => { 
      it('is a random string', async () => { 
        const { codeVerifier: code1 } = await pkce.makeCode();
        const { codeVerifier: code2 } = await pkce.makeCode();
        expect(typeof code1).toEqual('string');
        expect(code1).not.toEqual(code2);
      });

      it('is of the necessary length', async () => { 
        const { codeVerifier } = await pkce.makeCode();
        expect(codeVerifier.length).toBeGreaterThanOrEqual(43);
        expect(codeVerifier.length).toBeLessThanOrEqual(128);
      });

    });
  });
});
