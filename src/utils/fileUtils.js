import { config } from '../config/config.js';

/**
 * Validates and sanitizes file path to prevent directory traversal attacks
 * @param {string} filename - The filename to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidFilename(filename) {
    if (!filename || typeof filename !== 'string') {
        return false;
    }
    
    // Reject paths with directory traversal attempts
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return false;
    }
    
    // Reject null bytes and other dangerous characters
    if (/[\0\x00-\x1f]/.test(filename)) {
        return false;
    }
    
    // Ensure filename is not too long
    if (filename.length > 255) {
        return false;
    }
    
    return true;
}

/**
 * Get content type for a file based on its extension
 * @param {string} filename - The filename
 * @returns {string} - The MIME type
 */
export function getContentType(filename) {
    if (!isValidFilename(filename)) {
        return 'application/octet-stream';
    }
    
    const ext = filename.split('.').pop().toLowerCase();
    return config.mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Handle stream errors safely without leaking sensitive information
 * @param {Error} error - The error object
 * @param {Response} res - The HTTP response object
 */
export function handleStreamError(error, res) {
    console.error('Stream error:', error.message);
    
    if (!res.headersSent) {
        // Don't leak internal error details to clients
        const isProduction = process.env.NODE_ENV === 'production';
        const message = isProduction 
            ? 'Streaming error occurred' 
            : error.message;
        
        res.status(500).json({ error: message });
    }
}

/**
 * Validate range header to prevent invalid requests
 * @param {string} range - The range header value
 * @param {number} fileSize - The total file size
 * @returns {object|null} - Parsed range object or null if invalid
 */
export function parseRangeHeader(range, fileSize) {
    if (!range || typeof range !== 'string') {
        return null;
    }
    
    const parts = range.replace(/bytes=/, '').split('-');
    
    if (parts.length < 1 || parts.length > 2) {
        return null;
    }
    
    const start = parseInt(parts[0], 10);
    
    if (isNaN(start) || start < 0 || start >= fileSize) {
        return null;
    }
    
    let end;
    if (parts[1]) {
        end = parseInt(parts[1], 10);
        if (isNaN(end) || end < start) {
            return null;
        }
        end = Math.min(end, fileSize - 1);
    } else {
        end = fileSize - 1;
    }
    
    return { start, end };
}

/**
 * Setup a readable stream for a file with proper error handling
 * @param {File} file - The torrent file object
 * @param {string} range - The range header value
 * @param {Response} res - The HTTP response object
 * @returns {ReadableStream} - The file stream
 */
export function setupStream(file, range, res) {
    if (!file || !file.name) {
        throw new Error('Invalid file object');
    }
    
    const contentType = getContentType(file.name);

    if (!range) {
        return setupFullStream(file, contentType, res);
    }

    return setupRangeStream(file, range, contentType, res);
}

/**
 * Setup full file stream (no range)
 * @param {File} file - The torrent file object
 * @param {string} contentType - The MIME type
 * @param {Response} res - The HTTP response object
 * @returns {ReadableStream} - The file stream
 */
function setupFullStream(file, contentType, res) {
    const head = {
        'Content-Length': String(file.length),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000'
    };
    
    res.writeHead(200, head);
    
    const stream = file.createReadStream();
    stream.on('error', (error) => handleStreamError(error, res));
    
    return stream;
}

/**
 * Setup partial file stream (with range support)
 * @param {File} file - The torrent file object
 * @param {string} range - The range header value
 * @param {string} contentType - The MIME type
 * @param {Response} res - The HTTP response object
 * @returns {ReadableStream} - The file stream
 */
function setupRangeStream(file, range, contentType, res) {
    const parsedRange = parseRangeHeader(range, file.length);
    
    if (!parsedRange) {
        res.writeHead(416, {
            'Content-Range': `bytes */${file.length}`,
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({ error: 'Invalid range' }));
        return null;
    }
    
    const { start, end } = parsedRange;
    const chunksize = (end - start) + 1;

    const head = {
        'Content-Range': `bytes ${start}-${end}/${file.length}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunksize),
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000'
    };

    res.writeHead(206, head);
    
    try {
        const stream = file.createReadStream({ start, end });
        stream.on('error', (error) => handleStreamError(error, res));
        return stream;
    } catch (error) {
        handleStreamError(error, res);
        return null;
    }
}
