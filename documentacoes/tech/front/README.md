# Frontend Tecnico

## Visao Geral

O frontend do Viajário e uma aplicacao React com Vite. A tela principal funciona como um diario visual de viagens, com fluxos para listar viagens, criar/editar dados, ver detalhes e abrir o roteiro completo.

Principais tecnologias:

- React para UI e estado local.
- Vite para build/dev server.
- Vitest para testes unitarios.
- CSS global em `src/styles.css`, seguindo o design system do produto.

## Estrutura Atual

```text
front/src
├── api.js
├── api.test.js
├── App.jsx
├── components
│   ├── CollageTitle.jsx
│   ├── formFields.jsx
│   └── ImageWithFallback.jsx
├── features
│   └── trips
│       ├── ChecklistBlocks.jsx
│       ├── Detail.jsx
│       ├── Home.jsx
│       ├── ItineraryPage.jsx
│       ├── RouteBlocks.jsx
│       ├── TripForm.jsx
│       ├── tripModel.js
│       └── tripModel.test.js
├── itinerary.js
├── itinerary.test.js
├── main.jsx
└── styles.css
```

## Responsabilidades

`App.jsx`

- Mantem o estado de navegacao da aplicacao.
- Carrega viagens pela API.
- Orquestra criacao, edicao, finalizacao e atualizacao.
- Escolhe qual tela renderizar: home, formulario, detalhe ou roteiro completo.

`features/trips`

- Contem componentes e regras especificas do dominio de viagens.
- `tripModel.js` centraliza conversoes entre dados da API e estado de formulario.
- `Detail.jsx` controla interacoes de detalhe da viagem, checklists e roteiro paginado.
- `TripForm.jsx` controla o formulario de criacao/edicao.

`components`

- Contem componentes genericos reutilizaveis que nao conhecem o dominio de viagens.
- Exemplos: campos de formulario, imagem com fallback, titulo em colagem.

`itinerary.js`

- Contem logica pura para converter Markdown em blocos renderizaveis.
- Tambem pagina blocos do roteiro em formato de caderno.
- Deve permanecer sem dependencia de React para ser facil de testar.

## Padroes Aplicados

- Feature folders: codigo especifico de viagem fica em `features/trips`.
- Componentes pequenos e focados: `App.jsx` nao concentra mais toda a UI.
- Logica pura fora de componentes: parser/paginador do roteiro e transformacoes de formulario sao testaveis sem DOM.
- API client isolado: chamadas HTTP ficam em `api.js`.
- Testes unitarios perto da regra testada.

## Testes

Comando:

```bash
npm test
```

Cobertura atual:

- `itinerary.test.js`: parser Markdown, agrupamento de titulos com conteudo e paginacao do roteiro.
- `tripModel.test.js`: conversao entre modelo da API e formulario.
- `api.test.js`: chamadas basicas do client HTTP, serializacao JSON e mensagens de erro.

## Build

Comando:

```bash
npm run build
```

O build deve ser executado depois de alteracoes em componentes, dependencias ou CSS estrutural.

## Dependencias E Seguranca

Dependencias de runtime:

- `react`
- `react-dom`

Dependencias de desenvolvimento:

- `vite`
- `@vitejs/plugin-react`
- `vitest`

O audit do frontend deve ficar sem vulnerabilidades conhecidas:

```bash
npm audit
```

## Diretrizes Para Proximas Mudancas

- Colocar nova regra de negocio em modulo puro antes de acoplar ao componente.
- Preferir componentes de feature quando o componente conhece conceitos de viagem.
- Preferir `components/` apenas para pecas reutilizaveis e sem dominio.
- Evitar adicionar estado global enquanto os fluxos couberem em estado local do `App`.
- Manter o roteiro paginado testado, porque pequenas mudancas de parser podem causar regressao visual.
- Nao mover estilos para CSS-in-JS sem uma decisao explicita de arquitetura.

## Pontos Pendentes

- Separar `styles.css` por secoes ou arquivos quando o CSS crescer mais.
- Adicionar testes de interacao com React Testing Library se os fluxos ficarem mais complexos.
- Avaliar rotas reais com React Router quando houver URLs compartilhaveis para viagem/roteiro.
- Adicionar lint/format como etapa padrao de qualidade.
