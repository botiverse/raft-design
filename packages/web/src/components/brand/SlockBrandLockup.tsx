export default function SlockBrandLockup({
  className = "h-10 w-auto",
}: {
  className?: string;
}) {
  return (
    <img
      src="/brand/slock-lockup-light.svg"
      alt="Slock"
      className={`block select-none ${className}`}
      draggable={false}
    />
  );
}
