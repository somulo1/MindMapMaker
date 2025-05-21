import { db } from '../db';
import { ChamaDocument } from '@shared/schema';

export async function getChamaDocuments(chamaId: number): Promise<ChamaDocument[]> {
  const result = await db.query(
    `SELECT 
      d.id,
      d.name,
      d.description,
      d.category,
      d.file_url as "fileUrl",
      d.file_type as "fileType",
      d.file_size as "fileSize",
      d.uploaded_by as "uploadedBy",
      d.uploaded_at as "uploadedAt",
      u.full_name as "uploaderName"
    FROM documents d
    JOIN users u ON d.uploaded_by = u.id
    WHERE d.chama_id = $1 AND d.deleted_at IS NULL
    ORDER BY d.uploaded_at DESC`,
    [chamaId]
  );
  
  return result.rows;
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
  const result = await db.query(
    `INSERT INTO documents (
      chama_id,
      name,
      description,
      category,
      file_url,
      file_type,
      file_size,
      uploaded_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING 
      id,
      name,
      description,
      category,
      file_url as "fileUrl",
      file_type as "fileType",
      file_size as "fileSize",
      uploaded_by as "uploadedBy",
      uploaded_at as "uploadedAt"`,
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
  
  return result.rows[0];
}

export async function getChamaDocument(chamaId: number, documentId: number): Promise<ChamaDocument | null> {
  const result = await db.query(
    `SELECT 
      d.id,
      d.name,
      d.description,
      d.category,
      d.file_url as "fileUrl",
      d.file_type as "fileType",
      d.file_size as "fileSize",
      d.uploaded_by as "uploadedBy",
      d.uploaded_at as "uploadedAt",
      u.full_name as "uploaderName"
    FROM documents d
    JOIN users u ON d.uploaded_by = u.id
    WHERE d.chama_id = $1 AND d.id = $2 AND d.deleted_at IS NULL`,
    [chamaId, documentId]
  );
  
  return result.rows[0] || null;
}

export async function deleteChamaDocument(chamaId: number, documentId: number): Promise<void> {
  await db.query(
    `UPDATE documents 
    SET deleted_at = CURRENT_TIMESTAMP 
    WHERE chama_id = $1 AND id = $2`,
    [chamaId, documentId]
  );
} 