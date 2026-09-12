#!/usr/bin/env bash
# exit on error
set -o errexit

npm install --include=dev
npx puppeteer browsers install chrome
npm run build
