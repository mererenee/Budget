# Kline-Nall Budget App 2026

A fully client-side personal budgeting app built from your existing Google Sheet. No backend, no subscriptions, no bank connections — just open it in a browser.

---

## Features

- **Dashboard** — monthly income vs expenses, spending mix, bill progress bars
- **Smart Import** — paste bank rows (USAA, Chase) and auto-categorize by merchant name
- **Auto-Categorizer** — 100+ built-in rules seeded from your real merchants; learns from corrections
- **Budget** — planned vs actual for every line item, skeleton + day-to-day
- **Goals** — savings goal tracker with progress bars and chart
- **Debt** — avalanche/snowball payoff calculator with projection chart
- **Investments** — account tracker + compound growth projection
- **House Projects** — quote/budget/saved tracker for your wishlist
- **Google Sheets sync** — push all data directly to your own Google Sheet, no middleman
- **Year-end purge** — export to Sheets + JSON backup, then wipe for the new year

---

## Running Locally

No build step required. Just serve the files with any static server.

### Option 1 — VS Code Live Server
Install the "Live Server" extension, right-click `index.html` → **Open with Live Server**.

### Option 2 — Python
```bash
cd kline-nall-budget
python3 -m http.server 8080
# Open http://localhost:8080
```

### Option 3 — Node
```bash
npx serve .
```

---

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages → Source → Deploy from branch → main → / (root)**.
3. Your app will be live at `https://<your-username>.github.io/<repo-name>/`.

> **Important for Google Sheets OAuth:** Add your GitHub Pages URL as an authorized JavaScript origin in your Google Cloud Console OAuth credentials.

---

## Google Sheets Integration Setup

This is a one-time setup. Your data goes directly from your browser to Google's API — nothing passes through any third-party server.

### Step 1 — Create a Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Create a new project (e.g. `kline-nall-budget`)
3. Go to **APIs & Services → Library** → search **Google Sheets API** → Enable it

### Step 2 — Create OAuth Credentials
1. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Add to **Authorized JavaScript origins**:
   - `http://localhost:8080` (for local dev)
   - `https://<your-username>.github.io` (for GitHub Pages)
4. Add to **Authorized redirect URIs**: `postmessage`
5. Click Create → copy your **Client ID**

### Step 3 — Create a Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com) → create a new blank sheet
2. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

### Step 4 — Connect in the App
1. Open the app → click **Google Sheets** tab
2. Paste your **OAuth Client ID** and **Spreadsheet ID**
3. Click **Connect Google Account** → sign in via the popup
4. Click **Push Everything** to sync

### What Gets Written
Each push creates/overwrites these tabs in your spreadsheet:

| Tab name | Contents |
|---|---|
| `2026_Transactions` | All imported transactions with date, merchant, category, amount |
| `2026_Budget` | Monthly planned vs actual summary |
| `2026_Goals` | Savings goals and progress |
| `2026_Debt` | Debt accounts, balances, APR |
| `2026_Investments` | Investment accounts and contributions |
| `2026_Projects` | House project tracker |

---

## Adding Transactions

### Paste Import (recommended)
1. Go to your bank's transaction history
2. Select and copy rows (USAA: works directly; Chase: download CSV → open in Excel → copy)
3. Open **Import** tab → paste into the text area → select month → **Parse & Auto-Categorize**
4. Review categories (correct any wrong ones — corrections teach the app for next time)
5. Click **Import**

### Single Add
Use the form at the bottom of the Import tab for one-off entries (cash, transfers, etc.)

---

## Year-End Workflow

At the end of December:
1. Go to **Google Sheets** tab → click **Push Everything** to save the year to your sheet
2. Verify your Google Sheet looks correct
3. Click **Export & Purge Year** → confirm the two prompts
4. The app resets actuals to zero and you start fresh for the new year
5. A JSON backup is also downloaded to your computer as a second copy

---

## File Structure

```
kline-nall-budget/
├── index.html              # Entry point
├── README.md
└── src/
    ├── styles.css          # All styles
    ├── data.js             # Budget data, line items, category list
    ├── rules.js            # 100+ built-in categorization rules
    ├── categorizer.js      # Rule matching + learning engine
    ├── storage.js          # localStorage persistence + JSON export + year purge
    ├── sheets.js           # Google Sheets API integration
    ├── app.js              # Router, utilities, init
    └── tabs/
        ├── dashboard.js
        ├── import.js
        ├── budget.js
        ├── goals.js
        ├── debt.js
        ├── invest.js
        ├── house.js
        ├── rules.js
        └── sheets.js
```

---

## Privacy & Security

- **No backend.** The app is 100% static HTML/CSS/JS.
- **No data leaves your browser** except when you explicitly push to Google Sheets using your own credentials.
- All data is stored in your browser's `localStorage` under keys prefixed `knb_`.
- Google OAuth tokens are session-only and never written to disk.
- Your Google Client ID and Spreadsheet ID are stored in `localStorage` for convenience — they are not sensitive on their own.
