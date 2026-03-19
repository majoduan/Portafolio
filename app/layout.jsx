import './globals.css';

export const metadata = {
  title: 'Mateo Dueñas | Full Stack Developer Portfolio',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
