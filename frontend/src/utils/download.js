/**
 * Fail-safe file download utility.
 * Ensures URL.revokeObjectURL and DOM cleanup execute synchronously
 * even if the download trigger throws, preventing memory leaks.
 */
export const triggerFileDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  try {
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
  } finally {
    // Synchronous cleanup — always runs regardless of errors above
    URL.revokeObjectURL(url);
    if (a.parentNode) {
      document.body.removeChild(a);
    }
  }
};

