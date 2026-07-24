import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';

import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';
import { FakePrefsStorage } from 'src/app/shared/testing/fake-prefs-storage';

import { SettingsFormComponent } from './settings-form.component';

describe('SettingsFormComponent', () => {
  let component: SettingsFormComponent;
  let fixture: ComponentFixture<SettingsFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SettingsFormComponent],
      providers: [
        provideTranslateService(),
        { provide: PrefsStorage, useValue: new FakePrefsStorage() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('offers exactly the v2 locales: English and French', () => {
    const options = fixture.debugElement.queryAll(
      By.css('ion-select[formControlName="locale"] ion-select-option'),
    );

    expect(options.map((option) => option.nativeElement.value)).toEqual([
      'en',
      'fr',
    ]);
  });

  it('links to the public privacy policy in a new window', () => {
    const link = fixture.debugElement.query(
      By.css('[data-testid="privacy-policy-link"]'),
    ).nativeElement as HTMLElement & { href: string };

    expect(link.href).toBe(
      'https://nyxa07.github.io/pizza-app/privacy/',
    );
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
