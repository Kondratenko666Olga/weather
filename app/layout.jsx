import './globals.scss';

export const metadata = {
  title: 'Your city weather',
  description: 'Прогноз погоди містах',
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
