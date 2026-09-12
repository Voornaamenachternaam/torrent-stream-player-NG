import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { config } from './config/config.js';
import { torrentService } from './services/TorrentService.js';
import { handleStream } from './controllers/streamController.js';

const app = express();
const server = createServer(app);

// Configure Socket.IO with security options
const io = new Server(server, {
    cors: {
        origin: config.allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: false,
    pingTimeout: 60000,
    pingInterval: 25000
});

// Parse JSON bodies with size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static files with cache control
app.use(express.static(config.publicPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true,
    fallthrough: true,
    setHeaders: (res, path) => {
        // Disable caching for HTML files
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        }
    }
}));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (req.method !== 'GET' || res.statusCode >= 400) {
            console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
        }
    });
    next();
});

// WebSocket connection with authentication and validation
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Limit number of concurrent connections per IP
    const ip = socket.handshake.address;
    const clientCount = Array.from(io.sockets.sockets.values())
        .filter(s => s.handshake.address === ip).length;
    
    if (clientCount > config.maxConnectionsPerIp) {
        console.warn(`Too many connections from ${ip}`);
        socket.emit('error', 'Too many connections');
        socket.disconnect(true);
        return;
    }
    
    // Validate magnet URI format before processing
    socket.on('add-torrent', (magnetURI) => {
        if (!magnetURI || typeof magnetURI !== 'string') {
            socket.emit('error', 'Invalid magnet URI format');
            return;
        }
        
        // Basic magnet URI validation
        const magnetRegex = /^magnet:\?xt=urn:btih:[a-fA-F0-9]{40}/;
        if (!magnetRegex.test(magnetURI)) {
            // Also accept info hash directly
            if (/^[a-fA-F0-9]{40}$/.test(magnetURI)) {
                magnetURI = `magnet:?xt=urn:btih:${magnetURI}`;
            } else {
                socket.emit('error', 'Invalid magnet URI or info hash');
                return;
            }
        }
        
        console.log('Adding torrent:', magnetURI.substring(0, 50) + '...');
        torrentService.addTorrent(magnetURI, socket);
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
    
    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});

// Stream endpoint with validation
app.get('/stream/:infoHash/:fileIndex', handleStream);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    
    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message;
    
    res.status(err.status || 500).json({
        error: message
    });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(() => {
        console.log('HTTP server closed');
    });
    
    // Close all Socket.IO connections
    io.close(() => {
        console.log('Socket.IO connections closed');
    });
    
    // Destroy WebTorrent client
    torrentService.destroy();
    
    // Force exit after timeout
    setTimeout(() => {
        console.error('Forced shutdown due to timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

server.listen(config.port, config.host, () => {
    console.log(`Server running at http://${config.host}:${config.port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
