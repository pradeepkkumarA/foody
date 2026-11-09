export default function StatusMessage({ emoji = '🍽️', title, children, action }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <div className="mb-4 text-5xl" aria-hidden>
        {emoji}
      </div>
      <h2 className="font-display text-2xl font-semibold text-stone-900">{title}</h2>
      {children && <p className="mt-2 text-stone-600">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorMessage({ onRetry, children = 'We couldn’t reach the recipe service. Check your connection and try again.' }) {
  return (
    <StatusMessage
      emoji="⚠️"
      title="Something went wrong"
      action={
        onRetry && (
          <button type="button" onClick={onRetry} className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white hover:bg-orange-700">
            Try again
          </button>
        )
      }
    >
      {children}
    </StatusMessage>
  );
}
