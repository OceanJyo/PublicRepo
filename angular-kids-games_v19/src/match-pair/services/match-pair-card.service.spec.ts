import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MatchPairCardService } from './match-pair-card.service';
import { HttpClient } from '@angular/common/http';

describe('MatchPairCardService', () => {
  let service: MatchPairCardService;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    http = TestBed.inject(HttpClient);
    service = TestBed.inject(MatchPairCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
