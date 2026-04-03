# Analýza řešení: Aplikace pro procvičování anglických slovíček

> Verze: 1.0 | Datum: duben 2026

---

## 1. Přehled projektu

### Cíl
Webová single-page aplikace (SPA) pro procvičování 1 000 nejčastějších anglických slovíček formou kvízu. Uživateli je zobrazeno anglické slovo a tři možnosti překladu do češtiny – vybírá jednu správnou. Každé kolo obsahuje 30 náhodně vybraných slovíček a na konci obdrží uživatel skóre.

### Klíčové vlastnosti
- Databáze 1 000 nejčastějších anglických slov s českými překlady
- Náhodný výběr 30 slovíček pro každé kolo (jedno společné kolo bez dělení dle obtížnosti)
- Multiple-choice formát (1 správná + 2 náhodné špatné odpovědi)
- Okamžitá vizuální zpětná vazba po každé odpovědi (✓ správně / ✗ špatně)
- Přehled chybně zodpovězených slov na konci kola
- Historie výsledků uložená v localStorage
- Hravý, barevný vizuální styl s gamifikačními prvky
- Responzivní design pro desktop i mobilní zařízení

---

## 2. Použité technologie

### Frontend framework
| Technologie | Verze | Zdůvodnění |
|---|---|---|
| **React** | 18.x | Zadáno jako požadavek; komponentová architektura je ideální pro stavový kvíz |
| **Vite** | 5.x | Rychlý dev server, jednoduchá konfigurace, optimalizovaný build |
| **React Router** | 6.x | Navigace mezi obrazovkami (Úvod → Kvíz → Výsledky) bez reloadu |

### Styling
| Technologie | Zdůvodnění |
|---|---|
| **CSS Modules** | Scoped styly bez externích závislostí, přehledné pojmenování |
| **CSS Custom Properties** | Centralizované barevné schéma a typografie, snadná změna tématu |
| **Google Fonts** | Hravá typografie – Fredoka One (nadpisy) + Nunito (tělo) |

#### Vizuální styl – gamifikace
Aplikace bude používat **hravý, barevný design** inspirovaný mobilními vzdělávacími aplikacemi (Duolingo, Quizlet):

| Prvek | Specifikace |
|---|---|
| **Barevná paleta** | Živé barvy – primární fialová `#7C3AED`, zelená `#22C55E`, červená `#EF4444`, žlutá `#FACC15`, světlé pozadí `#F5F3FF` |
| **Typografie** | Display: **Fredoka One** (kulaté, hravé), Body: **Nunito** (přátelský, čitelný) |
| **Správná odpověď** | Zelené pozadí + ✓ ikona + bounce/pulse animace |
| **Špatná odpověď** | Červené pozadí na špatné volbě + zelené na správné + shake animace |
| **Progress bar** | Barevný, animovaný plynulý přechod, emoji milestone (🔥 za každých 10 otázek) |
| **Skóre na konci** | Velký barevný badge, hvězdičkové hodnocení ⭐, konfetti animace při ≥ 80 % |
| **Tlačítka** | Výrazné rounded corners, box-shadow, press efekt (translateY + shadow při click) |
| **Kartičky** | Bílá karta se stínem na barevném gradientním pozadí, velký display font pro slovo |

### State management
| Technologie | Zdůvodnění |
|---|---|
| **React Context + useReducer** | Lehké řešení bez nutnosti Redux; vystačí pro rozsah aplikace |
| **localStorage** | Perzistence historie výsledků na straně klienta |

### Data
| Technologie | Zdůvodnění |
|---|---|
| **Statický JSON soubor** | 1 000 slovíček je malý dataset (~50 KB), není potřeba backend ani API |

### Nástroje a kvalita kódu
| Nástroj | Účel |
|---|---|
| **ESLint + Prettier** | Konzistence kódu |
| **Vitest** | Unit testy logiky (výběr slov, generování odpovědí) |

### Deployment
Aplikace je čistě statická – lze nasadit na **GitHub Pages**, **Vercel** nebo **Netlify** bez backendu.

---

## 3. Struktura projektu

