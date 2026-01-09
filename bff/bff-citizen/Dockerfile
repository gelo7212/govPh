FROM node:20-alpine

WORKDIR /repo

# --------------------
# Root workspace files
# --------------------
COPY package.json ./

# --------------------
# Workspace folders
# --------------------
COPY bff ./bff

# --------------------
# Install & build
# --------------------
RUN yarn install --frozen-lockfile
RUN yarn workspace @gov-ph/bff-core build
RUN yarn workspace bff-citizen build

# --------------------
# Run
# --------------------
EXPOSE 3000
CMD ["node", "bff/bff-citizen/dist/server.js"]
