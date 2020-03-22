# iot-power-meter-app-api

Setup db
 - docker build -f ./scripts/Dockerfile -t iot-power-meter-db -t iot-power-meter-db .
 - docker run -d -p 27017:27017 --name iot-power-meter-db iot-power-meter-db
 - docker exec -it iot-power-meter-db bash
 - cd /data/db2
 - bash init.sh
