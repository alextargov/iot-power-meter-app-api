# iot-power-meter-app-api

## Docker app setup
1. npm run build
1. mkdir _build
1. cp -a dist package*.json _build
1. docker run --name iot-power-meter-api -p 3200:3200 -d iot-power-meter-app-api

## Setup db
 - docker build -f ./scripts/Dockerfile -t iot-power-meter-db -t iot-power-meter-db .
 - docker run -d -p 27017:27017 --name iot-power-meter-db iot-power-meter-db
 - docker exec -it iot-power-meter-db bash "/data/db2/init.sh"
