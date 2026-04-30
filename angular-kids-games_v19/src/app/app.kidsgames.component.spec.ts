import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppKidsgamesComponent } from './app.kidsgames.component';
import { routes } from './app.routes';

describe('AppKidsgamesComponent', () => {
  let component: AppKidsgamesComponent;
  let fixture: ComponentFixture<AppKidsgamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppKidsgamesComponent],
      providers: [provideRouter(routes),]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppKidsgamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
