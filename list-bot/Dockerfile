FROM node:19-alpine As installer

WORKDIR /usr/src/app

COPY --chown=node:node . ./

# Install system-level dependencies (if needed)
# For example, on Debian-based systems:
RUN apk add --no-cache sqlite

RUN npm rebuild

# Install app dependencies
RUN npm install --no-audit

CMD ["node", "./list-bot/index.js"]
