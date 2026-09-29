interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
}

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || '?';

export function Avatar({ name, src, className = 'w-24 h-24 text-3xl' }: AvatarProps) {
  if (src) {
    return <img src={src} alt={name || 'Avatar'} className={`${className} rounded-2xl object-cover`} />;
  }
  return (
    <div
      aria-label={name || 'Avatar'}
      className={`${className} rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold flex items-center justify-center`}
    >
      {initialsOf(name)}
    </div>
  );
}
