# Hotline POS Application

> **Note**: For the full changelog of recent UI/UX improvements, icon migrations, 1366×768 resolution fixes, and keyboard shortcut updates, see [README_UPDATES.md](file:///d:/Documents/Hotline-Cellular/Hotline-POS-main/README_UPDATES.md) or the root [README.md](file:///d:/Documents/Hotline-Cellular/README.md).

## Technology Stack
- **Framework**: React 19 + TypeScript + Vite
- **Desktop Runtime**: Electron
- **Icons**: Lucide React (`lucide-react`)
- **Styling**: Tailwind CSS v4

## React + TypeScript + Vite

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
