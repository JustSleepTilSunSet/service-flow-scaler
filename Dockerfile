FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install

#Inner port.
EXPOSE 3001
CMD ["npm","start"]