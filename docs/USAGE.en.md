# How to use Taskelio

[Português](USAGE.md) · **English**

Taskelio is a browser extension for tracking activities you define. Each counter represents something you do, such as qualifying leads, reviewing profiles or completing tasks.

## Choose a language

Use **Language / Idioma** in the dashboard or popup to select **English** or **Português**. The first launch follows your browser language: Portuguese for Portuguese locales and English otherwise. Your preference is saved in this browser profile and shared between the dashboard and popup. Switching languages does not change counter names, expected values, rules or history.

## 1. Install

1. Download `taskelio-v0.2.0.zip` under **Assets** in the [latest release](https://github.com/blajeen/taskelio/releases/latest).
2. Extract it into a permanent folder containing `manifest.json`.
3. In Chrome, open `chrome://extensions`. In Edge, open `edge://extensions`.
4. Enable **Developer mode**, then click **Load unpacked**.
5. Select the extracted folder, not the ZIP file.
6. Pin Taskelio in the extensions menu, click its icon and choose **Open my dashboard**.

Taskelio is not yet listed in extension stores. Developer mode lets you load this GitHub release. No server or commands are required. A managed work browser may require your IT team to allow unpacked extensions.

## 2. Create a counter

Open your work website in another tab, then click **New counter** in Taskelio.

| Field | What to enter |
| --- | --- |
| Counter name | An activity, such as “Qualified leads”. |
| Website | Your system’s origin, such as `https://mycompany.example.com`. |
| Page path | The part after the domain. Use `/person/*` for matching profile paths or `*` for the whole website. |
| When should it count? | A field change, a page opening or a click. |
| Watched element | Select it visually or enter a CSS selector. Not needed for page visits. |
| Expected value | The value representing completion, such as `Yes` or `Done`. |
| Repeat policy | Whether and when the same item can count again. |
| Daily goal | Optional; leave zero to disable it. |

Your browser asks you to allow access to the website. Each website is authorized separately; Taskelio does not require blanket access to your browsing.

### Select an element

1. Enter **Website** and keep a page from that website open in another tab.
2. Click **Select on page**.
3. The website tab opens with a Taskelio banner.
4. Click the field or button you want to watch. This selection click does not perform the action in your work system.
5. Return to the dashboard. **Watched element** now contains a selector.
6. Click **Test element** to check the number of matches and current value.

Press **Esc** on the website to cancel selection. With several tabs on the same website, selection uses an active tab or the most recently accessed matching tab. Keep only your intended tab open to avoid confusion.

For field changes, aim for a test that finds **one element**. If there are multiple matches, this version watches only the first. Select the value itself rather than a container that also includes labels or other text. Checkboxes use `true` and `false`.

## 3. Examples

### Qualified changes to Yes

- Name: **Qualified leads**.
- Website: your CRM’s actual domain.
- Page path: the real profile-page path, such as `/person/*`.
- Trigger: **A field changes to a value**.
- Element: select the field showing the Qualified value.
- Expected value: **Yes**.
- Repeat policy: **Once per item, ever**.

Save while the field is still `No`. A change to `Yes` should increase the counter. Opening a profile already marked `Yes` does not count as new work. Taskelio must observe the transition; a system that immediately navigates away without displaying the updated field may not be captured. This is a generic configuration example, not a validated Pipedrive integration.

### How many profiles did I view today?

- Name: **Profiles viewed**.
- Trigger: **A page is opened**.
- Page path: only the profile-page path pattern.
- Repeat policy: **Once per item each day**.

Opening the same profile several times in a day counts once. It can count again on the next day. Use **Every occurrence** if you want reopens to count too; the same item must be at least 1.2 seconds apart.

### Clicking Finish

- Name: **Finish clicks**.
- Trigger: **An element is clicked**.
- Element: select your system’s **Finish** button.

This measures clicks even if the operation fails afterward. Prefer a field that changes after success when you need completed-task counts.

## 4. Identify an item

By default, each address is one item: origin + path + fragment after `#`. Query parameters after `?` are not used to distinguish items or match page paths. A system that only uses `?id=123` to identify profiles needs an additional identifier.

Under **Item identity and repeat counting**, enter a selector for an element with a stable ID. Taskelio uses `data-id`, then `href`, then the element’s value/text. Prefer a record ID over text containing personal information. If a configured identifier is missing, the activity does not count.

This version does not track multiple rows individually in the same table. That needs additional features or connectors. Desktop Excel is not supported yet.

## 5. Review and correct

- **Overview:** today’s total, all-time total, average and daily goals.
- **My counters:** edit rules, pause/resume tracking or delete a counter.
- **Add 1:** add a task manually, even when its counter is paused.
- **History → Undo:** exclude a count from totals while preserving the correction record.
- **History → Export CSV:** download all records, including undone ones. The screen shows only the latest 100.

The average includes only days with valid records, not working days. Record dates follow the browser’s timezone at the time of counting. Reverting a field does not subtract a count automatically; use **Undo**. Deleting a counter keeps earlier records. CSV headers and yes/no flags follow your chosen interface language; user-defined names stay unchanged.

## 6. Troubleshooting

| Problem | What to check |
| --- | --- |
| Nothing is counted | Check that the counter is active, website access is allowed and the page path matches. |
| The element test finds zero matches | Open the correct screen, wait for the field to load and select it again. |
| The field was already completed | Make a real transition to the expected value after saving the rule. |
| The item does not count a second time | Check the repeat policy; it may be correctly blocking a duplicate. |
| Different profiles count as one item | Check whether IDs only appear in query parameters and configure a stable item ID. |
| The website layout changed | Edit the rule and select the element again. |
| Tracking stopped after an extension update | Reload the work website tab too. |
| The element is inside an iframe | This version watches only the main page. |

If the problem persists, [open an issue](https://github.com/blajeen/taskelio/issues) with fictional data and reproduction steps. Do not publish private screenshots, customer information or credentials.

## 7. Data and updates

Your data stays in your local browser profile, with no cross-device sync. Uninstalling Taskelio or deleting the browser profile can remove history and rules. Export CSV periodically; it is a report and cannot restore your configuration.

To update without uninstalling, extract the new version into the same folder, then click **Reload** on the browser’s extensions page. Reload your work website tabs too. See the [README](../README.en.md#privacy-and-limitations) for privacy details and other limits.
