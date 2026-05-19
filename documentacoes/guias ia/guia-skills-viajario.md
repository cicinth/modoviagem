# Guia de uso das skills do Viajário

Este guia explica quando pedir ao Codex para usar cada skill criada para o projeto.

As skills ficam em:

```text
/home/cinthia/.codex/skills
```

## 1. Skill `viajario-produto`

Use quando quiser tomar decisoes de produto, validar escopo ou transformar ideias em requisitos.

Ela ajuda o Codex a lembrar:

- visao do Viajário;
- publico-alvo;
- proposta de valor;
- funcionalidades do MVP;
- regras de negocio;
- fluxo principal da pessoa usuaria.

Exemplos de pedidos:

```text
Use a skill viajario-produto e me diga qual deve ser a proxima feature do MVP.
```

```text
Use a skill viajario-produto para transformar esta ideia em requisitos: quero adicionar uma area de documentos da viagem.
```

```text
Com a skill viajario-produto, revise se essa funcionalidade combina com o MVP.
```

## 2. Skill `viajario-ui`

Use quando o pedido envolver visual, experiencia, telas, CSS, responsividade ou componentes.

Ela ajuda o Codex a manter:

- visual de caderno de viagem;
- clima de moodboard/scrapbook;
- interface leve e inspiracional;
- secoes organizadas;
- responsividade;
- textos curtos em portugues do Brasil.

Exemplos de pedidos:

```text
Use a skill viajario-ui e melhore a tela inicial sem perder o estilo de caderno de viagem.
```

```text
Use a skill viajario-ui para criar o layout da pagina de detalhes da viagem.
```

```text
Com a skill viajario-ui, revise o CSS e veja se a interface esta consistente.
```

## 3. Skill `viajario-fullstack`

Use quando quiser implementar funcionalidades no codigo, principalmente quando envolver frontend, backend, API ou persistencia.

Ela ajuda o Codex a lembrar:

- estrutura `front` e `back`;
- React com Vite;
- Express no backend;
- API em `/api`;
- persistencia em `back/data/trips.txt`;
- regras do `tripRepository.js`;
- testes do roteiro Markdown.

Exemplos de pedidos:

```text
Use a skill viajario-fullstack e implemente um campo de observacoes na viagem.
```

```text
Use a skill viajario-fullstack para adicionar uma rota que duplica uma viagem.
```

```text
Com a skill viajario-fullstack, corrija o bug de salvar lista de tarefas.
```

## Como combinar skills

Voce pode pedir mais de uma skill no mesmo pedido.

Para uma feature completa:

```text
Use as skills viajario-produto, viajario-ui e viajario-fullstack para implementar a area de documentos da viagem.
```

Para pensar antes de codar:

```text
Use a skill viajario-produto para definir os requisitos e depois a viajario-fullstack para implementar.
```

Para melhorar uma tela ja existente:

```text
Use as skills viajario-ui e viajario-fullstack para redesenhar os cards de viagem e ajustar o codigo.
```

## Dica pratica

Quando o pedido for sobre ideia, escopo ou regra, use `viajario-produto`.

Quando o pedido for sobre aparencia ou experiencia, use `viajario-ui`.

Quando o pedido for para mexer no codigo, use `viajario-fullstack`.
