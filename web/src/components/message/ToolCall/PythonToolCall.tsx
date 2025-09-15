import MarkdownContent from "../MarkdownContent";


/**
 * Represent a tool call in markdown code snippet
 */
const CodeToolCall = ({ name, code }: { name: string; code: string; }) => {
  return (
    <>
      <header className="
          flex items-center
          px-[26px] py-2
          text-sm font-semibold text-text-secondary
          border-b-[1px] border-solid border-border-secondary
      ">
        {name}
      </header>
      <div className="px-[26px] py-3">
        <MarkdownContent
          text={`\`\`\`${name}\n${code}\n\`\`\``}
        />
      </div>
    </>
  );
};

export default CodeToolCall;
