# Usar una imagen base de Node.js actualizada
FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Puerto expuesto
EXPOSE 3000

# Comando para iniciar la aplicación en desarrollo
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]