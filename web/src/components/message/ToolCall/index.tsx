import PythonToolCall from "./PythonToolCall";


/**
 * Represent a tool call in markdown code snippet
 */
const ToolCall = ({ name, args }: { name: string; args: any; }) => {
  switch (name) {
    case "python":
      // TODO: Maybe not args.query. Need to check.
      return <PythonToolCall name={name} code={args.query} />;
    default:
      return null;
  }
};

export default ToolCall;
