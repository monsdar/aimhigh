
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


$.fn.refreshTasks = function(url, userkey) {
    //let's store the object into a variable, so that we can use it in the $.each
    var category = $(this);
    
    //clean up the calling element
    category.empty();    
    
    //let's query the aimhigh-interface for content
    console.log("Refreshing the tasks!");
    var postVars = {userkey: userkey, request: 'getTasks'};
    $.post(url, postVars, function(data) {
        var json = $.parseJSON(data);
        $.each(json, function(i, item)
        {
            console.log('New Task: ' + item.text + '(' + item.index + ')');
            category.append('<div class="task" id="#id-' + item.index + '"><p>' + item.text + '</p></div>');
        });
    });
}


