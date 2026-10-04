export function Toast({ message, leaving }: { message: string | null; leaving?: boolean }) {
  if (!message) return null;
  return (
    // `key` reinicia a animação de entrada quando chega uma mensagem nova.
    <div key={message} className={leaving ? 'toast is-leaving' : 'toast'} role="status">
      {message}
    </div>
  );
}
