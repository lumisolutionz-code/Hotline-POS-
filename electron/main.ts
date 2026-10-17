import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
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

let win: BrowserWindow | null = null
let activePrintWindow: BrowserWindow | null = null

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

  // Open external links in user's default browser and configure child print windows
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        webPreferences: {
          preload: path.join(__dirname, 'preload.mjs'),
          contextIsolation: true,
          nodeIntegration: false,
        },
      },
    }
  })

  // Track child print windows opened from this window
  win.webContents.on('did-create-window', (childWin) => {
    activePrintWindow = childWin
    childWin.on('closed', () => {
      if (activePrintWindow === childWin) activePrintWindow = null
    })
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

// Trigger native OS print dialog for the requesting or child report window
const handleNativePrint = async (event: any, options?: { silent?: boolean }) => {
  // 1. If child print window is active, prioritize printing it
  let targetWin = (activePrintWindow && !activePrintWindow.isDestroyed())
    ? activePrintWindow
    : BrowserWindow.fromWebContents(event.sender)

  // 2. Fallback to focused window or main window
  if (!targetWin || targetWin.isDestroyed()) {
    targetWin = BrowserWindow.getFocusedWindow() || win
  }

  if (!targetWin || targetWin.isDestroyed()) return false

  targetWin.focus()
  return new Promise((resolve) => {
    targetWin!.webContents.print(
      {
        silent: options?.silent ?? false,
        printBackground: true,
      },
      (success, failureReason) => {
        if (!success) console.warn('[Electron Print Error]:', failureReason)
        resolve(success)
      }
    )
  })
}

ipcMain.handle('print_document', handleNativePrint)
ipcMain.handle('print_active_report', handleNativePrint)

// Direct HTML print
ipcMain.handle('print_html_direct', async (_event, { html, title }: { html: string; title?: string }) => {
  const printWin = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
    },
  })
  if (title) printWin.setTitle(title)
  await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
  return new Promise((resolve) => {
    printWin.webContents.print(
      {
        silent: false,
        printBackground: true,
      },
      (success, failureReason) => {
        printWin.close()
        if (!success) console.warn('[Direct Print Error]:', failureReason)
        resolve(success)
      }
    )
  })
})

// Render HTML report to PDF and trigger save file dialog
ipcMain.handle('download_pdf', async (_event, { html, defaultName }: { html: string; defaultName?: string }) => {
  try {
    const pdfWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
      },
    })
    await pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
    const data = await pdfWin.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      margins: {
        top: 0.35,
        bottom: 0.35,
        left: 0.4,
        right: 0.4,
      },
    })
    pdfWin.close()

    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Download Business Report as PDF',
      defaultPath: defaultName || `Business-Report-${new Date().toISOString().slice(0, 10)}.pdf`,
      filters: [{ name: 'PDF Document (*.pdf)', extensions: ['pdf'] }],
    })

    if (!canceled && filePath) {
      fs.writeFileSync(filePath, data)
      return { success: true, filePath }
    }
    return { success: false, canceled: true }
  } catch (err: any) {
    console.error('[Download PDF Error]:', err)
    return { success: false, error: err?.message || String(err) }
  }
})

// ==========================================
// Database Backup IPC Handlers
// ==========================================
function getBackupConfigFile(): string {
  return path.join(app.getPath('userData'), 'backup-config.json')
}

function getDefaultBackupDir(): string {
  const dir = path.join(app.getPath('documents'), 'Hotline_POS_Backups')
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch (e) {
    console.error('[Backup] Failed to ensure default backup directory:', e)
  }
  return dir
}

function getStoredBackupDir(): string {
  try {
    const file = getBackupConfigFile()
    if (fs.existsSync(file)) {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'))
      if (parsed?.destinationPath && fs.existsSync(parsed.destinationPath)) {
        return parsed.destinationPath
      }
    }
  } catch (e) {
    console.warn('[Backup] Failed reading backup config:', e)
  }
  return getDefaultBackupDir()
}

ipcMain.handle('get_backup_config', async () => {
  return { destinationPath: getStoredBackupDir() }
})

ipcMain.handle('save_backup_config', async (_event, { destinationPath }: { destinationPath: string }) => {
  try {
    const file = getBackupConfigFile()
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true })
    }
    fs.writeFileSync(file, JSON.stringify({ destinationPath: destinationPath.trim() }), 'utf-8')
    return { success: true, destinationPath: destinationPath.trim() }
  } catch (e: any) {
    console.error('[Backup] Failed saving backup config:', e)
    return { success: false, error: e?.message || String(e) }
  }
})

ipcMain.handle('select_backup_directory', async () => {
  const currentDir = getStoredBackupDir()
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: 'Select Database Backup Storage Directory',
    defaultPath: currentDir,
    properties: ['openDirectory', 'createDirectory'],
  })
  if (!canceled && filePaths && filePaths.length > 0) {
    return filePaths[0]
  }
  return null
})

ipcMain.handle('save_backup_archive', async (_event, { buffer, filename, targetPath }: { buffer: any; filename: string; targetPath?: string }) => {
  try {
    const dir = targetPath || getStoredBackupDir()
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const safeFilename = filename || `hotline_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`
    const fullPath = path.join(dir, safeFilename)

    let writeBuffer: Buffer
    if (Buffer.isBuffer(buffer)) {
      writeBuffer = buffer
    } else if (typeof buffer === 'string') {
      writeBuffer = Buffer.from(buffer, 'base64')
    } else {
      writeBuffer = Buffer.from(buffer)
    }

    fs.writeFileSync(fullPath, writeBuffer)
    const stats = fs.statSync(fullPath)

    return {
      success: true,
      filePath: fullPath,
      size: stats.size,
      filename: safeFilename,
      savedAt: new Date().toISOString(),
    }
  } catch (e: any) {
    console.error('[Backup] Error saving backup archive to disk:', e)
    return { success: false, error: e?.message || String(e) }
  }
})

ipcMain.handle('list_backup_files', async (_event, customDir?: string) => {
  try {
    const dir = customDir || getStoredBackupDir()
    if (!fs.existsSync(dir)) {
      return { success: true, files: [], directory: dir }
    }
    const entries = fs.readdirSync(dir)
    const files = entries
      .filter((file) => file.toLowerCase().endsWith('.zip'))
      .map((file) => {
        try {
          const fullPath = path.join(dir, file)
          const stats = fs.statSync(fullPath)
          return {
            filename: file,
            fullPath,
            size: stats.size,
            modifiedAt: stats.mtime.toISOString(),
          }
        } catch {
          return null
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())

    return { success: true, files, directory: dir }
  } catch (e: any) {
    console.error('[Backup] Error listing backup files:', e)
    return { success: false, error: e?.message || String(e), files: [] }
  }
})

ipcMain.handle('open_backup_directory', async (_event, customDir?: string) => {
  const dir = customDir || getStoredBackupDir()
  if (fs.existsSync(dir)) {
    shell.openPath(dir)
    return { success: true }
  }
  return { success: false, error: 'Directory does not exist' }
})

