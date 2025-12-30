
/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
    interface ProcessEnv {
        DIST: string;
        PUBLIC: string;
    }
}

interface Window {
    // expose in the `electron/preload`
    ipcRenderer: import('electron').IpcRenderer;
    electron: {
        versions: {
            node: () => string;
            chrome: () => string;
            electron: () => string;
        };
        saveFile: (content: string, defaultName: string) => Promise<{ success: boolean; filePath?: string; error?: string; canceled?: boolean }>;
        exportPDF: () => Promise<{ success: boolean; filePath?: string; error?: string; canceled?: boolean }>;
        startRPA: (payload: { ref: string; entity: string; rcNumber?: string; filingId?: string }) => Promise<void>;
        onRPAUpdate: (callback: (event: any, data: any) => void) => void;
        offRPAUpdate: (callback: (event: any, data: any) => void) => void;
        showNotification: (title: string, body: string) => void;
        openExternal: (url: string) => Promise<void>;
        setSecret: (key: string, value: string) => Promise<{ success: boolean; error?: string }>;
        getSecret: (key: string) => Promise<{ success: boolean; value?: any; error?: string }>;
    }
}
