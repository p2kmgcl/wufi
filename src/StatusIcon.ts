import { BrowserWindow, Menu, nativeImage, Tray } from 'electron';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export class StatusIcon {
  private _trayInstance: Tray | null = null;
  private _destroyed = false;

  constructor() {}

  private _getTray() {
    if (!this._trayInstance) {
      this._trayInstance = new Tray(nativeImage.createEmpty());

      const intervalId = setInterval(() => {
        if (this._destroyed) {
          clearInterval(intervalId);
        } else {
          this._trayInstance;
        }
      }, 1000);
    }

    return this._trayInstance;
  }

  destroy() {
    this._destroyed = true;
  }

  async setIcon(text: string): Promise<void> {
    const win = new BrowserWindow({
      frame: false,
      width: text.length * 12,
      height: 22,
      show: true,
      focusable: false,
      skipTaskbar: true,
      x: 9999,
      y: 9999,
    });

    await win.loadURL(
      `data:text/html;charset=utf-8,${readFileSync(
        resolve(__dirname, '../assets/message.html'),
        'utf-8',
      ).replace('[[MESSAGE]]', text)}`,
    );

    const image = await win.capturePage();

    this._getTray().setImage(image);
    win.destroy();
  }

  setContextMenu(menu: Menu): void {
    this._getTray().setContextMenu(menu);
  }
}
