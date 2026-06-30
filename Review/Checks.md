# Enterprise-Grade Full Codebase Audit Prompt

Act as a **Principal Software Engineer**, **Staff Engineer**, **Security Engineer**, **Performance Engineer**, **DevOps Engineer**, **Solutions Architect**, and **Technical Auditor**.

Your mission is to perform a deep, exhaustive audit of this entire repository.

Do not stop at surface-level observations.

Traverse the entire repository recursively and inspect:

- Source code
- Backend
- Frontend
- Database layer
- APIs
- Authentication system
- Authorization logic
- Infrastructure
- Docker files
- CI/CD pipelines
- Configuration files
- Environment files
- Middleware
- Services
- Controllers
- Models
- Utilities
- Hooks
- Components
- Tests
- Deployment configuration
- Caching layers
- Queues
- Background jobs
- Monitoring setup
- Logging setup

For every issue found:

- Mention exact file path
- Mention function/class/component name
- Mention line numbers whenever possible
- Explain impact
- Explain risk
- Suggest precise fixes
- Provide improved code examples

---

# Phase 1: Repository Understanding

## Project Overview

Analyze and document:

- Business purpose
- Application goal
- Core features
- User personas

## Architecture Analysis

Create a detailed architecture report covering:

- Overall architecture pattern
- Monolith vs Microservices
- Layered architecture
- Event-driven architecture
- Domain boundaries
- Data flow
- Request lifecycle

## Tech Stack

Identify:

- Languages
- Frameworks
- Libraries
- Databases
- Queues
- Caching systems
- Search engines
- Cloud services

## Application Flow

Explain:

- Authentication flow
- Authorization flow
- API flow
- Database flow
- User flow
- State management flow
- Deployment flow

### Deliverable

Generate a complete architecture summary before continuing.

---

# Phase 2: Duplicate Code Detection

Find all forms of duplicate code.

## Detect

### Exact Duplicates

Functions copied directly.

### Near Duplicates

Functions with minor modifications.

### Logical Duplicates

Different implementations solving the same problem.

### Duplicate Components

Frontend duplication.

### Duplicate Services

Repeated service logic.

### Duplicate Queries

Repeated database queries.

### Duplicate API Calls

Repeated API request patterns.

### Duplicate Validation

Repeated validation logic.

### Duplicate Utilities

Repeated helper functions.

For every duplicate:

```text
File:
Function/Class:
Duplicate Of:
Reason:
Suggested Refactor:
Potential Lines Removed:
Complexity Reduction:
Maintenance Benefit:
```

Generate a consolidated duplicate-code report.

---

# Phase 3: Security Audit

Perform a complete security review.

Use OWASP Top 10 and production-grade security standards.

## Authentication Review

Check for:

- Missing authentication
- JWT vulnerabilities
- Session vulnerabilities
- Weak token validation
- Token leakage
- Refresh token issues
- Password handling issues

## Authorization Review

Check for:

- Missing role validation
- Permission bypass
- Broken access control
- Ownership validation issues
- Privilege escalation

## API Security

Check for:

- IDOR
- BOLA
- Mass assignment
- Excessive data exposure
- Missing rate limiting
- Missing throttling
- Missing validation

## Injection Vulnerabilities

Find:

- SQL Injection
- NoSQL Injection
- Command Injection
- LDAP Injection
- Template Injection
- GraphQL Injection

## XSS

Find:

- Stored XSS
- Reflected XSS
- DOM XSS

## CSRF

Review all mutation endpoints.

## File Upload Security

Check:

- File validation
- MIME validation
- Virus scanning
- Path traversal
- Arbitrary uploads

## Secret Management

Find:

- Hardcoded secrets
- API keys
- Tokens
- Credentials
- Private keys

## Dependency Security

Review:

- Vulnerable packages
- Deprecated packages
- Outdated dependencies

For every issue:

```text
Severity:
Critical / High / Medium / Low

Location:

Description:

Attack Scenario:

Business Impact:

Recommended Fix:

Code Example:
```

---

# Phase 4: Backend Review

## API Design

Evaluate:

- REST principles
- Endpoint naming
- Resource design
- Pagination
- Filtering
- Sorting
- Versioning

## Database Review

Check:

- N+1 queries
- Missing indexes
- Inefficient joins
- Repeated queries
- Transaction issues
- Locking issues
- Data consistency

## Service Layer

Review:

- Business logic separation
- Reusability
- Coupling

## Error Handling

Find:

- Silent failures
- Generic exceptions
- Missing logging
- Missing retries

## Scalability

Review:

- Blocking operations
- Heavy DB calls
- Expensive loops
- Inefficient algorithms

### Deliverable

Generate a backend scorecard.

---

# Phase 5: Frontend Review

## React / Next.js Review

Check:

- Unnecessary re-renders
- Missing memoization
- Hydration issues
- Server/client boundary issues
- Hook misuse
- State management issues

## Accessibility Review

Check:

- ARIA labels
- Keyboard navigation
- Semantic HTML
- Screen reader support

## UX Review

Check:

- Loading states
- Error states
- Empty states
- Responsive design

## Frontend Security

Check:

- Client-side secrets
- Unsafe localStorage usage
- Token leakage
- XSS vulnerabilities

### Deliverable

Generate frontend scorecard.

---

# Phase 6: Performance Audit

## Backend Performance

