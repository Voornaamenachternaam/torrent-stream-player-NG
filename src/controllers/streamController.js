import { torrentService } from '../services/TorrentService.js';
import { setupStream, isValidFilename } from '../utils/fileUtils.js';

/**
 * Validate the infoHash parameter to prevent injection attacks
 * @param {string} infoHash - The info hash to validate
 * @returns {boolean} - True if valid
 */
function isValidInfoHash(infoHash) {
    return /^[a-fA-F0-9]{40}$/.test(infoHash);
}

/**
 * Handle HTTP stream requests with proper validation and error handling
 * @param {Request} req - The HTTP request object
 * @param {Response} res - The HTTP response object
 */
export async function handleStream(req, res) {
    const { infoHash, fileIndex } = req.params;
    
    // Validate infoHash format
    if (!infoHash || !isValidInfoHash(infoHash)) {
        console.warn('Invalid info hash format:', infoHash);
        return res.status(400).json({ error: 'Invalid torrent info hash' });
    }
    
    // Validate fileIndex is a valid number
    const index = /^\d+$/.test(fileIndex) ? parseInt(fileIndex, 10) : NaN;
    if (isNaN(index) || index < 0 || index > 10000) {
        console.warn('Invalid file index:', fileIndex);
        return res.status(400).json({ error: 'Invalid file index' });
    }
    
    console.log('Stream request:', { infoHash, fileIndex: index });
    
    try {
        const torrent = torrentService.getTorrent(infoHash);
        
        if (!torrent) {
            console.warn('Torrent not found:', infoHash);
            return res.status(404).json({ error: 'Torrent not found' });
        }

        // Validate file index against actual torrent files
        if (index >= torrent.files.length) {
            console.warn('File index out of range:', { index, totalFiles: torrent.files.length });
            return res.status(404).json({ 
                error: 'File not found',
                details: `Index ${index} is out of range (0-${torrent.files.length - 1})`
            });
        }
        
        const file = torrent.files[index];
        
        if (!file) {
            console.error('File object is null:', { index });
            return res.status(404).json({ error: 'File not found' });
        }

        // Validate filename for security
        if (!isValidFilename(file.name)) {
            console.warn('Invalid filename detected:', file.name);
            return res.status(400).json({ error: 'Invalid file' });
        }

        const stream = setupStream(file, req.headers.range, res);

        if (!stream) {
            // Error already handled in setupStream
            return;
        }

        // Handle client disconnection gracefully
        req.on('close', () => {
            console.log('Client disconnected, cleaning up stream');
            if (stream && typeof stream.destroy === 'function') {
                stream.destroy();
            }
        });

        req.on('error', (err) => {
            console.error('Request error:', err);
            if (stream && typeof stream.destroy === 'function') {
                stream.destroy();
            }
        });

        stream.pipe(res);
        
    } catch (error) {
        console.error('Streaming error:', error);
        
        if (!res.headersSent) {
            const isProduction = process.env.NODE_ENV === 'production';
            res.status(500).json({ 
                error: isProduction ? 'Internal server error' : error.message 
            });
        }
    }
}
