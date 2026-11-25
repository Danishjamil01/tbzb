import { TestBed } from '@angular/core/testing';
import { StatusBarService } from './status-bar.service';

describe('StatusBarService', () => {
  let service: StatusBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusBarService);
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--tbzb-status-bar-bg');
  });

  it('sets --tbzb-status-bar-bg and meta theme-color for Home red dark mode', async () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);

    try {
      await service.setDarkMode('#DC2626');
      expect(document.documentElement.style.getPropertyValue('--tbzb-status-bar-bg')).toBe('#DC2626');
      expect(meta.getAttribute('content')).toBe('#DC2626');
    } finally {
      meta.remove();
    }
  });

  it('resets --tbzb-status-bar-bg and meta theme-color for white light mode overlays', async () => {
    await service.setDarkMode('#DC2626');
    await service.setLightMode('#FFFFFF');
    expect(document.documentElement.style.getPropertyValue('--tbzb-status-bar-bg')).toBe('#FFFFFF');
  });
});
