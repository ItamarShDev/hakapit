import "styles/themes/main.css";
import "styles/globals.css";
import styles from "styles/layout.module.css";
import { Inter } from "@next/font/google";
const font = Inter();

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={font.className}>
        <main className={styles.page}>{children}</main>
      </body>
    </html>
  );
}
