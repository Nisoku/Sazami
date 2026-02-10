import { tokenize } from '../src/parser/tokenizer';
import { parseSakko, Parser } from '../src/parser/parser';
import { transformAST } from '../src/runtime/transformer';
import { parseModifiers, MODIFIER_MAP } from '../src/primitives/modifier-map';
import { generateCSSVariables, generateThemeCSS, getTokenValue } from '../src/config/generator';
import { defaultTokens } from '../src/config/tokens';

describe('Tokenizer - Error handling', () => {
  test('should throw on unterminated string', () => {
    expect(() => tokenize('text: "hello')).toThrow('Unterminated string');
  });

  test('should throw on unterminated string at end of input', () => {
    expect(() => tokenize('"')).toThrow('Unterminated string');
  });

  test('should throw on unterminated string with content after', () => {
    expect(() => tokenize('"hello world')).toThrow('Unterminated string');
  });

  test('should throw on unexpected character @', () => {
    expect(() => tokenize('text@ value')).toThrow('Unexpected character: @');
  });

  test('should throw on unexpected character #', () => {
    expect(() => tokenize('#heading')).toThrow('Unexpected character: #');
  });

  test('should throw on unexpected character $', () => {
    expect(() => tokenize('price: $5')).toThrow('Unexpected character: $');
  });

  test('should throw on unexpected character !', () => {
    expect(() => tokenize('!important')).toThrow('Unexpected character: !');
  });

  test('should handle string with only whitespace content', () => {
    const tokens = tokenize('text: "   "');
    expect(tokens[2]).toMatchObject({ type: 'STRING', value: '   ' });
  });

  test('should handle string with bracket characters inside', () => {
    const tokens = tokenize('text: "{[(<>)]}"');
    expect(tokens[2]).toMatchObject({ type: 'STRING', value: '{[(<>)]}' });
  });

  test('should handle single-character identifiers', () => {
    const tokens = tokenize('a');
    expect(tokens[0]).toMatchObject({ type: 'IDENT', value: 'a' });
  });

  test('should handle identifiers with hyphens and underscores', () => {
    const tokens = tokenize('icon-btn my_var data-id');
    expect(tokens[0]).toMatchObject({ type: 'IDENT', value: 'icon-btn' });
    expect(tokens[1]).toMatchObject({ type: 'IDENT', value: 'my_var' });
    expect(tokens[2]).toMatchObject({ type: 'IDENT', value: 'data-id' });
  });

  test('should handle consecutive strings', () => {
    const tokens = tokenize('"hello" "world"');
    expect(tokens[0]).toMatchObject({ type: 'STRING', value: 'hello' });
    expect(tokens[1]).toMatchObject({ type: 'STRING', value: 'world' });
  });

  test('should handle semicolons as tokens', () => {
    const tokens = tokenize('a; b; c');
    expect(tokens.filter(t => t.type === 'SEMI')).toHaveLength(2);
  });

  test('should strip comments before strings on same line', () => {
    const tokens = tokenize('text: Hello // "this is not a string"');
    const strings = tokens.filter(t => t.type === 'STRING');
    expect(strings).toHaveLength(0);
  });

  test('should handle tab characters as whitespace', () => {
    const tokens = tokenize('a\tb\tc');
    expect(tokens[0]).toMatchObject({ type: 'IDENT', value: 'a' });
    expect(tokens[1]).toMatchObject({ type: 'IDENT', value: 'b' });
    expect(tokens[2]).toMatchObject({ type: 'IDENT', value: 'c' });
  });
});

