# Usa uma imagem Node.js leve
FROM node:20-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia apenas os arquivos de dependência primeiro (melhora o cache do Docker)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o resto do código da aplicação
COPY . .

# Compila o TypeScript do NestJS
RUN npm run build

# Expõe a porta que a aplicação vai rodar
EXPOSE 3000

# Comando para rodar a aplicação em produção
CMD ["npm", "run", "start:prod"]