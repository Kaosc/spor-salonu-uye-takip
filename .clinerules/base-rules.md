## Stack
- React Native
- TypeScript
- Redux
- React Navigation
- Firebase

## Code Style
- When creating styles
  ```ts
  const styles = createStyles(darkMode)

  const createStyles = (darkMode: boolean) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: darkMode ? "#000" : "#fff",
      },
    })
  ```
  this is the basic structure for creating styles. If you need to pass different props like premium, theme, etc. you can add them as parameters to the createStyles function.

- When creating components, use functional components and hooks instead of class components. This is the recommended way to write React components and allows for better performance and easier code reuse.
- When naming variables and functions, use camelCase. This is the standard convention in JavaScript
- When naming components, use PascalCase. This is the standard convention for React components.
- When creating a component file (.tsx) use PascalCase but for utility or function files use camelCase. This helps to easily distinguish between components and other code.

## Behavior
- Don't explain obvious things
- Show only changed code when editing, not the whole file
- Ask before installing new packages
- If unsure about something, say so instead of guessing

## Restrictions
- Don't run npx expo prebuild in any circumstance, it can override my custom native code and cause issues