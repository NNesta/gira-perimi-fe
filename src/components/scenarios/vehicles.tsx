// Top-down vehicles for the drawings (right-of-way scenes and lesson diagrams). Drawn at the origin, facing up.

export function Car({ body, edge }: { body: string; edge: string }) {
  return (
    <>
      <rect x={-13} y={-21} width={30} height={48} rx={9} fill="rgba(15,23,42,0.22)" />
      <rect x={-14} y={-24} width={28} height={48} rx={8} fill={body} stroke={edge} strokeWidth={1.5} />
      <path d="M-10 -11 Q0 -16 10 -11 L9 -4 L-9 -4 Z" fill="#dff1fb" />
      <rect x={-9} y={-3} width={18} height={13} rx={3} fill="#ffffff" opacity={0.18} />
      <path d="M-9 13 L9 13 L10 17 Q0 20 -10 17 Z" fill="#dff1fb" opacity={0.85} />
      <rect x={-12} y={-24} width={6} height={3} rx={1.5} fill="#fff6bf" />
      <rect x={6} y={-24} width={6} height={3} rx={1.5} fill="#fff6bf" />
    </>
  );
}

export function Truck() {
  return (
    <>
      <rect x={-14} y={-38} width={32} height={84} rx={6} fill="rgba(15,23,42,0.22)" />
      <rect x={-15} y={-14} width={30} height={56} rx={3} fill="#e8ecf2" stroke="#9aa4b2" strokeWidth={1.5} />
      <rect x={-14} y={-42} width={28} height={26} rx={6} fill="#f59e0b" stroke="#b45309" strokeWidth={1.5} />
      <path d="M-10 -32 Q0 -37 10 -32 L9 -26 L-9 -26 Z" fill="#dff1fb" />
      <path d="M-11 -6 H11 M-11 6 H11 M-11 18 H11 M-11 30 H11" stroke="#c4ccd8" strokeWidth={1.5} />
    </>
  );
}
