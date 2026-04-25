import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

// Mock FFmpeg since it's not available in jsdom environment and relies on WASM/Workers
vi.mock('@ffmpeg/ffmpeg', () => {
    return {
        FFmpeg: class FFmpeg {
            constructor() {}
            load() { return Promise.resolve(); }
            on() {}
            writeFile() {}
            exec() {}
            readFile() {}
        }
    }
});

vi.mock('@ffmpeg/util', () => {
    return {
        fetchFile: () => Promise.resolve(new Uint8Array()),
        toBlobURL: () => Promise.resolve('blob:url')
    }
});

describe('Video to GIF Page', () => {
    it('renders the title and upload area', () => {
        render(Page);
        
        const title = screen.getByRole('heading', { name: /video to gif converter/i });
        expect(title).toBeTruthy();

        const uploadText = screen.getByText(/click or drag & drop a video file here/i);
        expect(uploadText).toBeTruthy();
    });
});
