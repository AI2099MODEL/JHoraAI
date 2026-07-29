# Compose Navigation Mapping: JHoraAI Unified Architecture
**Date:** July 15, 2026
**Version:** 1.0.0
**Status:** Architecture Blueprint

---

## 1. Overview
This document outlines how Kotlin Jetpack Compose Navigation principles (destinations, arguments, nav graphs, nested graphs, state hosting) are translated and implemented in the JHoraAI React Web platform. This ensures matching architectural consistency for future Android Native compiles or multiplatform wrappers (such as Compose Multiplatform).

---

## 2. NavHost Representation (React Web vs Jetpack Compose)

### Jetpack Compose Kotlin Code (Architectural reference):
```kotlin
@Composable
fun JHoraAppNavHost(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    startDestination: String = "dashboard"
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        composable("dashboard") { DashboardScreen() }
        composable("profiles") { ProfilesScreen() }
        
        // Nested Horoscope Graph
        navigation(startDestination = "overview", route = "horoscope") {
            composable("overview") { OverviewScreen() }
            composable("positions") { PlanetaryPositionsScreen() }
            composable("panchanga") { PanchangaScreen() }
            // ...
        }
        
        // Nested Developer Graph
        navigation(startDestination = "raw_json", route = "developer") {
            composable("raw_json") { RawJsonScreen() }
            composable("plugin_manager") { PluginManagerScreen() }
        }
    }
}
```

### React Web Declarative State equivalent (`src/App.tsx`):
We host the current active route and submenu selection in state. Transitions are executed cleanly using Framer Motion (`motion/react`) layout animations to preserve hardware-accelerated animations typical of native Android Compose transitions:

```typescript
// Nested Navigation States
export interface NavState {
  currentMenu: MainMenuId;
  currentSubMenu: { [key in MainMenuId]?: string };
}

// React Host rendering
const ActiveView = () => {
  switch (navState.currentMenu) {
    case 'dashboard': return <DashboardView />;
    case 'horoscope': return <HoroscopeView subView={navState.currentSubMenu['horoscope']} />;
    case 'charts': return <ChartsView subView={navState.currentSubMenu['charts']} />;
    case 'developer': return <DeveloperView subView={navState.currentSubMenu['developer']} />;
    // ...
  }
}
```

---

## 3. Back-Stack and Deep-Link Support
1. **Dynamic Navigation Drawer & Rail**: Selecting an item from the Navigation Rail resets the submenu backstack to its default category starting destination, preventing navigation depth trap.
2. **Back-button Handling**: On mobile layouts, the back-button state is managed using browser history states. Triggering back navigates backward through the submenus within the current active core tab first, then returns to the Dashboard.
3. **Arguments Mapping**: When deep-linking to specific charts (e.g., viewing Navamsa D9 of a saved profile), routes map as URL search query parameters: `?menu=charts&sub=d9_navamsa&profileId=123`.
