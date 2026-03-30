'use client';

// Skips animation on first mount (boot screen's portfolio-fade-in handles it).
// Resets on full page reload (module re-evaluates), which is correct since
// the boot screen plays again on reload.
let isFirstMount = true;

export default function Template({ children }) {
  const skip = isFirstMount;
  if (isFirstMount) isFirstMount = false;

  return (
    <div className={skip ? '' : 'page-transition'}>
      {children}
    </div>
  );
}
