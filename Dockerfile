# 1. Usar imagen oficial de Node.js
FROM node:24-alpine

# 2. Directorio de trabajo
WORKDIR /usr/src/app

# 3. Copiar archivos de dependencias
COPY package*.json ./

# 4. Instalar dependencias
RUN npm install

# 5. Copiar el resto del código
COPY . .

# 6. Construir el proyecto (compilar TypeScript a JS)
RUN npm run build

# 7. Exponer el puerto que usa NestJS
EXPOSE 3000

# 8. Comando para arrancar
CMD ["npm", "run", "start:prod"]