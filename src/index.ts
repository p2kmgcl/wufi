import { app, Menu } from 'electron';
import { StatusIcon } from './StatusIcon';
import { Woffu } from './Woffu';

async function main() {
  let destroyed = false;
  const statusIcon = new StatusIcon();

  let woffu: Woffu | undefined;

  async function initWoffu() {
    woffu?.destroy();
    woffu = undefined;
    statusIcon.setIcon('🔄');
    const nextWoffu = new Woffu();
    await nextWoffu.init();
    await nextWoffu.login();
    woffu = nextWoffu;
  }

  await initWoffu();

  (async function loadStatus() {
    if (destroyed) {
      return;
    }

    if (woffu) {
      const emoji = (await woffu.isWorking()) ? '💪' : '🏖️';
      const [h, m] = (await woffu.getWorkedHours()).split(':').slice(0, 2);
      statusIcon.setIcon(`${emoji} ${h}:${m}`);
    } else {
      statusIcon.setIcon('🔄');
    }

    setTimeout(loadStatus, 2000);
  })();

  statusIcon.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Toggle work',
        type: 'normal',
        click: () => woffu?.toggleWork(),
      },
      {
        type: 'separator',
      },
      {
        label: 'Reload window',
        type: 'normal',
        click: () => initWoffu(),
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
