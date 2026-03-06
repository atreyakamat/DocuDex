import { submitWorkflowToInstitution } from '../institution-api.service';
import { pool } from '../../config/database';
import { getPresignedUrl } from '../s3.service';
import axios from 'axios';
import { logger } from '../../utils/logger';

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

jest.mock('../s3.service', () => ({
  getPresignedUrl: jest.fn(),
}));

jest.mock('axios');

describe('Institution API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully submit workflow documents', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ template_id: 'home-loan', document_ids: ['doc-1'] }]
    });

    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ id: 'doc-1', original_name: 'test.pdf', storage_key: 'key-1' }]
    });

    (getPresignedUrl as jest.Mock).mockResolvedValueOnce('https://s3.url/key-1');
    (axios.post as jest.Mock).mockResolvedValueOnce({ status: 200 });

    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development'; // To trigger the mock API post

    await submitWorkflowToInstitution('wf-1', 'user-1');

    expect(axios.post).toHaveBeenCalledWith(
      'https://mock-institution-api.docudex.dev/submit',
      {
        workflowId: 'wf-1',
        templateId: 'home-loan',
        userId: 'user-1',
        documents: [{ documentId: 'doc-1', name: 'test.pdf', url: 'https://s3.url/key-1' }]
      }
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('should log a warning and return if no document_ids are present', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [{ template_id: 'home-loan', document_ids: [] }]
    });

    const spy = jest.spyOn(logger, 'warn');

    await submitWorkflowToInstitution('wf-1', 'user-1');

    expect(spy).toHaveBeenCalledWith('Workflow wf-1 has no documents to submit');
    expect(axios.post).not.toHaveBeenCalled();
  });
});