```
vocabulary-quiz/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/                    # Ikonky, obrázky
│   ├── components/                # Znovupoužitelné UI komponenty
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.module.css
│   │   ├── ProgressBar/
│   │   │   ├── ProgressBar.jsx
│   │   │   └── ProgressBar.module.css
│   │   ├── AnswerOption/
│   │   │   ├── AnswerOption.jsx
│   │   │   └── AnswerOption.module.css
│   │   └── ScoreBadge/
│   │       ├── ScoreBadge.jsx
│   │       └── ScoreBadge.module.css
│   ├── pages/                     # Hlavní obrazovky aplikace
│   │   ├── StartPage/
│   │   │   ├── StartPage.jsx
│   │   │   └── StartPage.module.css
│   │   ├── QuizPage/
│   │   │   ├── QuizPage.jsx
│   │   │   └── QuizPage.module.css
│   │   └── ResultsPage/
│   │       ├── ResultsPage.jsx
│   │       └── ResultsPage.module.css
│   ├── context/
│   │   └── QuizContext.jsx        # Globální stav kvízu (Context + useReducer)
│   ├── hooks/
│   │   ├── useQuiz.js             # Logika kvízu (výběr slov, vyhodnocení)
│   │   └── useHistory.js          # Čtení/zápis localStorage
│   ├── data/
│   │   └── words.json             # Databáze 1 000 slovíček
│   ├── utils/
│   │   ├── shuffle.js             # Fisher-Yates shuffle algoritmus
│   │   └── generateOptions.js     # Generování 3 možností odpovědí
│   ├── App.jsx                    # Root komponenta + Router
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Globální styly, CSS proměnné
├── tests/
│   ├── shuffle.test.js
│   └── generateOptions.test.js
├── index.html
├── vite.config.js
├── .eslintrc.json
└── package.json
```

---

## 4. Datový model

### Struktura slovíčka (`words.json`)
```json
[
  {
    "id": 1,
    "en": "the",
    "cs": "určitý člen",
    "category": "function_word",
    "difficulty": 1
  },
  {
    "id": 42,
    "en": "time",
    "cs": "čas",
    "category": "noun",
    "difficulty": 1
  }
]
```

**Pole:**
- `id` – unikátní identifikátor
- `en` – anglické slovo
- `cs` – český překlad
- `category` – slovní druh (`noun`, `verb`, `adjective`, `adverb`, `function_word`)

### Stav kvízu (QuizContext)
```js
{
  words: [],           // všech 1000 slovíček
  session: {
    questions: [],     // 30 vybraných slovíček pro aktuální kolo
    currentIndex: 0,   // index aktuální otázky (0–29)
    answers: [],       // pole { wordId, correct: bool, chosen: string }
    status: "idle"     // "idle" | "active" | "answered" | "finished"
  },
  history: []          // výsledky minulých kol z localStorage
}
```

### Záznam v historii (`localStorage`)
```json
{
  "date": "2026-04-01T10:30:00Z",
  "score": 24,
  "total": 30,
  "percentage": 80
}
```

---

## 5. Logika aplikace

### 5.1 Výběr 30 slovíček
Algoritmus použije **Fisher-Yates shuffle** na celé pole 1 000 slov a vezme prvních 30. Tím je zaručena uniformní náhodnost bez opakování.

```js
// utils/shuffle.js
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// hooks/useQuiz.js
const questions = shuffle(words).slice(0, 30);
```

### 5.2 Generování možností odpovědí
Pro každou otázku:
1. Vezmi správný překlad (`cs`) jako jednu z možností.
2. Vyber náhodně 2 další slova z databáze (≠ aktuální slovo), vezmi jejich `cs`.
3. Zamíchej všechny tři možnosti.

```js
// utils/generateOptions.js
export function generateOptions(correctWord, allWords) {
  const distractors = shuffle(
    allWords.filter(w => w.id !== correctWord.id)
  ).slice(0, 2);

  return shuffle([
    correctWord.cs,
    distractors[0].cs,
    distractors[1].cs
  ]);
}
```

### 5.3 Tok aplikace (stavový automat)

```
IDLE ──[Start]──► ACTIVE ──[Answer]──► ANSWERED ──[Next]──► ACTIVE
                                                          └──[Last question]──► FINISHED
```

| Stav | Popis |
|---|---|
| `idle` | Úvodní obrazovka |
| `active` | Zobrazena otázka, čeká se na odpověď |
| `answered` | Uživatel odpověděl, zobrazuje se zpětná vazba |
| `finished` | Kolo dokončeno, zobrazují se výsledky |

---

## 6. Wireframy

### 6.1 Úvodní obrazovka (StartPage)

