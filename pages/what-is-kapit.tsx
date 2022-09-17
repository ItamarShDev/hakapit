import { NextPage } from "next";
const WhatIsKapit: NextPage = () => {
  return (
    <>
      <section>
        <div className="center">
          <span>WIP</span>
          <h1>אז מה זה כפית?</h1>
          <p>
            <div>כפית זה משחק של אופי.</div>
            <div>כפית זה ניצחון ברגע האחרון.</div>
            <div>כפית זה כל כך פשוט וכל כך קשה.</div>
          </p>
        </div>

        <h2>
          הכפית של <a href="https://twitter.com/guyrgv">גיא</a>
        </h2>
        <ul>
          <li>4-3 מול ניוקאסל</li>
          <li>הניצחון על אולימפיאקוס</li>
          <li>גמר ליגת האלופות ב2005</li>
          <li>הניצחון בדרבי עם הגול של אוריגי</li>
        </ul>
      </section>
      <style jsx>{`
        section {
          padding: 3rem;
          display: flex;
          flex-direction: column;
        }
        h1 {
          font-size: 3rem;
        }

        .center {
          text-align: center;
        }
        .center p {
          font-size: 1.5rem;
          line-height: 2rem;
        }
      `}</style>
    </>
  );
};

export default WhatIsKapit;
