<div align="center"> 

# 🕐 Tracker

**A lightweight Chrome extension for manual time tracking — organized by teams and tasks.**

![Manifest Version](https://img.shields.io/badge/Manifest-V3-63ffb4?style=flat-square&labelColor=0d0d0f)
![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-white?style=flat-square&labelColor=0d0d0f)

</div>

---

## 📖 Overview

**Tracker** is a manual time tracking Chrome extension that lets you log time across multiple teams and tasks — entirely within your browser. No accounts, no syncing, no internet required. Your data stays local.

It's built for developers, freelancers, and teams who want a no-frills way to record what they worked on and for how long.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏷️ **Teams** | Create multiple teams to group related work |
| ✅ **Tasks** | Add tasks under each team |
| ⏱️ **Time Entries** | Log hours and minutes per task, per day |
| 📝 **Notes** | Attach optional notes to every time entry |
| 📊 **Export** | Generate CSV reports filtered by team and date range |
| 💾 **Local Storage** | All data stored privately via Chrome's storage API |
| 🔒 **No Account Needed** | Works 100% offline — nothing leaves your browser |

---

## 🖥️ System Requirements

| Requirement | Details |
|---|---|
| **Browser** | Google Chrome 88+ (Manifest V3 support required) |
| **Operating System** | Windows 10/11, macOS 10.14+, Linux (any modern distro) |
| **Permissions** | `storage` — used solely to persist your data locally |
| **Internet** | Not required (except for loading Google Fonts on first open) |

---

## 📦 Installation

> Tracker is not yet published on the Chrome Web Store. Install it manually using Developer Mode.

### Step 1 — Download

Download the latest release ZIP from the [Releases](#) page, or clone this repository:

```bash
git clone https://github.com/your-username/tracker-extension.git
```

### Step 2 — Unzip

If you downloaded the ZIP file, extract it to a folder on your computer.

```
tracker-extension/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json
├── popup.html
├── popup.css
└── popup.js
```

### Step 3 — Open Chrome Extensions

Open Google Chrome and navigate to:

```
chrome://extensions
```

Or go to: **Chrome Menu (⋮)** → **More Tools** → **Extensions**

### Step 4 — Enable Developer Mode

Toggle **Developer Mode** on using the switch in the **top-right corner** of the Extensions page.

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/e3f22637-7db1-42bc-a3fb-7e04178cf5e9" />

### Step 5 — Load Unpacked

Click **"Load unpacked"** and select the `tracker-extension` folder (the one containing `manifest.json`).

### Step 6 — Pin to Toolbar *(optional but recommended)*

Click the puzzle icon 🧩 in the Chrome toolbar, find **Tracker**, and click the **pin** icon to keep it visible in your toolbar.

---

## 🚀 How to Use

### Creating a Team

1. Click the **Tracker** icon in your toolbar to open the popup.
2. Click the **`+`** button in the top-right corner.
3. Enter a team name (e.g. `Design`, `Backend`, `Client Work`) and click **Create Team**.

### Adding Tasks

1. Select a team by clicking its tab.
2. Click **`+ Add Task`**.
3. Enter the task name. Optionally log your first time entry right away (date, hours, minutes, notes).
4. Click **Save**.

### Logging Time

1. On any task card, click the **clock icon** (⏱) to add a time entry.
2. Fill in the **date**, **hours**, **minutes**, and optional **notes**.
3. Click **Add Entry**.
4. Click the task card to **expand** it and see all logged entries.

### Deleting Entries

- To remove a single time entry: expand the task card and click the **`✕`** next to the entry.
- To delete a task: click the **trash icon** on the task card.
- To delete a team: hover over the team tab and click **`✕`**.

### Exporting a Report

1. Click the **export/download icon** (↓) in the top-right corner.
2. Select a **team** (or keep "All Teams").
3. Set a **date range**.
4. Click **Preview** to see the data in-popup.
5. Click **Download CSV** to save the report to your computer.

The exported CSV includes: `Date`, `Team`, `Task`, `Hours`, `Minutes`, `Total Time`, and `Notes`.

---

## 📁 Project Structure

```
tracker-extension/
│
├── manifest.json       # Chrome extension manifest (MV3)
├── popup.html          # Extension popup UI
├── popup.css           # Styles (dark theme, Syne + DM Mono fonts)
├── popup.js            # All app logic (state, rendering, storage, export)
│
└── icons/
    ├── icon16.png      # 16×16 toolbar icon
    ├── icon48.png      # 48×48 extensions page icon
    └── icon128.png     # 128×128 Chrome Web Store icon
```

---

## 🔧 Tech Stack

- **Vanilla JavaScript** — no frameworks or dependencies
- **Chrome Extensions API** — Manifest V3, `chrome.storage.local`
- **HTML/CSS** — custom dark UI with [Syne](https://fonts.google.com/specimen/Syne) and [DM Mono](https://fonts.google.com/specimen/DM+Mono) typefaces
- **CSV Export** — native Blob + URL API, no libraries

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Arnold Elacion Jr**

> Built with focus and simplicity in mind. Track your time, own your data.

---

<div align="center">

Made with ☕ by Arnold Elacion Jr

</div>