```
┌─────────────────────────────────────┐
│                                     │
│     🇬🇧  Vocabulary Quiz            │
│                                     │
│   Procvičuj anglická slovíčka       │
│   formou kvízu. Každé kolo          │
│   obsahuje 30 náhodných slov.       │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  Tvoje nejlepší skóre: 27/30│   │  ← Zobrazí se jen pokud existuje
│   └─────────────────────────────┘   │     záznam v localStorage
│                                     │
│       ╔═══════════════════╗         │
│       ║   Začít kvíz      ║         │
│       ╚═══════════════════╝         │
│                                     │
│   Poslední výsledky:                │
│   • 01.04.2026 – 24/30 (80 %)      │
│   • 31.03.2026 – 19/30 (63 %)      │
│   • 30.03.2026 – 27/30 (90 %)      │
│                                     │
└─────────────────────────────────────┘
```

### 6.2 Obrazovka kvízu (QuizPage) – stav `active`

```
┌─────────────────────────────────────┐
│  Otázka 7 / 30          ████░░░░░░  │  ← Progress bar
│                                     │
│                                     │
│           "beautiful"               │  ← Anglické slovo (velké)
│                                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │        krásný                 │  │  ← Možnost A
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │        rychlý                 │  │  ← Možnost B
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │        starý                  │  │  ← Možnost C
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 6.3 Obrazovka kvízu – stav `answered` (správně)

```
┌─────────────────────────────────────┐
│  Otázka 7 / 30          ████░░░░░░  │
│                                     │
│           "beautiful"               │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ✓  krásný                    │  │  ← Zelené pozadí (správná odpověď)
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │        rychlý                 │  │  ← Šedé / neaktivní
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │        starý                  │  │  ← Šedé / neaktivní
│  └───────────────────────────────┘  │
│                                     │
│       ╔═══════════════════╗         │
│       ║  Další otázka →   ║         │
│       ╚═══════════════════╝         │
└─────────────────────────────────────┘
```

### 6.4 Obrazovka kvízu – stav `answered` (špatně)

```
┌─────────────────────────────────────┐
│  Otázka 7 / 30          ████░░░░░░  │
│                                     │
│           "beautiful"               │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ✓  krásný                    │  │  ← Zelené (správná odpověď)
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  ✗  rychlý                    │  │  ← Červené (uživatel zvolil toto)
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │        starý                  │  │  ← Šedé / neaktivní
│  └───────────────────────────────┘  │
│                                     │
│       ╔═══════════════════╗         │
│       ║  Další otázka →   ║         │
│       ╚═══════════════════╝         │
└─────────────────────────────────────┘
```

### 6.5 Obrazovka výsledků (ResultsPage)

```
┌─────────────────────────────────────┐
│                                     │
│           Výsledky kola             │
│                                     │
│         ┌─────────────┐             │
│         │   24 / 30   │             │  ← Velké skóre
│         │    80 %     │             │
│         └─────────────┘             │
│                                     │
│   ★★★★☆  Výborně!                  │  ← Hodnocení slovně (dle %)
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Chybně zodpovězená slova:   │   │
│   │                             │   │
│   │  beautiful → krásný        │   │
│   │  (tvoje odpověď: rychlý)   │   │
│   │                             │   │
│   │  necessary → nutný         │   │
│   │  (tvoje odpověď: možný)    │   │
│   │  ...                        │   │
│   └─────────────────────────────┘   │
│                                     │
│   ╔══════════╗  ╔════════════════╗  │
│   ║ Hrát znovu  ║  Domů          ║  │
│   ╚══════════╝  ╚════════════════╝  │
│                                     │
└─────────────────────────────────────┘
```

---

## 7. Komponenty – přehled zodpovědností

| Komponenta | Zodpovědnost |
|---|---|
| `App.jsx` | Router, obalení do QuizProvider |
| `StartPage` | Uvítání, tlačítko start, seznam historických výsledků |
| `QuizPage` | Orchestrace kvízu: zobrazuje otázku, předává události do contextu |
| `ResultsPage` | Zobrazení skóre, chybných slov, uložení do history |
| `ProgressBar` | Vizuální indikátor postupu (currentIndex / 30) |
| `AnswerOption` | Jedno tlačítko odpovědi; props: `text`, `state` (`idle/correct/wrong/disabled`) |
| `ScoreBadge` | Kruhový nebo boxový displej skóre na výsledkové stránce |
| `Button` | Obecné tlačítko s variantami (`primary`, `secondary`) |
| `QuizContext` | Globální stav + reducer; exponuje akce `startQuiz`, `submitAnswer`, `nextQuestion`, `finishQuiz` |
| `useQuiz` | Hook zapouzdřující přístup ke QuizContext |
| `useHistory` | Hook pro čtení/zápis localStorage |

---

## 8. Reducer – akce

```js
// Typy akcí
const Actions = {
  START_QUIZ: "START_QUIZ",       // Inicializuje nové kolo, shuffle + slice
  SUBMIT_ANSWER: "SUBMIT_ANSWER", // Zaznamená odpověď, přejde do stavu "answered"
  NEXT_QUESTION: "NEXT_QUESTION", // Přejde na další otázku nebo do "finished"
  RESET: "RESET",                 // Vrátí do "idle"
};
```

---

## 9. Responzivita

| Breakpoint | Layout |
|---|---|
| `< 480px` (mobil) | Plná šířka, větší dotykové cíle (min. 48px výška tlačítek) |
| `480–768px` (tablet) | Centrovaný kontejner, max-width 520px |
| `> 768px` (desktop) | Centrovaný kontejner, max-width 600px, větší typografie |

---

## 10. Přístupnost (a11y)

- Správné HTML sémantické elementy (`<button>`, `<main>`, `<h1>`) 
- `aria-label` na tlačítkách se stavy (správně/špatně)
- `aria-live="polite"` na oblasti zpětné vazby po odpovědi
- Klávesová navigace: `1`, `2`, `3` pro výběr odpovědi, `Enter`/`Space` pro potvrzení
- Dostatečný kontrast barev (WCAG AA)

---

## 11. Gamifikační animace a UX detaily

### Zpětná vazba na odpověď
| Akce | Animace | Trvání |
|---|---|---|
| Správná odpověď | Tlačítko zelené + ✓ + `scale(1.05)` pulse | 300 ms |
| Špatná odpověď | Kliknuté tlačítko červené + shake, správné zelené | 400 ms |
| Přechod na další otázku | Slide-out/slide-in karta | 250 ms |

### Progress bar milníky
- Po otázce 10: 🔥 emoji animace nad barem + „Pokračuj tak!"
- Po otázce 20: ⚡ emoji + „Jsi v polovině!"
- Po otázce 30: automatický přechod na výsledky

### Výsledková obrazovka
| Skóre | Hodnocení | Efekt |
|---|---|---|
| ≥ 27/30 (90 %+) | ⭐⭐⭐ „Perfektní!" | Konfetti animace (CSS) |
| ≥ 21/30 (70 %+) | ⭐⭐ „Výborně!" | Zlatý záblesk badge |
| ≥ 15/30 (50 %+) | ⭐ „Dobrá práce!" | Standardní zobrazení |
| < 15/30 | 💪 „Zkus to znovu!" | Motivační text, bez hvězd |

### Konfetti (CSS-only)
Konfetti bude implementováno pomocí CSS animací (pseudo-elementy + `@keyframes`) bez externí knihovny, aby se minimalizovaly závislosti.

---

## 12. Implementační plán

### Fáze 1 – Základ (2–3 dny)
1. Inicializace projektu (Vite + React + React Router)
2. Příprava `words.json` s 1 000 slovíčky
3. Implementace utility funkcí (`shuffle`, `generateOptions`)
4. QuizContext + Reducer

### Fáze 2 – UI komponenty (2–3 dny)
5. CSS Custom Properties – barevná paleta, fonty (Fredoka One + Nunito via Google Fonts)
6. Komponenty: `Button`, `ProgressBar`, `AnswerOption`, `ScoreBadge`
7. Stránky: `StartPage`, `QuizPage`, `ResultsPage`
8. Routing (React Router)

### Fáze 3 – Gamifikace a animace (1–2 dny)
9. Animace odpovědí (bounce, shake, slide)
10. Progress bar milníky + emoji
11. Konfetti animace (CSS-only) na výsledkové obrazovce
12. localStorage history (useHistory hook)

### Fáze 4 – Finalizace (1 den)
13. Responzivita (mobilní layout)
14. Přístupnost (aria atributy, klávesová navigace)
15. Unit testy kritické logiky (shuffle, generateOptions)

---

## 13. Možná budoucí rozšíření

- **Obtížnostní úrovně** – přidání pole `difficulty` do dat, filtrování před startem kola
- **Kategorie** – výběr slovního druhu před startem kola
- **Časový limit** – odpočítávání na otázku pro zvýšení napětí
- **Regime psaní** – uživatel napíše překlad místo výběru
- **Obousměrný překlad** – CZ → EN varianta
- **Streak systém** – počítadlo po sobě jdoucích správných odpovědí, bonus body
- **PWA** – offline podpora, instalace jako aplikace

---

*Dokument připraven jako podklad pro implementaci. Po odsouhlasení lze přistoupit k fázi 1.*
