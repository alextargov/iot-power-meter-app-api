# NodeJS image
FROM node:14.5.0-alpine

# Build variables.
ARG npm_config__auth
ARG npm_config_registry
ARG npm_config_production

# Add tini init to handle fork(s) and zombie processes and set-up the work directory.
RUN apk add --no-cache tini && \
    mkdir -p /usr/src/app/dist && \
    chown -R node: /usr/src/app

# Run as a lower level user.
USER node

# Set the work directory.
WORKDIR /usr/src/app

# Copy in the production assets.
COPY --chown=node . /usr/src/app/

# Install the production node_modules.
RUN npm install --only=production

# Ensure all commands are executed under tini.
ENTRYPOINT ["tini", "--"]

# Start up the application.
CMD npm start
