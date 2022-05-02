#!/bin/bash
docker buildx build --platform linux/amd64 -f ./Dockerfile . -t ferchoslim/catalyst-user-service:latest
docker push ferchoslim/catalyst-user-service:latest