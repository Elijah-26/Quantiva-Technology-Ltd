# Dashboard - Phase 3

## Overview

The dashboard provides the main authenticated user experience with a professional sidebar layout, navigation, and key metrics display.

## Architecture

### Layout Structure

The dashboard uses a nested layout pattern:
```
Root Layout (app/layout.tsx)
└── Dashboard Layout (app/dashboard/layout.tsx)
    ├── Sidebar (fixed left)
    ├── Top Bar (fixed top)
    └── Page Content (scrollable)
```

## Components

### 1. Dashboard Layout (`app/dashboard/layout.tsx`)

**Key Features:**
- Fixed sidebar navigation (left)
- Fixed top bar (right section)
- Scrollable main content area
- Full-height layout (h-screen)
- Responsive design ready

**Sidebar Navigation:**
- Logo: "Market Intel"
- 5 navigation items with icons
- Active state highlighting
- User profile section at bottom
- Smooth hover transitions

**Top Bar:**
- Dynamic page title based on route
- User avatar with name and role
- Logout button with icon
- Clean separator between sections

**Navigation Items:**
```typescript
- Dashboard (LayoutDashboard icon)
- New Research (FileSearch icon)
- Reports (FileText icon)
- Schedules (Calendar icon)
- Settings (Settings icon)
```

**User Info:**
- Mock user: "John Doe"
- Email: john@example.com
- Avatar: "JD" initials
- Role: "Admin"

### 2. Dashboard Home (`app/dashboard/page.tsx`)

**Sections:**

#### Welcome Section
- Personalized greeting: "Welcome back, John! 👋"
- Subtitle with context

#### Primary Action
- Large "Create New Market Research" button
- Links to `/dashboard/new-research`
- Prominent placement and styling

#### Summary Cards (3 cards)
1. **Total Reports**
   - Count: 24
   - Icon: FileText (blue)
   - Hover effect: blue border
   
2. **Active Schedules**
   - Count: 5
   - Icon: Calendar (green)
   - Hover effect: green border
   
3. **Last Research Run**
   - Date: "January 8, 2026"
   - Time: "2:30 PM"
   - Icon: Clock (purple)
   - Hover effect: purple border

#### Quick Actions Card
- 3 action buttons:
  - Create New Research
  - View All Reports
  - Manage Schedules
- Icon badges with colored backgrounds
- Full-width outline buttons

#### Getting Started Card
- Gradient background (blue to purple)
- 3 numbered steps:
  1. Set up your first research
  2. Schedule recurring reports
  3. Review insights
- Visual numbered badges
- Helpful tips for new users

### 3. Placeholder Pages

All placeholder pages follow the same pattern:
- Centered card layout
- Large icon at top
- Title and description
- Gray placeholder content area
- "Coming soon" message

**Pages:**
- New Research (`/dashboard/new-research`)
- Reports (`/dashboard/reports`)
- Schedules (`/dashboard/schedules`)
- Settings (`/dashboard/settings`)

## Styling & Design

### Color Scheme

**Navigation:**
- Active state: Blue-50 background, Blue-700 text
- Hover state: Gray-100 background
- Default: Gray-700 text

**Summary Cards:**
- Blue theme: Reports
- Green theme: Schedules
- Purple theme: Last Run
- Orange theme: Settings (placeholder)

**Backgrounds:**
- Page: Gray-50
- Sidebar: White
- Cards: White
- Top Bar: White

### Spacing & Layout

**Padding:**
- Main content: `p-8`
- Card content: Consistent padding
- Sidebar: `px-4 py-6`

**Grid Layout:**
- Summary cards: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Quick actions: 1 column (mobile), 2 columns (desktop)

**Heights:**
- Screen: Full height (`h-screen`)
- Top bar: `h-16`
- Buttons: Consistent heights (`h-11`, `h-12`)

### Typography

**Headlines:**
- Page title (top bar): `text-2xl font-bold`
- Welcome message: `text-3xl font-bold`
- Card titles: `text-xl` or `text-2xl font-bold`

