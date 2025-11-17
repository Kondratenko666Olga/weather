import './globals.scss';

export const metadata = {
  title: 'Weather App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
