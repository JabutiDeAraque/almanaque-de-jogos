export default function Chip({ cor, children, label }) {
  return (
    <span className={'chip' + (cor ? ' ' + cor : '')} aria-label={label}>
      {children}
    </span>
  );
}