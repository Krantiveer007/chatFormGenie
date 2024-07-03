import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSignUpComponent } from './view-sign-up.component';

describe('ViewSignUpComponent', () => {
  let component: ViewSignUpComponent;
  let fixture: ComponentFixture<ViewSignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewSignUpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
