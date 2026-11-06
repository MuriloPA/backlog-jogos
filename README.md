# PlayLog

Backlog pessoal de jogos: cadastre os jogos que você quer jogar, está jogando ou já zerou, e deixe o site sortear o que jogar a seguir.

Projeto desenvolvido como MVP da disciplina Tópicos Integradores.

**Site publicado:** https://murilopa.github.io/backlog-jogos/

## Funcionalidades

- Cadastro e login com e-mail e senha
- Biblioteca de jogos com cadastro, edição e exclusão
- Plataformas e gêneros múltiplos, escolhidos por chips
- Capa do jogo por link, com imagem padrão quando não há capa
- Busca por título, filtros por status, plataforma e gênero, e ordenação
- Sorteio do próximo jogo, com filtro de tempo disponível e de gênero
- Página de estatísticas com resumo, gráfico de status e gêneros mais frequentes
- Página de detalhe de cada jogo, com nota, progresso e opinião
- Mensagens de erro claras, inclusive quando o usuário está sem internet

## Como o sorteio funciona

O sorteio é uma roleta com pesos. Só entram jogos com status "Na fila". Cada jogo tem peso `1 + dias na fila / 7`, limitado a 365 dias, então jogos que esperam há mais tempo têm mais chance, mas nenhum fica sem chance.

Quando o usuário informa um limite de horas, o filtro usa o tempo restante do jogo (horas estimadas menos horas jogadas). Jogos sem horas estimadas ficam de fora nesse caso, e o site avisa quantos foram excluídos.

## Tecnologias

- HTML, CSS e JavaScript puro, com módulos ES (sem framework)
- Supabase: Auth, banco PostgreSQL e Row Level Security
- GitHub Pages para a hospedagem

## Estrutura do projeto

```
index.html              login e cadastro
biblioteca.html         lista, formulário e filtros
sorteio.html            sorteio do próximo jogo
estatisticas.html       indicadores e gráficos
jogo.html               detalhe de um jogo
css/style.css           estilos de todas as páginas
js/                     módulos JavaScript de cada página
assets/                 imagem de capa padrão
tests/                  testes automáticos das regras
```

As regras de negócio (filtros, sorteio e estatísticas) ficam em funções puras, que recebem dados e devolvem dados, sem depender da tela nem do banco. Isso permite testá-las de forma automática.

## Banco de dados e segurança

A tabela `jogos` tem as colunas `id`, `user_id`, `titulo`, `plataforma`, `genero`, `capa_url`, `status`, `nota`, `horas_jogadas`, `horas_estimadas`, `opiniao` e `criado_em`.

A proteção dos dados tem duas camadas:

1. **GRANT:** só o papel `authenticated` (usuário logado) tem permissão de leitura e escrita na tabela. Visitantes sem login não acessam nada.
2. **Row Level Security:** quatro políticas (select, insert, update e delete) com a regra `user_id = auth.uid()`. Cada usuário só enxerga e altera as próprias linhas.

A coluna `user_id` é preenchida pelo próprio banco com `auth.uid()`. O site nunca envia esse valor, então não há como gravar um jogo em nome de outra pessoa.

O arquivo `js/supabase.js` contém a URL do projeto e a **Publishable key**. Essa chave foi feita para ficar no navegador e não dá acesso a dados por si só; quem protege os dados é o RLS. A **Secret key** nunca é usada neste projeto e não está no repositório.

## Como rodar localmente

Requisitos: Python 3 instalado.

1. Clone o repositório e entre na pasta do projeto.
2. Inicie um servidor local (os módulos ES não funcionam abrindo o arquivo direto no navegador):

```
python -m http.server 8000
```

3. Abra http://localhost:8000/ no navegador.

Para usar outro projeto Supabase, troque a URL e a Publishable key em `js/supabase.js` e crie a tabela `jogos` com as colunas e as políticas descritas acima.

## Testes

Com o servidor local ativo, abra http://localhost:8000/tests/ . A página executa os testes automáticos de filtros, ordenação, sorteio (incluindo uma simulação de 10.000 sorteios) e estatísticas, e mostra quantos passaram.

## Possíveis evoluções

- Busca de jogos e capas por uma API pública (como a RAWG), que exige chave e link de atribuição
- Importação e exportação da biblioteca

## Autor

Murilo, estudante de Análise e Desenvolvimento de Sistemas.