import { app, Menu } from 'electron';
import { StatusIcon } from './StatusIcon';
import { Woffu } from './Woffu';

async function main() {
  let destroyed = false;
  const statusIcon = new StatusIcon();

  let woffu: Woffu | undefined;

  statusIcon.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Toggle work',
        type: 'normal',
        click: async () => {
          const currentWoffu = woffu;

          statusIcon.setIcon('🔄 Toggling');
          await currentWoffu?.toggleWork();
          statusIcon.setIcon('🔄 Waiting');

          woffu = currentWoffu;
          loadStatus();
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Reload window',
        type: 'normal',
        click: async () => {
          await initWoffu();
          loadStatus();
        },
      },
      {
        label: 'Show window',
        type: 'checkbox',
        checked: process.env.NODE_ENV === 'development',
        click: (menuItem) => woffu?.toggleWindow(menuItem.checked),
      },
      {
        label: 'Exit',
        type: 'normal',
        click: () => {
          app.quit();
          statusIcon.destroy();
          woffu?.destroy();
          destroyed = true;
        },
      },
    ]),
  );

  async function initWoffu() {
    woffu?.destroy();
    woffu = undefined;

    try {
      const nextWoffu = new Woffu();
      statusIcon.setIcon('🔄 Initializing');
      await nextWoffu.init();
      statusIcon.setIcon('🔄 Logging in');
      await nextWoffu.login();
      statusIcon.setIcon('🔄 Ready');
      woffu = nextWoffu;
    } catch (error) {
      statusIcon.setIcon('🟥 Error');
    }
  }

  async function loadStatus() {
    if (destroyed) {
      return;
    }

    if (woffu) {
      const emoji = (await woffu.isWorking()) ? '💪' : '🏖️';
      const [h, m] = (await woffu.getWorkedHours()).split(':').slice(0, 2);
      statusIcon.setIcon(`${emoji} ${h}:${m}`);
    } else {
      statusIcon.setIcon('🔄 Waiting');
    }
  }

  async function loadStatusLoop() {
    try {
      await loadStatus();
    } catch (error) {
      console.error(error);
    }

    setTimeout(loadStatusLoop, 10000);
    return new Promise(() => {});
  }

  await initWoffu();
  await loadStatusLoop();
}

app
  .whenReady()
  .then(main)
  .catch((error) => {
    console.error(error.toString());
    console.trace();
  });

app.on('window-all-closed', (event: Event) => {
  event.preventDefault();
});
