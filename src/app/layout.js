import './globals.css'
import 'bootstrap/dist/css/bootstrap.css';
import NavBar from './components/Nav bar/NavBar';

export const metadata = {
  title: 'FulboLista',
  description: 'Organiza tu partido de Futbol',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body >
        <NavBar />
        {children}
      </body>
    </html>
  )
}
