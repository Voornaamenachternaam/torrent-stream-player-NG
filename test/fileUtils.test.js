import { describe, it } from 'node:test';
import assert from 'node:assert';
import { isValidFilename, getContentType, parseRangeHeader } from '../src/utils/fileUtils.js';

describe('fileUtils', () => {
    describe('isValidFilename', () => {
        it('should return true for valid filenames', () => {
            assert.strictEqual(isValidFilename('video.mp4'), true);
            assert.strictEqual(isValidFilename('movie.mkv'), true);
            assert.strictEqual(isValidFilename('audio.mp3'), true);
        });

        it('should return false for empty or non-string inputs', () => {
            assert.strictEqual(isValidFilename(''), false);
            assert.strictEqual(isValidFilename(null), false);
            assert.strictEqual(isValidFilename(undefined), false);
            assert.strictEqual(isValidFilename(123), false);
        });

        it('should return false for directory traversal attempts', () => {
            assert.strictEqual(isValidFilename('../etc/passwd'), false);
            assert.strictEqual(isValidFilename('..\\windows\\system32'), false);
            assert.strictEqual(isValidFilename('file/../other'), false);
            assert.strictEqual(isValidFilename('path/to/file'), false);
            assert.strictEqual(isValidFilename('path\\to\\file'), false);
        });

        it('should return false for null bytes and control characters', () => {
            assert.strictEqual(isValidFilename('file\0.txt'), false);
            assert.strictEqual(isValidFilename('file\x01.txt'), false);
        });

        it('should return false for filenames exceeding 255 characters', () => {
            const longName = 'a'.repeat(256) + '.mp4';
            assert.strictEqual(isValidFilename(longName), false);
        });
    });

    describe('getContentType', () => {
        it('should return correct MIME types for video files', () => {
            assert.strictEqual(getContentType('video.mp4'), 'video/mp4');
            assert.strictEqual(getContentType('video.webm'), 'video/webm');
            assert.strictEqual(getContentType('video.mkv'), 'video/x-matroska');
            assert.strictEqual(getContentType('video.avi'), 'video/x-msvideo');
            assert.strictEqual(getContentType('video.mov'), 'video/quicktime');
        });

        it('should return correct MIME types for audio files', () => {
            assert.strictEqual(getContentType('audio.mp3'), 'audio/mpeg');
            assert.strictEqual(getContentType('audio.m4a'), 'audio/mp4');
            assert.strictEqual(getContentType('audio.wav'), 'audio/wav');
        });

        it('should return octet-stream for unknown extensions', () => {
            assert.strictEqual(getContentType('file.unknown'), 'application/octet-stream');
        });

        it('should return octet-stream for invalid filenames', () => {
            assert.strictEqual(getContentType('../etc/passwd'), 'application/octet-stream');
        });
    });

    describe('parseRangeHeader', () => {
        it('should return null for invalid range headers', () => {
            assert.strictEqual(parseRangeHeader(null, 1000), null);
            assert.strictEqual(parseRangeHeader('', 1000), null);
            assert.strictEqual(parseRangeHeader('invalid', 1000), null);
        });

        it('should parse valid range headers', () => {
            const result = parseRangeHeader('bytes=0-499', 1000);
            assert.deepStrictEqual(result, { start: 0, end: 499 });
        });

        it('should handle open-ended ranges', () => {
            const result = parseRangeHeader('bytes=500-', 1000);
            assert.deepStrictEqual(result, { start: 500, end: 999 });
        });

        it('should clamp end to file size', () => {
            const result = parseRangeHeader('bytes=0-2000', 1000);
            assert.deepStrictEqual(result, { start: 0, end: 999 });
        });

        it('should return null for invalid start values', () => {
            assert.strictEqual(parseRangeHeader('bytes=-100-200', 1000), null);
            assert.strictEqual(parseRangeHeader('bytes=abc-200', 1000), null);
            assert.strictEqual(parseRangeHeader('bytes=1000-2000', 1000), null);
        });

        it('should return null when end is less than start', () => {
            assert.strictEqual(parseRangeHeader('bytes=500-100', 1000), null);
        });
    });
});
