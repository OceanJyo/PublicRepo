import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { Points24 } from './points-24';

describe('Points24Component', () => {
  let component: Points24;
  let fixture: ComponentFixture<Points24>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, Points24],
      providers: [HttpClient]

    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Points24);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
