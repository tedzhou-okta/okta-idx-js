import parsersForVersion from '../../../src/parsers';

describe('parsersForVersion', () => { 
  it('is a function', () => { 
    expect(typeof parsersForVersion).toBe('function');
  });

  it('requires a version', () => { 
    expect( () => parsersForVersion()).toThrow(new Error('Api version is required') );
  });

  it('throws an error on an unsupported version', () => { 
    expect( () => parsersForVersion('NOT_A_VERSION')).toThrow(new Error('Unknown api version: NOT_A_VERSION.  Use an exact semver version.') );
  });

  it('returns an object of parsers', () => { 
    const parsers = parsersForVersion('1.0.0');
    expect(parsers).toBeDefined();
    expect(parsers.makeIdxState).toBeDefined();
  });
});
