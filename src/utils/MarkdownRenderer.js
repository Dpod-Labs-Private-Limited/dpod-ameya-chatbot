import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './markdown.css';

const normalizeMarkdown = (text) => {
  if (!text) return '';

  let t = text.trim();
  t = t.replace(/\n{3,}/g, '\n\n');
  t = t.replace(/(\S)\n\n(\s*[*-] |\s*\d+\. )/g, '$1\n$2');

  return t;
};

const MarkdownRenderer = ({ displayData }) => {
  const cleaned = normalizeMarkdown(displayData);

  return (
    <div className="md-root">
      <ReactMarkdown
        className="md-content"
        remarkPlugins={[remarkGfm]}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
