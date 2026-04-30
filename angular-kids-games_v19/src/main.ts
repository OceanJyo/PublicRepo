import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
//import { AppComponent } from './app/app.component';
import { AppKidsgamesComponent } from './app/app.kidsgames.component';

bootstrapApplication(AppKidsgamesComponent, appConfig)
  .catch((err) => console.error(err));
