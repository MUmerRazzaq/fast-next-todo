# Plan to Address Pull Request Feedback

This plan outlines the steps to address the feedback received on the pull request. The changes are categorized into fixes and reversions of out-of-scope modifications.

## 1. Code Fixes

### 1.1. Apply Type-Safe Routing
- **File:** `frontend/src/components/auth/SignInForm.tsx`
  - **Change:** Modify `router.push("/tasks")` to `router.push("/tasks" as const)`.
- **File:** `frontend/src/components/auth/SignUpForm.tsx`
  - **Change:** Modify `router.push("/tasks")` to `router.push("/tasks" as const)`.

### 1.2. Correct `AlertTitle` Component Types
- **File:** `frontend/src/components/ui/alert.tsx`
  - **Change:** Update the `React.forwardRef` type from `HTMLParagraphElement` to `HTMLHeadingElement` to match the rendered `<h5>` element.

### 1.3. Simplify `signUpWithEmail` Call
- **File:** `frontend/src/components/auth/SignUpForm.tsx`
  - **Change:** Simplify `data.name || undefined` to just `data.name` as the schema already guarantees the `name` property.

## 2. Revert Out-of-Scope Changes

To keep the pull request focused on the authentication UI revamp, the following unrelated changes will be reverted.

### 2.1. Revert MCP Memory Server Configuration
- **File:** `.mcp.json`
  - **Action:** Remove the `memory` server configuration.

### 2.2. Revert Favicon Addition
- **File:** `frontend/src/app/layout.tsx`
  - **Action:** Remove the `icons` property from the metadata.

### 2.3. Revert Vercel Build Command
- **File:** `frontend/vercel.json`
  - **Action:** Remove the custom `buildCommand` to prevent deployment issues.
