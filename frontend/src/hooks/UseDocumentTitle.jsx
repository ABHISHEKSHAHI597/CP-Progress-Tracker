import { useEffect } from 'react';

export function UseDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}