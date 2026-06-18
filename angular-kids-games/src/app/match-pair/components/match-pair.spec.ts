import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { MatchPair } from './match-pair';

describe('MatchPair', () => {
  let component: MatchPair;
  let fixture: ComponentFixture<MatchPair>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatchPair],
      providers: [HttpClient]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatchPair);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
