import './globals.scss';

export const metadata = {
  title: 'Next.js Weather SPA | Погода',
  description: 'Прогноз погоди у вибраних містах',
  icons: {
    icon: '/favicon.ico', // Шлях відносно папки public/
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
