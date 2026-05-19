# Modelagem do Banco de Dados

## Decisao

O backend usa PostgreSQL com Prisma. O banco local roda em Docker e a troca futura para Neon, Supabase ou RDS depende apenas da `DATABASE_URL` e da execucao das migrations.

## Entidades

### users

Tabela preparada para autenticacao futura e separacao de dados por usuario.

| Campo | Tipo | Observacao |
| --- | --- | --- |
| id | UUID | Chave primaria |
| name | TEXT | Nome do usuario |
| email | TEXT | Unico |
| created_at | TIMESTAMP | Criacao |
| updated_at | TIMESTAMP | Atualizacao |

Relacionamento:

- Um usuario pode ter muitas viagens.
- `trips.user_id` e opcional para manter compatibilidade com o MVP sem login.

### trips

Entidade principal do planejador.

| Campo | Tipo | Observacao |
| --- | --- | --- |
| id | UUID | Chave primaria |
| user_id | UUID | Opcional, aponta para `users.id` |
| name | TEXT | Obrigatorio |
| destination | TEXT | Destino resumido |
| period | TEXT | Periodo textual usado pelo front atual |
| status | TripStatus | `proxima` ou `finalizada` |
| has_insurance | BOOLEAN | Indica se tem seguro |
| insurance_ticket | TEXT | Bilhete/apolice |
| transport | TEXT | Transporte principal |
| reservation_code | TEXT | Codigo da reserva |
| locator | TEXT | Localizador |
| accommodation | TEXT | Hospedagem |
| accommodation_dates | TEXT | Datas da hospedagem |
| accommodation_link | TEXT | Link da hospedagem |
| accommodation_address | TEXT | Endereco |
| accommodation_directions | TEXT | Como chegar |
| internal_transport | TEXT | Transporte interno |
| itinerary_markdown | TEXT | Roteiro em Markdown |
| created_at | TIMESTAMP | Criacao |
| updated_at | TIMESTAMP | Atualizacao |

Indices:

- `user_id`
- `status`
- `updated_at`

### trip_image_links

Links de imagem associados a uma viagem.

| Campo | Tipo | Observacao |
| --- | --- | --- |
| id | UUID | Chave primaria |
| trip_id | UUID | FK para `trips.id` |
| url | TEXT | URL da imagem |
| position | INTEGER | Ordem de exibicao |
| created_at | TIMESTAMP | Criacao |

Ao remover uma viagem, as imagens sao removidas por cascade.

### trip_documents

Documentos ou referencias textuais associados a uma viagem.

| Campo | Tipo | Observacao |
| --- | --- | --- |
| id | UUID | Chave primaria |
| trip_id | UUID | FK para `trips.id` |
| title | TEXT | Texto atual recebido pelo front |
| position | INTEGER | Ordem de exibicao |
| created_at | TIMESTAMP | Criacao |

O modelo foi mantido simples para preservar o contrato atual. Quando houver upload real, esta tabela pode ganhar `file_url`, `storage_key`, `mime_type` e `size_bytes`.

### trip_tasks

Tarefas da viagem.

| Campo | Tipo | Observacao |
| --- | --- | --- |
| id | UUID | Chave primaria |
| trip_id | UUID | FK para `trips.id` |
| text | TEXT | Descricao |
| done | BOOLEAN | Concluida ou nao |
| position | INTEGER | Ordem de exibicao |
| created_at | TIMESTAMP | Criacao |
| updated_at | TIMESTAMP | Atualizacao |

### trip_packing_items

Checklist de mala.

| Campo | Tipo | Observacao |
| --- | --- | --- |
| id | UUID | Chave primaria |
| trip_id | UUID | FK para `trips.id` |
| text | TEXT | Item da mala |
| done | BOOLEAN | Marcado ou nao |
| position | INTEGER | Ordem de exibicao |
| created_at | TIMESTAMP | Criacao |
| updated_at | TIMESTAMP | Atualizacao |

## Enum

### TripStatus

Valores:

- `proxima`
- `finalizada`

## Contrato preservado com o front

O banco esta normalizado, mas a API continua respondendo no formato usado pelo front:

```json
{
  "id": "uuid",
  "name": "China e Alemanha 2026",
  "imageLinks": ["https://..."],
  "documents": ["Passaporte"],
  "tasks": [{ "text": "Comprar passagens", "done": false }],
  "packingList": [{ "text": "Carregador", "done": false }]
}
```

Essa conversao fica em `src/modules/trips/mappers/tripMapper.js`.

## Migrations

A migration inicial esta em:

```txt
back/prisma/migrations/20260519000000_init/migration.sql
```

Comandos principais:

```bash
cd back
npm run docker:up
npm run prisma:generate
```

## Dados default

A viagem inicial fica exportada em:

```txt
back/prisma/seed/defaultTrips.json
```

O seed e idempotente: se a viagem com o mesmo `id` ja existir, ela e ignorada. A unica excecao e a viagem default criada pela migration em formato minimo; nesse caso o seed hidrata o registro com o conteudo completo exportado em JSON. Isso evita duplicidade quando o comando roda varias vezes e preserva edicoes posteriores.

Comando:

```bash
cd back
npm run db:seed
```
