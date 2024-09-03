
// check if a DOM element is ready
const checkElement = async selector => {
    while ( document.querySelector(selector) === null) {
        await new Promise( resolve =>  requestAnimationFrame(resolve) )
    }
    return document.querySelector(selector); 
};

// make integers pretty
function prettyInt(i) {
    if (i <= 1000) {} else if (1000 <= i && i <= 9999) {
        i = Math.round(i / 100) / 10;
        i = i + "K";
    } else if (10000 <= i && i <= 99999) {
        i = Math.round(i / 1000);
        i = i + "K";
    } else if (100000 <= i && i <= 999999) {
        i = Math.round(i / 1000);
        i = i + "K";
    } else {
        i = Math.round(i / 10000) / 100;
        i = i + "M";
    }
    return i;
}

// add commas to integers
function commaInt(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// check a file exists
function fileExists(url) {
    return new Promise((res, rej) => {
        jQuery.get(url)
        .done(function() {
            res();
        })
        .fail(function() {
            rej();
        })
    })
}

// make an array unique
function uniqueArray(value, index, array) {
  return array.indexOf(value) === index;
}

// make an array unique by key
function uniqueArrayByKey(myArray, key) {
    return myArray.filter((e, i) => myArray.findIndex(a => a[key] === e[key]) === i);
}

// search an array for ID
function searchArrayForID(val, myArray){
    for (let i=0; i < myArray.length; i++) {
        if (myArray[i].id === val) {
            return myArray[i];
        }
    }
    return false;
}

// search an array for Media key
function searchArrayForMediaKey(val, myArray){
    for (let i=0; i < myArray.length; i++) {
        if (myArray[i].media_key === val) {
            return myArray[i];
        }
    }
    return false;
}

// search an array for Order ID
function searchArrayForOrderID(val, myArray) {
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].order_id == val) {
            return myArray[i];
        }
    }
    return false;
}

// search an array for Product ID
function searchArrayForProductID(val, myArray) {
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].product_id == val) {
            return myArray[i];
        }
    }
    return false;
}

// search an array for a region
function searchArrayForRegion(val, myArray) {
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].region == val) {
            return myArray[i];
        }
    }
    return false;
}

// sort an array of objects by date
function SortByDate(a, b) {
    var var1 = a.created_time;
    var var2 = b.created_time;
    return ((var1 < var2) ? -1 : ((var1 > var2) ? 1 : 0));
}

// sort an array of objects by client ID
function SortByClientID(a, b) {
    var var1 = a.client_id;
    var var2 = b.client_id;
    return ((var1 < var2) ? -1 : ((var1 > var2) ? 1 : 0));
}

// check if a string is a URL
function isStringAURL(s) {
    const dataURLRegex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
    return !!s.match(dataURLRegex);
}

// convert data URI to blob
function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) byteString = atob(dataURI.split(',')[1]);
    else byteString = decodeURI(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: mimeString });
}
    

