
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
    //clean up the calling element
    $(this).empty();
    
    //let's query the aimhigh-interface for content
    var postVars = {userkey: userkey, request: 'getTasks'};
    $.post(url, postVars, function(data) {
        var json = $.parseJSON(data);
        $.each(json, function(i, item)
        {
            $(this).append('<div class="task" id="#id-' + item.index + '"><p>' + item.text + '</p></div>');
        });
    });
}


