import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/react'
import { useTheme } from 'next-themes'

export type ThemeToggleProps = React.ComponentProps<typeof Button>

export function ThemeToggle({ ...props }: ThemeToggleProps) {
  const { setTheme, systemTheme, theme } = useTheme()

  const currentTheme = theme === 'system' ? systemTheme : theme

  function switchTheme() {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button variant="outline" size="icon" onClick={() => switchTheme()} {...props}>
      {currentTheme === 'dark' ? (
        <Icon
          key={currentTheme}
          icon="line-md:sunny-outline-to-moon-alt-loop-transition"
          className="size-5"
        />
      ) : (
        <Icon
          key={currentTheme}
          icon="line-md:moon-to-sunny-outline-loop-transition"
          className="size-5"
        />
      )}

      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
