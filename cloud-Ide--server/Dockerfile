# Use an official Ubuntu base image
FROM ubuntu

# Install required dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# Set working directory
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install both production and development dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the app on port 9000
EXPOSE 9000

# Command to start the app using nodemon for hot-reloading
CMD ["npm", "run", "dev"]
