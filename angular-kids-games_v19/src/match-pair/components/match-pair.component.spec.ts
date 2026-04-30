import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { MatchPairComponent } from './match-pair.component';

describe('MatchPairComponent', () => {
  let component: MatchPairComponent;
  let fixture: ComponentFixture<MatchPairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MatchPairComponent],
    providers: [HttpClient, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
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
