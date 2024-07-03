import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/routes/sessions/login/auth.service';

import { InputTextboxSelectorComponent } from './input-textbox-selector.component';

describe('InputTextboxSelectorComponent', () => {
  let component: InputTextboxSelectorComponent;
  let fixture: ComponentFixture<InputTextboxSelectorComponent>;
  const fakeActivatedRoute = {
    snapshot: { data: {} }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputTextboxSelectorComponent ],
      imports: [ HttpClientTestingModule, MatSnackBarModule, MatDialogModule ],
      providers: [ DatePipe, AuthService, { provide: ActivatedRoute, useValue: fakeActivatedRoute }  ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputTextboxSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
