export const takeUniqueOrThrow = <T extends any[]>(values: T): T[number] => {
  if (values.length > 1)
    throw new Error("Found multiple rows when one was expected")
  if (values.length === 0) throw new Error("Expected a row but found none")

  return values[0]!
}

export const takeUniqueOrNull = <T extends any[]>(
  values: T
): T[number] | null => {
  if (values.length > 1)
    throw new Error("Found multiple rows when one was expected")

  return values[0] ?? null
}
