/**
 * Inserts a string at the specified position found by the search string.
 *
 * @param {string} search - The search string to find the insertion point.
 * @param {string} insert - The string to insert.
 * @returns {string} - The updated string with the inserted content.
 */
/*
String.prototype.insertString = function(search, insert) {
    const insertionPoint = this.indexOf(search) + search.length;

    // Ensure the search string is found before proceeding
    if (insertionPoint === search.length - 1) {
        console.error('Search string not found in the string.');
        return;
    }

    const updatedString = 
        this.substring(0, insertionPoint) + 
        insert + 
        this.substring(insertionPoint);

    return updatedString;
};
*/
/**
 * Inserts a string at the specified position found by the search string.
 * 
 * @param {string} string - The string to insert in.
 * @param {string} search - The search string to find the insertion point.
 * @param {string} insert - The string to insert.
 * @returns {string} - The updated string with the inserted content.
 */
export function insertString(str ,search, insert) {
    const insertionPoint = str.indexOf(search) + search.length;

    // Ensure the search string is found before proceeding
    if (insertionPoint === search.length - 1) {
        console.error('Search string not found in the string.');
        return;
    }

    const updatedString = 
        str.substring(0, insertionPoint) + 
        insert + 
        str.substring(insertionPoint);

    return updatedString;
};