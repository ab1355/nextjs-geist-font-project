import { NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const aLLowedFileTypes = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/javascript',
  'text/typescript',
  'text/x-python',
  'text/html',
  'text/css',
  'application/json',
];

const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      filename: (name, ext, part, form) => {
        return `${Date.now()}-${part.originalFilename}`;
      },
      filter: ({ mimetype }) => {
        return mimetype && aLLowedFileTypes.includes(mimetype);
      },
    });

    const [fields, files] = await form.parse(request as any);

    if (!files.file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const file = files.file[0];

    return NextResponse.json({
      message: 'File uploaded successfully',
      filepath: file.filepath,
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'File upload failed', details: error.message },
      { status: 500 }
    );
  }
}
