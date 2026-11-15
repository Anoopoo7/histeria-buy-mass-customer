import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TranslationService],
    });
    service = TestBed.inject(TranslationService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should default to Malayalam for Kerala launch', () => {
    expect(service.currentLang()).toBe('ml');
    expect(service.isMalayalam()).toBeTrue();
  });

  it('should translate keys into Malayalam and English', () => {
    service.setLanguage('ml');
    expect(service.t('nav_home')).toBe('ഹോം');
    expect(service.t('nav_cart')).toBe('കാർട്ട്');

    service.setLanguage('en');
    expect(service.t('nav_home')).toBe('Home');
    expect(service.t('nav_cart')).toBe('Cart');
  });

  it('should correctly interpolate parameters into translations', () => {
    service.setLanguage('en');
    const result = service.t('within_radius', { radius: 20 });
    expect(result).toBe('Within 20 km');

    service.setLanguage('ml');
    const resultMl = service.t('within_radius', { radius: 20 });
    expect(resultMl).toBe('20 കി.മീ ചുറ്റളവിൽ');
  });

  it('should toggle language between English and Malayalam', () => {
    service.setLanguage('en');
    expect(service.currentLang()).toBe('en');

    service.toggleLanguage();
    expect(service.currentLang()).toBe('ml');

    service.toggleLanguage();
    expect(service.currentLang()).toBe('en');
  });
});
