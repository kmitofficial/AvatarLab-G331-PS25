// app/layout.js
export const metadata = {
    title: 'TalkSync AI - Talking Head Synthesis',
    description: 'Generate AI talking head videos with synchronized lip movements',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    )
}