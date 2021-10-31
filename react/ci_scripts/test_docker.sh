#!/bin/bash
docker run --name test-container -d -p 3010:80 $REPOSITORY_URL:latest;
sleep 15;
docker container logs test-container

result=$(docker ps |grep test-container)

if [[ -n "$result" ]]; then
  echo "success" > result.txt
  docker container stop test-container
  docker container rm test-container
else
  echo "error" > result.txt
fi