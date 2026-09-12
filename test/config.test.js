import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('config', () => {
    it('should load config module without errors', async () => {
        const { config } = await import('../src/config/config.js');
        
        assert.ok(config.port);
        assert.ok(config.host);
        assert.ok(config.downloadPath);
        assert.ok(config.publicPath);
        assert.ok(Array.isArray(config.allowedOrigins));
        assert.ok(config.maxConnectionsPerIp > 0);
        assert.ok(Array.isArray(config.supportedVideoFormats));
        assert.ok(Array.isArray(config.supportedAudioFormats));
        assert.ok(typeof config.mimeTypes === 'object');
        assert.ok(config.torrentTimeout > 0);
        assert.ok(config.maxTorrents > 0);
    });

    it('should have valid MIME types', async () => {
        const { config } = await import('../src/config/config.js');
        
        assert.strictEqual(config.mimeTypes.mp4, 'video/mp4');
        assert.strictEqual(config.mimeTypes.webm, 'video/webm');
        assert.strictEqual(config.mimeTypes.mkv, 'video/x-matroska');
        assert.strictEqual(config.mimeTypes.mp3, 'audio/mpeg');
    });
});
