# Meal Mate Planner

A meal planning application that helps you organize recipes, manage your grocery inventory, and plan meals efficiently.

## Project Overview

Meal Mate Planner is a cross-platform web application built with modern technologies. It integrates with the Spoonacular API to provide recipe suggestions and nutritional information. The app helps users create meal plans, manage their grocery lists, and organize recipes in one convenient place.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Bun package manager or npm
- Spoonacular API key (get one at https://spoonacular.com/food-api)

### Installation

Follow these steps to get the project running locally:

```sh
# Step 1: Clone the repository
git clone https://github.com/krsnadadhich/meal-mate-planner.git

# Step 2: Navigate to the project directory
cd meal-mate-planner

# Step 3: Install dependencies
bun install
# or
npm install

# Step 4: Start the development server
bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:5173`

## Technology Stack

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **React Router** - Client-side routing
- **shadcn-ui** - High-quality UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Capacitor** - Cross-platform app framework
- **Spoonacular API** - Recipe and nutrition data

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── grocery/        # Grocery management components
│   ├── meal/           # Meal planning components
│   ├── recipe/         # Recipe display components
│   ├── layout/         # Layout components
│   └── ui/             # shadcn-ui components
├── pages/              # Page components
├── services/           # API and storage services
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── App.tsx             # Main App component
└── main.tsx            # Entry point
```

## Features

- **Meal Planning**: Create and manage meal plans
- **Recipe Management**: Browse and save recipes from Spoonacular
- **Grocery Inventory**: Track and manage your grocery items
- **API Integration**: Real-time recipe data from Spoonacular API
- **Local Storage**: Persist data in browser storage
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint checks

## Configuration

### Spoonacular API Key

To use recipe features, you need a Spoonacular API key:

1. Sign up at https://spoonacular.com/food-api
2. Get your API key from your account dashboard
3. Enter the API key in the app's settings dialog when prompted

### Capacitor Configuration

The project is configured for Capacitor to enable cross-platform deployment. Configuration can be found in `capacitor.config.ts`

## Contributing

Feel free to fork this repository and submit pull requests with improvements.

## License

This project is open source and available under the MIT License.
