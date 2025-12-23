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
COPY bff/packages ./bff/packages

# --------------------
# Install & build
# --------------------
RUN yarn install --frozen-lockfile
RUN yarn workspace bff-citizen build

# --------------------
# Run
# --------------------
EXPOSE 3000
CMD ["node", "bff/bff-citizen/dist/server.js"]
