export function Brand({ small }: { small?: boolean }) {
  return (
    <div className={small ? 'brand brand--small' : 'brand'}>
      Enddy <em>&amp;</em> Bento
    </div>
  );
}
