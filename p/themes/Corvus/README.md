# Corvus for FreshRSS

A dark theme inspired by [Corvus AWPG](https://github.com/corvus-gateway/corvus):
charcoal surfaces, blue accents, thin borders, outline icons and compact article rows.
The article reader uses larger system typography, a comfortable measure, quiet metadata,
and consistent styling for quotations, code and tables.

This is an independent FreshRSS theme, not an official Corvus project.
It follows Corvus's dark appearance regardless of the operating system's colour scheme.

## Preview

Screenshots from a running FreshRSS instance with fictional sample articles:

![Article list](thumbs/original.png)

![Article reader](thumbs/reader.png)

[Mobile reader](thumbs/mobile.png)

## Install into an existing instance

1. Copy this entire `Corvus` directory into `FreshRSS/p/themes/Corvus`.
   The resulting path must be `p/themes/Corvus/metadata.json`, with no extra nested folder.
2. Make the directory and its files readable by the web server.
3. Reload FreshRSS, open **Configuration → Display**, choose **Corvus**, and submit.

There is no build step, database migration or extension to enable. A regular PHP installation
normally needs no restart. Theme selection is per user. To revert, select the previous theme.
Keep Origine and base-theme installed: Corvus reuses their layout foundations.

For the closest list appearance, choose **Normal view**, collapse articles, set **Website** to
**Icon and name**, disable thumbnails and summaries, and show the publication date.
For long-form reading, try **Reading view** with **Medium** content width.
Other native article-width, metadata, thumbnail and summary settings remain available.

### Docker

Mount the theme into the existing FreshRSS service. For the official FreshRSS image,
add this entry alongside the service's existing volumes:

```yaml
volumes:
  - ./themes/Corvus:/var/www/FreshRSS/p/themes/Corvus:ro
```

Then apply the Compose change with `docker compose up -d`. This recreates the container
when its configuration changes; retain the existing data volumes. Other images may use
a different application path: check the path inside your container first.

If `p/themes` is already persistently mounted, copy Corvus into that directory and refresh
the page. Copying directly into an unmounted container filesystem is temporary and will
be lost when the container is replaced. Keep a copy of the theme outside the application:
FreshRSS does not officially guarantee preservation of personal themes during upgrades.

## User CSS alternative

If you only have access to the FreshRSS web interface:

1. Select **Origine** under **Configuration → Display**.
2. Enable **User CSS** under **Configuration → Extensions**.
3. Paste the contents of `corvus.css` into its configuration editor and save.
   For an RTL interface, use `corvus.rtl.css` instead.
4. Optionally enable **User JS** and paste `corvus.js` to add the workspace heading.

This provides the palette, typography, spacing, lists and reader styling. The custom outline
icons and wordmark require the installed theme; the CSS alternative retains Origine's icons.
Use one installation method at a time so old User CSS does not override newer theme changes.

## Implementation and compatibility

- Tested against FreshRSS `edge`, commit `6af8ebc`, using PHP 8.4 and Chromium.
- No PHP/template changes, frontend framework or remote fonts. Structural administration improvements require the bundled JavaScript.
- CSS reuses Origine and the common FreshRSS base; theme-specific SVG icons replace native icons.
- The script adds page headers, arranges the existing log forms into a data panel, styles native
  pagination, and identifies empty log messages. Existing POST forms and CSRF protection remain
  intact. Article read/favourite/navigation/loading logic stays with FreshRSS.
- Dynamic articles receive the same styles automatically. CSS supports mobile layouts,
  keyboard focus and reduced-motion preferences. RTL CSS is generated with `rtlcss`.
- New log helper labels are currently English; native FreshRSS labels follow the user language.
- Older FreshRSS releases may have different selectors. Validate against your installed version.
- Publishers' inline styling and third-party extensions may need additional overrides.

Validation covered normal, expanded, reading, global and display-settings views; narrow screens
at 320, 390 and 768 pixels; sidebar controls, read/unread toggles, favourites, dynamic article loading and keyboard navigation.
The generated RTL stylesheet was also checked with a Hebrew interface.
CSS and JavaScript passed the repository's Stylelint and ESLint checks.
The full `make test-all` suite passes with the workspace PHP runtime configured, including
866 PHPUnit tests, PHPCS, PHPStan, frontend linting and spelling checks.

## Administration workspace

Version 1.1 introduces structured administration layouts, uniform form spacing, explicit back/logout
buttons and a logs panel with integrated search and compact pagination. Dates and times use separate
lines; long messages wrap inside the table rather than widening the page.

Empty messages are real records accepted by FreshRSS's log parser. The theme labels them
“No message recorded” and offers a page-local toggle to hide them. Records are never deleted by
this toggle. Pagination still counts the original server records, including hidden empty messages.
If a page contains only empty messages, the toggle starts unchecked so the page remains explainable.
Clearing logs remains the existing explicit FreshRSS action.

The CSS-only installation provides visual overrides; install the full theme or also enable User JS
for the structural administration changes.

## Shortcuts and subscription forms

Version 1.3 groups shortcuts into compact cards with aligned key fields and a shared action bar.
Subscription editing uses a 620-pixel side drawer on desktop and the available width on mobile.
The full-page editor shares the same section cards, labels above fields, switches, consistent
spacing and clearly labelled reference examples. Maintenance and destructive actions stay separate.

A single sticky Submit/Cancel/Remove bar replaces repeated generic action blocks. Native form
submission, reset, keyboard interaction, validation, CSRF fields and removal confirmation remain
in use. Help text is associated with its field for assistive technology. The theme JavaScript
also handles forms loaded through FreshRSS's existing drawer events; update the whole theme,
including `corvus.js`, to get these structural changes.

## Extension catalogue and installation

Version 1.2.1 gives the community catalogue the same panel, toolbar and table styling as the logs
workspace, with client-side search and a visible/total row count. Installed extension rows and
optional Extension Manager buttons use the same spacing and control styles.

The theme does not install executable files. The community
[Extension Manager](https://github.com/featurecreep-cron/freshrss-extensions/tree/main/xExtension-ExtensionManager)
already supplies Install/Update/Remove controls and a server backend that checks administrator
access, POST methods and CSRF tokens. Install it manually once, then enable it in FreshRSS.
No extra User JS installer is necessary and no installer backend is bundled with this theme.

That manager currently supports GitHub repositories. Immediate installation needs a writable
extensions directory; its queue mode requires applying `install-queued.sh` on the server.
Installation/removal changes files shared by all users; per-user enable/disable is separate.
See its own README for installation modes and requirements. The theme does not change those rules.

## Optional settings UI

Corvus 1.2 exposes typography, width and spacing variables for the companion
[Corvus Settings extension](../../../extensions/xExtension-CorvusSettings/README.md).
Install both directories and enable the extension under Configuration → Extensions. Settings are
per user and stored on the server. Disabling it restores the theme defaults; no core changes are needed.

## Development

From the FreshRSS repository root:

```sh
npx stylelint p/themes/Corvus/corvus.css
npx eslint p/themes/Corvus/corvus.js
npx rtlcss p/themes/Corvus/corvus.css p/themes/Corvus/corvus.rtl.css
```

Do not edit `corvus.rtl.css` by hand.

## Credits

Design reference: [Corvus AWPG](https://github.com/corvus-gateway/corvus), by Jikwang Moon.
The theme uses its published dark palette as a reference; it does not bundle Corvus's React components.

Outline icons: [Lucide](https://lucide.dev/), with local stroke-colour/width and favourite-fill
adjustments. See [LICENSE-icons.txt](LICENSE-icons.txt) for the ISC and MIT notices.
The FreshRSS wordmark SVG is specific to this theme.
