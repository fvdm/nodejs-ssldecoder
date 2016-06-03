#!/bin/bash
result=0

eslint *.js || result=1

if [ "$TRAVIS_BRANCH" == "master" ] && [ "$CODECLIMATE_REPO_TOKEN" != "" ]; then
  istanbul cover test.js --print none --report lcovonly || result=1
  [ "$result" -eq "0" ] && codeclimate-test-reporter < ./coverage/lcov.info || result=1
else
  node test.js || result=1
fi

exit $result

