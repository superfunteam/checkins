import fs from 'fs/promises';
import path from 'path';

export function adminApiPlugin() {
  return {
    name: 'admin-api',
    configureServer(server) {
      // Save passport.json
      server.middlewares.use('/api/admin/passport', async (req, res, next) => {
        const urlParts = req.url.split('/');
        const passportId = urlParts[1];
        const action = urlParts[2];

        if (!passportId) {
          return next();
        }

        // POST /api/admin/passport/:id/save
        if (action === 'save' && req.method === 'POST') {
          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const passportPath = path.resolve(`passports/${passportId}/passport.json`);

            await fs.writeFile(passportPath, JSON.stringify(body, null, 2));

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            console.error('Save error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
          return;
        }

        // POST /api/admin/passport/:id/upload
        if (action === 'upload' && req.method === 'POST') {
          try {
            const contentType = req.headers['content-type'] || '';

            if (!contentType.includes('multipart/form-data')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Expected multipart/form-data' }));
              return;
            }

            const boundary = contentType.split('boundary=')[1];
            if (!boundary) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No boundary in content-type' }));
              return;
            }

            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);

            // Parse multipart form data
            const parts = parseMultipart(buffer, boundary);
            const filePart = parts.find(p => p.filename);
            const assetTypePart = parts.find(p => p.name === 'assetType');
            const filenamePart = parts.find(p => p.name === 'filename');

            if (!filePart) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No file uploaded' }));
              return;
            }

            const assetType = assetTypePart?.value || 'images';
            const filename = filenamePart?.value || filePart.filename;

            // Determine asset path
            let assetDir;
            if (assetType === 'images' || assetType === 'image') {
              assetDir = `passports/${passportId}/assets/images/badges`;
            } else if (assetType === 'audio' || assetType === 'sound') {
              assetDir = `passports/${passportId}/assets/audio/badges`;
            } else {
              assetDir = `passports/${passportId}/assets/${assetType}`;
            }

            const assetPath = path.resolve(assetDir);
            await fs.mkdir(assetPath, { recursive: true });

            const filePath = path.join(assetPath, filename);
            await fs.writeFile(filePath, filePart.data);

            // Return the relative path to use in passport.json
            const relativePath = `assets/${assetType === 'images' || assetType === 'image' ? 'images/badges' : assetType === 'audio' || assetType === 'sound' ? 'audio/badges' : assetType}/${filename}`;

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              path: relativePath,
              fullPath: filePath
            }));
          } catch (error) {
            console.error('Upload error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
          return;
        }

        next();
      });
    },
  };
}

// Simple multipart parser
function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const endBoundaryBuffer = Buffer.from(`--${boundary}--`);

  let start = 0;
  let pos = buffer.indexOf(boundaryBuffer, start);

  while (pos !== -1) {
    // Skip past the boundary
    let partStart = pos + boundaryBuffer.length;

    // Skip \r\n after boundary
    if (buffer[partStart] === 0x0d && buffer[partStart + 1] === 0x0a) {
      partStart += 2;
    }

    // Find next boundary
    let partEnd = buffer.indexOf(boundaryBuffer, partStart);
    if (partEnd === -1) break;

    // Remove trailing \r\n before boundary
    if (buffer[partEnd - 2] === 0x0d && buffer[partEnd - 1] === 0x0a) {
      partEnd -= 2;
    }

    // Parse the part
    const partBuffer = buffer.slice(partStart, partEnd);
    const part = parsePart(partBuffer);
    if (part) {
      parts.push(part);
    }

    // Check if this is the end boundary
    if (buffer.slice(partEnd, partEnd + endBoundaryBuffer.length).equals(endBoundaryBuffer)) {
      break;
    }

    pos = partEnd;
  }

  return parts;
}

function parsePart(buffer) {
  // Find the header/body separator (\r\n\r\n)
  let headerEnd = -1;
  for (let i = 0; i < buffer.length - 3; i++) {
    if (buffer[i] === 0x0d && buffer[i + 1] === 0x0a &&
        buffer[i + 2] === 0x0d && buffer[i + 3] === 0x0a) {
      headerEnd = i;
      break;
    }
  }

  if (headerEnd === -1) return null;

  const headers = buffer.slice(0, headerEnd).toString();
  const body = buffer.slice(headerEnd + 4);

  // Parse Content-Disposition
  const dispositionMatch = headers.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i);
  if (!dispositionMatch) return null;

  const name = dispositionMatch[1];
  const filename = dispositionMatch[2];

  if (filename) {
    return { name, filename, data: body };
  } else {
    return { name, value: body.toString() };
  }
}
