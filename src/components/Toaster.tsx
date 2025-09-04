import { Toaster as SonnerToaster } from 'sonner@2.0.3'
import { useTheme } from '../contexts/ThemeContext'

export function Toaster() {
  const { theme } = useTheme()

  return (
    <SonnerToaster
      theme={theme}
      richColors
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        },
      }}
    />
  )
}