import { TestBed } from '@angular/core/testing';

import { Points24Drag } from './points-24-drag';

describe('Points24Drag', () => {
  let service: Points24Drag;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Points24Drag);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