**Body Text:**
- Descriptions: `text-gray-600`
- Card values: `text-3xl font-bold`
- Small text: `text-sm`

## Navigation & Routing

### Active State Detection

```typescript
const pathname = usePathname()
const isActive = pathname === item.href
```

### Page Title Logic

```typescript
const getPageTitle = () => {
  const currentNav = navigation.find(item => item.href === pathname)
  return currentNav ? currentNav.name : 'Dashboard'
}
```

### Logout Flow

```typescript
const handleLogout = () => {
  console.log('Logout clicked')
  router.push('/login')
}
```

## Mock Data

Current mock data (to be replaced with API):

```typescript
const stats = {
  totalReports: 24,
  activeSchedules: 5,
  lastRunDate: 'January 8, 2026',
  lastRunTime: '2:30 PM'
}
```

## User Flow

1. User logs in or signs up
2. Redirected to `/dashboard`
3. Sees welcome message and summary cards
4. Can navigate via sidebar
5. Can create new research
6. Can view reports, schedules, settings
7. Can logout (returns to login page)

## Accessibility Features

✅ Semantic HTML structure
✅ Proper heading hierarchy
✅ Icon + text labels for navigation
✅ ARIA-compliant components (via Shadcn)
✅ Keyboard navigation support
✅ Focus states on interactive elements
✅ Proper color contrast

## Responsive Design

### Desktop (default)
- Sidebar visible (w-64)
- Full navigation labels
- Multi-column grids
- User email visible in top bar

### Tablet
- Sidebar remains visible
- 2-column grid for cards
- Adjusted spacing

### Mobile (future enhancement)
- Collapsible sidebar
- Single column layout
- Hamburger menu
- Compact top bar

## Backend Integration Points

### Ready for API calls:

1. **User Info**
```typescript
// Replace mock user data
const user = await fetchUser()
```

2. **Dashboard Stats**
```typescript
// Replace mock stats
const stats = await fetchDashboardStats()
```

3. **Logout**
```typescript
const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  router.push('/login')
}
```

4. **Navigation**
```typescript
// Add permissions check
const allowedRoutes = user.permissions
```

## File Structure

```
app/dashboard/
├── layout.tsx                    # Main dashboard layout
├── page.tsx                      # Dashboard home
├── new-research/
│   └── page.tsx                  # New research page
├── reports/
│   └── page.tsx                  # Reports page
├── schedules/
│   └── page.tsx                  # Schedules page
└── settings/
    └── page.tsx                  # Settings page
```

## Reusability

The dashboard layout is **automatically applied** to all pages under `/dashboard/*`:

- No need to import layout in each page
- Consistent navigation across all pages
- Easy to add new pages
- Shared state management ready

## Testing Checklist

✅ All navigation links work
✅ Active state highlights correctly
✅ Logout redirects to login
✅ Page titles update dynamically
✅ All cards display properly
✅ Buttons have correct links
✅ Responsive grid layouts work
✅ No console errors
✅ Build succeeds
✅ TypeScript types are correct

## Next Steps (Phase 4)

When backend is ready:
1. Replace mock data with API calls
2. Add loading states
3. Add error handling
4. Implement real authentication
5. Add user permissions
6. Add real-time data updates
7. Add data refresh mechanisms
8. Build out placeholder pages
9. Add charts and visualizations
10. Implement actual features

## Performance Considerations

- Static rendering where possible
- Client-side navigation (no page reloads)
- Optimized icons from lucide-react
- Minimal re-renders with proper React patterns
- Ready for code splitting

## Security Notes

- No authentication middleware yet
- No route protection yet
- Logout is client-side only
- Ready for backend auth integration

## Dependencies Used

- `next/navigation`: usePathname, useRouter
- `lucide-react`: All icons
- `@/components/ui/*`: Shadcn components
- Tailwind CSS: All styling

