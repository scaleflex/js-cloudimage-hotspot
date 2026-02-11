import { describe, it, expect } from 'vitest';
import { sanitizeHTML } from '../src/popover/sanitize';

describe('sanitizeHTML', () => {
  it('preserves safe HTML', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHTML(html)).toBe('<p>Hello <strong>world</strong></p>');
  });

  it('preserves links with safe href', () => {
    const html = '<a href="https://example.com" target="_blank">Link</a>';
    expect(sanitizeHTML(html)).toBe('<a href="https://example.com" target="_blank">Link</a>');
  });

  it('preserves images with safe src', () => {
    const html = '<img src="https://example.com/img.jpg" alt="Test">';
    const result = sanitizeHTML(html);
    expect(result).toContain('src="https://example.com/img.jpg"');
    expect(result).toContain('alt="Test"');
  });

  it('removes script tags', () => {
    const html = '<p>safe</p><script>alert(1)</script>';
    expect(sanitizeHTML(html)).toBe('<p>safe</p>');
  });

  it('removes event handlers', () => {
    const html = '<div onclick="alert(1)">Click me</div>';
    expect(sanitizeHTML(html)).toBe('<div>Click me</div>');
  });

  it('removes onerror handlers', () => {
    const html = '<img src="x" onerror="alert(1)">';
    const result = sanitizeHTML(html);
    expect(result).not.toContain('onerror');
  });

  it('blocks javascript: URLs in href', () => {
    const html = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeHTML(html);
    expect(result).not.toContain('javascript:');
  });

  it('blocks javascript: URLs in src', () => {
    const html = '<img src="javascript:alert(1)">';
    const result = sanitizeHTML(html);
    expect(result).not.toContain('javascript:');
  });

  it('removes iframe elements', () => {
    const html = '<p>safe</p><iframe src="evil.html"></iframe>';
    expect(sanitizeHTML(html)).toBe('<p>safe</p>');
  });

  it('removes form elements', () => {
    const html = '<form action="evil"><input type="text"></form>';
    expect(sanitizeHTML(html)).toBe('');
  });

  it('removes style elements', () => {
    const html = '<style>body{display:none}</style><p>safe</p>';
    expect(sanitizeHTML(html)).toBe('<p>safe</p>');
  });

  it('preserves allowed list elements', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    expect(sanitizeHTML(html)).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
  });

  it('preserves heading elements', () => {
    const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
    expect(sanitizeHTML(html)).toBe('<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>');
  });

  it('preserves class attribute', () => {
    const html = '<div class="my-class">Content</div>';
    expect(sanitizeHTML(html)).toBe('<div class="my-class">Content</div>');
  });

  it('removes disallowed attributes', () => {
    const html = '<div id="test" style="color:red" data-x="1">Content</div>';
    expect(sanitizeHTML(html)).toBe('<div>Content</div>');
  });

  it('allows mailto: links', () => {
    const html = '<a href="mailto:test@example.com">Email</a>';
    expect(sanitizeHTML(html)).toContain('mailto:test@example.com');
  });

  it('handles empty string', () => {
    expect(sanitizeHTML('')).toBe('');
  });

  it('handles plain text', () => {
    expect(sanitizeHTML('Hello world')).toBe('Hello world');
  });
});
