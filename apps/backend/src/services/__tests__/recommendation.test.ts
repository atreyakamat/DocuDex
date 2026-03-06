import { getRecommendations } from '../recommendation.service';
import { pool } from '../../config/database';
import { WORKFLOW_TEMPLATES } from '../../config/workflows';

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('Recommendation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return missing documents for all workflows based on what the user has', async () => {
    // Let's pretend the user only has a PAN_CARD and AADHAAR_CARD
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        { document_type: 'PAN_CARD' },
        { document_type: 'AADHAAR_CARD' },
      ],
    });

    const recommendations = await getRecommendations('user-id');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT document_type FROM documents'),
      ['user-id']
    );

    // E.g., Home Loan requires ['PAN_CARD', 'AADHAAR_CARD', 'SALARY_SLIP', 'BANK_STATEMENT']
    // Should recommend SALARY_SLIP and BANK_STATEMENT for Home Loan
    const homeLoanRec = recommendations.find(r => r.workflowId === 'home-loan');
    expect(homeLoanRec).toBeDefined();
    expect(homeLoanRec?.missingDocuments).toEqual(['SALARY_SLIP', 'BANK_STATEMENT']);

    // E.g., Company Incorporation requires ['PAN_CARD', 'AADHAAR_CARD', 'ELECTRICITY_BILL']
    // Should recommend ELECTRICITY_BILL
    const bizRec = recommendations.find(r => r.workflowId === 'business-incorporation');
    expect(bizRec).toBeDefined();
    expect(bizRec?.missingDocuments).toEqual(['ELECTRICITY_BILL']);
  });

  it('should not return a recommendation if the user has all required documents for a workflow', async () => {
    // User has all documents for Passport Renewal: ['PASSPORT', 'AADHAAR_CARD', 'PAN_CARD']
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        { document_type: 'PAN_CARD' },
        { document_type: 'AADHAAR_CARD' },
        { document_type: 'PASSPORT' },
      ],
    });

    const recommendations = await getRecommendations('user-id');

    const passportRec = recommendations.find(r => r.workflowId === 'passport-renewal');
    expect(passportRec).toBeUndefined(); // Should not be in the recommendations array
  });
});
