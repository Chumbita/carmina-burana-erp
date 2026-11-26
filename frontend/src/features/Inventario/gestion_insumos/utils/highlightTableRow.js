const HIGHLIGHT_CLASSES = ['bg-green-100', 'dark:bg-green-900']
const HIGHLIGHT_DURATION_MS = 2000

/**
 * Desplaza la vista hasta la fila del insumo recién creado y la resalta
 * temporalmente. Efecto puramente de presentación: no muta estado de React.
 */
export function highlightTableRow(container, id) {
  if (!id || !container) return

  const row = container.querySelector(`[data-insumo-id="${id}"]`)
  if (!row) return

  row.scrollIntoView({ behavior: 'smooth', block: 'center' })
  row.classList.add(...HIGHLIGHT_CLASSES)
  setTimeout(() => row.classList.remove(...HIGHLIGHT_CLASSES), HIGHLIGHT_DURATION_MS)
}
