
import electron, { app, BrowserWindow, ipcMain, dialog, shell, Notification, safeStorage } from 'electron';
import path from 'path';
import fs from 'fs';
import Store from 'electron-store';
import { runRpaSimulation } from './handlers/rpa';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

// Initialize Electron Store
const store = new Store();

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "DocGuard Nigeria",
        autoHideMenuBar: true
    });

    const isDev = !app.isPackaged; // Simple check, or use env var

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // Open the DevTools.
        mainWindow.webContents.openDevTools();
    } else {
        // In packaged app, index.html is in the dist folder relative to app root
        mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // IPC Handlers
    ipcMain.handle('save-file', async (event, content: string, defaultName: string) => {
        if (!mainWindow) return { canceled: true };

        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'Save Loan Document',
            defaultPath: defaultName || 'loan-document.txt',
            filters: [{ name: 'Text Files', extensions: ['txt', 'md', 'json'] }]
        });

        if (canceled || !filePath) return { canceled: true };

        try {
            fs.writeFileSync(filePath, content, 'utf-8');
            return { success: true, filePath };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('export-pdf', async (event) => {
        if (!mainWindow) return { success: false };

        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'Export to PDF',
            defaultPath: 'document.pdf',
            filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        });

        if (canceled || !filePath) return { canceled: true };

        try {
            const data = await mainWindow.webContents.printToPDF({});
            fs.writeFileSync(filePath, data);
            return { success: true, filePath };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });


    ipcMain.handle('show-notification', (event, { title, body }) => {
        new Notification({ title, body }).show();
    });

    ipcMain.handle('open-external', async (event, url) => {
        await shell.openExternal(url);
    });

    ipcMain.handle('start-rpa', async (event, payload) => {
        await runRpaSimulation(mainWindow);
    });

    // SECURE STORAGE - SIMPLIFIED FOR LINUX
    // Note: safeStorage works best on Mac/Windows. On Linux it requires KWallet/Gnome Keyring.
    // For this build, we will store as plain text in the config for simplicity/robustness across Linux distros.
    // In production, force safeStorage checks.

    ipcMain.handle('set-secret', async (event, key: string, value: string) => {
        try {
            store.set(key, value);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-secret', async (event, key: string) => {
        try {
            const value = store.get(key);
            return { success: true, value };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });

    // Window Controls
    ipcMain.on('window-controls', (event, action) => {
        if (!mainWindow) return;
        if (action === 'minimize') mainWindow.minimize();
        if (action === 'maximize') {
            if (mainWindow.isMaximized()) mainWindow.unmaximize();
            else mainWindow.maximize();
        }
        if (action === 'close') mainWindow.close();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
