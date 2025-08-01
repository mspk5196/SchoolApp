# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads/documents uploads/events uploads/materials uploads/message_attachments uploads/profileImages/coordinator uploads/profileImages/mentor uploads/profileImages/students

# Expose the port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
