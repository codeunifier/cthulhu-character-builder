import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgeEffectsCardComponent } from './age-effects-card.component';

describe('AgeEffectsCardComponent', () => {
  let component: AgeEffectsCardComponent;
  let fixture: ComponentFixture<AgeEffectsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgeEffectsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgeEffectsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
