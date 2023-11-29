import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <section className="flex flex-col items-center justify-center h-full py-4 text-center lg:about h-fit lg:py-0">
      <div className="text-center text-paragraph">
        <h1 className="text-5xl fade-in-bottom">אז מה זה כפית?</h1>
        <div className="py-5 what-is-kapit">
          <p className="py-5 fade-in-bottom a-delay-100">
            כפית זה משחק של אופי.
          </p>
          <p className="py-5 fade-in-bottom a-delay-400">
            כפית זה ניצחון ברגע האחרון.
          </p>
          <p className="py-5 fade-in-bottom a-delay-700">
            כפית זה כל כך פשוט וכל כך קשה.
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-2 ">
        <Link to="https://twitter.com/KapitPod">Twitter</Link>
        <span className="text-accent">|</span>
        <Link to="https://www.threads.net/@kapitpod">Threads</Link>
        <span className="text-accent">|</span>
        <Link to="https://www.facebook.com/KapitPod">Facebook</Link>
        <span className="text-accent">|</span>
        <Link to="https://www.instagram.com/kapitpod/">Instagram</Link>
        <span className="text-accent">|</span>
        <Link to="https://pod.link/1546442506">Pod.link</Link>
      </div>
    </section>
  );
}
