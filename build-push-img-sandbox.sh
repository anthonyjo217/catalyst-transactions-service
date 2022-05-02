#!/bin/bash
docker build -f ./Dockerfile . -t ferchoslim/sb-catalyst-user-service:latest
docker push ferchoslim/sb-catalyst-user-service:latest