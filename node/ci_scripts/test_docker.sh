#!/bin/bash
docker run --name test-container -d -p 4000:4000 -p 8900:8900 $REPOSITORY_URL:latest;
sleep 15;
docker inspect --format='{{range $p, $conf := .NetworkSettings.Ports}} {{$p}} -> {{(index $conf 0).HostPort}} {{end}}' test-container
docker container logs test-container
result=$(docker ps |grep test-container)

if [[ -n "$result" ]]; then
  echo "success" > result.txt
  docker container stop test-container
  docker container rm test-container
else
  echo "error" > result.txt
fi
