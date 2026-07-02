/** Friendly "studying at a desk" illustration for the login split-screen. */
export function LoginIllustration({ className }: { className?: string }) {
  return (
    <img
      src="/login_svg.png"
      alt="Illustration of a character studying at a desk"
      className={className}
      draggable={false}
    />
  );
}
