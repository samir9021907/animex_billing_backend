import fs from 'fs';
import path from 'path';

import multer from 'multer';

const uploadsDir = path.resolve(process.cwd(), 'src', 'image', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  }
});

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif']);

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error('Only image files are allowed'));
      return;
    }

    cb(null, true);
  }
});

export const removeUploadedFile = async (fileName: string): Promise<void> => {
  if (!fileName) {
    return;
  }

  const filePath = path.join(uploadsDir, fileName);

  try {
    await fs.promises.unlink(filePath);
  } catch {
    // Ignore missing files so cleanup stays idempotent.
  }
};

export { uploadsDir };
