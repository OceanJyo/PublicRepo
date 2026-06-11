import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';

import { AppKidsGames } from './app/app.kidsgames';

bootstrapApplication(AppKidsGames, appConfig)
  .catch((err) => console.error(err));
