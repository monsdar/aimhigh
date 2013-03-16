
    
//Returns the userkey-portion of the URL
//Returns '' if a file is given (the given URL contains '.' at the end))
//This function splits possible hash-values from the Userkey (anything coming after a '#')
function getUserkey() {
    var urlParts = window.location.href.split('/');
    var userkey = urlParts[ urlParts.length - 1 ];

    //don't return a user if a page is selected
    //NOTE: Why do we implement that? Does this ever happen?
    if(userkey.indexOf('.') !== -1) {
        userkey = '';
    }
    //don't return any GET-variables
    if(userkey.indexOf('#') !== -1) {
        userkey = userkey.split('#')[0];
    }

    return userkey;
}

//NOTE: The following code is directly executed when this file is included
//This checks if the user exists or if a new one must be created (via redirect)
if(getUserkey() === '')
{
    var randomMd5 = md5( Math.random().toString() );
    console.log("Replacing the Location -> Forward the user to his personal URL");
    window.history.pushState("", "AimHigh - Build new habits, reach your goals!", "/" + randomMd5);
}