# 🎮 Almanaque de Jogos - FLIS 2026

![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-brightgreen)
![Feira](https://img.shields.io/badge/Evento-FLIS%20Saquarema-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)

> **Um almanaque de jogos para a Feira Literária Internacional de Saquarema (FLIS).**
> Um projeto simples e divertido para que crianças e demais convidados possam se divertir enquanto descobrem, na prática, como a **Subsecretaria de Tecnologia** atua na educação.

---

## 📖 Sobre o Projeto

A tecnologia na educação não precisa ser complicada. Pensando nisso, este projeto foi criado para a **FLIS (Feira Literária Internacional de Saquarema)**, unindo o universo da literatura e do conhecimento a uma interface lúdica inspirada em histórias em quadrinhos.

O objetivo é proporcionar uma experiência interativa em telas interativas onde o público pode jogar, aprender e, ao mesmo tempo, enxergar o potencial criativo e pedagógico das ferramentas digitais desenvolvidas pela Subsecretaria.

---

## 🕹️ Os Jogos

O almanaque conta com 5 jogos, cada um com níveis de dificuldade (Fácil, Médio, Difícil e Desafio):

| Jogo | Descrição |
| :--- | :--- |
| **🔤 Forca Maluca** | Descubra a palavra secreta antes que o boneco se complete. |
| **🧮 Calculadora Quebrada** | Resolva contas matemáticas usando apenas as teclas que não quebraram. |
| **🏁 Corrida da Mente** | Um duelo de perguntas e contas para dois jogadores na mesma tela. |
| **💬 Quiz Comic** | Teste seus conhecimentos gerais sobre livros, escola, ciência e mais. |
| **📖 Ordene a História** | Coloque as cenas clássicas da literatura na ordem correta. |

---

## 🚀 Acesso ao Projeto

O projeto está disponível online e pode ser acessado diretamente no navegador:
👉 **https://almanaque-de-jogos.vercel.app/**

---

## 🛠️ Tecnologias e Arquitetura

Este projeto foi construído com foco em **leveza**, **compatibilidade** e **facilidade de manutenção**:

- **React 18 + Vite**: Para uma interface reativa e build ultra-rápido.
- **CSS Puro**: Um Design System próprio inspirado em HQs (bordas grossas, cores vivas e sombras deslocadas), garantindo que funcione até em navegadores mais antigos.
- **Hash Routing (manual)**: Não usamos `react-router-dom` ou History API. A navegação usa `window.location.hash` (`#/jogo/quiz`). Isso garante que o projeto funcione em ambientes estáticos (como o Vercel) e em navegadores embarcados de TVs sem dar erro 404.
- **Vercel Analytics**: Para monitorar o engajamento do público durante o evento.

---

## 👩‍💻 Créditos

Desenvolvido com dedicação por Isabelly Vaz.
- **Evento:** Feira Literária Internacional de Saquarema (FLIS)

---

## 🔧 Para Desenvolvedores (Como rodar localmente)

Se você é da equipe técnica e precisa rodar este projeto na sua máquina:

1. Clone o repositório: git clone https://github.com/JabutiDeAraque/almanaque-de-jogos.git
2. Instale as dependências: npm install
3. Rode o servidor de desenvolvimento: npm run dev

---

## 📁 Estrutura de Pastas
- **src/components/:** Componentes reutilizáveis (TopBar, Botões, Modais).
- **src/jogos/:** Lógica de cada um dos 5 jogos (separados por pastas).
- **src/data/:** Bancos de dados (perguntas, palavras, histórias).
- **src/lib/:** Utilitários (gerador de contas, controle de som, etc).
- **src/pages/:** Telas principais (Home e roteador dos jogos).

