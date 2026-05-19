# ModoViagem

Projeto inicial do planejador de viagens em dois apps separados:

- `front`: React com Vite
- `back`: Node.js com Express

## Como rodar

Em um terminal:

```bash
cd back
npm install
npm run dev
```

Em outro terminal:

```bash
cd front
npm install
npm run dev
```

O frontend consome a API em `http://localhost:3333/api`.

## Persistência do MVP

As viagens são salvas em `back/data/trips.txt` como JSON dentro de arquivo TXT. A lógica fica isolada em `back/src/storage/tripRepository.js` para facilitar trocar por banco de dados depois.
