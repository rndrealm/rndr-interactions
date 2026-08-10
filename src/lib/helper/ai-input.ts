export const getExt = (name: string) =>
  name.split(".").pop()?.toLowerCase() ?? "";
