import WebTorrent from 'webtorrent';
import { config } from '../config/config.js';
import { getContentType } from '../utils/fileUtils.js';

class TorrentService {
    constructor() {
        this.client = new WebTorrent({
            maxConns: 55,
            downloadLimit: -1,
            uploadLimit: -1
        });
        this.activeTorrents = new Map();
        this.torrentMetadata = new Map(); // Store metadata for cleanup
    }

    addTorrent(magnetURI, socket) {
        console.log('Adding torrent:', magnetURI.substring(0, 50) + '...');
        
        // Check if we've reached max torrents limit
        if (this.activeTorrents.size >= config.maxTorrents) {
            socket.emit('error', 'Maximum number of torrents reached');
            return;
        }
        
        // Check if torrent already exists
        const existingTorrent = Array.from(this.client.torrents)
            .find(t => t.magnetURI === magnetURI || t.infoHash === this._extractInfoHash(magnetURI));
            
        if (existingTorrent) {
            console.log('Torrent already exists, reusing:', existingTorrent.infoHash);
            this.activeTorrents.set(existingTorrent.infoHash, existingTorrent);
            this._sendTorrentInfo(socket, existingTorrent);
            return;
        }

        // Add new torrent with timeout
        const timeoutId = setTimeout(() => {
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            if (torrent && !torrent.ready) {
                this.removeTorrent(torrent.infoHash);
let timedOut = false;
const timeoutId = setTimeout(() => {
        let timedOut = false;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);

        try {
            this.client.add(magnetURI, { path: config.downloadPath }, (torrent) => {
                clearTimeout(timeoutId);
                if (timedOut) {
                    this.client.remove(torrent, () => {});
                    return;
                }
                this.activeTorrents.set(torrent.infoHash, torrent);
                this.torrentMetadata.set(torrent.infoHash, {
                    addedAt: Date.now(),
                    socketId: socket.id,
                    magnetURI
                });
                this._prioritizeVideoFiles(torrent);
                this._sendTorrentInfo(socket, torrent);
                this._setupErrorHandling(torrent, socket);
            });
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Failed to add torrent:', error);
            socket.emit('error', 'Failed to add torrent');
        }
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) this.client.remove(pending, () => {});
        }, config.torrentTimeout);

        try {
            this.client.add(magnetURI, { path: config.downloadPath }, (newTorrent) => {
                clearTimeout(timeoutId);
                if (timedOut) { this.client.remove(newTorrent, () => {}); return; }
                this.activeTorrents.set(newTorrent.infoHash, newTorrent);
                this.torrentMetadata.set(newTorrent.infoHash, { addedAt: Date.now(), socketId: socket.id, magnetURI });
                this._prioritizeVideoFiles(newTorrent);
                this._sendTorrentInfo(socket, newTorrent);
                this._setupErrorHandling(newTorrent, socket);
            });
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Failed to add torrent:', error);
            socket.emit('error', 'Failed to add torrent: ' + error.message);
        }
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);
    console.error('Torrent addition timed out');
    socket.emit('error', 'Failed to load torrent: timeout');
    const pending = this.client.get(magnetURI);
    if (pending) {
        this.client.remove(pending, () => {});
    }
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);