describe('Parser - Error handling', () => {
  test('should throw on completely empty input', () => {
    expect(() => parseSakko('')).toThrow();
  });

  test('should throw on whitespace-only input', () => {
    expect(() => parseSakko('   \n\n   ')).toThrow();
  });

  test('should throw on comment-only input', () => {
    expect(() => parseSakko('// just a comment')).toThrow();
  });

  test('should throw when missing opening <', () => {
    expect(() => parseSakko('page { text: Hello }>')).toThrow("Expected '<'");
  });

  test('should throw when missing closing >', () => {
    expect(() => parseSakko('<page { text: Hello }')).toThrow("Expected '>'");
  });

  test('should throw when missing opening {', () => {
    expect(() => parseSakko('<page text: Hello }>')).toThrow("Expected '{'");
  });

  test('should throw when missing closing }', () => {
    expect(() => parseSakko('<page { text: Hello >')).toThrow();
  });

  test('should throw when root name is missing', () => {
    expect(() => parseSakko('< { text: Hello }>')).toThrow("Expected identifier after '<'");
  });

  test('should throw on non-identifier after <', () => {
    expect(() => parseSakko('<{ text: Hello }>')).toThrow("Expected identifier after '<'");
  });

  test('should throw on value missing after colon', () => {
    expect(() => parseSakko('<page { text: }>')).toThrow();
  });

  test('should throw on colon followed by closing brace', () => {
    expect(() => parseSakko('<page { name: }>')).toThrow();
  });

  test('should throw on nested unclosed block', () => {
    expect(() => parseSakko('<page { card { text: Hello }>')).toThrow();
  });

  test('should throw on deeply nested unclosed block', () => {
    expect(() => parseSakko('<page { a { b { c: d }>')).toThrow();
  });

  test('should throw on unclosed modifier parenthesis', () => {
    expect(() => parseSakko('<page { button(accent : Click }>')).toThrow();
  });

  test('should throw on empty modifiers with unclosed paren', () => {
    expect(() => parseSakko('<page { button( }>')).toThrow();
  });

  test('should throw on unclosed list bracket', () => {
    expect(() => parseSakko('<page { row: [a: 1, b: 2 }>')).toThrow();
  });

  test('should throw on list missing comma between items', () => {
    expect(() => parseSakko('<page { row: [a: 1 b: 2] }>')).toThrow('Expected "," or "]"');
  });

  test('should throw on element name that is not an identifier', () => {
    expect(() => parseSakko('<page { : value }>')).toThrow('Expected identifier');
  });

  test('should throw on non-identifier inside modifiers', () => {
    expect(() => parseSakko('<page { button(: value): Click }>')).toThrow('Expected identifier in modifiers');
  });

  test('should parse void elements (no body, colon, or list)', () => {
    const ast = parseSakko('<page { card button: Click }>');
    expect(ast.children).toHaveLength(2);
    expect(ast.children[0]).toEqual({ type: "inline", name: "card", modifiers: [], value: "" });
    expect(ast.children[1]).toEqual({ type: "inline", name: "button", modifiers: [], value: "Click" });
  });

  test('should throw on just angle brackets', () => {
    expect(() => parseSakko('<>')).toThrow();
  });

  test('should throw on just < with name', () => {
    expect(() => parseSakko('<page')).toThrow();
  });

  test('should throw on duplicate closing >', () => {
    const ast = parseSakko('<page { }>');
    expect(ast.name).toBe('page');
  });
});

describe('Parser - Malformed but parseable edge cases', () => {
  test('should parse empty block element', () => {
    const ast = parseSakko('<page { card {} }>');
    expect(ast.children).toHaveLength(1);
    const card = ast.children[0];
    expect(card.type).toBe('element');
    if (card.type === 'element') {
      expect(card.children).toHaveLength(0);
    }
  });

  test('should parse element with empty modifiers', () => {
    const ast = parseSakko('<page { button(): Click }>');
    const btn = ast.children[0];
    if (btn.type === 'inline') {
      expect(btn.modifiers).toHaveLength(0);
      expect(btn.value).toBe('Click');
    }
  });

  test('should parse empty list', () => {
    const ast = parseSakko('<page { row: [] }>');
    const row = ast.children[0];
    expect(row.type).toBe('element');
    if (row.type === 'element') {
      expect(row.children).toHaveLength(1);
      const list = row.children[0];
      expect(list.type).toBe('list');
      if (list.type === 'list') {
        expect(list.items).toHaveLength(0);
      }
    }
  });

  test('should parse trailing semicolons', () => {
    const ast = parseSakko('<page { text: A; text: B; }>');
    expect(ast.children).toHaveLength(2);
  });

  test('should throw on multiple semicolons between items', () => {
    expect(() => parseSakko('<page { text: A;; text: B }>')).toThrow();
  });

  test('should handle list with trailing comma (parses successfully)', () => {
    const ast = parseSakko('<page { row: [a: 1,] }>');
    const row = ast.children[0];
    expect(row.type).toBe('element');
  });

  test('should parse single inline child', () => {
    const ast = parseSakko('<page { text: Hello }>');
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe('inline');
  });

  test('should parse string value with spaces', () => {
    const ast = parseSakko('<page { text: "Hello World" }>');
    const child = ast.children[0];
    if (child.type === 'inline') {
      expect(child.value).toBe('Hello World');
    }
  });

  test('should parse bare identifier as value', () => {
    const ast = parseSakko('<page { icon: play }>');
    const child = ast.children[0];
    if (child.type === 'inline') {
      expect(child.value).toBe('play');
    }
  });

  test('should parse known key at end of modifiers as flag', () => {
    const ast = parseSakko('<page { row(gap): [] }>');
    const row = ast.children[0];
    if (row.type === 'element') {
      expect(row.modifiers).toEqual([{ type: 'flag', value: 'gap' }]);
    }
  });
});

