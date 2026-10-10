import { type Handle } from "remix/component";
export default function Footer(_handle: Handle<Record<string, never>>) {
  return () => {
    return (
      <div className="flex flex-wrap justify-center gap-2 py-4">
        <a href="https://twitter.com/KapitPod" target="_blank" rel="noreferrer">
          Twitter
        </a>
        <span className="text-accent">|</span>
        <a href="https://www.threads.net/@kapitpod" target="_blank" rel="noreferrer">
          Threads
        </a>
        <span className="text-accent">|</span>
        <a href="https://www.facebook.com/KapitPod" target="_blank" rel="noreferrer">
          Facebook
        </a>
        <span className="text-accent">|</span>
        <a href="https://www.instagram.com/kapitpod/" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <span className="text-accent">|</span>
        <a href="https://pod.link/1546442506" target="_blank" rel="noreferrer">
          Pod.link
        </a>
      </div>
    );
  };
}
