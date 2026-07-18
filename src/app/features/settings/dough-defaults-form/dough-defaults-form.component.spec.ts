import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';

import { DoughDefaultsService } from 'src/app/features/calculator/services/dough-defaults.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { DoughDefaultsFormComponent } from './dough-defaults-form.component';

describe('DoughDefaultsFormComponent', () => {
  let component: DoughDefaultsFormComponent;
  let fixture: ComponentFixture<DoughDefaultsFormComponent>;
  let prefs: FakePrefsStorage;

  /** A user edit from the UI marks the control dirty; patchValue alone does not. */
  const userPicks = (
    field: 'hydrationRatio' | 'saltRatio' | 'pizzaWeight',
    value: number,
  ): void => {
    component['form'].controls[field].markAsDirty();
    component['form'].patchValue({ [field]: value });
  };

  beforeEach(waitForAsync(() => {
    prefs = new FakePrefsStorage();
    TestBed.configureTestingModule({
      imports: [DoughDefaultsFormComponent],
      providers: [
        provideTranslateService(),
        { provide: PrefsStorage, useValue: prefs },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DoughDefaultsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('offers the same hydration choices as the calculator (55% to 80%)', () => {
    const options = fixture.debugElement.queryAll(
      By.css('ion-select[formControlName="hydrationRatio"] ion-select-option'),
    );
    const values = options.map((option) => option.nativeElement.value);

    expect(values[0]).toBe(0.55);
    expect(values[values.length - 1]).toBe(0.8);
  });

  it('picking a value updates the user Defaults', fakeAsync(() => {
    const defaults = TestBed.inject(DoughDefaultsService);

    userPicks('hydrationRatio', 0.7);
    tick(250);

    expect(defaults.getDefaults().hydrationRatio).toBe(0.7);
  }));

  it('touching one Default keeps the others following the factory values', fakeAsync(() => {
    userPicks('hydrationRatio', 0.7);
    tick(250);

    // Only the edited field is persisted as an override: the untouched ones
    // must keep tracking FACTORY_DEFAULTS if a future release re-tunes them.
    expect(prefs.get('calculator:defaults')).toEqual({ hydrationRatio: 0.7 });
  }));
});
