#!/bin/bash

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

export TEST_SUITE_TYPE="checkstyle"
export TEST_RESULT_FILE_DIR="${REPO}/test-reports/lint"

# The lint command in package.json will always succeed. Errors are reported
# via the generated report.
yarn lint-report

# Run the yarn sync linter
echo "---"
echo "Running yarn sync linter"
echo "---"

cd ${OKTA_HOME}/${REPO}
function yarn_sync() {
    if ! git diff --name-only --exit-code -- '*yarn.lock'
    then
        return 1
    fi
    return 0
}

if ! yarn_sync;
then
    echo "yarn.lock file is not in sync"
    # to catch non-zero exit code after build
    exit $BUILD_FAILURE;
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
