import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeSettingsPage } from './settings.page';

describe('SettingsPage', () => {
  let component: HomeSettingsPage;
  let fixture: ComponentFixture<HomeSettingsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
