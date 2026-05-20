# Segurança e LGPD

## Dados tratados

- Nome e e-mail da pessoa usuária.
- Hash da senha, nunca senha em texto puro.
- Dados de viagem, roteiro, documentos descritos, tarefas, mala, hospedagem, transporte, seguro e memórias.
- Links externos de imagens/fotos.

## Princípios LGPD aplicados

- Finalidade: guardar planejamento e memórias de viagem da pessoa usuária.
- Minimização: cadastro usa nome, e-mail e senha; demais dados são opcionais e ligados à viagem.
- Segurança: senhas com hash e salt; rotas protegidas; viagens filtradas por usuário.
- Transparência: esta documentação descreve dados usados pelo MVP.

## Lacunas de produto

- Criar tela de política de privacidade antes de produção.
- Criar fluxo para exportar dados da pessoa usuária.
- Criar fluxo para excluir conta e todas as viagens.
- Definir retenção de logs e dados excluídos.
- Definir canal de contato para solicitações LGPD.

## Cenários Gherkin

```gherkin
Funcionalidade: Segurança de autenticação

  Cenário: Login não revela se e-mail existe
    Dado que existe uma pessoa cadastrada
    Quando tento entrar com e-mail ou senha inválidos
    Então a API deve responder "E-mail ou senha inválidos"
    E a resposta não deve informar se o e-mail existe

  Cenário: Muitas tentativas de login são bloqueadas
    Dado que uma origem tenta login repetidas vezes
    Quando excede o limite configurado
    Então a API deve responder 429
    E deve pedir para aguardar antes de tentar novamente

Funcionalidade: Isolamento de dados por usuário

  Cenário: Usuário não acessa viagem de outro usuário
    Dado que existem dois usuários autenticados
    E cada usuário possui uma viagem
    Quando o usuário A tenta acessar a viagem do usuário B
    Então a API deve responder 404 ou 403
    E nenhum dado da viagem do usuário B deve ser retornado

Funcionalidade: Sessão segura

  Cenário: Token expirado não acessa dados protegidos
    Dado que uma sessão expirou
    Quando a pessoa tenta listar viagens
    Então a API deve responder 401
    E deve pedir novo login

  Cenário: Logout encerra cookie de sessão
    Dado que a pessoa está autenticada
    Quando clica em sair
    Então o cookie de sessão deve ser removido
    E dados protegidos não devem ser carregados sem novo login

Funcionalidade: Validação de entrada

  Cenário: Links perigosos são rejeitados
    Dado que a pessoa informa uma URL de foto
    Quando a URL usa protocolo diferente de http ou https
    Então a API deve responder 400
    E o link não deve ser salvo
```
