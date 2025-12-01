import type { Metadata } from 'next';
import '../styles/globals.css';
import { Web3Provider } from '../context/Web3Context';
import { ChatProvider } from '../context/ChatContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Blockchain WhatsApp - Gasless Messaging',
  description: 'Decentralized messaging app with gasless transactions on Sepolia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          <ChatProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1F2C33',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#25D366',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ff4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ChatProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
