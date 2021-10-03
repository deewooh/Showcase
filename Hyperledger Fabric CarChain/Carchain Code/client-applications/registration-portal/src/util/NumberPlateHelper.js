
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Used by registration-portal to format the Number Plate.
 * i.e. transform an Array of four Numbers to the String representation.
 * @param {Array} regoArr An Array of four Numbers e.g. [0,1,2,123]
 * @returns {String} The String representation e.g. 'ABC123'
 */
function formatRego(regoArr) {
    let letterGroup = letters[regoArr[0]] + letters[regoArr[1]] + letters[regoArr[2]];
    let numberGroup = String(regoArr[3]).padStart(3, '0');
    return letterGroup + numberGroup;
}

/**
 * Used by registration-portal to calculate the next number plate in the sequence.
 * 
 * Number Plates are stored as an Array of four Numbers.
 * 
 * The first cell represents the first letter in the number plate.
 * The second cell represents the second letter in the number plate.
 * The third cell represents the third letter in the number plate.
 * The last cell represents the three numbers in the number plate.
 * 
 * For example:
 * [0,0,1,9] represents 'AAB009'
 * 
 * Incrementing [1,25,25,999] ('AZZ999') would return [2,0,0,0] ('BAA000')
 * 
 * @param {Array} regoArr An Array of Numbers e.g. [0,0,0,0]
 * @returns {Array} An Array of Numbers e.g. [0,0,0,1]
 */
function incrementRego(regoArr) {

    let first = regoArr[0];
    let second = regoArr[1];
    let third = regoArr[2];
    let last = regoArr[3];
    last++;

    if (last > 999) {
        regoArr[3] = 0;
        third++;
        if (third > 25) {
            regoArr[2] = 0;
            second++;
            if (second > 25) {
                regoArr[1] = 0;
                first++;
                if (first > 25) {
                    throw new Error('Maximmum number plates exceeded');
                } else {
                    regoArr[0] = first;
                }
            } else {
                regoArr[1] = second;
            }
        } else {
            regoArr[2] = third;
        }
    } else {
        regoArr[3] = last;
    }
    return regoArr;
}

module.exports.incrementRego = incrementRego;
module.exports.formatRego = formatRego;