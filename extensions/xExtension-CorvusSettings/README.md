# Corvus Settings

A per-user FreshRSS extension for the Corvus theme (version 1.2 or newer).
Preferences are stored on the server with your account, so they apply across browsers and devices.
No FreshRSS core changes are needed.

## Install

1. Update the **whole** Corvus theme directory, including `corvus.css`, `corvus.rtl.css` and `corvus.js`.
2. Copy `xExtension-CorvusSettings` into your FreshRSS `extensions/` directory.
   The resulting path must be `extensions/xExtension-CorvusSettings/metadata.json`.
3. In **Configuration → Extensions**, enable **Corvus Settings** under user extensions.
4. Open its gear icon, choose your preferences and submit.

Both directories must be readable by the web server. FreshRSS's data directory must remain writable.
For Docker, preserve the extension directory with a bind mount or persistent volume, as with the theme.
For the official FreshRSS image the target is `/var/www/FreshRSS/extensions/xExtension-CorvusSettings`.
Adding a new Compose mount requires applying the Compose configuration.

## Controls

| Area | Settings |
| --- | --- |
| Interface | Font family, base font size, page side margins, section spacing |
| Reader | Body font, font size, line spacing, maximum width, inner side padding |
| Subscriptions | Sidebar width, font size, category/feed minimum row height, side padding |
| Article list | Minimum row height |

Fonts are presets using installed system fonts and fallbacks. The extension downloads no fonts.
The interface size changes the base interface text and buttons; labels, badges and metadata retain
some deliberate smaller sizes. Row heights are minimums: large text, summaries or thumbnails may
require taller rows.

A reader width of **0** follows FreshRSS's **Content width** setting. Otherwise use 480–1800 pixels.
A sidebar row height of **0** keeps the theme defaults. Otherwise use 24–56 pixels.
Mobile layouts still cap the sidebar and article padding to the viewport.
Default values emit no overrides, preserving the theme's responsive defaults.

**Restore theme defaults** resets every preference. Disabling the extension stops loading its
stylesheet while retaining preferences. Other themes are unaffected by the Corvus-scoped rules.
Existing User CSS may override these settings, especially rules containing `!important`.

## Storage and validation

Preferences use FreshRSS's native per-user extension configuration API. A generated stylesheet is
stored in `data/users/USERNAME/extensions/CorvusSettings/style.css` and served through FreshRSS's
user-authenticated extension endpoint. A content hash prevents stale styling after rapid saves.

Inputs are validated against font presets, numeric bounds and allowed steps. Invalid submissions
leave the previous configuration intact; arbitrary CSS and remote font URLs are not accepted.
The form uses FreshRSS's normal CSRF protection. Interface strings use the extension translation
system; the initial translation is English.

## Development and validation

Run from the FreshRSS repository root:

```sh
php -l extensions/xExtension-CorvusSettings/extension.php
php -l extensions/xExtension-CorvusSettings/configure.phtml
php extensions/xExtension-CorvusSettings/tests/settings.php
npx stylelint 'p/themes/Corvus/*.css'
npx eslint p/themes/Corvus/corvus.js
```

The PHP validation test covers defaults, bounds, steps, font presets, CSS injection rejection and
scoped stylesheet generation. Browser checks cover native save/reset, fresh-session persistence,
account isolation, user-specific asset access, actual font/width/row geometry and mobile layout.
The extension PHP files passed PHPCS and PHPStan checks. The full core `make test-all` suite also
passes, including 866 PHPUnit tests.

## Future community publication — not submitted

The public [FreshRSS/Extensions](https://github.com/FreshRSS/Extensions) repository distinguishes
community listings from extensions maintained in its own tree. No submission is made by this work.

For a **community listing**, first extract this extension into a small, separately versioned public
repository with a README, licence and `metadata.json`. Document the required Corvus theme version
and supported FreshRSS versions. Then propose adding that repository to the catalogue's
[`repositories.json`](https://github.com/FreshRSS/Extensions/blob/main/repositories.json) and the
community section of its README. Maintainers review the submission and generate `extensions.json`.
Do not hand-edit the generated catalogue.

Do not list the entire FreshRSS fork as an extension repository: the catalogue generator searches
recursively for `metadata.json`, which would also collect unrelated theme and bundled metadata.
A dedicated repository avoids that problem and gives the extension a stable installation source.

For **official inclusion**, a separate PR can propose the `xExtension-CorvusSettings/` directory
itself to FreshRSS/Extensions, with its tests, licence, documentation, translations and an ongoing
maintenance commitment. Inclusion and review requirements are decided by that project's maintainers.

## Licence

GNU Affero General Public License, version 3. See [LICENSE](LICENSE).
