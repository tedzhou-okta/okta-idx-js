// We load all the current parsers, because we won't know in advance which version(s) we need to parse
// Expect to only support current major - 1 (also suspect that this limit may never be hit)

import v1 from './v1/parsers'; // More granularity to be defined as needed

const parsersForVersion = function parsersForVersion( version ) {
  switch (version) {
    case '1.0.0':
      return v1;
    case undefined:
    case null:
      throw new Error(`Api version is required`);
    default:
      throw new Error(`Unknown api version: ${version}.  Use an exact semver version.`);
  }
};

export default parsersForVersion;
