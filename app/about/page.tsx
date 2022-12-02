import styles from "./page.module.css";
export default async function Index() {
  return (
    <section className={styles.section}>
      <div className={styles.center}>
        <span>WIP</span>
        <h1 className={styles.h1}>אז מה זה כפית?</h1>
        <div>
          <p>כפית זה משחק של אופי.</p>
          <p>כפית זה ניצחון ברגע האחרון.</p>
          <p>כפית זה כל כך פשוט וכל כך קשה.</p>
        </div>
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
  );
}
