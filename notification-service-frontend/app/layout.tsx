import './globals.css'

export const metadata = {
  title: 'Notification Dashboard - Bhutan Auction Platform',
  description: 'Admin dashboard for monitoring auction notifications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}