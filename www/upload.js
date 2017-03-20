
var currenturn = '';
$(document).ready (function () {

    $('#btnTranslateThisOne').click (function (evt) {

        $("#jstree_demo_div").html(""); 

        var files =document.getElementById ('files').files ;
        if ( files.length == 0 )
            return ;

        $.each (files, function (key, value) {
            var data =new FormData () ;
            data.append (key, value) ;

            $.ajax ({
                url: 'http://' + window.location.host + '/ForgeRoute/file',
                type: 'post',
                headers: { 'x-file-name': value.name },
                data: data,
                cache: false,
                //dataType: 'json',
                processData: false, // Don't process the files
                contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                complete: null
            }).done (function (data) {
                $('#msg').text (value.name + ' file uploaded on your server') ;
                var paramToTrans  = {name:data.name,iszip: false,rootfile: ''};
                translate (paramToTrans) ;
            }).fail (function (xhr, ajaxOptions, thrownError) {
                $('#msg').text (value.name + ' upload failed!') ;
            }) ;
        }) ;

    }) ;

     

    $('#btnGetMetaData').click (function (evt) {
         if ( currenturn == '' )
            return ;

         $('#msg').text (currenturn + ' metadata request...') ;
            $.ajax ({
                url: '/ForgeRoute/startMetadata/'+ currenturn ,
                type: 'get',
                 timeout: 0,
                contentType: 'application/json',
                complete: null
            }).done (function (response) {
                $('#msg').text (response.guid + ' metadata requested...') ;
                if(response.body.data){
                    prepareTree(response.body);
                 }
                else {
                    setTimeout(function () {
                        getMetaDataProgress(response.urn,response.guid);
                    }, 5000);
                }
                //thisurn = response.urn;

                var guid = 0;
            }).fail (function (xhr, ajaxOptions, thrownError) {
                $('#msg').text (data.name + ' translation request failed!') ;
            }) ;

     }) ;

    $('#btnGetProperties').click (function (evt) {
         if ( currenturn == '' )
            return ;

        $('#msg').text (currenturn + ' prop request...') ;
        $.ajax ({
            url: '/ForgeRoute/startGuidPro/'+ currenturn ,
            type: 'get',
            timeout: 0,
            contentType: 'application/json',
            complete: null
        }).done (function (response) {
            $('#msg').text (response.guid + ' prop requested...') ;
            if(response.body){
                prepareTree(response.body);
            }
            else {
                setTimeout(function () {
                    getPropProgress(response.urn,response.guid);
                }, 5000);
            }
            //thisurn = response.urn;

            var guid = 0;
        }).fail (function (xhr, ajaxOptions, thrownError) {
            $('#msg').text (data.name + ' translation request failed!') ;
        }) ;
    }) ;



}) ;

function AddThisOne (urn) {
    var id =urn.replace (/=+/g, '') ;
    $('#list').append ('<div class="list-group-item row">'
        + '<button id="' + id + '" type="text" class="form-control">' + urn + '</button>'
        + '</div>'
    ) ;

    $('#' + id).click (function (evt) {
        window.open ('/?urn=' + $(this).text (), '_blank') ;
    }) ;
}

function translate (data) {
    $('#msg').text (data.name + ' translation request...') ;
    $.ajax ({
        url: '/ForgeRoute/translate',
        type: 'post',
        data: JSON.stringify (data),
        timeout: 0,
        contentType: 'application/json',
        complete: null
    }).done (function (response) {
        $('#msg').text (data.name + ' translation requested...') ;
        setTimeout (function () { translateProgress (response.urn) ; }, 5000) ;
        thisurn = response.urn;
    }).fail (function (xhr, ajaxOptions, thrownError) {
        $('#msg').text (data.name + ' translation request failed!') ;
    }) ;
}

function translateProgress (urn) {
    $.ajax ({
        url: '/ForgeRoute/translate/' + urn + '/progress',
        type: 'get',
        data: null,
        contentType: 'application/json',
        complete: null
    }).done (function (response) {
        currenturn = response.urn;

        if ( response.progress == 'complete' ) {
            AddThisOne (response.urn) ;
             $('#msg').text ('') ;
        } else {
            var name =window.atob (urn) ;
            var filename =name.replace (/^.*[\\\/]/, '') ;
            $('#msg').text (filename + ': ' + response.progress) ;
            setTimeout (function () { translateProgress (currenturn) ; }, 500) ;
        }
    }).fail (function (xhr, ajaxOptions, thrownError) {
        $('#msg').text ('Progress request failed!') ;
    }) ;
}

function getMetaDataProgress (urn,guid) {
    $.ajax ({
        url: '/ForgeRoute/startMetadata/' + currenturn + '/' + guid,
        type: 'get',
        data: null,
        contentType: 'application/json',
        complete: null
    }).done (function (response) {
        if ( response.body.data) {
                prepareTree(response.body);

        } else {
            setTimeout (function () { getMetaDataProgress (currenturn,guid) ; }, 500) ;
        }
    }).fail (function (xhr, ajaxOptions, thrownError) {
        $('#msg').text ('get metadata request failed!') ;
    }) ;
}

function getPropProgress (urn,guid) {
    $.ajax ({
        url: '/ForgeRoute/startGuidPro/' + urn + '/' + guid,
        type: 'get',
        data: null,
        contentType: 'application/json',
        complete: null
    }).done (function (response) {
        if ( response.body.data) {
                prepareTree(response.body);

        } else {
            setTimeout (function () { getPropProgress (urn,guid) ; }, 500) ;
        }
    }).fail (function (xhr, ajaxOptions, thrownError) {
        $('#msg').text ('get metadata request failed!') ;
    }) ;
}

function prepareTree(jsonStr) {
    $("#jstree_demo_div").html(""); 
    document.getElementById("jstree_demo_div").innerHTML = JSONTree.create(jsonStr); 

}
  

 

