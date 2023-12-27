FROM node:19-alpine As installer

WORKDIR /usr/src/app

COPY --chown=node:node . ./

# Install app dependencies
RUN npm install --no-audit
CMD ["node", "main.js"]
