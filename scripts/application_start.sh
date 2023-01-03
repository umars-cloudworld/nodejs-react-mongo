#!/bin/bash
cd /home/ec2-user/nodejs-react-mongo
sudo chmod -R 777 /home/ec2-user/nodejs-react-mongo
npm install
npm run build
sudo npm install pm2 -g
pm2 start "node dist/index.js"
