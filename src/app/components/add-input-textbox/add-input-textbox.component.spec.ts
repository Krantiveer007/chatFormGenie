import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { UiService } from 'app/dp-world/services/ui.service';
import { UtilsService } from 'app/dp-world/services/utils.service';
import { AuthService } from 'app/routes/sessions/login/auth.service';

import { AddInputTextboxComponent } from './add-input-textbox.component';

describe('AddInputTextboxComponent', () => {
  let component: AddInputTextboxComponent;
  let fixture: ComponentFixture<AddInputTextboxComponent>;
  const fakeActivatedRoute = {
    snapshot: { data: {} }
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddInputTextboxComponent ],
      imports: [ HttpClientTestingModule, MatSnackBarModule, MatDialogModule ],
      providers: [ AuthService, UiService, UtilsService, DatePipe, { provide: ActivatedRoute, useValue: fakeActivatedRoute } ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInputTextboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
