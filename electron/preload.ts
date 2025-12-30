import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    // Add any IPC functionality here
    // example:
    // send: (channel: string, data: any) => ipcRenderer.send(channel, data),
    // on: (channel: string, func: Function) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    versions: {
        node: () => process.versions.node,
        chrome: () => process.versions.chrome,
        electron: () => process.versions.electron
    },
    saveFile: (content: string, defaultName: string) => ipcRenderer.invoke('save-file', content, defaultName),
    exportPDF: () => ipcRenderer.invoke('export-pdf'),
    startRPA: (payload: any) => ipcRenderer.invoke('start-rpa', payload),
    onRPAUpdate: (callback: (event: any, data: any) => void) => ipcRenderer.on('rpa-update', callback),
    offRPAUpdate: (callback: (event: any, data: any) => void) => ipcRenderer.removeListener('rpa-update', callback),
    showNotification: (title: string, body: string) => ipcRenderer.invoke('show-notification', { title, body }),
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
    setSecret: (key: string, value: string) => ipcRenderer.invoke('set-secret', key, value),
    getSecret: (key: string) => ipcRenderer.invoke('get-secret', key)
});
