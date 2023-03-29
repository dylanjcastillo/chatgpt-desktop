const {
    app,
    BrowserWindow,
    Tray,
    Menu,
    globalShortcut,
} = require('electron');
const path = require('path');
const localShortcut = require('electron-localshortcut');

let mainWindow;
let windowPosition = null;
let tray;

function toggleWindow() {
    if (mainWindow.isVisible()) {
        mainWindow.hide();
    } else {
        mainWindow.show();
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        show: true,
        movable: true,
        resizable: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
    });

    mainWindow.loadURL('https://chat.openai.com');

    mainWindow.on('close', function (event) {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.on('move', function () {
        windowPosition = mainWindow.getPosition();
    });

    mainWindow.on('show', function () {
        if (windowPosition) {
            mainWindow.setPosition(windowPosition[0], windowPosition[1]);
        } else {
            mainWindow.center();
        }
    });

    localShortcut.register('CmdOrCtrl+Enter', () => {
        if (mainWindow.isVisible()) {
            mainWindow.webContents.executeJavaScript(`
                (() => {
                    const activeElement = document.activeElement;
                    if (activeElement && activeElement.form) {
                        activeElement.form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                })();
            `);
        }
    });

}

function createTray() {
    const iconPath = path.join(__dirname, 'icon_tray.png');

    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([{
            label: 'Reset Window',
            click: function () {
                mainWindow.setSize(400, 600);
                mainWindow.center()
                windowPosition = null;
            },
        },
        {
            label: 'Hide',
            click: function () {
                mainWindow.hide();
            },
        },
        {
            type: 'separator',
        },
        {
            label: 'Quit',
            click: function () {
                app.isQuitting = true;
                app.quit();
            },
        },
    ]);
    tray.setToolTip('OpenAI Chat');

    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });


    tray.on('right-click', () => {
        tray.popUpContextMenu(contextMenu);
    });
}


app.on('ready', function () {
    createWindow();
    createTray();

    if (process.platform === 'darwin') {
        app.dock.hide();
    }

    const showWindowShortcut = 'CmdOrCtrl+Shift+0';
    const ret = globalShortcut.register(showWindowShortcut, () => {
        toggleWindow();
    });

    if (!ret) {
        console.error(`Failed to register shortcut: ${showWindowShortcut}`);
    } else {
        console.log(`Shortcut ${showWindowShortcut} registered successfully!`);
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
