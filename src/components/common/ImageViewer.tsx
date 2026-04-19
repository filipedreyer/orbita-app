export function ImageThumbnail({ uri, size = 100 }: { uri: string; size?: number }) {
  return (
    <img
      src={uri}
      alt="Imagem anexada"
      className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] object-cover"
      style={{ width: size, height: size }}
    />
  );
}
