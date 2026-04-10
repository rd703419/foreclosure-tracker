# Foreclosure + Tax Sale Tracker

A browser-based tracker for foreclosure and tax sale listings across **Lucas County, OH** and the **DMV area** (Northern VA, DC, MD suburbs). No server, no database, no subscription — runs entirely in your browser and saves data locally.

---

## Features

- Track **Pre-Foreclosure, Filing, Auction, REO, Tax Lien, Tax Deed, and Land Bank** listings
- Filter by market (Lucas County / DMV), stage, and type
- Tax sale fields: amount owed, redemption period, interest rate
- Source directory with direct links to all relevant county/court sites
- Import from CSV (drag and drop supported)
- Export to CSV anytime
- Data saved automatically in your browser's local storage
- Works offline after first load

---

## Setup — GitHub Pages (free, no credit card)

### Step 1 — Create a GitHub account

1. Go to [github.com](https://github.com)
2. Click **Sign up** — enter your email, create a password, choose a username
3. Verify your email address

### Step 2 — Create a new repository

1. Once logged in, click the **+** button in the top right corner
2. Click **New repository**
3. Name it exactly: `foreclosure-tracker`
4. Make sure **Public** is selected (required for free GitHub Pages)
5. Check the box that says **Add a README file**
6. Click **Create repository**

### Step 3 — Upload the files

You'll see your new repository page. Now upload the tracker files:

1. Click **Add file** → **Upload files**
2. Upload all of the following files, keeping the folder structure:
   ```
   index.html
   css/style.css
   js/app.js
   js/data.js
   ```
   To upload files inside folders (css/ and js/): drag the entire `foreclosure-tracker` folder onto the upload area — GitHub will preserve the folder structure automatically.
3. Scroll down, add a commit message like `"initial upload"`, and click **Commit changes**

### Step 4 — Enable GitHub Pages

1. In your repository, click the **Settings** tab (top of the page)
2. In the left sidebar, click **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Under **Branch**, select `main` and keep the folder as `/ (root)`
5. Click **Save**

### Step 5 — Open your tracker

GitHub will show a message: *"Your site is live at..."* — usually within 1–2 minutes.

Your URL will be:
```
https://YOUR-USERNAME.github.io/foreclosure-tracker/
```

Replace `YOUR-USERNAME` with your actual GitHub username. Bookmark this URL — that's your tracker, live on the web, free forever.

---

## Updating your data

Your listings are saved in your **browser's local storage** — they persist between visits on the same browser/device. To back them up or move them:

- Use **Export CSV** to download a backup anytime
- To move to another device: export on the old device, open the tracker on the new device, use **Import CSV**

---

## Adding new listings

Three ways:

1. **Manual** — click **+ Add listing** and fill in the form
2. **CSV import** — paste rows or drag a `.csv` file onto the page
3. **Bulk import** — export from a spreadsheet, drag onto the tracker

CSV column order:
```
address, zip, county, market, stage, filed, auction, est_value, source, url, notes, tax_owed, redemption_period, tax_rate
```

`market` values: `lucas` or `dmv`

`stage` values: `Pre-Foreclosure`, `Filing`, `Auction`, `REO`, `Tax Lien`, `Tax Deed`, `Land Bank`

---

## Source directory

### Lucas County, OH
| Source | URL |
|--------|-----|
| Sheriff sales | lucascountysheriff.org/civil/sheriff-sales |
| Online auctions | lucas.realauction.com |
| Tax delinquent list | co.lucas.oh.us/treasurer |
| Land Bank | toledolucascountylandbank.com |
| Fannie Mae REO | homepath.com |
| HUD Homes | hudhomestore.gov |

### DMV Area
| Source | URL |
|--------|-----|
| Fairfax tax sale | fairfaxcounty.gov/taxes/real-estate/tax-sale |
| Arlington tax sale | arlingtonva.us |
| DC tax lien sale | otr.cfo.dc.gov/page/tax-sale |
| Montgomery Co. tax sale | montgomerycountymd.gov/finance/tax-sale.html |
| VA Lawyers Weekly (trustee notices) | valawyersweekly.com/public-notices |
| Fairfax land records | icare.fairfaxcounty.gov |

---

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Add new listing |
| `Escape` | Close modal |

---

## Privacy

All data is stored in **your browser's local storage** on your own device. Nothing is sent to any server. GitHub only hosts the HTML/CSS/JS files — it never sees your listing data.
