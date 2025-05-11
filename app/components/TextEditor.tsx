import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import styles from './TextEditor.module.css';

type Suggestion = {
  message: string;
  replacements: Array<{ value: string }>;
  offset: number;
  length: number;
};

const TextEditor: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSuggestions = useCallback(
    debounce(async (inputText: string) => {
      if (!inputText) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/languagetool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: inputText }),
        });
        const data: { matches: Suggestion[] } = await res.json();
        setSuggestions(data.matches || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchSuggestions(text);
    return () => fetchSuggestions.cancel();
  }, [text, fetchSuggestions]);

  const applySuggestion = (match: Suggestion) => {
    const replacement = match.replacements[0]?.value || '';
    const newText =
      text.slice(0, match.offset) +
      replacement +
      text.slice(match.offset + match.length);
    setText(newText);
  };

  return (
    <div className={styles.container}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your text here..."
        className={styles.textarea}
      />
      {loading && <p className={styles.loading}>Fetching suggestions...</p>}
      {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((match, index) => (
            <li key={index} className={styles.suggestion}>
              <span>
                <strong>{match.message}</strong>
                {match.replacements[0] && (
                  <>
                    {' '}
                    → Suggest: <em>{match.replacements[0].value}</em>
                  </>
                )}
              </span>
              {match.replacements[0] && (
                <button
                  onClick={() => applySuggestion(match)}
                  className={styles.applyButton}
                >
                  Apply
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TextEditor;