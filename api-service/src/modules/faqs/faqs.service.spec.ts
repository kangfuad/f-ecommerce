import { FaqsService } from './faqs.service';

describe('FaqsService', () => {
  let service: FaqsService;

  beforeEach(() => {
    service = new FaqsService();
  });

  it('should return complete list of rental procedure FAQs', () => {
    const faqs = service.findAll();
    expect(faqs.length).toBeGreaterThan(0);
    expect(faqs.some((f) => f.id === 'faq-01')).toBe(true);
    expect(faqs[0].steps).toBeDefined();
    expect(faqs[0].steps?.length).toBe(5);
  });
});
