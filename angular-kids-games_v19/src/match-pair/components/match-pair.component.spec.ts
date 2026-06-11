import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { MatchPairComponent } from './match-pair.component';

describe('MatchPairComponent', () => {
  let component: MatchPairComponent;
  let fixture: ComponentFixture<MatchPairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatchPairComponent],
      providers: [HttpClient]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatchPairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
