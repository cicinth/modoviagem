# MVP

Fonte: https://www.notion.so/MVP-36450c588c6480c99e13d45a7f892e24

A primeira versao do produto deve focar no essencial para planejar e acompanhar uma viagem do inicio ao fim.

Funcionalidades principais do MVP:

- Autenticacao com login e logout
- CRUD de uma nova viagem
- Visualizar viagens proximas
- Visualizar viagens finalizadas
- Marcar uma viagem como finalizada
- Adicionar imagens por link ou colando a imagem para formar um moodboard da viagem
- CRUD de roteiro com suporte a colar roteiro Markdown
- Adicionar um diario visual da viagem por cidade ou pais, com notas e fotos em formato de colagem
- Visualizar uma pagina organizada para cada viagem

## Fluxo principal do usuario

1. A pessoa entra na tela de login
2. A pessoa acessa sua conta com e-mail e senha
3. Visualiza viagens separadas entre proximas e finalizadas
4. Cria uma nova viagem
5. Preenche os dados principais
6. Adiciona links de imagens
7. Registra documentos, tarefas, seguro, passagens, hospedagem e deslocamentos
8. Adiciona o roteiro com suporte a Markdown
9. Adiciona memorias visuais e notas por cidade ou pais
10. Consulta a pagina da viagem durante o planejamento
11. Edita informacoes sempre que precisar
12. Marca a viagem como finalizada depois que ela termina

## Analise de requisitos do MVP

### Home

- O sistema deve exibir uma tela inicial com as viagens cadastradas.
- O sistema deve separar as viagens em duas categorias: proximas viagens e viagens finalizadas.
- O sistema deve permitir alternar entre as categorias.
- O sistema deve exibir informacoes resumidas de cada viagem.
- O sistema deve permitir abrir a pagina de detalhes de uma viagem.

### Autenticacao

- O sistema deve permitir criar uma conta com nome, e-mail e senha.
- O sistema deve permitir fazer login com e-mail e senha.
- O sistema deve manter a sessao ativa ao recarregar a pagina.
- O sistema deve permitir fazer logout.
- O sistema deve associar cada viagem ao usuario logado.
- O sistema deve impedir que um usuario acesse viagens de outro usuario.
- O sistema deve redirecionar pessoas nao autenticadas para a tela de login.

### Criacao de viagem

- O sistema deve permitir criar uma nova viagem.
- O sistema deve permitir informar o nome da viagem.
- O sistema deve permitir informar a data ou periodo da viagem.
- O sistema deve permitir adicionar imagens por link.
- O sistema deve permitir adicionar imagens colando.
- O sistema deve permitir registrar lista de documentos necessarios.
- O sistema deve permitir registrar tarefas da viagem.
- O sistema deve permitir usar uma lista padrao de mala.
- O sistema deve permitir criar uma lista de mala personalizada.
- O sistema deve permitir editar uma lista de mala.
- O sistema deve permitir informar se a viagem possui seguro viagem.
- Quando houver seguro viagem, o sistema deve permitir registrar o numero do bilhete.
- O sistema deve permitir registrar informacoes de passagens aereas.
- O sistema deve permitir registrar itinerario de voo.
- O sistema deve permitir registrar numero da reserva.
- O sistema deve permitir registrar localizador.
- O sistema deve permitir registrar informacoes de acomodacao.
- O sistema deve permitir registrar check-in e check-out da acomodacao.
- O sistema deve permitir registrar link da reserva da acomodacao.
- O sistema deve permitir registrar endereco da acomodacao.
- O sistema deve permitir registrar como chegar ate a acomodacao.
- O sistema deve permitir registrar passagens aereas ou trens usados para deslocamento interno.
- O sistema deve permitir um roteiro da viagem escrevendo ou em formato Markdown.
- O sistema deve iniciar viagem com status em andamento.

### Pagina da viagem

- O sistema deve exibir uma pagina individual para cada viagem.
- A pagina da viagem deve exibir o nome da viagem.
- A pagina da viagem deve exibir a data ou periodo da viagem.
- A pagina da viagem deve exibir o moodboard com imagens adicionadas por link.
- A pagina da viagem deve exibir documentos necessarios.
- A pagina da viagem deve exibir tarefas.
- A pagina da viagem deve exibir lista de mala.
- A pagina da viagem deve exibir informacoes de seguro viagem.
- A pagina da viagem deve exibir informacoes de passagens aereas.
- A pagina da viagem deve exibir informacoes de acomodacao.
- A pagina da viagem deve exibir deslocamentos internos.
- A pagina da viagem deve permitir abrir a area de roteiro.

### Edicao de viagem

- O sistema deve permitir editar uma viagem existente.
- O sistema deve carregar os dados existentes no formulario de edicao.
- O sistema deve permitir alterar informacoes da viagem.
- O sistema deve salvar as alteracoes realizadas.
- O sistema deve atualizar a pagina da viagem apos a edicao.

### Finalizacao de viagem

- O sistema deve permitir marcar uma viagem como finalizada.
- Ao finalizar, a viagem deve sair da categoria de proximas viagens.
- Ao finalizar, a viagem deve aparecer na categoria de viagens finalizadas.

### Roteiro

- O sistema deve permitir criar um novo roteiro.
- O roteiro pode estar em um formato Markdown.
- O sistema deve exibir uma area visual de roteiro no estilo caderno/moodboard.

### Diario da viagem

- O sistema deve permitir adicionar memorias por cidade ou pais.
- Cada memoria deve permitir registrar uma nota curta.
- Cada memoria deve permitir registrar fotos por link ou colagem.
- A pagina deve exibir as fotos em formato de colagem com limite de visualizacao resumida.
- Quando houver mais fotos do que o limite resumido, o sistema deve permitir abrir a memoria para ver todas as fotos.
- O diario deve funcionar como uma area propria da viagem e nao como parte do texto do roteiro.

## Requisitos nao funcionais

### Experiencia visual

- A interface deve ter aparencia visual leve, criativa e inspiracional.
- O visual deve remeter a um caderno de viagem, moodboard ou scrapbook.
- O produto deve ser agradavel para planejamento e consulta.
- O layout deve funcionar em desktop e telas menores.

### Usabilidade

- A pessoa usuaria deve conseguir criar uma viagem sem ajuda externa.
- A navegacao entre home, nova viagem, pagina da viagem e roteiro deve ser simples.
- Os campos devem ser organizados por secoes claras.
- O produto deve evitar excesso de complexidade na primeira versao.
- O login deve ser rapido de entender e nao exigir configuracao extra na entrada.

## Regras de negocio

- Uma viagem pode estar em apenas um status por vez: proxima ou finalizada.
- Uma viagem finalizada deve aparecer na aba de viagens finalizadas.
- Uma viagem nao finalizada deve aparecer na aba de proximas viagens.
- Imagens devem ser adicionadas por link ou colando.
- O sistema nao deve fazer upload de imagens no MVP.
- O roteiro pode ser colado em formato Markdown.
- O diario visual deve usar fotos por link ou colagem, sem upload no MVP.
- O diario visual deve ficar separado do roteiro em Markdown.
- O acesso ao produto deve ser feito por conta autenticada no MVP.
- A lista padrao de mala pode ser usada como ponto de partida.
- A pessoa usuaria pode optar por criar uma lista de mala do zero.
- O numero do bilhete do seguro so e necessario quando a viagem tiver seguro viagem.

## Documentos relacionados

- [Viajário](./viajario.md)
