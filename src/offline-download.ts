/** Export the bundled app, without copying the current learner's rendered answers. */
export function offlineDocument(document: Document): string {
  const html = document.documentElement.cloneNode(true) as HTMLElement;
  if (html.querySelector('script[src]'))
    throw new Error(
      'Diese Ansicht enthält noch separate Skriptdateien. Verwende die fertige Offline-Datei.',
    );
  html.querySelector('#root')?.replaceChildren();
  return '<!doctype html>\n' + html.outerHTML;
}
export function saveOfflineApp(document: Document): void {
  const blob = new Blob([offlineDocument(document)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob),
    anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'Telematik-verstehen.html';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