Find:

- Slow queries
- Missing indexes
- Large payloads
- Memory leaks
- CPU bottlenecks
- Blocking I/O

## Frontend Performance

Find:

- Large bundles
- Dead code
- Heavy dependencies
- Missing lazy loading
- Image optimization issues

## Network Performance

Check:

- Redundant requests
- Waterfall requests
- Missing caching headers
- Large payload transfers

For every issue:

```text
Current Impact:

Root Cause:

Suggested Fix:

Expected Improvement:

Priority:
```

---

# Phase 7: Code Quality Review

## Clean Code

Identify:

- Long functions
- Long files
- God classes
- God components
- Deep nesting
- Magic numbers
- Poor naming

## Dead Code

Find:

- Unused functions
- Unused imports
- Unused variables
- Unreachable code

## SOLID Violations

Review:

- Single Responsibility Principle
- Open Closed Principle
- Liskov Substitution Principle
- Interface Segregation Principle
- Dependency Inversion Principle

## Design Pattern Review

Identify:

- Misused patterns
- Missing abstractions
- Tight coupling

### Deliverable

Generate maintainability report.

---

# Phase 8: Testing Audit

## Unit Tests

Check:

- Coverage
- Missing tests
- Weak assertions

## Integration Tests

Review:

- API tests
- Service tests
- Database tests

## E2E Tests

Review:

- User flows
- Critical paths

## Test Quality

Check:

- Flaky tests
- Mock abuse
- Missing edge cases

### Deliverable

Generate testing score:

```text
Coverage:
Reliability:
Maintainability:
Confidence:
```

---

# Phase 9: DevOps & Infrastructure Audit

## Docker Review

Check:

- Multi-stage builds
- Image size
- Security practices

## CI/CD Review

Check:

- Build pipelines
- Security scanning
- Test execution
- Deployment process

## Cloud Review

Check:

- Cost optimization
- Security groups
- IAM permissions
- Storage configuration

## Observability

Review:

- Logging
- Metrics
- Monitoring
- Alerting
- Tracing

## Reliability

Review:

- Retry mechanisms
- Circuit breakers
- Health checks
- Backup strategy

### Deliverable

Generate DevOps scorecard.

---

# Phase 10: Architecture & Scalability Review

## Scalability Analysis

Can this application handle:

- 1,000 users
- 10,000 users
- 100,000 users
- 1,000,000 users

Identify bottlenecks.

## Availability

Review:

- Single points of failure
- Failover strategy
- Redundancy

## Reliability

Review:

- Recovery strategy
- Disaster recovery
- Data durability

## Maintainability

Review:

- Ease of onboarding
- Complexity
- Documentation

## Future Readiness

Evaluate:

- AI readiness
- Multi-tenancy readiness
- Internationalization readiness
- Mobile readiness

---

# Technical Debt Report

Classify all issues into:

## Critical

Must fix immediately.

## High Priority

Fix this sprint.

## Medium Priority

Fix this month.

## Low Priority

Nice-to-have improvements.

Rank by:

- Business Impact
- Engineering Impact
- Security Impact
- Performance Impact

---

# Refactoring Roadmap

## Quick Wins (1–2 Hours)

Highest ROI fixes.

## Short-Term Improvements (1–3 Days)

Important improvements.

## Medium-Term Refactors (1–2 Weeks)

Structural improvements.

## Long-Term Refactors (1–4 Weeks)

Architecture improvements.

---

# Final Deliverables

## 1. Executive Summary

```text
Architecture Score: /10
Security Score: /10
Performance Score: /10
Frontend Score: /10
Backend Score: /10
Testing Score: /10
DevOps Score: /10
Scalability Score: /10
Maintainability Score: /10

Overall Production Readiness Score: /10
```

## 2. Repository Architecture Diagram

Create a textual architecture diagram.

## 3. Security Vulnerability Report

| Severity | File | Line | Vulnerability | Impact | Fix |
|----------|------|------|--------------|--------|-----|

## 4. Duplicate Code Report

| File | Function | Duplicate Of | Refactor |
|--------|----------|-------------|----------|

## 5. Performance Report

Top 20 performance issues ranked by impact.

## 6. Backend Findings

Detailed report.

## 7. Frontend Findings

Detailed report.

## 8. Database Findings

Detailed report.

## 9. Infrastructure Findings

Detailed report.

## 10. Technical Debt Report

Prioritized list.

## 11. Refactoring Roadmap

Step-by-step implementation plan.

## 12. Production Launch Readiness

Provide:

- Launch blockers
- High-risk areas
- Recommended fixes before production
- Recommended fixes after production

## 13. AI Agent Summary

Generate:

### Top 10 Critical Issues

### Top 20 Quick Wins

### Estimated Technical Debt

### Estimated Refactor Effort

### Recommended Execution Order

### Final Verdict

Choose one:

- Not Production Ready
- Production Ready with Risks
- Production Ready
- Enterprise Grade

---

# Critical Instructions

- Inspect every file recursively.
- Do not skip configuration files.
- Do not skip infrastructure files.
- Do not skip hidden files.
- Do not provide generic observations.
- Support every finding with evidence.
- Cite exact file paths and line numbers.
- Show before-and-after code for major issues.
- Prioritize findings by risk and business impact.
- Think like a Principal Engineer conducting a production readiness review for a mission-critical system.