import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Points24Service } from './points-24.service';
import { HttpClient } from '@angular/common/http';

describe('Points24Service', () => {
  let service: Points24Service;
  let http: HttpClient;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    http = TestBed.inject(HttpClient);
    service = TestBed.inject(Points24Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
