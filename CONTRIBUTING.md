# Contributing to Tally Consolidation Tool

First off, thanks for considering contributing to this project! It's people like you that make this tool such a great resource.

## Ways to Contribute

### 🐛 Bug Reports
Found a bug? Please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Your browser and OS
- Screenshots if applicable

### 💡 Feature Requests
Have an idea to improve the tool? Open an issue with:
- Clear description of the feature
- Why it would be useful
- Suggested implementation (optional)

### 📝 Documentation
Help improve the docs:
- Clarify existing documentation
- Add examples or use cases
- Translate to other languages
- Create tutorial videos

### 🔧 Code Contributions
Want to code? Here's how:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tally-consolidation-tool.git
   cd tally-consolidation-tool
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Make your changes**
   - Follow the existing code style
   - Keep changes focused and atomic
   - Add comments for complex logic

5. **Test locally**
   ```bash
   npm run dev
   npm run typecheck
   ```

6. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new consolidation feature"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Link related issues
   - Describe your changes clearly
   - Include before/after screenshots if UI changes

## Development Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git

### Quick Start
```bash
npm install
npm run dev
```

### Available Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run serve        # Preview production build
npm run typecheck    # Check TypeScript errors
```

## Code Style

### TypeScript
- Use strict type checking
- Avoid `any` types
- Document complex functions
- Use meaningful variable names

### React Components
- Prefer functional components
- Use custom hooks for logic
- Keep components focused
- Add PropTypes or TypeScript interfaces

### Naming Conventions
- Files: `kebab-case.ts`, `PascalCase.tsx`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Components: `PascalCase`

### File Organization
```
src/
├── components/      # UI components
├── hooks/          # Custom React hooks
├── types/          # TypeScript definitions
├── utils/          # Utility functions
└── App.tsx         # Main component
```

## Git Commit Messages

Follow conventional commits:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (no logic changes)
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `test:` Tests
- `chore:` Build/dependency updates

**Examples:**
```
feat(consolidation): add elimination entry builder
fix(excel-parser): handle empty cells correctly
docs: improve setup instructions
```

## Pull Request Process

1. Update README.md if adding/changing features
2. Update SETUP.md if setup process changes
3. Add tests if applicable
4. Ensure code passes type checking
5. Keep PR focused (one feature per PR)
6. Be open to feedback and discussion

## Code Review Guidelines

When reviewing code:
- Be respectful and constructive
- Ask questions rather than demand changes
- Suggest improvements
- Test the changes locally if possible
- Approve once satisfied

## Areas We Need Help With

- [ ] Support for more than 4 companies
- [ ] Intercompany transaction editor UI
- [ ] Multi-period consolidation
- [ ] Dark mode theme
- [ ] Internationalization (i18n)
- [ ] Additional export formats (JSON, CSV)
- [ ] Performance optimizations
- [ ] Mobile responsiveness improvements
- [ ] Unit tests for utilities
- [ ] Integration tests

## Questions?

- Check existing issues and discussions
- Create a new discussion for questions
- Review documentation in README.md
- Look at code comments for implementation details

## Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Recognized for their efforts

Thank you for contributing! 🙏

---

**Remember:** This project is open source and for everyone. Be respectful, inclusive, and constructive in all interactions.
