import Snippet from "./Snippet";

interface SnippetViewerProps {
    snippet: Snippet | null;
    snippetWidth: number;
    snippetHeight: number;
    onScan: (base64ImageSnippet: string) => void;
    onClearSnippet: () => void;
}

export default SnippetViewerProps;