# Contributing to PAI-Kiro

Thank you for your interest in contributing to PAI-Kiro! This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

- **Report Bugs** - Found a bug? Let us know!
- **Suggest Features** - Have an idea? We'd love to hear it!
- **Write Code** - Submit PRs for bug fixes or new features
- **Improve Documentation** - Help make our docs better
- **Test** - Try PAI-Kiro and report your experience
- **Share** - Tell others about PAI-Kiro

## 🐛 Reporting Bugs

Before creating a bug report:
1. Check if the bug has already been reported
2. Collect relevant information (version, OS, logs)
3. Try to reproduce the bug consistently

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml) when filing issues.

## 💡 Suggesting Features

Before suggesting a feature:
1. Check if it's already been suggested
2. Consider if it fits PAI-Kiro's goals
3. Think about implementation complexity

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml) when suggesting features.

## 🔧 Development Setup

### Prerequisites

- [Bun](https://bun.sh) v1.0.0+
- [Git](https://git-scm.com/)
- [Kiro IDE](https://kiro.dev)
- TypeScript knowledge

### Setup Steps

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/PAI-kiro.git
cd PAI-kiro/kiro-adapter

# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests
bun test

# Build
bun run build
```

## 📝 Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Prefer `async/await` over callbacks
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Follow existing code patterns

### Example

```typescript
/**
 * Convert ISA to Kiro Spec format
 * @param isa - The ISA to convert
 * @returns Promise resolving to Kiro Spec
 */
async function isaToKiroSpec(isa: ISA): Promise<KiroSpec> {
  // Implementation
}
```

## 🧪 Testing

- Write tests for new features
- Ensure existing tests pass
- Test on multiple platforms if possible
- Include edge cases

```bash
# Run tests
bun test

# Run specific test
bun test src/adapters/KiroAdapter.test.ts
```

## 📚 Documentation

- Update README.md for user-facing changes
- Update relevant .md files in docs/
- Add inline code comments
- Include examples where helpful

## 🔀 Pull Request Process

### Before Submitting

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow existing patterns
   - Add tests if applicable

3. **Test thoroughly**
   ```bash
   bun test
   bun run build
   ```

4. **Commit with clear messages**
   ```bash
   git commit -m "feat: add new feature"
   ```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add OpenCode adapter support
fix: resolve hook execution timing issue
docs: update migration guide with new examples
```

### Submitting PR

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changed and why
   - Include testing evidence
   - Add screenshots if UI-related

3. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Related Issues
   Fixes #123
   
   ## Changes Made
   - Added X feature
   - Fixed Y bug
   - Updated Z documentation
   
   ## Testing
   - [ ] Tested on macOS
   - [ ] Tested on Linux
   - [ ] All tests pass
   - [ ] Documentation updated
   
   ## Screenshots
   (if applicable)
   ```

### Review Process

- Maintainers will review your PR
- Address feedback promptly
- Keep PR focused and small
- Be patient and respectful

## 🎯 Priority Areas

We especially welcome contributions in these areas:

### High Priority
- Testing on different Kiro versions
- Skills migration improvements
- Hook system enhancements
- Bug fixes

### Medium Priority
- Documentation improvements
- Performance optimizations
- Additional platform adapters
- Example projects

### Low Priority
- UI/UX improvements
- Additional features
- Refactoring

## 🏗️ Architecture Guidelines

### Platform Adapter Pattern

When adding new platform support:

1. Implement `PlatformAdapter` interface
2. Follow existing adapter patterns
3. Document platform-specific quirks
4. Add comprehensive tests

### Code Organization

```
kiro-adapter/
├── src/
│   ├── adapters/     # Platform adapters
│   ├── core/         # Platform-agnostic core
│   ├── kiro/         # Kiro-specific code
│   ├── cli/          # CLI tools
│   └── utils/        # Shared utilities
```

## 🔒 Security

- Never commit secrets or API keys
- Review code for security issues
- Report security vulnerabilities privately
- Follow secure coding practices

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information

## 💬 Getting Help

- **GitHub Issues** - For bugs and features
- **GitHub Discussions** - For questions and ideas
- **PAI Discord** - For community chat

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📞 Contact

- **GitHub Issues**: https://github.com/ylxai/PAI-kiro/issues
- **Discussions**: https://github.com/ylxai/PAI-kiro/discussions

---

**Thank you for contributing to PAI-Kiro!** 🚀

Your contributions help bring PAI's Life Operating System to developers across all AI IDEs.
