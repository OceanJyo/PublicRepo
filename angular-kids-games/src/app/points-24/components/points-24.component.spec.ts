import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { Points24Component } from './points-24.component';

describe('Points24Component', () => {
  let component: Points24Component;
  let fixture: ComponentFixture<Points24Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [Points24Component],
    providers: [HttpClient, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(Points24Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
