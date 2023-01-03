#!/bin/bash
cd /home/ec2-user/nodejs-react-mongo
npm install
npm run build
pm2 reload 0