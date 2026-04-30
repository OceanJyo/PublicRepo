import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MatchPairCardService } from './match-pair-card.service';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MatchPairCardService', () => {
  let service: MatchPairCardService;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
    http = TestBed.inject(HttpClient);
    service = TestBed.inject(MatchPairCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