        try {
            this.client.add(magnetURI, { path: config.downloadPath }, (torrent) => {
                clearTimeout(timeoutId);
                if (timedOut) {
                    this.client.remove(torrent, () => {});
                    return;
                }
                console.log('Torrent added:', torrent.infoHash);
                this.activeTorrents.set(torrent.infoHash, torrent);
                this.torrentMetadata.set(torrent.infoHash, {
                    addedAt: Date.now(),
                    socketId: socket.id,
                    magnetURI
                });
                this._prioritizeVideoFiles(torrent);
                this._sendTorrentInfo(socket, torrent);
                this._setupErrorHandling(torrent, socket);
            });
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Failed to add torrent:', error);
            socket.emit('error', 'Failed to add torrent');
        }

let torrent = null;

try {
    this.client.add(magnetURI, { path: config.downloadPath }, (newTorrent) => {
        clearTimeout(timeoutId);
        if (timedOut) {
            this.client.remove(newTorrent, () => {});
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);

        try {
            this.client.add(magnetURI, { path: config.downloadPath }, (newTorrent) => {
                clearTimeout(timeoutId);
                if (timedOut) {
                    this.client.remove(newTorrent, () => {});
                    return;
                }
                console.log('Torrent added:', newTorrent.infoHash);
                this.activeTorrents.set(newTorrent.infoHash, newTorrent);
                this.torrentMetadata.set(newTorrent.infoHash, {
                    addedAt: Date.now(),
                    socketId: socket.id,
                    magnetURI
                });
                this._prioritizeVideoFiles(newTorrent);
                this._sendTorrentInfo(socket, newTorrent);
                this._setupErrorHandling(newTorrent, socket);
            });
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Failed to add torrent:', error);
            socket.emit('error', 'Failed to add torrent: ' + error.message);
        }
        }
        torrent = newTorrent;
        // ...
    });
} catch (error) {
    clearTimeout(timeoutId);
    console.error('Failed to add torrent:', error);
    socket.emit('error', 'Failed to add torrent: ' + error.message);
}
        let timedOut = false;
        // Add new torrent with timeout
        let timedOut = false;
        // Add new torrent with timeout
        let timedOut = false;
        // Add new torrent with timeout
        // Add new torrent with timeout
        let timedOut = false;
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);
        const timeoutId = setTimeout(() => {
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        let timedOut = false;
        // Add new torrent with timeout
        // Add new torrent with timeout
        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);
            timedOut = true;
            console.error('Torrent addition timed out');
            socket.emit('error', 'Failed to load torrent: timeout');
            const pending = this.client.get(magnetURI);
            if (pending) {
                this.client.remove(pending, () => {});
            }
        }, config.torrentTimeout);

        let torrent = null;
        
        try {
            this.client.add(magnetURI, { 
                path: config.downloadPath,
                // Security: disable DHT in production if needed
            this.client.add(magnetURI, {
                path: config.downloadPath
            }, (newTorrent) => {
            }, (newTorrent) => {
                clearTimeout(timeoutId);
                torrent = newTorrent;
                
                console.log('Torrent added:', torrent.infoHash);
                this.activeTorrents.set(torrent.infoHash, torrent);
                this.torrentMetadata.set(torrent.infoHash, {
                    addedAt: Date.now(),
                    socketId: socket.id,
                    magnetURI
                });
                
                this._prioritizeVideoFiles(torrent);
                this._sendTorrentInfo(socket, torrent);
                this._setupErrorHandling(torrent, socket);
            });
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Failed to add torrent:', error);
            socket.emit('error', 'Failed to add torrent: ' + error.message);
        }
    }

    getTorrent(infoHash) {
        return this.activeTorrents.get(infoHash);
    }

    removeTorrent(infoHash) {
        const torrent = this.activeTorrents.get(infoHash);
        if (torrent) {
            console.log('Removing torrent:', infoHash);
            torrent.destroy((err) => {
                if (err) {
                    console.error('Error destroying torrent:', err);
                }
            });
            this.activeTorrents.delete(infoHash);
            this.torrentMetadata.delete(infoHash);
            return true;
        }
        return false;
    }

    destroy() {
        console.log('Destroying TorrentService...');
        // Destroy all active torrents
        for (const infoHash of this.activeTorrents.keys()) {
            this.removeTorrent(infoHash);
        }
        // Destroy the client
        this.client.destroy((err) => {
            if (err) {
                console.error('Error destroying client:', err);
            } else {
                console.log('WebTorrent client destroyed');
            }
        });
    }

    _extractInfoHash(magnetURI) {
        const match = magnetURI.match(/btih:([a-fA-F0-9]{40})/);
        return match ? match[1].toLowerCase() : null;
    }

    _prioritizeVideoFiles(torrent) {
        if (torrent.files.length > 0) {
            const videoFiles = torrent.files.filter(file => {
                const ext = file.name.split('.').pop().toLowerCase();
                return config.supportedVideoFormats.includes(ext);
            });
            
            if (videoFiles.length > 0) {
                // Prioritize first video file for streaming
                videoFiles[0].select();
                console.log(`Prioritized video file: ${videoFiles[0].name}`);
            }
        }
    }

    _setupErrorHandling(torrent, socket) {
        torrent.on('error', (err) => {
            console.error('Torrent error:', err);
            socket.emit('error', 'Torrent error: ' + err.message);
            // Attempt cleanup on critical errors
            if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
                this.removeTorrent(torrent.infoHash);
            }
        });

        torrent.on('warning', (warn) => {
            console.warn('Torrent warning:', warn);
        });
    }

    _sendTorrentInfo(socket, torrent) {
        const files = torrent.files.map((file, index) => ({
            name: file.name,
            length: file.length,
            path: file.path,
            index
        }));
        
        socket.emit('torrent-info', {
            files,
            infoHash: torrent.infoHash,
            name: torrent.name,
            totalSize: torrent.length
        });

        this._setupProgressUpdates(socket, torrent);
    }

    _setupProgressUpdates(socket, torrent) {
        const intervalId = setInterval(() => {
            if (!torrent.client || torrent.removed) {
                clearInterval(intervalId);
                return;
            }
            
            socket.emit('download-progress', {
                progress: torrent.progress,
                downloadSpeed: torrent.downloadSpeed,
                uploadSpeed: torrent.uploadSpeed,
                peers: torrent.numPeers,
                ratio: torrent.ratio
            });

            if (torrent.progress === 1) {
                clearInterval(intervalId);
                socket.emit('torrent-done', torrent.infoHash);
            }
        }, 1000);

        socket.on('disconnect', () => {
            clearInterval(intervalId);
        });
    }
}

export const torrentService = new TorrentService();
