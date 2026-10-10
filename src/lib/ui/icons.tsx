import { type Handle, type Props } from "remix/component";
export function PlayIcon(handle: Handle<Props<"svg">>) {
  return () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true" {...handle.props}>
      <path d="M4 2.5v10l8-5z" />
    </svg>
  );
}
export function PauseIcon(handle: Handle<Props<"svg">>) {
  return () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true" {...handle.props}>
      <path d="M3 2h3v11H3zm6 0h3v11H9z" />
    </svg>
  );
}

export function CloseIcon(handle: Handle<Props<"svg">>) {
  return () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true" {...handle.props}>
      <path d="M4 4l7 7M11 4l-7 7" stroke="currentColor" stroke-width="1.2" />
    </svg>
  );
}
export function SendIcon(handle: Handle<Props<"svg">>) {
  return () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      {...handle.props}
    >
      <path d="M9 10l-5 5 5 5" />
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </svg>
  );
}
