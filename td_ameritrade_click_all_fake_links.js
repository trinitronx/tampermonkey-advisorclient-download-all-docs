'use strict';

// String.toProperCase() function
// returns the string in Proper Case
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

// Get element by XPath: path
// returns XPathResult of ORDERED_NODE_ITERATOR_TYPE
// Note: This requires iterateNext() to be called on the result,
//   and the DOM must NOT be mutated during iteration.
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
}

// Get element by XPath: path
// returns XPathResult of ORDERED_NODE_SNAPSHOT_TYPE
function getElementSnapshotByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
}

// Get full account number from page's select -> option element
// returns the first selected element without 'All' & non-null value,
//   or the first candidate element found if none was selected
function getAccountNumber() {
    // Both statements & transactions pages have different ancestor elements: (app-statements|app-trade-confirmations)
    // But we can't use XPath 2.0 constructs like the pipe | operator here.
    // const account_select_el_xpath = "//(app-statements|app-trade-confirmations)/*//select[@name=\"account\" or @data-account-filter]/option[2]"; // 2nd child <option> el has value=accountNumber
    const account_select_el_xpath = "//select[@name=\"account\" or @data-account-filter or @name=\"account-selector\" or @data-account-selector]/option";  // Don't trust ordering of child <option>, find first one manually
    var account_select_option_els = getElementSnapshotByXpath(account_select_el_xpath);
    // console.log('Looping over account select->option elements snapshot: ' + account_select_option_els);

    var first_candidate_el = null;
    for (var i = 0; i < account_select_option_els.snapshotLength; i++) {
        var option_node = account_select_option_els.snapshotItem(i);
        // console.log('Considering option node:');
        // console.log(option_node);
        // console.log('If Statement Debug: has value: ' + (option_node.hasAttribute('value') && option_node.value != ''));
        // console.log('If Statement Debug: innerText: ' + option_node.innerText);
        if (option_node.hasAttribute('value') && option_node.value != '' && option_node.innerText != 'All') {
            // console.log('Has value: ' + option_node.value);
            // console.log('Has innerText: ' + option_node.innerText);
            // console.log('Candidate element: ' + option_node);
            if (first_candidate_el == null) {
                first_candidate_el = option_node;
                // console.log('First Candidate: ' + first_candidate_el);
            }
            if (option_node.selected) {
                // console.log('Returning selected candidate: ' + option_node);
                return option_node.value;
            }
        }
        // else {
        //     console.log(option_node);
        //     console.log('value is null or innerText == All\nNot an account_number candidate element');
        // }
    }
    // Return first candidate if none were selected
    if (first_candidate_el != null && first_candidate_el.hasAttribute('value')) {
        // console.log('No option elements were marked selected...');
        // console.log('Returning first candidate: ' + first_candidate_el);
        return first_candidate_el.value;
    } else {
        // no valid canidates found
        return null;
    }
}

