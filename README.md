# Match & Move · Rolex (demo)

Peça de portfólio para apresentações de marca. **Não é um site da Rolex e não tem afiliação com a Rolex SA.**

A transição **Match & Move** da Canva — os mesmos elementos indo de um quadro ao outro — recriada como scroll num telemóvel. Não é um corte, uma máscara nem um morph: coroa, palavra e mostrador são os mesmos nós e apenas mudam de lugar, escala e uma leve rotação.

## O que o scroll faz

Dois quadros, presos no ecrã enquanto a página rola (~230% da altura). A curva é `power2.inOut`, com um pequeno atraso de ~0,55s para o gesto parecer a transição original de meio segundo.

| Elemento | Estado A (topo) | Estado B (fim) |
| --- | --- | --- |
| Coroa + ROLEX | Rótulo dourado muito grande, no topo | Menor, um pouco mais alto |
| Relógio | Close: só o topo do mostrador enche a metade de baixo | Inteiro, no centro (a escala **diminui** — zoom-out) |
| OYSTER | Minúscula, escondida atrás do relógio | Palavra enorme, verde, atrás do herói |
| Acentos | Fora do quadro, nos cantos | Entram em órbita, com escala e rotação leves |

O que só existe num quadro (subtítulo, dica de scroll, assinatura) entra ou sai em opacidade. O mapa está comentado em `main.js` e nos dois layouts de `index.html`.

## Abrir localmente

Não há build. Com a internet ligada (fonte e GSAP vêm de CDN):

```bash
python3 -m http.server 4173
```

Abre [http://localhost:4173](http://localhost:4173) num telemóvel, ou no browser com a janela estreita (~390×844). No desktop o palco fica centrado como um telefone.

Também podes abrir `index.html` direto, desde que o CDN carregue.

## GitHub Pages

O site é a raiz do repositório (HTML estático). Há um workflow em `.github/workflows/pages.yml` que publica a cada push na branch `main`.

1. Faz merge deste trabalho em `main`.
2. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. O endereço fica:

**https://kauan-gattward.github.io/rolex-match-move-demo/**

Alternativa sem Actions: **Settings → Pages → Deploy from a branch → `main` → `/ (root)`**. O arquivo `.nojekyll` já está na raiz para o Jekyll não interferir.

## Reaproveitar noutra marca

1. Troca as variáveis no topo de `styles.css` (verde, ouro, creme, fontes).
2. Edita os textos nos dois layouts (`.layout-a` e `.layout-b`) **e** na camada `.mm-layer`. O `data-slot` e o `data-mm` com o mesmo nome são o par que viaja.
3. Posição e tamanho moram no CSS de cada layout. O `main.js` só mede e interpola.

`prefers-reduced-motion` troca a viagem por um crossfade entre os dois cartazes.
