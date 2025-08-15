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
[![Mailgun](https://img.shields.io/badge/Mailgun.js-9.4.1-CF2C1D.svg?logo=mailgun&logoColor=white)](https://www.mailgun.com/)
[![bcrypt](https://img.shields.io/badge/bcrypt-5.1.1-yellow.svg?logo=lock&logoColor=black)](https://www.npmjs.com/package/bcrypt)
[![AWS SDK](https://img.shields.io/badge/AWS_SDK-2.1519.0-FF9900.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/sdk-for-javascript/)

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
docker compose -f docker-compose.yml up -d --build
```

Este comando irá subir o PostgreSQL, Redis e demais serviços necessários.

### 6. Rodar as migrations do banco com Prisma

```bash
npx prisma generate
npx prisma migrate deploy
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

## Scripts úteis

| Comando               | Descrição                                            |
| --------------------- | ---------------------------------------------------- |
| `npm run start`       | Executa o servidor em produção                       |
| `npm run dev`         | Executa o servidor em desenvolvimento com hot reload |
| `npm run test`        | Executa os testes automatizados                      |
| `docker compose down` | Para e remove os containers Docker                   |

## Contribuindo

Contribuições são bem-vindas! Por favor, siga as etapas abaixo:

1. Fork este repositório
2. Crie sua branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
