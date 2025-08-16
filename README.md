# **Omni**

**Chat em tempo real com segurança de nível empresarial, auditoria completa e criptografia ponta a ponta.**

[![Fastify](https://img.shields.io/badge/Fastify-4.24.3-blue.svg?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Zod](https://img.shields.io/badge/Zod-3.22.4-ff69b4.svg?logo=zod&logoColor=white)](https://github.com/colinhacks/zod)
[![Prisma](https://img.shields.io/badge/Prisma-5.7.1-2D3748.svg?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ESLint](https://img.shields.io/badge/ESLint-8.55.0-4B32C3.svg?logo=eslint&logoColor=white)](https://eslint.org/)
[![Vitest](https://img.shields.io/badge/Vitest-1.0.4-6E9F18.svg?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Swagger](https://img.shields.io/badge/Swagger-8.12.0-85EA2D.svg?logo=swagger&logoColor=black)](https://swagger.io/)
[![Scalar](https://img.shields.io/badge/Scalar-1.20.31-orange.svg?logo=swagger&logoColor=white)](https://scalar.com/)
[![Redis](https://img.shields.io/badge/Redis-4.6.11-D82C20.svg?logo=redis&logoColor=white)](https://redis.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.7.4-black.svg?logo=socketdotio&logoColor=white)](https://socket.io/)

[![Validate Code Quality](https://github.com/Stivan-Lucas/Omni-Chat-Real-Time/actions/workflows/lint.yml/badge.svg)](https://github.com/Stivan-Lucas/Omni-Chat-Real-Time/actions/workflows/lint.yml)
[![Coverage](https://codecov.io/gh/Stivan-Lucas/Omni-Chat-Real-Time/branch/main/graph/badge.svg)](https://codecov.io/gh/Stivan-Lucas/Omni-Chat-Real-Time)

> Desenvolvido para garantir comunicações seguras e confiáveis entre empresas, com foco total em proteção contra golpes e fraudes.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 24+ recomendada)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- [GIT](https://git-scm.com/downloads)

## Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/Stivan-Lucas/Omni-Chat-Real-Time.git server
```

### 2. Acessar a pasta do projeto

```bash
cd <caminho-para-o-projeto>/server
```

### 3. Instalar dependências do Node.js

```bash
npm install
```

### 4. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário:

```bash
cp .env.example .env
```

> **Dica:** Certifique-se de configurar corretamente as variáveis de ambiente para seu ambiente (desenvolvimento ou produção).

### 5. Subir os containers com Docker Compose

```bash
docker-compose -f docker-compose.yml --env-file .env -p omni_dev up -d
```

Este comando irá subir o PostgreSQL, Redis e demais serviços necessários.

### 6. Rodar as migrations do banco com Prisma

```bash
npx prisma generate && npx prisma migrate deploy
```

> **Importante:** O comando prisma generate gera o cliente Prisma a partir do schema, certifique-se de rodá-lo sempre que modificar o schema.

### 7. Rodar a aplicação

- Para rodar em modo produção:

```bash
npm run build && npm run start
```

- Para rodar em modo desenvolvimento (com hot reload):

```bash
npm run dev
```

Perfeito! Podemos organizar seu README na seção de testes de forma clara, mostrando como configurar o banco e executar os diferentes comandos. Aqui está uma sugestão ajustada:

---

### 8. Rodar os testes

Antes de rodar os testes, você precisa criar o banco de dados de testes. Certifique-se de ter um arquivo `.env.test` configurado e ajuste as portas se necessário.

```bash
docker-compose -f docker-compose.test.yml --env-file .env.test -p omni_test up -d
```

#### Scripts de teste

O projeto utiliza `vitest` e `prisma`. Os seguintes scripts estão disponíveis no `package.json`:

- **Rodar todos os testes**

```bash
npm run test
```

Gera os clientes Prisma, aplica as migrations e executa os testes.

- **Rodar testes em modo watch**

```bash
npm run test:watch
```

Roda os testes continuamente, reiniciando quando há mudanças no código.

- **Resetar o banco de testes**

```bash
npm run test:reset
```

Reseta o banco de dados de testes, aplicando novamente todas as migrations.

- **Gerar cobertura de testes**

```bash
npm run test:coverage
```

Roda os testes e gera relatórios de cobertura.

- **Cobertura em HTML**

```bash
npm run test:coverage:html
```

Gera o relatório de cobertura em HTML, que pode ser aberto no navegador.

## Contribuindo

Contribuições são bem-vindas! Por favor, siga as etapas abaixo:

1. Fork este repositório
2. Crie sua branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
