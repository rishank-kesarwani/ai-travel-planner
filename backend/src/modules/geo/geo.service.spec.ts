import { Test, TestingModule } from '@nestjs/testing';
import { GeoService } from './geo.service';

describe('GeoService', () => {
  let geoService: GeoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoService],
    }).compile();

    geoService = module.get<GeoService>(GeoService);
  });

  it('should be defined', () => {
    expect(geoService).toBeDefined();
  });

  it('should detect country and currency from cloudflare / edge headers', () => {
    const res = geoService.detectGeo({ 'cf-ipcountry': 'TH' });
    expect(res.countryCode).toBe('TH');
    expect(res.currency).toBe('THB');
    expect(res.currencySymbol).toBe('฿');
    expect(res.detectedFrom).toBe('headers');
  });

  it('should detect currency from timezone query when no headers present', () => {
    const res = geoService.detectGeo({}, { timezone: 'Asia/Kolkata' });
    expect(res.currency).toBe('INR');
    expect(res.currencySymbol).toBe('₹');
    expect(res.detectedFrom).toBe('timezone');
  });

  it('should detect currency from destination name (e.g. Phuket -> THB, Mussoorie -> INR)', () => {
    const thbRes = geoService.detectGeo({}, { destination: 'Phuket, Thailand' });
    expect(thbRes.currency).toBe('THB');
    expect(thbRes.currencySymbol).toBe('฿');

    const inrRes = geoService.detectGeo({}, { destination: 'Mussoorie, India' });
    expect(inrRes.currency).toBe('INR');
    expect(inrRes.currencySymbol).toBe('₹');
  });

  it('should default to INR when nothing is supplied', () => {
    const res = geoService.detectGeo({});
    expect(res.currency).toBe('INR');
    expect(res.currencySymbol).toBe('₹');
    expect(res.detectedFrom).toBe('default');
  });
});
