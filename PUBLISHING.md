# Publishing Guide

This repository uses GitHub Actions to publish packages to NPM and create GitHub releases.

## Package Structure

Each package lives in its own directory under `packages/`:

```
packages/
  xyn-signal/       # Signal-based reactivity
  xyn-html/         # DOM creation (future)
  xyn-router/       # Client-side routing (future)
```

## Setup Requirements

### 1. NPM Token

To publish to NPM, you need to add an NPM access token as a GitHub secret:

1. Go to [npmjs.com](https://www.npmjs.com/) and sign in
2. Click your profile icon > Access Tokens
3. Click "Generate New Token" > "Classic Token"
4. Select "Automation" type (for CI/CD)
5. Copy the generated token
6. In your GitHub repository, go to Settings > Secrets and variables > Actions
7. Click "New repository secret"
8. Name: `NPM_TOKEN`
9. Value: Paste your NPM token
10. Click "Add secret"

### 2. GitHub Token

The `GITHUB_TOKEN` is automatically provided by GitHub Actions. No setup needed.

## Publishing a Release

### Tag Naming Convention

Each package uses its own tag prefix:

- `xyn-signal-v1.0.0` - Publishes xyn-signal version 1.0.0
- `xyn-html-v2.1.0` - Publishes xyn-html version 2.1.0 (future)
- `xyn-router-v0.5.0` - Publishes xyn-router version 0.5.0 (future)

### Steps to Publish

1. **Ensure your changes are merged to main**

2. **Create and push a version tag:**
   ```bash
   git tag xyn-signal-v1.4.0
   git push origin xyn-signal-v1.4.0
   ```

3. **The workflow automatically:**
   - Builds the package
   - Updates package.json version
   - Publishes to NPM
   - Creates a GitHub Release with auto-generated notes

### Publishing from a Branch

If you want to publish after merging a tagged branch:

1. Create your feature branch and make changes
2. Before merging, tag the branch:
   ```bash
   git tag xyn-signal-v1.4.1
   ```
3. Push the tag:
   ```bash
   git push origin xyn-signal-v1.4.1
   ```
4. Merge your branch to main
5. The workflow triggers on the tag push

## Adding New Packages

1. Create the package directory:
   ```bash
   mkdir -p packages/new-package/dist
   ```

2. Create `packages/new-package/package.json`:
   ```json
   {
     "name": "new-package",
     "version": "1.0.0",
     "type": "module",
     "main": "dist/new_package.js",
     "scripts": {
       "build": "cp ../../src/new_package.js dist/new_package.js",
       "prepublishOnly": "npm run build"
     }
   }
   ```

3. Copy `.github/workflows/publish-xyn-signal.yml` to `.github/workflows/publish-new-package.yml`

4. Update the new workflow:
   - Change tag pattern to `new-package-v*`
   - Update `working-directory` paths
   - Update release name and files

## Workflow Files

- `.github/workflows/publish-xyn-signal.yml` - Publishes xyn-signal package
- `.github/workflows/release-template.yml` - Template/reference for new packages

## Troubleshooting

### "npm ERR! 403 Forbidden"
- Check that your NPM_TOKEN secret is correct
- Ensure the token has publish permissions
- Verify the package name is available on NPM

### "Release already exists"
- Each version can only be published once
- Increment the version number for new releases

### Workflow not triggering
- Ensure the tag follows the correct pattern (e.g., `xyn-signal-v1.0.0`)
- Check that the workflow file is on the main branch
