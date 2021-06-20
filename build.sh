cd website
npm i --also=dev
npm run buildsite

cd ../typings
npm i --also=dev
tsc

cd ../bot
npm i --also=dev
npm run build