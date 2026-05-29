import React from 'react';
import './markdown.css';

const INLINE_PATTERNS = [
  { regex: /\*\*([^*\n]+?)\*\*/, type: 'bold' },
  { regex: /`([^`\n]+?)`/, type: 'code' },
  { regex: /\[([^\]\n]+?)\]\(([^)\n]+?)\)/, type: 'link' },
  { regex: /(?<![*\w])\*([^*\n]+?)\*(?!\w)/, type: 'italic' },
  { regex: /~~([^~\n]+?)~~/, type: 'strike' },
];

const renderInline = (text) => {
  if (!text) return null;
  const nodes = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = null;
    for (const p of INLINE_PATTERNS) {
      const m = remaining.match(p.regex);
      if (m && (!earliest || m.index < earliest.match.index)) {
        earliest = { ...p, match: m };
      }
    }

    if (!earliest) {
      nodes.push(remaining);
      break;
    }

    if (earliest.match.index > 0) {
      nodes.push(remaining.slice(0, earliest.match.index));
    }

    const { type, match } = earliest;
    if (type === 'bold') nodes.push(<strong key={key++}>{renderInline(match[1])}</strong>);
    else if (type === 'code') nodes.push(<code key={key++}>{match[1]}</code>);
    else if (type === 'link') nodes.push(<a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer">{renderInline(match[1])}</a>);
    else if (type === 'italic') nodes.push(<em key={key++}>{renderInline(match[1])}</em>);
    else if (type === 'strike') nodes.push(<del key={key++}>{renderInline(match[1])}</del>);

    remaining = remaining.slice(earliest.match.index + earliest.match[0].length);
  }

  return nodes;
};

const isListLine = (line) => /^\s*([*\-+]|\d+\.)\s+/.test(line);
const isHrLine = (line) => /^\s*(\*{3,}|-{3,}|_{3,})\s*$/.test(line);
const isHeaderLine = (line) => /^#{1,6}\s+/.test(line);
const isFenceLine = (line) => /^\s*```/.test(line);
const isTableSeparator = (line) => /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(line);
const isTableRow = (line) => /^\s*\|.+\|\s*$/.test(line.trim()) || (line.includes('|') && line.trim().split('|').length >= 3);

const parseTableRow = (line) => {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
};

const parseList = (lines, startIdx, baseIndent) => {
  const items = [];
  const firstMatch = lines[startIdx].match(/^(\s*)([*\-+]|\d+\.)\s+(.*)$/);
  const isOrdered = /\d+\./.test(firstMatch[2]);

  let i = startIdx;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    const m = line.match(/^(\s*)([*\-+]|\d+\.)\s+(.*)$/);
    if (!m) {
      // Possibly a continuation line (indented text under a list item)
      const indentMatch = line.match(/^(\s*)\S/);
      if (indentMatch && indentMatch[1].length > baseIndent && items.length > 0) {
        items[items.length - 1].lines.push(line.slice(baseIndent).trimStart());
        i++;
        continue;
      }
      break;
    }

    const [, indent, , content] = m;
    const indentLen = indent.length;

    if (indentLen < baseIndent) break;

    if (indentLen === baseIndent) {
      items.push({ lines: [content], children: [] });
      i++;
    } else {
      if (items.length === 0) {
        items.push({ lines: [content], children: [] });
        i++;
      } else {
        const sub = parseList(lines, i, indentLen);
        items[items.length - 1].children.push(sub.list);
        i = sub.endIndex;
      }
    }
  }

  return { list: { type: 'list', isOrdered, items }, endIndex: i };
};

const parseBlocks = (text) => {
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') { i++; continue; }

    if (isHeaderLine(line)) {
      const m = line.match(/^(#{1,6})\s+(.*)$/);
      blocks.push({ type: 'header', level: m[1].length, text: m[2] });
      i++;
      continue;
    }

    if (isFenceLine(line)) {
      const langMatch = line.match(/^\s*```(\w*)/);
      const lang = langMatch ? langMatch[1] : '';
      const codeLines = [];
      i++;
      while (i < lines.length && !isFenceLine(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: 'code', lang, content: codeLines.join('\n') });
      continue;
    }

    if (isHrLine(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    if (isListLine(line)) {
      const m = line.match(/^(\s*)/);
      const baseIndent = m[1].length;
      const result = parseList(lines, i, baseIndent);
      blocks.push(result.list);
      i = result.endIndex;
      continue;
    }

    // Table detection: a row followed by a separator
    if (line.includes('|') && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const headerRow = parseTableRow(line);
      const aligns = parseTableRow(lines[i + 1]).map(c => {
        const left = c.startsWith(':');
        const right = c.endsWith(':');
        if (left && right) return 'center';
        if (right) return 'right';
        if (left) return 'left';
        return null;
      });
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(parseTableRow(lines[i]));
        i++;
      }
      blocks.push({ type: 'table', header: headerRow, aligns, rows });
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', text: quoteLines.join('\n') });
      continue;
    }

    // Paragraph
    const paraLines = [line];
    i++;
    while (i < lines.length) {
      const next = lines[i];
      if (next.trim() === '' || isListLine(next) || isFenceLine(next) || isHeaderLine(next) || isHrLine(next) || next.startsWith('>')) {
        break;
      }
      paraLines.push(next);
      i++;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ').replace(/\s+/g, ' ').trim() });
  }

  return blocks;
};

const renderList = (list, key) => {
  const Tag = list.isOrdered ? 'ol' : 'ul';
  return (
    <Tag key={key}>
      {list.items.map((item, idx) => {
        const itemText = item.lines.join(' ').replace(/\s+/g, ' ').trim();
        return (
          <li key={idx}>
            {renderInline(itemText)}
            {item.children.map((child, cidx) => renderList(child, `c-${cidx}`))}
          </li>
        );
      })}
    </Tag>
  );
};

const renderBlock = (block, key) => {
  if (block.type === 'header') {
    const Tag = `h${block.level}`;
    return <Tag key={key}>{renderInline(block.text)}</Tag>;
  }
  if (block.type === 'paragraph') {
    return <p key={key}>{renderInline(block.text)}</p>;
  }
  if (block.type === 'code') {
    return <pre key={key}><code>{block.content}</code></pre>;
  }
  if (block.type === 'hr') {
    return <hr key={key} />;
  }
  if (block.type === 'quote') {
    return <blockquote key={key}>{renderInline(block.text)}</blockquote>;
  }
  if (block.type === 'list') {
    return renderList(block, key);
  }
  if (block.type === 'table') {
    return (
      <table key={key}>
        <thead>
          <tr>
            {block.header.map((h, idx) => (
              <th key={idx} style={block.aligns[idx] ? { textAlign: block.aligns[idx] } : undefined}>
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ridx) => (
            <tr key={ridx}>
              {row.map((cell, cidx) => (
                <td key={cidx} style={block.aligns[cidx] ? { textAlign: block.aligns[cidx] } : undefined}>
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return null;
};

const MarkdownRenderer = ({ displayData }) => {
  if (!displayData) return null;
  const blocks = parseBlocks(displayData.trim());

  return (
    <div className="md-root md-content">
      {blocks.map((block, idx) => renderBlock(block, idx))}
    </div>
  );
};

export default MarkdownRenderer;