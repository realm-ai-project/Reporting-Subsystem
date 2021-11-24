#!/bin/bash
export FLASK_APP=api.py
cd api
flask run & pid1=$!
cd ..
npm run start & pid2=$!

echo "pids is $pid1 $pid2"

trap "kill -9 $pid1" SIGTERM SIGINT # This is not killing the process
trap "kill -9 $pid2" SIGTERM SIGINT # This is not killing the process
wait $pid1 $pid2
echo "reporting subsystem has been stopped"
