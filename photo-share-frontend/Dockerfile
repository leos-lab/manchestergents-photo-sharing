FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN echo "======== App.js Content =========" && cat src/App.js && echo "================================="
RUN npm run build
RUN npm install -g serve
ENV REACT_APP_API_BASE=http://localhost:3000/api
CMD ["serve", "-s", "build", "--listen", "5173"]
