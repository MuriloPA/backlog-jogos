# PlayLog

Site para organizar o **backlog de jogos**: cadastrar os jogos que você tem, acompanhar o que está jogando, sortear o próximo e ver estatísticas da sua biblioteca.

Projeto da disciplina **Tópicos Integradores**, do curso de Análise e Desenvolvimento de Sistemas.

**Autor:** Murilo ([murilopa](https://github.com/murilopa))

**Site publicado:** https://murilopa.github.io/backlog-jogos/

**Conta de demonstração:** `demo@playlog.com` (a senha é informada na apresentação).

## O problema

Quem joga costuma acumular uma pilha de jogos e, na hora de escolher, não sabe por onde começar. O PlayLog junta tudo em um só lugar e ajuda a decidir o que jogar a seguir.

## Funcionalidades

- **Conta de usuário:** cadastro, login e logout. Cada pessoa vê apenas os próprios jogos.
- **Início:** saudação, indicadores animados, jogos em andamento com barra de progresso, próximo da fila, jogos adicionados recentemente e os mais bem avaliados.
- **Biblioteca:** cadastro manual de jogos (título, plataformas, gêneros, capa, status, nota, horas jogadas, horas para zerar e opinião), edição e exclusão com confirmação, busca por título, filtros por status, plataforma e gênero, e seis opções de ordenação. Jogos sem capa ganham uma capa colorida com a inicial do título.
- **Detalhe do jogo:** todas as informações, progresso e fundo desfocado a partir da capa.
- **Sorteio:** escolhe um jogo da fila com roleta animada. Dá mais chance aos jogos que esperam há mais tempo e permite limitar por tempo para zerar e por gênero.
- **Estatísticas:** seis gráficos (status, gêneros, notas, plataformas, horas por gênero e jogos mais jogados) e cinco indicadores, com animações.
- **Acabamento:** carregamento com cards "esqueleto", telas vazias com orientação, avisos de erro com botão para tentar de novo e layout adaptado ao celular. As animações respeitam a opção "reduzir movimento" do sistema.

## Tecnologias

- **Front-end:** HTML, CSS e JavaScript puro (módulos ES), sem framework.
- **Back-end:** [Supabase](https://supabase.com) (autenticação e banco PostgreSQL).
- **Hospedagem:** GitHub Pages.

## Segurança

- O banco usa **RLS (Row Level Security)**: toda consulta só enxerga as linhas em que `user_id = auth.uid()`. Mesmo que alguém altere o código do navegador, não consegue ler nem alterar jogos de outra pessoa.
- O site usa apenas a chave **publishable** do Supabase, própria para ficar no navegador. Nenhuma chave secreta está no repositório.
- Todo texto vindo do usuário é inserido na página como texto (`textContent`), nunca como HTML, o que evita injeção de código.
- Os dados dos formulários são validados no navegador (tamanhos, números, links) e também limitados por regras no banco.

## Estrutura

```
backlog-jogos/
├── index.html               login e cadastro
├── inicio.html              tela inicial
├── biblioteca.html          lista, filtros e formulário
├── jogo.html                detalhe de um jogo
├── sorteio.html             sorteio
├── estatisticas.html        gráficos e indicadores
├── assets/                  logo e favicon
├── css/
│   ├── style.css            estilos gerais e paleta
│   ├── componentes.css      estrelas, resumo, esqueleto e telas vazias
│   ├── inicio.css           tela inicial
│   ├── sorteio.css          sorteio e roleta
│   └── estatisticas.css     ajustes dos gráficos
├── js/
│   ├── supabase.js          conexão com o Supabase
│   ├── auth.js, login.js    autenticação
│   ├── jogos.js             acesso aos dados dos jogos
│   ├── filtros.js           busca, filtros e ordenação (funções puras)
│   ├── sorteio.js           regras do sorteio (funções puras)
│   ├── stats.js             regras das estatísticas (funções puras)
│   ├── destaques.js         regras da tela inicial (funções puras)
│   ├── ui.js                criação de cards e do detalhe
│   ├── graficos.js          rosca, barras e indicadores
│   ├── animacao.js          contagem de números e animações
│   ├── roleta.js            animação da roleta
│   ├── confirmar.js         caixa de confirmação própria
│   ├── toast.js, erros.js   avisos e mensagens de erro
│   ├── chips.js             seletor de plataformas e gêneros
│   └── *-pagina.js, biblioteca.js   código de cada página
└── tests/                   testes automáticos
```

As regras de negócio (filtros, sorteio, estatísticas e tela inicial) ficam em **funções puras**, separadas da interface, o que permite testá-las sem banco de dados.

## Como rodar no computador

Os módulos JavaScript exigem um servidor local, então o arquivo não funciona se for aberto com duplo clique. Na pasta do projeto:

```
python -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador.

## Testes automáticos

Com o servidor rodando, abra `http://localhost:8000/tests/`. A página executa os testes das regras de filtro, sorteio, estatísticas e tela inicial com dados fixos (nenhum dado do banco é usado) e mostra quais passaram.

## Decisões e limites

- **Cadastro manual:** o objetivo é o backlog pessoal. A integração com uma API pública de jogos chegou a ser testada, mas o serviço não respondia de forma confiável, então foi deixada de lado.
- **Plataforma é a da cópia do usuário:** o campo indica onde a pessoa tem ou joga o jogo, e não onde ele foi lançado.
- **Um jogo com vários gêneros ou plataformas** conta em todos eles nas estatísticas.

## Próximos passos

- Importar a biblioteca de outras plataformas por arquivo CSV, e exportar a biblioteca.
- Perfil do usuário e recuperação de senha.
- Busca de capas e informações de jogos por uma API externa.