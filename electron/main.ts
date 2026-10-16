import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

// Configure autoUpdater
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.logger = console

function getUpdaterConfigFile(): string {
  return path.join(app.getPath('userData'), 'updater-config.json')
}

function getStoredToken(): string | null {
  try {
    const file = getUpdaterConfigFile()
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'))
      return parsed?.token || null
    }
  } catch (e) {
    console.warn('[AutoUpdater] Failed reading updater config:', e)
  }
  return null
}

function saveStoredToken(token: string) {
  try {
    const file = getUpdaterConfigFile()
    fs.writeFileSync(file, JSON.stringify({ token: token.trim() }), 'utf-8')
  } catch (e) {
    console.error('[AutoUpdater] Failed writing updater config:', e)
  }
}

export function configureAutoUpdater(overrideToken?: string | null) {
  const token = overrideToken ?? process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? getStoredToken()
  if (token && token.trim()) {
    console.log('[AutoUpdater] Configuring updater with GitHub PAT token (Private Repo support)')
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'lumisolutionz-code',
      repo: 'Hotline-POS-',
      private: true,
      token: token.trim(),
    })
  } else {
    console.log('[AutoUpdater] Configuring updater in public repository mode')
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'lumisolutionz-code',
      repo: 'Hotline-POS-',
    })
  }
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
    backgroundColor: '#f0f4f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.maximize()

  // Open external links in user's default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())

    // Trigger update check after UI has finished loading (only in packaged production mode)
    if (!VITE_DEV_SERVER_URL) {
      setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify().catch((err) => {
          console.error('[AutoUpdater] Initial check error:', err?.message || err)
        })
      }, 3500)
    }
  })

  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron] Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`)
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  configureAutoUpdater()
  createWindow()
})

// Auto-updater event listeners with detailed payloads
autoUpdater.on('checking-for-update', () => {
  console.log('[AutoUpdater] Checking for update...')
  win?.webContents.send('update-checking')
})

autoUpdater.on('update-available', (info) => {
  console.log('[AutoUpdater] Update available:', info?.version)
  win?.webContents.send('update-available', info)
})

autoUpdater.on('update-not-available', (info) => {
  console.log('[AutoUpdater] Update not available. Already on latest version:', info?.version)
  win?.webContents.send('update-not-available', info)
})

autoUpdater.on('error', (err) => {
  const errMsg = err?.message || String(err)
  console.error('[AutoUpdater Error]:', errMsg)
  const is404 = errMsg.includes('404')
  win?.webContents.send('update-error', {
    message: errMsg,
    is404,
    hint: is404
      ? 'GitHub returned 404 Not Found. If the repository is Private, make it Public on GitHub or provide a token in Settings so autoUpdater can download the release.'
      : errMsg,
  })
})

autoUpdater.on('download-progress', (progressObj) => {
  win?.webContents.send('update-progress', progressObj)
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('[AutoUpdater] Update downloaded successfully:', info?.version)
  win?.webContents.send('update-downloaded', info)
})

// IPC handlers for manual UI triggers
ipcMain.handle('check_for_updates', async () => {
  try {
    configureAutoUpdater()
    const result = await autoUpdater.checkForUpdates()
    return {
      success: true,
      currentVersion: app.getVersion(),
      updateVersion: result?.updateInfo?.version,
      hasUpdate: Boolean(result?.updateInfo?.version && result.updateInfo.version !== app.getVersion()),
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err)
    console.error('[AutoUpdater] Manual check error:', errMsg)
    return {
      success: false,
      error: errMsg,
      is404: errMsg.includes('404'),
    }
  }
})

ipcMain.handle('get_update_token', () => {
  return getStoredToken() || ''
})

ipcMain.handle('save_update_token', (_event, token: string) => {
  saveStoredToken(token || '')
  configureAutoUpdater(token || null)
  return { success: true }
})

ipcMain.handle('get_app_version', () => {
  return app.getVersion()
})

// Listen for restart command from frontend
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall()
})

ipcMain.handle('open_external', async (_, url: string) => {
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    await shell.openExternal(url)
    return true
  }
  return false
})

