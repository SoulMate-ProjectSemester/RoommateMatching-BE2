# Use the official Node.js image from the Docker Hub
FROM node:16

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the local code to the container image.
COPY . .

# Set the environment variables
ENV NODE_ENV production

# If you have a build script, uncomment the next line
# RUN npm run build

# Expose the port the app runs on
EXPOSE 8181

# Run the web service on container startup.
CMD ["npm", "app.js"]
