import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(dirname(__filename)));

// Environment-based configuration with secure defaults
const isProduction = process.env.NODE_ENV === 'production';

export const config = {
    // Server configuration
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST || 'localhost',
    
    // Paths
    downloadPath: process.env.DOWNLOAD_PATH || join(__dirname, 'downloads'),
    publicPath: join(__dirname, 'public'),
    
    // Security settings
    allowedOrigins: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',') 
    allowedOrigins: (() => {
        if (process.env.ALLOWED_ORIGINS) return process.env.ALLOWED_ORIGINS.split(',');
        if (isProduction) throw new Error('ALLOWED_ORIGINS must be set in production');
        return [`http://${process.env.HOST || 'localhost'}:${parseInt(process.env.PORT, 10) || 3000}`];
    allowedOrigins: (() => {
        if (process.env.ALLOWED_ORIGINS) return process.env.ALLOWED_ORIGINS.split(',');
        return [`http://${process.env.HOST || 'localhost'}:${parseInt(process.env.PORT, 10) || 3000}`];
    })(),
    maxConnectionsPerIp: parseInt(process.env.MAX_CONNECTIONS_PER_IP, 10) || 5,
    
    // Rate limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || (15 * 60 * 1000),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    
    // File handling
    supportedVideoFormats: ['mp4', 'webm', 'mkv', 'avi', 'mov'],
    supportedAudioFormats: ['mp3', 'm4a', 'wav'],
    
    // MIME types
    mimeTypes: {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mkv': 'video/x-matroska',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'mp3': 'audio/mpeg',
        'm4a': 'audio/mp4',
        'wav': 'audio/wav'
    },
    
    // Torrent settings
    torrentTimeout: parseInt(process.env.TORRENT_TIMEOUT, 10) || 30000,
    maxTorrents: parseInt(process.env.MAX_TORRENTS, 10) || 10
};
