export const toClientResponse = <T extends { password?: string }>(
  client: T
): Omit<T, 'password'> | null => {
  if (!client) return null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...clientWithoutPassword } = client
  return clientWithoutPassword
}
