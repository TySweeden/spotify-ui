#!/bin/bash
set -e      #stop if there is an error
set -x      #show the commands we are running

VERSION=${BUILD_BUILDNUMBER}
BRANCH=${BUILD_SOURCEBRANCHNAME}
COMMIT=${BUILD_SOURCEVERSION}
DATE=$(TZ=America/Chicago date)

echo "{\"build\":\"${VERSION}\",\"date\":\"${DATE}\",\"branch\":\"${BRANCH}\",\"commit\":\"${COMMIT}\"}" > public/build-info.json

npm install
npm run build