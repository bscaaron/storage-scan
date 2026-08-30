export interface NumberedItem {
  id: string
  number: number
}

export function sortByNumber<T extends NumberedItem>(items: T[]): T[] {
  return [...items].sort((a, b) => a.number - b.number)
}

export function getNextNumber(items: NumberedItem[]): number {
  if (items.length === 0) return 1
  return Math.max(...items.map((i) => i.number)) + 1
}

export function renumberUpdates(items: NumberedItem[]) {
  const sorted = sortByNumber(items)
  return sorted
    .map((item, index) => ({
      id: item.id,
      number: index + 1,
    }))
    .filter((item, index) => item.number !== sorted[index].number)
}
