# DirectorApp
Used as an intermediary between a lovable app and twilio to use client side rendering

## How to Commit Changes

This guide explains how to commit changes to the DirectorApp repository.

### Prerequisites
- Git installed on your system
- Access to this repository (clone or fork)
- Basic understanding of git commands

### Basic Git Workflow

1. **Check current status**
   ```bash
   git status
   ```

2. **Add changes to staging area**
   ```bash
   # Add specific files
   git add filename.js
   
   # Add all changes
   git add .
   
   # Add all files of a specific type
   git add *.js
   ```

3. **Commit your changes**
   ```bash
   git commit -m "Your commit message"
   ```

4. **Push to remote repository**
   ```bash
   git push origin branch-name
   ```

### Commit Message Guidelines

Follow these conventions for clear and consistent commit messages:

#### Format
```
type(scope): short description

Longer description if needed
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples
```bash
# Good commit messages
git commit -m "feat: add twilio integration endpoint"
git commit -m "fix: resolve client-side rendering issue"
git commit -m "docs: update API documentation"

# Bad commit messages (avoid these)
git commit -m "update"
git commit -m "fixes"
git commit -m "wip"
```

### Step-by-Step Example

Here's a complete example of making a change and committing it:

```bash
# 1. Check what branch you're on
git branch

# 2. Create a new branch for your feature (recommended)
git checkout -b feature/new-endpoint

# 3. Make your changes to files
# ... edit files ...

# 4. Check what you've changed
git status
git diff

# 5. Add your changes
git add .

# 6. Commit with a descriptive message
git commit -m "feat: add new API endpoint for client communication"

# 7. Push your branch
git push origin feature/new-endpoint

# 8. Create a Pull Request on GitHub
```

### Common Scenarios

#### Making a quick fix
```bash
git add filename.js
git commit -m "fix: correct typo in client rendering logic"
git push origin main
```

#### Working on a feature
```bash
git checkout -b feature/twilio-integration
# ... make changes ...
git add .
git commit -m "feat: implement twilio message handling"
git push origin feature/twilio-integration
```

#### Updating documentation
```bash
git add README.md
git commit -m "docs: add deployment instructions"
git push origin main
```

### Tips
- Make small, focused commits rather than large ones
- Write descriptive commit messages that explain what and why
- Test your changes before committing
- Use branches for new features and bug fixes
- Review your changes with `git diff` before committing
