FROM node:latest


COPY . . /image-predict/
WORKDIR /image-predict


RUN npm install @tensorflow/tfjs-node
RUN npm install


CMD [ "node", "server.js" ]