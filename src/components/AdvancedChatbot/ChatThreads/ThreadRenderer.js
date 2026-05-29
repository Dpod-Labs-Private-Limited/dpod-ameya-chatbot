import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./styles.css";

const ThreadRenderer = ({ displayData }) => {
    return (
        <ReactMarkdown
            className="react-markdown"
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => <p>{children}</p>,
            }}
        >
            {displayData}
        </ReactMarkdown>
    );
};

export default ThreadRenderer;
