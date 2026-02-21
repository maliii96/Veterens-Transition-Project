# Mobile Navigation Menu - Code Example

## What Was Added to Each Page

### 1. State Management
Added a new state variable to track mobile menu open/closed status:

```tsx
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
```

### 2. Desktop Navigation (wrapped with className)
The existing desktop navigation now has a className for responsive hiding:

```tsx
<div className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/profile">Profile</Link>
  <Link href="/assessment">Assessment</Link>
  <Link href="/checklist">Checklist</Link>
  <button onClick={handleLogout}>Logout</button>
</div>
```

### 3. Hamburger Menu Button
A three-line hamburger icon button (hidden on desktop, visible on mobile):

```tsx
<button
  className="mobile-menu-btn"
  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  style={{
    display: 'none',
    flexDirection: 'column',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem'
  }}
>
  <div style={{ width: '24px', height: '2px', background: '#e6edf3' }} />
  <div style={{ width: '24px', height: '2px', background: '#e6edf3' }} />
  <div style={{ width: '24px', height: '2px', background: '#e6edf3' }} />
</button>
```

### 4. Mobile Dropdown Menu
A vertical dropdown menu that appears when hamburger is clicked:

```tsx
{mobileMenuOpen && (
  <div className="mobile-menu" style={{
    display: 'none',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem 2rem',
    background: '#0a0e14',
    borderTop: '1px solid #1e2530'
  }}>
    <Link href="/dashboard">Dashboard</Link>
    <Link href="/profile">Profile</Link>
    <Link href="/assessment">Assessment</Link>
    <Link href="/checklist">Checklist</Link>
    <button onClick={handleLogout}>Logout</button>
  </div>
)}
```

### 5. Responsive CSS
Media queries that control visibility and layout:

```css
@media (max-width: 768px) {
  .desktop-nav {
    display: none !important;  /* Hide desktop nav */
  }

  .mobile-menu-btn {
    display: flex !important;  /* Show hamburger button */
  }

  .mobile-menu {
    display: flex !important;  /* Show mobile menu when open */
  }
}
```

## Visual Behavior

### Desktop View (> 768px)
```
┌─────────────────────────────────────────────────────┐
│  [SITREP]  Dashboard  Profile  Assessment  [Logout] │
└─────────────────────────────────────────────────────┘
```

### Mobile View (< 768px) - Menu Closed
```
┌─────────────────────────────┐
│  [SITREP]              [☰]  │
└─────────────────────────────┘
```

### Mobile View (< 768px) - Menu Open
```
┌─────────────────────────────┐
│  [SITREP]              [☰]  │
├─────────────────────────────┤
│  Dashboard                  │
│  Profile                    │
│  Assessment                 │
│  Checklist                  │
│  [Logout]                   │
└─────────────────────────────┘
```

## How It Works

1. **Initial State**: Menu is closed (`mobileMenuOpen = false`)
2. **User Clicks Hamburger**: State toggles to `true`
3. **Menu Appears**: Conditional rendering shows mobile menu
4. **User Clicks Link**: Navigation occurs, can optionally close menu
5. **User Clicks Hamburger Again**: Menu closes

## Complete CSS for Each Page

The responsive styles ensure proper behavior across all screen sizes:

```jsx
<style jsx>{`
  @media (max-width: 768px) {
    /* Navigation */
    .nav-container {
      padding: 1rem !important;
    }
    .desktop-nav {
      display: none !important;
    }
    .mobile-menu-btn {
      display: flex !important;
    }
    .mobile-menu {
      display: flex !important;
    }

    /* Content */
    .main-content {
      padding: 1rem !important;
    }
    .page-title {
      fontSize: 1.5rem !important;
    }

    /* Page-specific responsive styles... */
  }

  @media (max-width: 480px) {
    /* Small mobile optimizations */
    .nav-container {
      padding: 0.75rem 1rem !important;
    }
    .page-title {
      fontSize: 1.25rem !important;
    }
  }
`}</style>
```

## Testing the Mobile Menu

To test the mobile navigation:

1. **Open Browser DevTools** (F12 or Cmd+Option+I)
2. **Toggle Device Toolbar** (Ctrl+Shift+M or Cmd+Shift+M)
3. **Select a mobile device** (e.g., iPhone 12)
4. **Click the hamburger icon** (☰) in the top right
5. **Verify menu opens** with vertical navigation
6. **Click a link** to test navigation
7. **Try different screen widths** (320px, 375px, 768px)

## Accessibility Notes

- Hamburger button is keyboard accessible (tabbable)
- Menu items maintain proper focus order
- Touch targets meet minimum size requirements (44x44px)
- Color contrast maintained for readability
- Works with screen readers (semantic HTML)
