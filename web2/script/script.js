


$(document).ready( function () {
    
    ////////////////////////////////////////////////////////
    //      Initialization of the page
    ////////////////////////////////////////////////////////
    
    //this is the interface we're using
    var aimHigh="http://aimhigh2.nilsbrinkmann.com/interface/interface.php";
    
    //TODO: This is not elegant, we should change the design to support async queries
    $.ajaxSetup({async:false});
    
    //get the userkey, create a new user if there is no given user
    var userkey = $.getUserKey();
    if(userkey == '')
    {
        //The following code redirects to the new users page...
        //Perhaps there is a better way to load the URL for a new user,
        //but I couldn't find it...
        var randomMd5 = md5( Math.random().toString() );
        window.location.replace("http://aimhigh2.nilsbrinkmann.com/" + randomMd5);
        return;
    }
    
    //call the user, it will be created if not already existing
    var postVars = {userkey: userkey, request: 'touchUser'};
    $.post(aimHigh, postVars, function(data) {
        console.log("Touched the user, received the following response: " + data);
    });
    
    //setup the Datepicker
    var currentDate = new Date();
    var dateStr = currentDate.getFullYear() + "-" + $.pad2(currentDate.getMonth()+1) + "-" + $.pad2(currentDate.getDate());
    console.log("Build the following date: " + dateStr);
    $("#selectedDate").val( dateStr );
    
    
});

///////////////////////////////////////
//   Specific Extensions
///////////////////////////////////////
console.log("Extending jQuery with getUserKey()");
$.extend({
    //Returns the userkey-portion of the URL
    //Returns '' if a file is given (the given URL contains '.' at the end))
    getUserKey: function(){
         var urlParts = window.location.href.split('/');
         var userKey = urlParts[ urlParts.length - 1 ];
         if(userKey.indexOf('.') !== -1)
         {
             userKey = '';
         }
         return userKey;
    }
});


///////////////////////////////////////
//   Common Extensions
///////////////////////////////////////
$.extend({
    pad2: function(number) {
        return (number < 10 ? '0' : '') + number;
    }
});