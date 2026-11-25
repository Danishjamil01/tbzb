import { TestBed } from '@angular/core/testing';
import { StatusBarService, HOME_HERO_STATUS_BG } from './status-bar.service';

describe('StatusBarService', () => {
  let service: StatusBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusBarService);
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--tbzb-status-bar-bg');
  });

  it('sets --tbzb-status-bar-bg and meta theme-color for Home light hero theme', async () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);

    try {
      await service.setLightMode(HOME_HERO_STATUS_BG);
      expect(document.documentElement.style.getPropertyValue('--tbzb-status-bar-bg')).toBe(HOME_HERO_STATUS_BG);
      expect(meta.getAttribute('content')).toBe(HOME_HERO_STATUS_BG);
    } finally {
      meta.remove();
    }
  });

  it('sets --tbzb-status-bar-bg for non-home dark header and white overlays', async () => {
    await service.setDarkMode('#092819');
    expect(document.documentElement.style.getPropertyValue('--tbzb-status-bar-bg')).toBe('#092819');

    await service.setLightMode('#FFFFFF');
    expect(document.documentElement.style.getPropertyValue('--tbzb-status-bar-bg')).toBe('#FFFFFF');
  });
});

