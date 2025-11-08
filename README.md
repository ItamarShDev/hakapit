# הכפית (Hakapit)

![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![E2E Tests](https://img.shields.io/badge/E2E_Tests-Playwright-blue)
![PR Coverage](https://img.shields.io/badge/PR_Coverage-Auto_Updated-green)

אתר הבית של משפחת הכפית - פלטפורמת פודקאסטים בעברית עם מעקב העברות כדורגל

## תכונות מרכזיות

- 🎧 **פלטפורמת פודקאסטים** - האזנה לפודקאסטים בעברית
- ⚽ **מעקב העברות כדורגל** - הצגת העברות אחרונות בכדורגל
- 📱 **עיצוב רספונסיבי** - תמיכה מלאה במובייל, טאבלט ודסקטופ
- 🌐 **תמיכה בעברית ו-RTL** - ממשק מותאם לשפה העברית
- 🌙 **תמיכה במצב כהה/בהיר** - מעבר בין מצבי תצוגה
- 🔔 **התראות Push** - תמיכה בהתראות דפדפן

## טכנולוגיות

- **Framework**: Next.js 16 עם Turbopack
- **שפה**: TypeScript
- **סטיילינג**: Tailwind CSS
- **מסד נתונים**: PostgreSQL עם Drizzle ORM
- **בדיקות**: Playwright לבדיקות E2E
- **קוד**: Biome ללינטינג ופורמטינג
- **חבילות**: Bun לניהול חבילות

## התקנה והרצה

### התקנת תלות

```bash
bun install
```

### הרצת סביבת פיתוח

```bash
bun run dev
```

### בנייה לייצור

```bash
bun run build
bun start
```

## בדיקות

```bash
# הרצת כל הבדיקות
bun run test:e2e

# בדיקות נגישות
bun run test:e2e:accessibility

# בדיקות עם דוח כיסוי
bun run test:e2e:coverage

# צפייה בדוח הבדיקות
bun run test:e2e:report

# בדיקות במצב UI אינטראקטיבי
playwright test --ui
```

## מסד נתונים

```bash
# יצירת מיגרציות
bun run generate

# הפעלת מיגרציות
bun run push-db

# פתיחת Drizzle Studio
bun run studio
```

## פיתוח

```bash
# בדיקת טיפוסים
bun run typecheck

# פורמטינג קוד
bun run format

# לינטינג קוד
bun run lint

# תיקון אוטומטי של לינטינג
bun run lint:fix
```

## מבנה הפרויקט

- `app/` - דפי האפליקציה (App Router)
- `components/` - קומפוננטות React
- `db/` - סכמות ומיגרציות מסד הנתונים
- `tests/` - בדיקות E2E עם Playwright
- `public/` - קבצים סטטיים

## תמיכה בדפדפנים

- Chrome (מומלץ)
- Firefox
- Safari
- Edge

## רישיון

פרויקט פרטי של משפחת הכפית
