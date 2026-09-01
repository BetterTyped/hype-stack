# README graphics

`slides.html` holds the four README slides in the house slide style (same CSS as `hype-stack-www/marketing/mockups/*/slides`). One section per PNG in the parent folder:

| section id | file |
| --- | --- |
| `#deploy` | `cli-deploy.png` |
| `#compose` | `cli-compose.png` |
| `#clients` | `five-clients.png` |
| `#mcp` | `mcp-server.png` |

To re-render after an edit, open `slides.html` in Playwright's Chromium and screenshot each `section.slide` at `deviceScaleFactor: 2`. Fonts (Inter, JetBrains Mono) load from Google Fonts at render time.
