import './styles/tokens.css';
import './styles/main.css';
import './styles/overlays.css';

import { createStore } from './core/store.js';
import { repository } from './services/repository.js';
import { initMusicController } from './components/music.js';
import { initLightbox } from './components/lightbox.js';
import { initInvitation } from './components/invitation.js';
import { initAdmin } from './components/admin.js';
import { initPWA } from './pwa/register.js';

async function bootstrap() {
  const initialData = await repository.load();
  const store = createStore(initialData);

  const music = initMusicController();
  const lightbox = initLightbox();

  initInvitation({ store, music, lightbox });
  initAdmin({ store });
  initPWA();
}

bootstrap();
