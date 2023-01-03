#!/bin/bash
npm install
# npm run build

DIR="/home/ec2-user/nodejs-react-mongo"
if [ -d "$DIR" ]; then
    echo "$DIR exists" 
else
    echo "Creating $DIR directory"
    mkdir $DIR
fi