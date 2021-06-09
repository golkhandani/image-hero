# development stage for local dev environment
# FROM node:14.16.1 As development
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install 
# COPY . .
# CMD npm run start:dev


FROM node:14.16.1 As production-build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM node:14.16.1 As production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=production-build /usr/src/app/dist ./dist
CMD ["npm", "start"]