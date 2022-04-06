#build
FROM node:lts-alpine as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

#deploy
FROM node:lts-alpine
WORKDIR /app
COPY --from=build /app/dist ./
COPY --from=build /app/package*.json ./
RUN npm install --production
# dependencies that nestjs needs
RUN npm install reflect-metadata tslib rxjs @nestjs/platform-express
EXPOSE 3000
CMD node ./main.js