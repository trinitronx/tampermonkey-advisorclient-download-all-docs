# tampermonkey-advisorclient-download-all-docs

Historical account records downloader userscript for `advisorclient.com`

## Why Does this Exist?

- TD Ameritrade accounts are under forced migration to Schwab
- Web UI pages for document download are woefully inadequate
- Tedious to download each Statement and Trade Confirmation by hand
- Deadline to access historical records is Friday of Labor Day weekend 2023

Message from TD Ameritrade's "`advisorclient.com`" portal:

> • Access to your account on TD Ameritrade platforms ends Friday,
>   Sep 01, at 8:30 p.m. ET
> • We will automatically and securely move your account information and
>   assets over the weekend
> • Use your Schwab Login ID and password to access the Schwab Alliance
>   client portal beginning 5 a.m. ET, Sep 05
> 
> Want to know more?
> To learn what to expect, visit the Schwab Transition Center for key dates,
> answers to top questions, and more.
> 
> [Go to the Transition Center][td-ameritrade-transition-center]

## Requirements

- A supported web browser
- An account on `advisorclient.com` (e.g. TD Ameritrade)

## Installing

### Manual

Add to Google Chrome via "snippets":

- Open "`More Tools -> Developer Tools`"
  (<kbd>Ctrl</kbd>`+`<kbd>Shift</kbd>`+`<kbd>I</kbd>)
- Open the "`Sources`" tab
- In the left pane, Open the "`Snippets`" tab
- Click "`+ New Snippet`"
- Name the snippet something (e.g. `td_ameritrade_click_all_fake_links.js`)
- Copy and paste code from `td_ameritrade_click_all_fake_links.js`
  into the file editor pane
- Follow Usage instructions, and when ready right click and select "`Run`"

## Usage

- Login to your account at `advisorclient.com`
- Navigate to either of the following pages:
  - ["Documents -> Statements"][1]
  - ["Documents -> Trade Confirmations"][2]
- Select how to filter the results with the dropdown menus
- Run this userscript to automatically download all displayed PDF files
- Recommended: Run the generated `./rename_files.sh` script to rename the
downloaded files appropriately.
  For example: This will rename
  Trade Confirmations `document*.pdf` files according to their trade data.

Example of generated rename script:

```sh
#!/bin/sh

mv 'document.pdf' '2018-10-31 - SELL ABCDX - XXXXXXXXX - Barney Rubble IRA TD Ameritrade.pdf'
mv 'document (1).pdf' '2018-10-31 - SELL DEFGX - XXXXXXXXX - Barney Rubble IRA TD Ameritrade.pdf'
mv 'document (2).pdf' '2018-10-24 - SELL HIJKX - XXXXXXXXX - Barney Rubble IRA TD Ameritrade.pdf'
mv 'document (3).pdf' '2018-10-16 - SELL LMNOX - XXXXXXXXX - Barney Rubble IRA TD Ameritrade.pdf'
mv 'document (4).pdf' '2018-10-11 - SELL PQRSX - XXXXXXXXX - Barney Rubble IRA TD Ameritrade.pdf'
```

[td-ameritrade-transition-center]: https://www.advisorclient.com/navigationHub
[1]: https://www.advisorclient.com/documents/statements
[2]: https://www.advisorclient.com/documents/trade-confirmations
