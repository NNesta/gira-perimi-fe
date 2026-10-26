/** Distraction-free shell for a running exam: no site header, footer or tab bar. */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return <main className="min-h-dvh bg-bg">{children}</main>;
}
