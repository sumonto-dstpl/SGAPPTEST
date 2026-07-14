# Property & Garage Management System (PGMS)

A comprehensive offline desktop application for managing markets, rented shops, and garages. Built with React, Tauri, and SQLite.

## Features

- **Dashboard** - Overview of total markets, shops, garages, payments, and pending dues
- **Market Management** - Add, view, and manage markets with their associated shops
- **Shop Management** - Track rented/leased shops with tenant details, rent collection, and payment status
- **Garage Management** - Manage garage rentals with vehicle and owner information
- **Collect Payments** - One-click payment collection from shops and garages with due amounts
- **Backup System** - Export all data as Excel (.xlsx) files with auto-backup scheduling
- **Payment History** - Track all collected payments across shops and garages
- **Snackbar Notifications** - User-friendly toast messages instead of browser alerts

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Desktop**: Tauri v2 (Rust-based desktop wrapper)
- **Database**: SQLite (via tauri-plugin-sql)
- **Icons**: Lucide React
- **Excel Export**: xlsx library

## Prerequisites

Before running this application, ensure you have the following installed:

### For Development/Testing

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Rust** (latest stable) - [Download](https://www.rust-lang.org/tools/install)
3. **pnpm** or **npm** - Package manager

### System Dependencies for Tauri

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

#### Windows
- Microsoft Visual Studio C++ Build Tools
- WebView2 (included in Windows 10/11)

#### macOS
- Xcode Command Line Tools: `xcode-select --install`

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd project

# Install Node.js dependencies
npm install

# Install Tauri CLI (if not already installed)
npm install -D @tauri-apps/cli
```

### 2. Development Mode (Web Preview)

For quick testing in the browser with localStorage-based data:

```bash
# Run Vite dev server (web mode)
npm run dev
```

This starts the app at `http://localhost:1420` with hot-reload. Data is stored in browser localStorage.

### 3. Development Mode (Desktop with SQLite)

To run the full Tauri desktop app with SQLite database:

```bash
# Run Tauri in development mode
npm run tauri dev
```

This will:
- Start the Vite dev server
- Compile Rust backend
- Launch the desktop application window
- Use SQLite database for persistent storage

## Building the Application

### Build for Production (Web)

```bash
npm run build
```

Output will be in the `dist/` folder.

### Build Desktop Executable (.exe / .app / binary)

To create a distributable desktop application:

```bash
# Build the Tauri application
npm run tauri build
```

**Output locations:**

- **Windows**: `src-tauri/target/release/bundle/msi/` - Contains `.msi` installer and `.exe`
- **macOS**: `src-tauri/target/release/bundle/dmg/` - Contains `.dmg` file
- **Linux**: `src-tauri/target/release/bundle/deb/` - Contains `.deb` package

### Build Flags

For faster debug builds (skips optimization):

```bash
npm run tauri build -- --debug
```

For release builds with optimization:

```bash
npm run tauri build -- --release
```

## Distribution

### Sending to Customers

1. **Windows**: Send the `.msi` installer from `src-tauri/target/release/bundle/msi/`
   - Customer double-clicks to install
   - Creates desktop shortcut automatically

2. **macOS**: Send the `.dmg` file from `src-tauri/target/release/bundle/dmg/`
   - Customer drags app to Applications folder

3. **Linux**: Send the `.deb` package
   - Install with: `sudo dpkg -i pgms_1.0.0_amd64.deb`

## Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
project/
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts (Auth, Snackbar, Data)
│   ├── lib/                # Database adapters
│   ├── pages/              # Screen components
│   ├── store/              # DataContext provider
│   └── types/              # TypeScript interfaces
├── src-tauri/              # Tauri/Rust backend
│   ├── src/                # Rust source code
│   ├── icons/              # App icons
│   └── tauri.conf.json     # Tauri configuration
├── package.json            # Node dependencies
└── vite.config.ts          # Vite configuration
```

## Key Features Guide

### Collecting Payments

1. Navigate to **Shops** or **Garages** page
2. Find rows with "Due" payment status
3. Click the green **Collect** button
4. Payment is recorded and status changes to "Paid"
5. Payment appears in Dashboard payment history

### Auto Backup

1. Go to **Backup** page
2. Enable the Auto Backup toggle
3. Select frequency (Daily/Weekly/Monthly)
4. Set the time for backup
5. Excel file will auto-download at scheduled time

### Manual Backup

1. Go to **Backup** page
2. Click **Run Backup** for instant Excel download
3. Or fill in backup name and click **Create Backup & Download Excel**

## Troubleshooting

### Build errors on Windows
- Ensure Visual Studio Build Tools are installed
- Run from Developer Command Prompt or PowerShell

### SQLite errors on first run
- Database is auto-created on first launch
- Check write permissions in app data directory

### Web preview shows no data
- localStorage is used for web preview
- Use Tauri desktop mode for SQLite database

### Icon not showing in taskbar
- Icons are bundled during build
- Check `src-tauri/icons/` folder for icon files

## License

This project is proprietary software. All rights reserved.

## Support

For issues or feature requests, contact the developer.
