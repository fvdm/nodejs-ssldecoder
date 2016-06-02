#!/bin/bash

PATH=./node_modules/.bin:$PATH

curl -s -o- https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash

gitBranch=`git rev-parse --abbrev-ref HEAD`
installVersion=`echo $1 | sed s/node-//`

if [ "$installVersion" == "" ]; then
  installVersion="stable"
fi

case "$1" in
  lint)
    echo
    echo "----------------------------------------"
    echo "Running test: lint"
    echo "----------------------------------------"
    echo

    . ~/.nvm/nvm.sh; nvm install stable

    if [ ! -x 'node_modules/.bin/eslint' ]; then
      echo "Downloading eslint"
      npm install eslint
    fi

    eslint .
  ;;
  
  coverage)
    echo
    echo "----------------------------------------"
    echo "Running test: coverage"
    echo "----------------------------------------"
    echo

    . ~/.nvm/nvm.sh; nvm install stable

    if [ ! -x 'node_modules/.bin/istanbul' ]; then
      echo "Downloading istanbul"
      npm install istanbul
    fi

    istanbul cover test.js

    if [ "$gitBranch" == "master" ] && [ "$CODECLIMATE_REPO_TOKEN" != "" ]; then
      codeclimate-test-reporter < ./coverage/lcov.info
    fi
  ;;
  
  *)
    echo
    echo "----------------------------------------"
    echo "Running test: script for Node.js $installVersion"
    echo "----------------------------------------"
    echo

    . ~/.nvm/nvm.sh; nvm install $installVersion
    npm install --production
    node ./test.js
  ;;
esac
