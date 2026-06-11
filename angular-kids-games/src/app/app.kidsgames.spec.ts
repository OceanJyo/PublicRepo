import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppKidsGames } from './app.kidsgames';
import { routes } from './app.routes';

describe('AppKidsGames', () => {
  let component: AppKidsGames;
  let fixture: ComponentFixture<AppKidsGames>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppKidsGames],
      providers: [provideRouter(routes),]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppKidsGames);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
