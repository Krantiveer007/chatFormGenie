import { waitForAsync,ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AutocompletePositionDirective } from '@shared/utils/auto-complete-position.directive';
import { MaterialModule } from 'app/material.module';
import { MultiSelectAutocompleteComponent } from './multi-select-autocomplete.component';

describe('MultiSelectAutocompleteComponent', () => {
  let component: MultiSelectAutocompleteComponent;
  let fixture: ComponentFixture<MultiSelectAutocompleteComponent>;
  let formBuilderInstance : UntypedFormBuilder;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiSelectAutocompleteComponent, AutocompletePositionDirective ],
      imports: [ MaterialModule, ReactiveFormsModule, BrowserAnimationsModule ],
      providers: [UntypedFormBuilder]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSelectAutocompleteComponent);
    formBuilderInstance = TestBed.inject(UntypedFormBuilder);
    component = fixture.componentInstance;
    component.form = formBuilderInstance.group({
      name: ''
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
