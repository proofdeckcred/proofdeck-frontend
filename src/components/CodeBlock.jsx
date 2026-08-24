import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

const CodeBlock = ({ children, language }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setIsCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="code-block-container">
      {language && <span className="code-block-language">{language}</span>}
      <button onClick={handleCopy} className="code-block-copy-button">
        {isCopied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
