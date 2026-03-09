# Recto Documentation

Organized documentation for all Recto features and services.

## Categories

### 🔐 Authentication (`/auth`)

Complete authentication system with Zustand, JWT tokens, and OTP verification.

- **README.md** - Overview and quick start
- **IMPLEMENTATION.md** - Detailed implementation guide
- **QUICK_REFERENCE.md** - Code examples and patterns
- **ARCHITECTURE.md** - System design and diagrams

**Key Features:**

- Email/password login & signup
- OTP-based verification
- Token management & auto-refresh
- Route protection (AuthGuard, GuestGuard)
- Password reset flow
- User profile management

**Quick Start:**

```bash
npm install zustand sonner
# Set NEXT_PUBLIC_API_URL in .env.local
# Add ToasterProvider to layout
# Create auth pages with LoginForm, SignupForm
```

**View:** [Authentication Docs →](./auth)

---

### 📚 Books (`/books`) [Coming Soon]

Book management, search, reviews, and recommendations system.

**Planned Features:**

- Book listing and search
- Book details and metadata
- User reviews and ratings
- Reading lists and collections
- Book recommendations

---

## File Structure

```
docs/
├── README.md (this file)
├── auth/
│   ├── README.md              # Quick start
│   ├── IMPLEMENTATION.md      # Detailed guide
│   ├── QUICK_REFERENCE.md    # Code examples
│   └── ARCHITECTURE.md        # System design
└── books/
    └── (Coming soon)
```

## Quick Navigation

**I want to...**

- [Get started with authentication](./auth) - Start here!
- [See code examples](./auth/QUICK_REFERENCE.md) - Copy-paste ready code
- [Understand the architecture](./auth/ARCHITECTURE.md) - System design
- [Read full implementation guide](./auth/IMPLEMENTATION.md) - Complete details

## Standards

### Documentation Structure

Each category has:

- **README.md** - Overview & quick start (entry point)
- **IMPLEMENTATION.md** - Complete detailed guide
- **QUICK_REFERENCE.md** - Code examples & patterns
- **ARCHITECTURE.md** - Design & diagrams (if applicable)

### Code Style

- TypeScript with 100% type coverage
- Functional components
- Hooks for state management
- Zustand for global state
- Tailwind CSS for styling

### Naming Conventions

- Components: PascalCase (`LoginForm.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Files: kebab-case or descriptive names
- Exports: Named exports with index.ts re-exports

---

**Last Updated:** January 18, 2026
**Total Documentation:** Well-organized & categorized
**Status:** Auth complete, Books coming soon
