const db = require('../config/db');
const { generatePresignedUploadUrl, deleteFile } = require('../config/s3');

// POST /api/posts/:id/attachments/presign
const presign = async (req, res, next) => {
    try {
        // Check if S3 is actually configured
        const keyId = process.env.AWS_ACCESS_KEY_ID || '';
        const secret = process.env.AWS_SECRET_ACCESS_KEY || '';
        if (!keyId || keyId === 'your_access_key_id' || !secret || secret === 'your_secret_access_key') {
            return res.status(503).json({
                success: false,
                message: 'خدمة رفع الملفات غير متاحة حالياً. يرجى التواصل مع المسؤول.',
            });
        }

        const postId = parseInt(req.params.id);
        const { file_name, content_type } = req.body;

        if (!content_type) {
            return res.status(400).json({ success: false, message: 'نوع الملف مطلوب.' });
        }

        // Verify post exists
        const { rows } = await db.query('SELECT id FROM posts WHERE id = $1', [postId]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'الطلب غير موجود.' });

        const { uploadUrl, fileKey, fileUrl } = await generatePresignedUploadUrl(postId, content_type);

        // Register the attachment immediately (file_url points to expected S3 location)
        const insert = await db.query(
            `INSERT INTO attachments (post_id, file_url, file_key, file_type)
       VALUES ($1, $2, $3, $4) RETURNING id`,
            [postId, fileUrl, fileKey, content_type]
        );

        res.json({
            success: true,
            message: 'تم توليد رابط الرفع بنجاح.',
            data: {
                attachment_id: insert.rows[0].id,
                uploadUrl,
                fileUrl,
                fileKey,
                expiresIn: parseInt(process.env.S3_PRESIGN_EXPIRY || '300'),
            },
        });
    } catch (err) {
        if (err.message.includes('not allowed')) {
            return res.status(415).json({ success: false, message: 'نوع الملف غير مسموح به.' });
        }
        next(err);
    }
};


// GET /api/posts/:id/attachments
const list = async (req, res, next) => {
    try {
        const { rows } = await db.query(
            'SELECT id, file_url, file_type, uploaded_at FROM attachments WHERE post_id = $1 ORDER BY uploaded_at',
            [req.params.id]
        );
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
};

// DELETE /api/attachments/:id
const remove = async (req, res, next) => {
    try {
        const { rows } = await db.query(
            'DELETE FROM attachments WHERE id = $1 RETURNING file_key',
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ success: false, message: 'Attachment not found.' });

        // Delete from S3 if key exists
        if (rows[0].file_key) {
            await deleteFile(rows[0].file_key).catch(err =>
                console.warn(`S3 delete warning for key ${rows[0].file_key}:`, err.message)
            );
        }

        res.json({ success: true, message: 'Attachment deleted.' });
    } catch (err) { next(err); }
};

module.exports = { presign, list, remove };
