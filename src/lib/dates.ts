export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function isPast(value: string | null) {
  if (!value) {
    return false;
  }

  return value < today();
}
