# hello-world

Portefolio de projetos web estaticos feito com HTML, CSS e JavaScript.

## Estrutura

```text
.
|-- index.html
|-- README.md
|-- script.js
|-- styles.css
|-- games/
|   |-- pipe_puzzle.html
|   `-- sudoku.html
`-- pages/
    `-- photography.html
```

## Projetos

### index.html

Pagina principal do repositorio. Funciona como portefolio de projetos e apresenta:

- uma introducao ao repositorio
- uma grelha com uma caixa por projeto
- links diretos para os HTML das apps disponiveis

### games/pipe_puzzle.html

Jogo de canalizacao em grelha.

- cada celula contem uma peca
- cada clique roda a peca 90 graus
- o puzzle comeca baralhado
- o objetivo e ligar corretamente toda a rede
- permite configurar o numero de casas X e Y

### games/sudoku.html

Jogo de Sudoku standalone com interface propria.

- varias dificuldades
- validacao do estado atual
- dicas
- reinicio e resolucao do puzzle

### pages/photography.html

Portefolio fotografico pessoal (Fatings Photo).

- banner com slider automatico de fotografias em destaque
- grelha de portefolio com validacao individual via oEmbed do Flickr
- ligacoes aos perfis publicos: Flickr, Instagram e 500px
- design escuro responsivo

## Ficheiros principais

- `index.html` - pagina principal do portefolio
- `styles.css` - estilos globais da homepage
- `script.js` - comportamento simples da homepage, incluindo texto rotativo e ano no rodape
- `games/pipe_puzzle.html` - jogo Pipe Puzzle
- `games/sudoku.html` - jogo Sudoku
- `pages/photography.html` - portefolio fotografico com oEmbed do Flickr

## Como abrir

Abre `index.html` no browser para navegar pelo portefolio e entrar em cada projeto.
