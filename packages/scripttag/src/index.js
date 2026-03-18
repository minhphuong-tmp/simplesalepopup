import DisplayManager from './managers/DisplayManager';
import ApiManager from './managers/ApiManager';

// Guard: prevent double initialization when both ScriptTag API and theme extension inject this file
if (!window.__avadaLoaded) {
  window.__avadaLoaded = true;
  console.log('This is the script tag');

  (async () => {
    const apiManager = new ApiManager();
    const displayManager = new DisplayManager();
    const { notifications, settings } = await apiManager.getNotifications();
    console.log('Avada ScriptTag ConfigLoaded:', { notifications, settings });
    displayManager.initialize({ notifications, settings });
  })()
}


