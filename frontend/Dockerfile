FROM node:16

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем все зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Устанавливаем react-scripts глобально
RUN npm install -g react-scripts@5.0.1

EXPOSE 3000

CMD ["npm", "start"] 