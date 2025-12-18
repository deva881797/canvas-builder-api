FROM node:18-alpine

# Install dependencies for node-canvas (Cairo) and FONTS
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    # Fonts for text rendering
    font-noto \
    ttf-dejavu \
    ttf-liberation \
    fontconfig \
    && fc-cache -f

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
