FROM node:20

WORKDIR /app
COPY web/package*.json ./
RUN npm install

COPY web/src ./src
COPY web/public ./public
COPY web/index.html ./
COPY web/vite.config.* ./
COPY web/tsconfig.* ./
COPY web/tailwind.config.* ./

EXPOSE 5173 
CMD ["npm", "run", "dev"]
