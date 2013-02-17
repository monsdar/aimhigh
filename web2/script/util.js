
$.extend({
    //Sets a given single-digit number to double digits (leading 0)
    pad2: function(number) {
        return (number < 10 ? '0' : '') + number;
    },
    //Returns the maximum value from a given list
    getMaximum: function(items) {
        var maximum = 0;
        $.each(items, function(i, item) {
            if(item > maximum){
                maximum = item;
            }
        });
        return maximum;
    },
    //Returns the minimum value from a given list (must be lower than 0)
    getMinimum: function(items) {
        var minimum = 0;
        $.each(items, function(i, item) {
            if(item < minimum){
                minimum = item;
            }
        });
        return minimum;      
    },
    //Returns the given date as a string (yy-mm-dd)
    getDateString: function(givenDate) {
        return givenDate.getFullYear() + "-" + $.pad2(givenDate.getMonth()+1) + "-" + $.pad2(givenDate.getDate());  
    },
    //Subtracts x days from the given date (string, "yy-mm-dd")
    //Returns a stringified date (see getDateString)
    subtractDays: function(currentDate, days) {
        var utc = Date.parse(currentDate);
        var date = new Date(utc - (1000 * 60 * 60 * 24 * days));
        return $.getDateString(date);       
    },
    
    //Returns the userkey-portion of the URL
    //Returns '' if a file is given (the given URL contains '.' at the end))
    //This function splits possible GET-variables from the Userkey (anything coming after a '#')
    getUserkey: function(){
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
});
