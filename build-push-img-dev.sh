#!/bin/bash
docker build -f ./Dockerfile . -t ferchoslim/dev-catalyst-user-service:latest
docker push ferchoslim/dev-catalyst-user-service:latest