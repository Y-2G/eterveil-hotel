# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint

# Storybook
npm run storybook    # Start Storybook dev server (http://localhost:6006)
npm run build-storybook  # Build static Storybook
```

## Testing

Tests run via Vitest with Storybook integration and Playwright browser testing:

```bash
npx vitest                    # Run all tests
npx vitest --run              # Run tests once (no watch)
npx vitest src/stories/Button # Run specific story tests
```

Test configuration is in `vitest.config.ts`. Tests execute Storybook stories in a headless Chromium browser.

## Architecture

This is a Next.js 16 hotel website featuring an immersive 3D scene built with React Three Fiber.

### Core Technologies
- **Next.js 16** with App Router (`src/app/`)
- **React Three Fiber + drei** for 3D graphics
- **GSAP + ScrollTrigger** for scroll-based animations
- **Tailwind CSS 4** + **Sass** for styling
- **Storybook 10** for component development

### Directory Structure

```
src/
├── app/
│   ├── page.tsx              # Main page (client component)
│   ├── layout.tsx            # Root layout with Cormorant Garamond font
│   ├── components/
│   │   ├── home/
│   │   │   ├── three/        # 3D scene components
│   │   │   ├── hero/         # Hero section
│   │   │   ├── concept/      # Concept section with facilities
│   │   │   ├── access/       # Access/map section
│   │   │   ├── contact/      # Contact forms (reservation, inquiry)
│   │   │   └── schedule/     # Schedule modal components
│   │   ├── atoms/            # Small reusable components (Logo, Heading)
│   │   └── common/           # Shared components (Header, Footer, etc.)
│   └── hooks/                # Custom React hooks
├── ui/                       # Shadcn-style UI primitives (Button, Input, Dialog, etc.)
└── stories/                  # Storybook stories
```

### 3D Scene Architecture (`src/app/components/home/three/`)

The 3D scene is a fullscreen fixed canvas that responds to scroll position:

- **Canvas.tsx**: Main container managing scroll-triggered camera animations via GSAP ScrollTrigger
- **Scene.tsx**: Three.js scene setup with camera, lighting, and all 3D objects
- **types.ts + debugConfig.ts**: Comprehensive configuration types for all scene elements (camera, lighting, sky, ocean, fog, bloom, neon signs, etc.)
- **Key 3D components**: HotelModel, WorldModel, Sky, Ocean, GrassSystem, GroundFog, BlueOrb, NeonSign, MapPinSprite

The scene uses a `DebugConfig` object for runtime configuration of camera position, lighting, effects, and animations. Access it via `useDebugConfig()` hook.

### Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json)

### UI Component Pattern

UI components in `src/ui/` follow the shadcn/ui pattern using `class-variance-authority` for variants and `tailwind-merge` via the `cn()` utility.