// Get all Trade Confirmation Page filename data from node (a "fake table" row div)
// returns the generated destination filename
// Note: User must run the downloaded rename script manually due to browser security restrictions
function getTradeData(node) {
    var trade_date_xpath = "child::*/*/*/span[@data-trade-date]";
    var account_description_xpath = "child::*/*/*/span[@data-mobile-account-description]";
    var account_id_xpath = "child::*/*/*/span[@data-mobile-account-id]";
    var trade_action_symbol_xpath = "child::*/*/*/span[@data-mobile-action-symbol]";
    var trade_date = document.evaluate(trade_date_xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
    var account_description = document.evaluate(account_description_xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
    var account_id = document.evaluate(account_id_xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
    var trade_action = document.evaluate(trade_action_symbol_xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;

    var full_account_number = getAccountNumber();
    var abbrev_account_id = '…' + full_account_number.substr(-4, 4); // page content has: '…' + last 4 digits
    // if (account_id.includes('…') && account_id == abbrev_account_id) { console.log('MATCHED'); } else { console.log('NO MATCH'); }

    // Replace abbreviated account ID number with matching full number
    if (full_account_number != null && account_id.includes('…') && account_id == abbrev_account_id) {
        account_id = full_account_number;
    } else {
        // If we found no full account number, just make it safe for use in filenames
        account_id = account_id.replace('…', 'xx');
    }
    trade_action = trade_action.replace(':', '').toUpperCase();
    // console.log(trade_date);
    var date_obj = new Date(Date.parse(trade_date));
    var yyyy = date_obj.getFullYear();
    var mm = date_obj.getMonth() + 1; // month is zero-based
    var dd = date_obj.getDate(); // day is Date.getDate()... wtf JavaScript!?

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formatted_trade_date = yyyy + '-' + mm + '-' + dd;

    var name_flip = account_description.split(', ');
    var user_name = name_flip[1] + ' ' + name_flip[0];
    // construct string filename based on trade data
    var filename_string = formatted_trade_date + ' - ' + trade_action + ' - ' + account_id + ' - ' + user_name.toProperCase() + ' IRA TD Ameritrade.pdf';
    // console.log(filename_string);
    return filename_string;
}

// Get all Statement Page filename data from node (a "fake table" row div)
// returns a tuple Array of: [source filename,  generated destination filename]
// Note: User must run the downloaded rename script manually due to browser security restrictions
function getStatementData(node) {
    var statement_date_xpath = "child::*/*/*/span[@data-document-description]";
    var account_description_xpath = "child::*/*/*/span[@data-mobile-account-description]";
    var account_id_xpath = "child::*/*/*/span[@data-mobile-account-id]";
    var statement_date = document.evaluate(statement_date_xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
    var account_description = document.evaluate(account_description_xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
    var account_id = document.evaluate(account_id_xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;

    var full_account_number = getAccountNumber();
    var abbrev_account_id = '…' + full_account_number.substr(-4, 4); // page content has: '…' + last 4 digits
    // if (account_id.includes('…') && account_id == abbrev_account_id) { console.log('MATCHED'); } else { console.log('NO MATCH'); }

    if (full_account_number != null && account_id.includes('…') && account_id == abbrev_account_id) {
        account_id = full_account_number;
    } else {
        // If we found no full account number, just make it safe for use in filenames
        account_id = account_id.replace('…', 'xx');
    }
    // console.log(statement_date);
    var date_obj = new Date(Date.parse(statement_date));
    var yyyy = date_obj.getFullYear();
    var shortMonthName = date_obj.toLocaleString('default', { month: 'short' }); // 3-letter month abbrev
    var dd = date_obj.getDate(); // day is Date.getDate()... wtf JavaScript!?

    if (dd < 10) dd = '0' + dd;

    var formatted_statement_date = yyyy + ' ' + shortMonthName;
    // console.log(formatted_statement_date);

    var name_flip = account_description.split(', ');
    var user_name = name_flip[1] + ' ' + name_flip[0];
    // construct string filename based on statement date
    // XXXXXXXXX 2023 Apr Statement.pdf = original name
    // XXXXXXXXX 2023 Apr Statement - Barney Rubble IRA TD Ameritrade.pdf = destination name
    var src_filename_string = account_id + ' ' + formatted_statement_date + ' Statement.pdf';
    var dest_filename_string = account_id + ' ' + formatted_statement_date + ' Statement - ' + user_name.toProperCase() + ' IRA TD Ameritrade.pdf';
    // console.log(dest_filename_string);
    return [src_filename_string, dest_filename_string];
}

// Get Transaction Confirmation page child "fake" VIEW link of node
// Returns the "clickable" "<a>" element
function getChildLink(node) {
    var clickable_link_xpath = 'child::div[@col-id="VIEW"]/*/*/a[contains(@class, "clickable")]';
    var clickable_link = document.evaluate(clickable_link_xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    return clickable_link;
}

// Get Statement Page child "fake" DOWNLOAD_LINK of node
// Returns the "clickable" "<a>" element
function getStatementChildLink(node) {
    var clickable_link_xpath = 'child::div[@col-id="DOWNLOAD_LINK"]/*/*/a[contains(@class, "clickable")]';
    var clickable_link = document.evaluate(clickable_link_xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    return clickable_link;
}

// Get all fake "a" links with no href, just class "clickable" w/onclick event handler
function getAllTDAmeritradeFakeLinks() {
    var xpath = '//a[contains(@class, "clickable")]';
    var filtered_links = getElementByXpath(xpath);

    while (node = filtered_links.iterateNext()) {
        console.log(node);
    }
}

// Get all Trade Confirmation page fake "table" row divs
// Returns an XPathResult of ORDERED_NODE_SNAPSHOT_TYPE
function getAllTDAmeritradeDocRows() {
    // Find all fake table row divs containing a span with data-trade-id
    // Then, walk back up the DOM tree until we get to that same top-level row div
    // This div contains both the fake columns with trade info, and the fake onclick link to PDF launcher JS crap
    var xpath = '//div[@role = "row" and @row-index]//span[@data-trade-date]/../../../../.';
    var doc_rows = getElementSnapshotByXpath(xpath);
    return doc_rows;
}

// Get all Statement page fake "table" row divs
// Returns an XPathResult of ORDERED_NODE_SNAPSHOT_TYPE
function getAllTDAmeritradeStatementRows() {
    // Find all fake table row divs containing a span with data-trade-id
    // Then, walk back up the DOM tree until we get to that same top-level row div
    // This div contains both the fake columns with trade info, and the fake onclick link to PDF launcher JS crap
    var xpath = '//div[@role = "row" and @row-index]//span[@data-document-description]/../../../../.';
    var stmt_rows = getElementSnapshotByXpath(xpath);
    return stmt_rows;
}

// Generate a file containing text and download it as if it were a normal web request
// Note: This mutates the DOM, so must be done **after** all XPathResult.ORDERED_NODE_ITERATOR_TYPE processing
async function generate_text_download(filename, text) {
    var element = document.createElement('a');
    element.textContent = "    ";
    element.setAttribute('style', 'font-size: 76pt; color: magenta;');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    const click_promise = function (el) {
        return new Promise(function (resolve) {
            element.click();
            resolve('Trying clicked the script download link successfully!');
        });
    };

    await click_promise(element); // avoid file download ordering races so renames work properly

    document.body.removeChild(element);
}

// Find and click on all Trade Confirmations pdf view buttons
// This function assumes the user has configured the browser to open PDFs as downloads rather than viewing in browser tabs
// Note that we must wait for each one to finish to avoid race conditions in file name ordering and writing (I/O)
// Therefore, it's rather slow and also generates a lot of open about:blank tabs
async function downloadAllDocs() {
    var snapshot_doc_rows = getAllTDAmeritradeDocRows();
    var post_process_script_cmds = ['#!/bin/sh', '']; // first element empty so console log lines easy to copy & paste later!
    for (var i = 0; i < snapshot_doc_rows.snapshotLength; i++) {
        var node = snapshot_doc_rows.snapshotItem(i);
        // console.log(node);

        // click link, assume 'document.pdf' is row-index 0
        getChildLink(node).click();
        await new Promise(r => setTimeout(r, 1000)); // avoid file download ordering races so renames work properly
        // console.log(getChildLink(node));
        var row_index = node.getAttribute('row-index');
        var filename_src_prefix = 'document';
        var filename_src_ext = '.pdf';
        var filename_src_index = (row_index == '0') ? '' : ' (' + row_index + ')';
        var filename_dest = getTradeData(node);
        // output appropriate file move command for post-processing
        var move_command = "mv '" + filename_src_prefix + filename_src_index + filename_src_ext + "'  '" + filename_dest + "'";
        post_process_script_cmds.push(move_command);
    }
    var script_filename = 'rename_files.sh';
    console.log(post_process_script_cmds.join('\n'));
    console.log('INFO: Please run all above commands to rename the files.');
    console.log('INFO: Above commands are included in the downloaded convenience script: ' + script_filename);
    generate_text_download(script_filename, post_process_script_cmds.join('\n'));
}

// Find and click on all statement download links
// Filenames are properly handled thanks to this page being correctly designed
function downloadAllStatements() {
    var snapshot_doc_rows = getAllTDAmeritradeStatementRows();
    var post_process_script_cmds = ['#!/bin/sh', '']; // first line empty so console log lines easy to copy & paste later!
    for (var i = 0; i < snapshot_doc_rows.snapshotLength; i++) {
        var node = snapshot_doc_rows.snapshotItem(i);

        // console.log(node);

        // click link, assume '.pdf' file format
        getStatementChildLink(node).click();
        console.log(getStatementChildLink(node));
        var filename_tuple = getStatementData(node);
        var filename_src = filename_tuple[0];
        var filename_dest = filename_tuple[1];
        // output appropriate file move command for post-processing
        var move_command = "mv '" + filename_src + "'  '" + filename_dest + "'";
        post_process_script_cmds.push(move_command);
    }
    var script_filename = 'rename_files.sh';
    console.log(post_process_script_cmds.join('\n'));
    console.log('INFO: Please run all above commands to rename the files.');
    console.log('INFO: Above commands are included in the downloaded convenience script: ' + script_filename);
    generate_text_download(script_filename, post_process_script_cmds.join('\n'));
}

function __main__() {
    const trade_confirmations_page_xpath = '//app-trade-confirmations';
    const statements_page_xpath = '//app-statements';
    var trade_confirmations_page_el = document.evaluate(trade_confirmations_page_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    var statements_page_page_el = document.evaluate(statements_page_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (trade_confirmations_page_el) {
        downloadAllDocs();
    } else if (statements_page_page_el) {
        downloadAllStatements();
    }
}

__main__();
