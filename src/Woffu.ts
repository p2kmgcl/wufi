import { BrowserWindow } from 'electron';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export class Woffu {
  private _window: BrowserWindow | null;

  constructor() {
    this._window = null;
  }

  async init() {
    if (this._window) {
      this._window.destroy();
    }

    this._window = new BrowserWindow({
      width: 1280,
      height: 720,
      focusable: process.env.NODE_ENV === 'development',
      skipTaskbar: process.env.NODE_ENV !== 'development',
      x: 9999,
      y: 9999,
    });

    await this._window.webContents.openDevTools();
    await this._window.loadURL('https://liferay.woffu.com');

    this._window.webContents.executeJavaScript(
      readFileSync(resolve(__dirname, '../assets/shared.js'), 'utf-8'),
    );
  }

  destroy() {
    this._window?.destroy();
    this._window = null;
  }

  async login(): Promise<void> {
    await this._window?.webContents.executeJavaScript(`
      (async function () {
        try {
          await waitForElement('#dashboard');
          return true;
        } catch (_) {}

        const emailInput = await waitForElement('#tuEmail');
        emailInput.value = '${process.env.WOFFU_USERNAME}';
        emailInput.dispatchEvent(new Event('input'));

        const passwordInput = await waitForElement('#tuPassword');
        passwordInput.value = '${process.env.WOFFU_PASSWORD}';
        passwordInput.dispatchEvent(new Event('input'));

        const submitButton = querySiblingElement(
          passwordInput,
          'button[type="submit"]',
        );

        submitButton.click();
      })();
    `);
  }

  async getWorkedHours(): Promise<string> {
    return this._window?.webContents.executeJavaScript(`
      (async function () {
        const element = await waitForElement('#panMySigns p[ng-if="submited"]');
        await waitForContent(element);

        return element.innerText;
      })()
    `);
  }

  async isWorking(): Promise<boolean> {
    return this._window?.webContents.executeJavaScript(`
      (async function () {
        try {
          await waitForElement('#out');
          return true;
        } catch (_) {
          return false;
        }
      })()
    `);
  }

  async toggleWork(): Promise<void> {
    return this._window?.webContents.executeJavaScript(`
      (async function () {
        try {
          (await waitForElement('#in')).click();
        } catch (_) {
          (await waitForElement('#out')).click();
        }
      })()
    `);
  }

  toggleWindow(visible: boolean) {
    if (!this._window) {
      return;
    }

    if (visible) {
      this._window.setFocusable(true);
      this._window.setSkipTaskbar(false);
      this._window.center();
    } else {
      this._window.setFocusable(false);
      this._window.setSkipTaskbar(true);
      this._window.setPosition(9999, 9999, false);
    }
  }
}
