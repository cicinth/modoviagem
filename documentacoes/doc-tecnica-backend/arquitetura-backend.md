# Arquitetura do Backend

## Objetivo

O backend foi reorganizado para um padrao MVC com separacao de responsabilidades e dependencia invertida nas regras de negocio.

## Stack

- Node.js
- Express
- PostgreSQL
- Prisma
- Vitest
- Docker Compose para banco local

## Estrutura

```txt
back/
├── docker-compose.yml
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── src/
    ├── app.js
    ├── server.js
    ├── config/
    │   ├── env.js
    │   └── prisma.js
    ├── modules/
    │   └── trips/
    │       ├── controllers/
    │       ├── mappers/
    │       ├── models/
    │       ├── repositories/
    │       ├── routes/
    │       └── services/
    └── shared/
        ├── errors/
        └── middlewares/
```

## Camadas

### Routes

Arquivo principal:

```txt
src/modules/trips/routes/tripRoutes.js
```

Responsabilidade:

- registrar endpoints HTTP
- conectar controller, service e repository

### Controllers

Arquivo principal:

```txt
src/modules/trips/controllers/TripController.js
```

Responsabilidade:

- receber `request`
- chamar o service
- devolver resposta HTTP
- tratar `404` quando uma viagem nao existe

O controller nao contem regra de negocio.

### Services

Arquivo principal:

```txt
src/modules/trips/services/TripService.js
```

Responsabilidade:

- aplicar fluxo de uso
- normalizar e validar entrada
- finalizar viagem
- depender de um repository injetado

Essa camada segue DIP: o service nao conhece Prisma diretamente, apenas o contrato esperado do repository.

### Models

Arquivo principal:

```txt
src/modules/trips/models/tripModel.js
```

Responsabilidade:

- normalizar campos
- converter listas e checklists
- validar regra obrigatoria de viagem
- centralizar valores de status e checklist padrao

### Repositories

Arquivo principal:

```txt
src/modules/trips/repositories/PrismaTripRepository.js
```

Responsabilidade:

- executar operacoes no banco via Prisma
- esconder detalhes de persistencia do service
- retornar dados no formato esperado pela API

### Mappers

Arquivo principal:

```txt
src/modules/trips/mappers/tripMapper.js
```

Responsabilidade:

- converter entidades normalizadas do banco para o contrato HTTP atual
- converter payload normalizado para formato de persistencia Prisma

## Endpoints

```txt
GET    /api/health
GET    /api/trips
GET    /api/trips/:id
POST   /api/trips
PUT    /api/trips/:id
PATCH  /api/trips/:id/finalize
DELETE /api/trips/:id
```

## Principios aplicados

### Single Responsibility Principle

Cada camada tem uma razao clara para mudar:

- controller muda por HTTP
- service muda por regra de negocio
- repository muda por persistencia
- mapper muda por contrato de entrada/saida

### Dependency Inversion Principle

`TripService` recebe o repository no construtor. Isso permite testar a regra com repository fake e trocar Prisma por outra implementacao se necessario.

### Open/Closed Principle

Novas formas de persistencia podem ser adicionadas criando outro repository sem alterar o service.

## Testes

Os testes unitarios ficam junto dos arquivos testados:

```txt
src/modules/trips/models/tripModel.test.js
src/modules/trips/services/TripService.test.js
```

Comando:

```bash
cd back
npm run test
```

Politica adotada:

- toda regra nova em model/service deve receber teste unitario
- controller e repository podem receber testes de integracao quando o fluxo HTTP ou banco ficar mais complexo

## Execucao local

```bash
cd back
npm install
docker compose up -d
npm run prisma:migrate
npm run db:seed
npm run dev
```

O backend sobe em:

```txt
http://localhost:3333
```

## Importacao do legado

O arquivo antigo `back/data/trips.txt` pode ser importado para o Postgres com:

```bash
cd back
npm run import:legacy-trips
```

O script ignora viagens que ja existam com o mesmo `id`.

Para o fluxo diario local, prefira:

```bash
cd back
npm run docker:up
```

Esse comando sobe o Postgres, aplica migrations e roda o seed default de forma idempotente.
