#!/bin/bash
docker build -f ./Dockerfile . -t ferchoslim/catalyst-user-service:latest
docker push ferchoslim/catalyst-user-service:latest