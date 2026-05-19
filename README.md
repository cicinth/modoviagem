# Viajário

Projeto inicial do planejador de viagens em dois apps separados:

- `front`: React com Vite
- `back`: Node.js com Express

## Como rodar

### Backend

O backend usa PostgreSQL com Prisma. Em um terminal:

```bash
cd back
npm install
npm run docker:up
npm run dev
```

### Frontend

Em outro terminal:

```bash
cd front
npm install
npm run dev
```

O frontend consome a API em `http://localhost:3333/api`.

## Persistência do MVP

As viagens agora sao salvas em PostgreSQL via Prisma. A modelagem e a arquitetura tecnica estao documentadas em `documentacoes/doc-tecnica-backend/`.
