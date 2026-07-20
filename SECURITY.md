# Security Policy

## Supported Versions

This project is pre-1.0 (currently `0.x`). Only the latest published version receives security fixes — there are no older maintained release branches yet.

| Version  | Supported          |
| -------- | ------------------ |
| latest   | :white_check_mark: |
| < latest | :x:                |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, use GitHub's [private vulnerability reporting](https://github.com/FernandoFranco/google-map-grids/security/advisories/new) for this repository (find it under the **Security** tab → **Report a vulnerability**). This lets you share details privately with the maintainer and get a fix out before the issue is publicly disclosed.

Please include as much detail as you can:

- A description of the vulnerability and its potential impact.
- Steps to reproduce (a minimal code sample or Storybook story is ideal).
- The version of `google-map-grids` affected.

You should expect an initial response within a few days. If the report is confirmed, a fix will be prioritized and a new version published; you'll be credited in the advisory unless you prefer otherwise.

## Scope

This policy covers the `google-map-grids` package itself. Vulnerabilities in its dependencies (e.g. `@googlemaps/js-api-loader`) should be reported to those projects directly, though we're happy to help coordinate if needed.
