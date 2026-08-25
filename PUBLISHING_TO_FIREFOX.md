# Publishing FBI Content Blocker on Firefox Add-ons

This guide publishes the add-on as a public listing on [Firefox Add-ons (AMO)](https://addons.mozilla.org/). Mozilla signs the submitted package and manages installation and updates after publication.

## 1. Prepare the release

1. Work from a clean, reviewed copy of the project and keep the source in version control.
2. Confirm the add-on's name, description, screenshots, and block-page experience accurately describe an independent local content filter. The FBI name and seizure-style image require especially careful non-affiliation wording, rights review, and compliance with Mozilla's Add-on Policies; publication is subject to Mozilla review.
3. Pick a permanent unique add-on ID, for example `fbi-content-blocker@your-domain.example`. Add it under `browser_specific_settings.gecko.id` in `manifest.json`; do not change it after the first public release.
4. Declare the current local-only data practice in the same `browser_specific_settings.gecko` object:

   ```json
   "data_collection_permissions": {
     "required": ["none"]
   }
   ```

5. Increase the `version` in `manifest.json`, update `CHANGES.md`, and make sure the release description matches the change.
6. Publish `PRIVACY_POLICY.md` at a stable public URL, such as the repository's rendered file URL or a project website. Use that URL in the AMO listing. The policy is recommended even though this add-on sends no runtime data.
7. Use `ifenterprise.dev@gmail.com` as the support email unless a different public support channel is established.

## 2. Validate and test

Install [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) if it is not already available, then run from the repository root:

```bash
web-ext lint
python3 -m unittest discover -s tests
node --check background.js
node --check popup/popup.js
node --check fbi/fbi.js
```

In Firefox, open `about:debugging#/runtime/this-firefox`, select **Load Temporary Add-on**, and choose `manifest.json`. Check that all category toggles persist, an enabled-list domain redirects to the local block page, a disabled category no longer blocks, and the blocked-page disclaimer is readable.

## 3. Build the AMO upload

Build from the repository root:

```bash
web-ext build --overwrite-dest --ignore-files \
  'README.md' 'CHANGES.md' 'LICENSE' \
  'PRIVACY_POLICY.md' 'PUBLISHING_TO_FIREFOX.md' \
  'generate_rules.py' 'tests/**' 'fbi/fbi_silkroad.png'
```

This produces a ZIP in `web-ext-artifacts/`. The archive root must contain `manifest.json`, not an extra enclosing project directory.

Include these runtime files in the release package:

```text
manifest.json
background.js
categories.js
disclaimer.js
popup/
fbi/
rules/
```

Do not include `.git/`, `node_modules/`, editor settings, existing ZIP/XPI files, test files, `generate_rules.py`, `README.md`, `CHANGES.md`, `LICENSE`, `PRIVACY_POLICY.md`, `PUBLISHING_TO_FIREFOX.md`, or unused source assets such as `fbi/fbi_silkroad.png`. `web-ext build` excludes common unwanted files; the command above excludes this project's extra non-runtime files. Inspect the generated ZIP before uploading.

If Mozilla requests a source-code submission, upload a separate source archive containing the complete project source, including `generate_rules.py`, `tests/`, documentation, and the instructions required to regenerate the domain lists. Do not include credentials or local build artifacts.

## 4. Submit to AMO

1. Create or sign in to a Firefox Add-ons developer account at [AMO Developer Hub](https://addons.mozilla.org/developers/).
2. Choose **Submit a New Add-on** and select a public, listed submission.
3. Upload the ZIP created by `web-ext build` and resolve every validation error before continuing.
4. Select the supported Firefox platforms and state whether a source archive is required.
5. Complete the listing: concise description, up to two relevant categories, license, support email, privacy-policy URL, and at least the screenshots required by AMO.
6. In **Notes for Reviewers**, explain that the add-on uses `webNavigation` only to compare top-level URLs with bundled local lists, persists only filter preferences using local extension storage, makes no runtime network requests or data transfers, and uses a local extension-generated block page.
7. Submit the version and monitor the developer-account email. Answer review questions with the relevant source locations and reproduction steps.

Mozilla's current [submission guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/), [packaging guide](https://extensionworkshop.com/documentation/publish/package-your-extension/), and [Add-on Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/) are the source of truth if the submission flow changes.

## 5. Publish updates

For every update, retain the same add-on ID, increase `manifest.json`'s version, update the changelog and privacy policy if data practices change, rerun validation and manual testing, rebuild the ZIP, and upload it as a new version on the existing AMO listing. Do not create a new listing for an update.
