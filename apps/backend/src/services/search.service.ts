import { Client } from '@elastic/elasticsearch';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { Document } from '@docudex/shared-types';

const esNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
let client: Client | null = null;

try {
  client = new Client({ node: esNode });
} catch (error) {
  logger.warn('Failed to initialize Elasticsearch client:', error);
}

export async function indexDocument(doc: Document): Promise<void> {
  if (!client) return;
  try {
    await client.index({
      index: 'documents',
      id: doc.id,
      document: {
        userId: doc.userId,
        fileName: doc.fileName,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        documentType: doc.metadata?.documentType,
        category: doc.metadata?.category,
        holderName: doc.metadata?.holderName,
        documentNumber: doc.metadata?.documentNumber,
        tags: doc.metadata?.tags || [],
        extractedFields: doc.metadata?.extractedFields || {},
        summary: doc.metadata?.summary || '',
        status: doc.status,
        createdAt: doc.createdAt,
      },
    });
    logger.debug(`Indexed document ${doc.id} in Elasticsearch`);
  } catch (error) {
    logger.error(`Error indexing document ${doc.id}:`, error);
  }
}

export async function deleteDocumentIndex(docId: string): Promise<void> {
  if (!client) return;
  try {
    await client.delete({
      index: 'documents',
      id: docId,
    });
    logger.debug(`Deleted document ${docId} from Elasticsearch index`);
  } catch (error) {
    logger.error(`Error deleting document ${docId} from index:`, error);
  }
}

export async function searchDocuments(userId: string, query: string): Promise<string[]> {
  if (!client) {
    logger.warn('Elasticsearch is not configured, returning empty search results');
    return [];
  }
  
  try {
    const result = await client.search({
      index: 'documents',
      query: {
        bool: {
          must: [
            { term: { userId } },
            {
              multi_match: {
                query,
                fields: ['originalName^3', 'documentType^2', 'category^2', 'holderName', 'tags', 'summary', 'extractedFields.*'],
                fuzziness: 'AUTO',
              }
            }
          ]
        }
      }
    });

    return result.hits.hits.map((hit: any) => hit._id);
  } catch (error) {
    logger.error('Elasticsearch search error:', error);
    return [];
  }
}
