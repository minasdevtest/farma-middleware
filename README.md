# Farmácia Solidária - Gateway Microserviços 

Gerenciador de Microserviços da Farmácia solidária

## Execução

```bash
npm install     # instala dependencias
npm run build   # Gera código otimizado
npm start       # Executa a aplicação
npm run watch   # Executa a aplicação em modo de desenvolvimento
```

## ENV Variables

 - PORT: Porta a ser executada
 - SECRET: Palavra secreta que será usada para criptografia
 - MS_NEWS: endereço do MS de notícias
 - MS_MEDICINE: endereço do MS de Medicamentos
 - MS_LOCATION: endereço do MS de Localização

 ## TODO:

- [ ] Use [Express Proxy](https://www.npmjs.com/package/express-http-proxy)