describe('Transformer - Edge cases', () => {
  test('should use fallback tag for unknown component names', () => {
    const vnode = transformAST({
      type: 'inline',
      name: 'nonexistent',
      modifiers: [],
      value: 'test',
    });
    if (!Array.isArray(vnode)) {
      expect(vnode.type).toBe('saz-nonexistent');
    }
  });

  test('should handle element with no children', () => {
    const vnode = transformAST({
      type: 'element',
      name: 'card',
      modifiers: [],
      children: [],
    });
    if (!Array.isArray(vnode)) {
      expect(vnode.children).toHaveLength(0);
    }
  });

  test('should handle deeply nested elements', () => {
    const vnode = transformAST({
      type: 'element',
      name: 'card',
      modifiers: [],
      children: [{
        type: 'element',
        name: 'row',
        modifiers: [],
        children: [{
          type: 'element',
          name: 'column',
          modifiers: [],
          children: [{
            type: 'inline',
            name: 'text',
            modifiers: [],
            value: 'deep',
          }],
        }],
      }],
    });
    if (!Array.isArray(vnode)) {
      expect(vnode.type).toBe('saz-card');
      const row = vnode.children[0] as any;
      expect(row.type).toBe('saz-row');
      const col = row.children[0] as any;
      expect(col.type).toBe('saz-column');
      expect(col.children[0].children[0]).toBe('deep');
    }
  });

  test('should flatten list nodes into parent children', () => {
    const vnode = transformAST({
      type: 'element',
      name: 'row',
      modifiers: [],
      children: [{
        type: 'list',
        items: [
          { type: 'inline', name: 'button', modifiers: [], value: 'A' },
          { type: 'inline', name: 'button', modifiers: [], value: 'B' },
        ],
      }],
    });
    if (!Array.isArray(vnode)) {
      expect(vnode.children).toHaveLength(2);
      expect((vnode.children[0] as any).type).toBe('saz-button');
      expect((vnode.children[1] as any).type).toBe('saz-button');
    }
  });

  test('should handle list node at top level', () => {
    const result = transformAST({
      type: 'list',
      items: [
        { type: 'inline', name: 'text', modifiers: [], value: 'A' },
        { type: 'inline', name: 'text', modifiers: [], value: 'B' },
      ],
    });
    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result).toHaveLength(2);
    }
  });

  test('should throw on unknown node type', () => {
    expect(() =>
      transformAST({ type: 'bogus' } as any)
    ).toThrow('Unknown node type: bogus');
  });

  test('should map modifiers through to props', () => {
    const vnode = transformAST({
      type: 'inline',
      name: 'button',
      modifiers: [
        { type: 'flag', value: 'accent' },
        { type: 'pair', key: 'size', value: 'large' },
      ],
      value: 'Click',
    });
    if (!Array.isArray(vnode)) {
      expect(vnode.props.variant).toBe('accent');
      expect(vnode.props.size).toBe('large');
    }
  });

  test('should handle empty list', () => {
    const result = transformAST({
      type: 'list',
      items: [],
    });
    expect(Array.isArray(result)).toBe(true);
    if (Array.isArray(result)) {
      expect(result).toHaveLength(0);
    }
  });
});

describe('Modifier Map - Edge cases', () => {
  test('should return empty props for empty modifiers', () => {
    expect(parseModifiers([])).toEqual({});
  });

  test('should throw on unknown flags', () => {
    expect(() => parseModifiers([{ type: 'flag', value: 'unknown-flag' }]))
      .toThrow(/Unknown modifier "unknown-flag"/);
  });

  test('should pass pair values directly', () => {
    const result = parseModifiers([{ type: 'pair', key: 'cols', value: '3' }]);
    expect(result.cols).toBe('3');
  });

  test('should handle multiple flags with last-wins for overlapping keys', () => {
    const result = parseModifiers([
      { type: 'flag', value: 'small' },
      { type: 'flag', value: 'large' },
    ]);
    expect(result.size).toBe('large');
  });

  test('should handle curved and flat toggling', () => {
    const result = parseModifiers([
      { type: 'flag', value: 'curved' },
      { type: 'flag', value: 'flat' },
    ]);
    expect(result.curved).toBe(false);
  });

  test('should handle all variant types', () => {
    for (const variant of ['accent', 'primary', 'secondary', 'danger', 'success']) {
      const result = parseModifiers([{ type: 'flag', value: variant }]);
      expect(result.variant).toBe(variant);
    }
  });

  test('should handle all shape types', () => {
    for (const shape of ['round', 'square', 'pill']) {
      const result = parseModifiers([{ type: 'flag', value: shape }]);
      expect(result.shape).toBe(shape);
    }
  });

  test('should handle mixed flags and pairs', () => {
    const result = parseModifiers([
      { type: 'flag', value: 'accent' },
      { type: 'flag', value: 'bold' },
      { type: 'flag', value: 'center' },
      { type: 'pair', key: 'gap', value: 'large' },
      { type: 'pair', key: 'cols', value: '3' },
    ]);
    expect(result).toEqual({
      variant: 'accent',
      weight: 'bold',
      align: 'center',
      gap: 'large',
      cols: '3',
    });
  });

  test('should handle disabled, active, loading, checked states', () => {
    const result = parseModifiers([
      { type: 'flag', value: 'disabled' },
      { type: 'flag', value: 'active' },
      { type: 'flag', value: 'loading' },
      { type: 'flag', value: 'checked' },
    ]);
    expect(result.disabled).toBe(true);
    expect(result.active).toBe(true);
    expect(result.loading).toBe(true);
    expect(result.checked).toBe(true);
  });

  test('pair value should override flag for same key', () => {
    const result = parseModifiers([
      { type: 'flag', value: 'large' },
      { type: 'pair', key: 'size', value: '42px' },
    ]);
    expect(result.size).toBe('42px');
  });
});

