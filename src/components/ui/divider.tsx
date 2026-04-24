interface DividerProps {
  text?: string;
}

export function Divider({ text }: DividerProps) {
  if (!text) {
    return <hr className="border-gray-200 my-6" />;
  }

  return (
    <div className="relative flex items-center py-2 my-6">
      <div className="flex-grow border-t border-gray-200" />
      <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-wider">
        {text}
      </span>
      <div className="flex-grow border-t border-gray-200" />
    </div>
  );
}
