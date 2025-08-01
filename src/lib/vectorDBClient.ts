import pool from '../config/database';

export interface KnowledgeEntry {
  id: string;
  content: string;
  embedding: number[];  // Vector representation
  metadata: {
    source: string;
    timestamp: number;
    confidence: number;
  };
}

export async function storeKnowledge(content: string): Promise<KnowledgeEntry> {
  try {
    const embedding = Array.from({ length: 128 }, () => Math.random());
    const source = 'agent-learning';
    const confidence = 0.95;
    const timestamp = Date.now();

    const insertQuery = `
      INSERT INTO knowledge_entries (content, embedding, source, timestamp, confidence)
      VALUES ($1, $2, $3, to_timestamp($4 / 1000.0), $5)
      RETURNING id, content, embedding, source, EXTRACT(EPOCH FROM timestamp)*1000 AS timestamp, confidence
    `;
    const values = [content, JSON.stringify(embedding), source, timestamp, confidence];

    const result = await pool.query(insertQuery, values);
    const row = result.rows[0];

    const entry: KnowledgeEntry = {
      id: row.id,
      content: row.content,
      embedding: row.embedding,
      metadata: {
        source: row.source,
        timestamp: row.timestamp,
        confidence: row.confidence,
      },
    };
    return entry;
  } catch (error) {
    console.error("Error storing knowledge:", error);
    throw new Error("Failed to store knowledge");
  }
}

export async function fetchKnowledge(query: string): Promise<KnowledgeEntry[]> {
  try {
    const fetchQuery = `
      SELECT id, content, embedding, source, EXTRACT(EPOCH FROM timestamp)*1000 AS timestamp, confidence
      FROM knowledge_entries
      ORDER BY RANDOM() LIMIT 3
    `;
    const result = await pool.query(fetchQuery);
    return result.rows.map(row => ({
      id: row.id,
      content: row.content,
      embedding: row.embedding,
      metadata: {
        source: row.source,
        timestamp: row.timestamp,
        confidence: row.confidence,
      },
    }));
  } catch (error) {
    console.error("Error fetching knowledge:", error);
    return [];
  }
}

export async function updateKnowledge(id: string, updates: Partial<KnowledgeEntry>): Promise<boolean> {
  try {
    let updateFields = [];
    let values = [];
    let index = 1;

    if (updates.content) {
      updateFields.push(`content = $${index}`);
      values.push(updates.content);
      index++;
    }

    if (updates.embedding) {
      updateFields.push(`embedding = $${index}`);
      values.push(JSON.stringify(updates.embedding));
      index++;
    }

    if (updates.metadata?.confidence !== undefined) {
      updateFields.push(`confidence = $${index}`);
      values.push(updates.metadata.confidence);
      index++;
    }

    if (updateFields.length === 0) return false;

    values.push(id);
    const updateQuery = `
      UPDATE knowledge_entries
      SET ${updateFields.join(', ')}
      WHERE id = $${index}
    `;

    const result = await pool.query(updateQuery, values);
    return result.rowCount ? result.rowCount > 0 : false;
  } catch (error) {
    console.error("Error updating knowledge:", error);
    return false;
  }
}
