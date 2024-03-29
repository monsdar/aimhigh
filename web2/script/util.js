
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
    }
});
