# Geo Unified Agent

This application combines three previously separate agents into a single unified interface:

- **Auditor Agent**: Audit brand presence.
- **Comparative Agent**: Compare products.
- **Fact Checker Agent**: Verify claims.

## Setup

1.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

## Structure

The project is structured as follows:

- `src/App.tsx`: Main shell application with the sidebar navigation.
- `src/auditor/`: Contains the source code for the Auditor Agent.
- `src/comparative/`: Contains the source code for the Comparative Agent.
- `src/fact-checker/`: Contains the source code for the Fact Checker Agent.

Each agent functions as a self-contained module within the larger application.

## Technologies

- **Vite**: Build tool and dev server.
- **React 19**: UI library.
- **Tailwind CSS**: Styling (via CDN for compatibility).
- **Lucide React**: Icons.
- **Google GenAI SDK**: For AI features.

## Contributors

- [@Kevin1289](https://github.com/Kevin1289)
- [@cynikjinchen](https://github.com/cynikjinchen)
