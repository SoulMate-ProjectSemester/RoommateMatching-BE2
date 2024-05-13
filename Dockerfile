# Use a base image with Node.js installed
FROM node:14

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the project (if applicable)
RUN npm run build

# Expose the port the application runs on
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
