#!/bin/bash
docker buildx build --platform linux/amd64 -f ./Dockerfile . -t ferchoslim/dev-catalyst-user-service:latest
docker push ferchoslim/dev-catalyst-user-service:latest