const ALLOWED_TAGS = new Set([
  'a', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'i', 'img', 'li', 'ol', 'p', 'span', 'strong', 'ul',
]);

const ALLOWED_ATTRS = new Set([
  'class', 'href', 'src', 'alt', 'title', 'target', 'rel',
]);

const SAFE_URL_PATTERN = /^(?:https?|mailto):/i;

/**
 * Sanitize HTML string to prevent XSS.
 * Uses DOMParser for robust parsing.
 */
export function sanitizeHTML(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const body = doc.body;

  sanitizeNode(body);

  return body.innerHTML;
}

function sanitizeNode(node: Node): void {
  const children = Array.from(node.childNodes);

  for (const child of children) {
    if (child.nodeType === Node.TEXT_NODE) {
      continue;
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tagName = el.tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tagName)) {
        // Remove disallowed element entirely (including its children)
        el.remove();
        continue;
      }

      // Remove disallowed attributes
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        const name = attr.name.toLowerCase();

        // Block event handlers
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          continue;
        }

        if (!ALLOWED_ATTRS.has(name)) {
          el.removeAttribute(attr.name);
          continue;
        }

        // Block javascript: URLs
        if ((name === 'href' || name === 'src') && !SAFE_URL_PATTERN.test(attr.value.trim())) {
          el.removeAttribute(attr.name);
        }
      }

      // Recursively sanitize children
      sanitizeNode(el);
    } else {
      // Remove comment nodes and other non-element/text nodes
      child.remove();
    }
  }
}
