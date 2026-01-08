FROM node:20-alpine

WORKDIR /repo

COPY package.json ./
COPY bff ./bff
COPY bff/packages ./bff/packages

RUN yarn install --frozen-lockfile
RUN yarn workspace bff-core build
RUN yarn workspace bff-admin build

EXPOSE 3000
CMD ["node", "bff/bff-admin/dist/server.js"]
