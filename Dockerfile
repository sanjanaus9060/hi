# Use official Node image
FROM node:18

# Create app directory inside container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Expose port (change if your app uses different port)
EXPOSE 3000

# Start application
CMD ["npm", "start"]
