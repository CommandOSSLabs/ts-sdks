import type { FC, ReactNode } from 'react'
import type { ThemeOverride } from '~/themes/themeContract'

interface ThemeProviderProps {
  children: ReactNode
  /**
   * Override default theme values for light and/or dark mode
   * @example
   * ```tsx
   * <ThemeProvider
   *   themeOverrides={{
   *     light: {
   *       colors: { primary: '#ff0000' }
   *     },
   *     dark: {
   *       colors: { primary: '#00ff00' }
   *     }
   *   }}
   * >
   *   {children}
   * </ThemeProvider>
   * ```
   */
  themeOverrides?: ThemeOverride
}

export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  themeOverrides: _ // Currently unused
}) => {
  return (
    <>
      {/* {themeOverrides && (
        <style
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for dynamic theme overrides
          dangerouslySetInnerHTML={{
            __html: `
              :root, .light {
                ${getStaticThemeStyles(lightTheme)}
              }
              .dark {
                ${getStaticThemeStyles(darkTheme)}
              }
            `,
          }}
        />
      )} */}
      {children}
    </>
  )
}

// function getStaticThemeStyles(theme: ThemeVars) {
// 	return `${styleDataAttributeSelector} {${cssStringFromTheme(theme)}}`;
// }

// function cssStringFromTheme(theme: ThemeVars) {
// 	return Object.entries(assignInlineVars(themeVars, theme))
// 		.map(([key, value]) => `${key}:${value};`)
// 		.join('');
// }
