interface TypingIndicatorProps {
  typingUsers: { userId: string; userName: string }[];
  isGroupChat?: boolean;
}

const TypingIndicator = ({ typingUsers, isGroupChat = false }: TypingIndicatorProps) => {
  if (typingUsers.length === 0) return null;

  const getText = () => {
    if (typingUsers.length === 1) {
      return isGroupChat
        ? `${typingUsers[0].userName} wuu qorayaa...`
        : "Wuu qorayaa...";
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} iyo ${typingUsers[1].userName} way qorayaan...`;
    } else {
      return `${typingUsers[0].userName} iyo ${typingUsers.length - 1} kale way qorayaan...`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></span>
      </div>
      <span className="text-xs text-muted-foreground italic">{getText()}</span>
    </div>
  );
};

export default TypingIndicator;