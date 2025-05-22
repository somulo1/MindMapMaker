import { getDB } from '../db';
import { ChamaDocument } from '@shared/schema';

export async function getChamaDocuments(chamaId: number): Promise<ChamaDocument[]> {
  const db = getDB();
  const documents = await db.all(
    `SELECT 
      d.id,
      d.name,
      d.description,
      d.category,
      d.file_url as fileUrl,
      d.file_type as fileType,
      d.file_size as fileSize,
      d.uploaded_by as uploadedBy,
      d.uploaded_at as uploadedAt,
      u.full_name as uploaderName
    FROM documents d
    JOIN users u ON d.uploaded_by = u.id
    WHERE d.chama_id = ? AND d.deleted_at IS NULL
    ORDER BY d.uploaded_at DESC`,
    [chamaId]
  );
  
  return documents;
}

export async function createChamaDocument(data: {
  chamaId: number;
  name: string;
  description?: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
}): Promise<ChamaDocument> {
  const db = getDB();
  const result = await db.run(
    `INSERT INTO documents (
      chama_id,
      name,
      description,
      category,
      file_url,
      file_type,
      file_size,
      uploaded_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.chamaId,
      data.name,
      data.description,
      data.category,
      data.fileUrl,
      data.fileType,
      data.fileSize,
      data.uploadedBy
    ]
  );
  
  // Get the inserted document
  const document = await db.get(
    `SELECT 
      id,
      name,
      description,
      category,
      file_url as fileUrl,
      file_type as fileType,
      file_size as fileSize,
      uploaded_by as uploadedBy,
      uploaded_at as uploadedAt
    FROM documents
    WHERE id = ?`,
    [result.lastID]
  );
  
  return document;
}

export async function getChamaDocument(chamaId: number, documentId: number): Promise<ChamaDocument | null> {
  const db = getDB();
  const document = await db.get(
    `SELECT 
      d.id,
      d.name,
      d.description,
      d.category,
      d.file_url as fileUrl,
      d.file_type as fileType,
      d.file_size as fileSize,
      d.uploaded_by as uploadedBy,
      d.uploaded_at as uploadedAt,
      u.full_name as uploaderName
    FROM documents d
    JOIN users u ON d.uploaded_by = u.id
    WHERE d.chama_id = ? AND d.id = ? AND d.deleted_at IS NULL`,
    [chamaId, documentId]
  );
  
  return document || null;
}

export async function deleteChamaDocument(chamaId: number, documentId: number): Promise<void> {
  const db = getDB();
  await db.run(
    `UPDATE documents 
    SET deleted_at = CURRENT_TIMESTAMP 
    WHERE chama_id = ? AND id = ?`,
    [chamaId, documentId]
  );
} 