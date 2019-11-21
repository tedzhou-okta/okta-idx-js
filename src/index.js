const makeIdxState = function({ stateHandle }) {
  const proceed = async function() {
    if (stateHandle) { stateHandle; }
  };
  return {
    proceed,
  };
};


const start = async function start({ stateHandle }) {
  // TODO: Fill in any bootstrapping here
  const idxState = makeIdxState({ stateHandle });
  return idxState;
};

export const foo = "testing";

export default {
  start,
  test: 1
};
