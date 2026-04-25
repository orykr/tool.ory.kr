import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('Image Editor Page', () => {
	it('renders the title and upload area initially', () => {
		render(Page);
		
		const title = screen.getByRole('heading', { name: /image editor/i });
		expect(title).toBeTruthy();

		const uploadText = screen.getByText(/click or drag & drop to upload an image/i);
		expect(uploadText).toBeTruthy();
	});
});