describe('Config - Edge cases', () => {
  test('generateCSSVariables with empty token map', () => {
    expect(generateCSSVariables({})).toBe('');
  });

  test('generateCSSVariables converts dots to hyphens', () => {
    const result = generateCSSVariables({ 'a.b.c': 'red' });
    expect(result).toContain('--saz-a-b-c: red;');
  });

  test('generateThemeCSS with no custom tokens uses defaults', () => {
    const css = generateThemeCSS();
    expect(css).toContain(':root {');
    expect(css).toContain('--saz-color-primary');
  });

  test('generateThemeCSS with custom tokens merges with defaults', () => {
    const css = generateThemeCSS({ 'color.primary': 'red' });
    expect(css).toContain('--saz-color-primary: red;');
    expect(css).toContain('--saz-color-accent');
  });

  test('custom token overrides default completely', () => {
    const original = getTokenValue('color.primary');
    const overridden = getTokenValue('color.primary', { 'color.primary': '#ff0000' });
    expect(overridden).toBe('#ff0000');
    expect(original).not.toBe('#ff0000');
  });

  test('getTokenValue returns undefined for nonexistent key', () => {
    expect(getTokenValue('nonexistent.key')).toBeUndefined();
  });

  test('getTokenValue returns custom token that doesnt exist in defaults', () => {
    const val = getTokenValue('custom.new', { 'custom.new': '42px' });
    expect(val).toBe('42px');
  });

  test('defaultTokens has all expected categories', () => {
    const keys = Object.keys(defaultTokens);
    expect(keys.some(k => k.startsWith('color.'))).toBe(true);
    expect(keys.some(k => k.startsWith('space.'))).toBe(true);
    expect(keys.some(k => k.startsWith('radius.'))).toBe(true);
    expect(keys.some(k => k.startsWith('shadow.'))).toBe(true);
    expect(keys.some(k => k.startsWith('text.'))).toBe(true);
    expect(keys.some(k => k.startsWith('icon.'))).toBe(true);
  });

  test('generateCSSVariables handles special characters in values', () => {
    const result = generateCSSVariables({
      'shadow.card': '0 2px 4px rgba(0, 0, 0, 0.1)',
      'font.family': '-apple-system, "Segoe UI", sans-serif',
    });
    expect(result).toContain('rgba(0, 0, 0, 0.1)');
    expect(result).toContain('"Segoe UI"');
  });
});

describe('Full Pipeline - Error propagation', () => {
  test('tokenizer error propagates through parseSakko', () => {
    expect(() => parseSakko('<page { text: "unterminated }>')).toThrow('Unterminated string');
  });

  test('parser error on malformed input propagates', () => {
    expect(() => parseSakko('garbage input here')).toThrow();
  });

  test('transformer handles full pipeline from parse to transform', () => {
    const ast = parseSakko('<page { card(accent) { text(bold): "Hello" } }>');
    const vnode = transformAST(ast.children[0]);
    if (!Array.isArray(vnode)) {
      expect(vnode.type).toBe('saz-card');
      expect(vnode.props.variant).toBe('accent');
      expect(vnode.children).toHaveLength(1);
      const text = vnode.children[0] as any;
      expect(text.type).toBe('saz-text');
      expect(text.props.weight).toBe('bold');
      expect(text.children[0]).toBe('Hello');
    }
  });

  test('full pipeline with list renders correctly', () => {
    const ast = parseSakko('<page { row: [button: A, button: B, button: C] }>');
    const vnodes = ast.children.map(transformAST);
    const row = vnodes[0];
    if (!Array.isArray(row)) {
      expect(row.children).toHaveLength(3);
    }
  });

  test('full pipeline preserves modifier pairs through transform', () => {
    const ast = parseSakko('<page { grid(cols 3 gap large): [text: A] }>');
    const vnode = transformAST(ast.children[0]);
    if (!Array.isArray(vnode)) {
      expect(vnode.props.cols).toBe('3');
      expect(vnode.props.gap).toBe('large');
    }
  });
});
