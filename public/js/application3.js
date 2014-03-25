  var res = "http://shgpi.edu.ru:4567/db/conferences/";
  var username = "";


  function back(url){
    return url.slice(0, url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1);
  }

  function getlastentry(url){
    return url.substring(url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1,url.lastIndexOf('/'));
  }

  function CreateEvent()
  {
    alert($('#name').val().replace(/\//g,'_').slice(0,29));
  }

  function ModifyEventInput()
  {
    $('#ID').val(Translit($('#name').val().slice(0,29)));

  }

  function CreateEventInput()
  {
    $('div#create > #ID').val(Translit($('div#create > #name').val().slice(0,29)));

  }

  function Translit(el)
  {

    new_el = new String();

    A = new Array();
    A["/"] = "_"; A["."] = "_"; A["Ё"]="YO";A["Й"]="I";A["Ц"]="TS";A["У"]="U";A["К"]="K";A["Е"]="E";A["Н"]="N";A["Г"]="G";A["Ш"]="SH";A["Щ"]="SCH";A["З"]="Z";A["Х"]="H";A["Ъ"]="'";
    A["ё"]="yo";A["й"]="i";A["ц"]="ts";A["у"]="u";A["к"]="k";A["е"]="e";A["н"]="n";A["г"]="g";A["ш"]="sh";A["щ"]="sch";A["з"]="z";A["х"]="h";A["ъ"]="'";
    A["Ф"]="F";A["Ы"]="I";A["В"]="V";A["А"]="A";A["П"]="P";A["Р"]="R";A["О"]="O";A["Л"]="L";A["Д"]="D";A["Ж"]="ZH";A["Э"]="E";
    A["ф"]="f";A["ы"]="i";A["в"]="v";A["а"]="a";A["п"]="p";A["р"]="r";A["о"]="o";A["л"]="l";A["д"]="d";A["ж"]="zh";A["э"]="e";
    A["Я"]="YA";A["Ч"]="CH";A["С"]="S";A["М"]="M";A["И"]="I";A["Т"]="T";A["Ь"]="'";A["Б"]="B";A["Ю"]="YU";
    A["я"]="ya";A["ч"]="ch";A["с"]="s";A["м"]="m";A["и"]="i";A["т"]="t";A["ь"]="'";A["б"]="b";A["ю"]="yu";A[" "] = "_";
    new_el = el.replace(/([\u0410-\u0451]|\/| )/g,

      function (str,p1,offset,s) {

        if (A[str] != 'undefined'){return A[str];}

      }

      );
    return new_el;
  }

  function getusersfromjson(object, url){
    var users = [];
    var allusers = [];
    var arrayfromfloor = [];
    var arrayfromfloor2 = [];
    for (var key in object)
    {
      //alert(object[key]['type'] != 'user');
      if ((typeof object[key] == "object") && (object[key]['type'] != 'user')) 
      {
        arrayfromfloor2 = getusersfromjson(object[key], url+key+'/');
        arrayfromfloor = $.merge(arrayfromfloor,arrayfromfloor2);
        //alert(JSON.stringify(arrayfromfloor));

      }
      else if (object[key]['type'] == 'user') {
        //object[key]['url'] = url+key;
        var obj = {};
        obj[url+key+'/'] = object[key];
        //alert(JSON.stringify(users));
        users.push(obj);
        //alert(JSON.stringify(users));
      }
    }

    allusers = $.merge(users,arrayfromfloor);
    //alert(JSON.stringify(allusers));
    return allusers;
  }


  function newusers()
  {
    var source = res
    $.getJSON(source+'?type=user', function(data){
      $('#newusers').html('');
      var users = getusersfromjson(data.response, source);
      
      for (var index in users)
      {
        //alert(JSON.stringify(index));
        for (var key in users[index])
        {
          if (!users[index][key]['activated'] || users[index][key]['activated'] == 'false')
          {
            //alert(key);
            var text = ((typeof users[index][key]['name']) == 'undefined')? key : users[index][key]['name'];
            $('#newuserslabel').html('<h4 style="text-align: center">Новые пользователи:</h4>');
            $('#newusers').append('<li><a id="'+key+'" class="newelem" href="#">'+ text +'</a></li>')
          }

        }
        
      }
      $('.newelem').click( function(event){
        //event.stopPropagation();
        mainnav($(this).attr('id'));
      });
    })
  }

  function modifyprop(data, source)
  {
    switch (data.response.type){
      case 'user':

      $('div#modify').append('<label class="control-label" for="name">ФИО</label>\
        <input class="span8" id="name" type="text" placeholder="Введите ФИО">')
      .append('<label class="control-label" for="ID">ID</label>\
        <input name="ID" type="text" disabled class="span8" id="ID">')
      .append('<label class="control-label" for="place">Населенный пункт</label>\
        <input class="span8" id="place" type="text" placeholder="Введите населенный пункт">')
      .append('<label class="control-label" for="facility">Организация</label>\
        <input class="span8" id="facility" type="text" placeholder="Введите организацию">')
      .append('<label class="control-label" for="email">E-mail</label>\
        <input class="span8" id="email" type="text" placeholder="Введите e-mail">');
      $('div#modify #name').val((typeof data.response.name == 'undefined') ? '' : data.response.name);
      $('div#modify #ID').val((typeof data.id == 'undefined') ? '' : data.id)
      $('div#modify #place').val((typeof data.response.place == 'undefined') ? '' : data.response.place);
      $('div#modify #facility').val((typeof data.response.facility == 'undefined') ? '' : data.response.facility);
      $('div#modify #email').val((typeof data.response.email == 'undefined') ? '' : data.response.email);
        //getsections();
        
        var checked = (data.response.activated && data.response.activated != 'false') ? 'checked' : '';
        //alert(checked);
        $('div#modify').append('<label class="checkbox" id="activated">\
          <input type="checkbox" '+checked+' value="" >Подтвержденный участник\
          </label>')
        .append('<button class="btn" type="button" id="apply">Применить изменения</button>') 
        .append('<button class="btn primary-btn" type="button" id="print">Печать</button>');

        break;
        case 'section': case 'master class': case 'round table':
        $('div#modify').append('<label class="control-label" for="name">Название секции</label>\
          <input class="span8" id="name" type="text" placeholder="Введите название">')
        .append('<label class="control-label" for="moderator">Модераторы</label>\
          <input class="span8" id="moderator" type="text" placeholder="Введите модераторов">')
        .append('<button class="btn" type="button" id="apply">Применить изменения</button>');
        $('div#modify #name').val((typeof data.response.name == 'undefined') ? '' : data.response.name);
        $('div#modify #moderator').val((typeof data.response.moderator == 'undefined') ? '' : data.response.moderator);
        break;
        case 'conference':
        $('div#modify').append('<label class="control-label" for="name">Название конференции</label>\
          <input class="span8" id="name" type="text" placeholder="Введите название">')
        .append('<button class="btn" type="button" id="apply">Применить изменения</button>');
        $('div#modify #name').val((typeof data.response.name == 'undefined') ? '' : data.response.name);
        break;
      }

      $('#apply').click( function(){
      //alert('123');
      var postrequest = {};
      $.each($('div#modify > *'), function(index,value){
        if (value.id == 'name' || value.id == 'place' || value.id == 'facility' || value.id == 'email' || value.id == 'moderator' ) {
          postrequest[value.id] = value.value;
        }
        if (value.id == 'activated') {postrequest['activated'] = ($('label#activated > input').attr('checked')) ? true : false}
          else return true;
      })
      //alert(JSON.stringify(postrequest));
      $.post(source, JSON.stringify(postrequest), function(data) {
        var jsondata = JSON.parse(data);
        if(jsondata.ok == true) alert("Данные успешно обновлены!")
          else alert("Ошибка:"+jsondata.error);
      });
      newusers();
    });

    }

    function create(data,source)
    {
      $('div#create').html('');
      switch (data.response.type){
        case 'conference':
        break;
        case 'section': case 'master class': case 'round table':

        $('div#create').append('<h2>Регистрация нового участника</h2><br><label class="control-label" for="name">ФИО*</label>\
          <input class="span8" id="name" type="text" placeholder="Введите ФИО" oninput="CreateEventInput()">')
        .append('<label class="control-label" for="ID">ID</label>\
          <input name="ID" type="text" disabled class="span8" id="ID">')
        .append('<label class="control-label" for="place">Населенный пункт*</label>\
          <input class="span8" id="place" type="text" placeholder="Введите населенный пункт">')
        .append('<label class="control-label" for="facility">Организация*</label>\
          <input class="span8" id="facility" type="text" placeholder="Введите организацию">')
        .append('<label class="control-label" for="email">E-mail</label>\
          <input class="span8" id="email" type="text" placeholder="Введите e-mail">')        
        .append('<label class="checkbox" id="activated">\
          <input type="checkbox" checked value="" >Подтвержденный участник\
          </label>')
        .append('<input type=hidden id="type" value="user">')
        .append('<button class="btn" type="button" id="create">Зарегистрировать</button>'); 

        break;
      }
      $('div #create > #create').click(function(){
        var putrequest = {};
        $.each($('div#create > *'), function(index,value){
          if (value.id == 'name' || value.id == 'place' || value.id == 'facility' || value.id == 'email' || value.id == 'moderator' ) {
            putrequest[value.id] = value.value;
          }
          if (value.id == 'activated') {putrequest['activated'] = ($('label#activated > input').attr('checked')) ? true : false}
            if (value.id == 'type') { putrequest['type'] = value.value}
          });
      //putrequest['valid users'] = 
      //alert(JSON.stringify(putrequest));
      $.ajax({
        url: source+$('div#create > #ID').val()+'/',
        type: 'PUT',
        data: JSON.stringify(putrequest),
        success: function(data) {
          var jsondata = JSON.parse(data);
          if(jsondata.ok == true) {alert("Данные успешно добавлены!");mainnav(source);}
          else alert("Ошибка:"+jsondata.error);

        }
      });

    });

    }

    function breadcrumb(source, first)
    {
      if (source == res) 
      {
        $('.breadelem').click( function(event){
          mainnav($(this).attr('id'));
        });
        $('#breadcrumb').show(); 

        return;
      }
      $.getJSON(source+'name', function(data){
        if (data.ok == true) {
          if (first) { 
            $('#breadcrumb').prepend('<li id="active">'+data.response.name+'<span class="divider">/</span></li>');
            $('#active').addClass('active');  }
            else $('#breadcrumb').prepend('<li><a id="'+source+'" class="breadelem" href="#">'+data.response.name+'</a><span class="divider">/</span></li>');



            if (source != res) breadcrumb(back(source),false);


          }
        });
    }

    function mainnav(source)
    {
      $('#breadcrumb').hide();
    //alert(source);
    //alert(jqueryobj.attr('id'));
    //alert(source+' '+getlastentry(source));
    $('#breadcrumb').html('');
    breadcrumb(source,true);
    window.console && console.log("i'm here");
    $.getJSON(source, function(data){
      
      $('#mainnav').html('');
      $('div#modify').html('');
      if (source != res) $('#mainnav').html('<li><a id="'+back(source)+'" class="navelem back" href="#">..</a></li>');
      $.each(data.response, function(index,value){
        if (typeof value == "object" && (value.type != "template")) {
          var text = (!value.name)? String(index) : value.name
          $('#mainnav').append('<li class><a id="'+source+index+'/'+'" class="navelem" href="#">'+ text +'<button type="button" class="close">×</button></a></li>')
        }
        else
        {

        }
      });
      if ($('#mainnav').text() == '') $('#modify').html('<h4 style="text-align: center">Пока что для вас не доступна ни одна из конференций</h4>');
      $('.close').click(function(event){
        event.stopPropagation();
        if (confirm("Вы действительно хотите удалить этот элемент?")) {
            //alert($(this).prev().attr('id'));

            $.ajax({
              url: $(this).parent().attr('id'),
              type: 'DELETE',
              success: function(data) {
                var jsondata = JSON.parse(data);
                if(jsondata.ok == true) {mainnav(source);}
                else {alert("Ошибка:"+jsondata.error);mainnav(source)}


              }
            });
          } 

          
        });
      
      modifyprop(data, source);
      create(data, source);
      
      
      $('.navelem').click( function(){
        mainnav($(this).attr('id'));
        $.contextMenu( 'destroy', '.navelem:not(.back)' );
        if ($(this).text() != '..') contextmenu(back($(this).attr('id')));
        
      }
      );
        //alert(this.headers.);
      });
  newusers();
}


function copy(what, to){
    //alert("переносим "+what+" из"+back(what)+" в "+to);
    $.getJSON(what, function(data){
      if (data.ok == true)
      {
        //alert(JSON.stringify(data.response));
        $.ajax({
          url: to+getlastentry(what)+'/',
          type: 'PUT',
          data: JSON.stringify(data.response),
          success: function(data) {
            var jsondata = JSON.parse(data);
            if(jsondata.ok == true) {
              //alert("Данные успешно добавлены!");
            }
            else
            {
              $.ajax({
                url: what,
                type: 'DELETE',
                success: function(data) {
                  var jsondata = JSON.parse(data);
                  if(jsondata.ok == true) {mainnav(back(what));}
                  else {
                    alert("Ошибка:"+jsondata.error);
                    
                  }
                }
              });

              alert("Ошибка:"+jsondata.error); 
             
            }
          }
        });
      }
    });
    
  }


  function move(what, to){
    //alert("переносим "+what+" из"+back(what)+" в "+to);
    $.getJSON(what, function(data){
      if (data.ok == true)
      {
        //alert(JSON.stringify(data.response));
        $.ajax({
          url: to+getlastentry(what)+'/',
          type: 'PUT',
          data: JSON.stringify(data.response),
          success: function(data) {
            var jsondata = JSON.parse(data);
            if(jsondata.ok == true) {
              //alert("Данные успешно добавлены!");
              $.ajax({
                url: what,
                type: 'DELETE',
                success: function(data) {
                  var jsondata = JSON.parse(data);
                  if(jsondata.ok == true) {mainnav(back(what));}
                  else {
                    $.ajax({
                      url: what,
                      type: 'DELETE',
                      success: function(data) {
                        var jsondata = JSON.parse(data);
                        if(jsondata.ok == true) {mainnav(back(what));}
                        else {
                          alert("Ошибка:"+jsondata.error);
                        
                        }
                      }
                    });

                    alert("Ошибка:"+jsondata.error); 
                     
                  }
                }
              }); 
            }
            else alert("Ошибка:"+jsondata.error);
            
          }
        });
} 
});

}

//context menu for .navelem
function contextmenu(source){
  $.getJSON(source, function(data){
    var menu = {};

    $.each(data.response, function(key,value){
      if(typeof value != "object") return true;
      menu[source+key+'/'] = {"name": value.name}
    })
      //alert(JSON.stringify(menu));
      $.contextMenu({
        selector: '.navelem:not(.back)',
        build: function($trigger, e){
          return {
            callback: function(key, options) {
              var m = "clicked: " + key + " ; id: "+options.$trigger.attr("id");
              //window.console && console.log(m) || alert(m); 
              move(options.$trigger.attr("id"),key);

            },
            items: {
              "move": {"name": "Перенести",
              "items": menu
            },
          }
        }

      }
    });

      $('.context-menu-one').on('click', function(e){
        console.log('clicked', this);
      })


    });


}



$(function(){
  //alert(back("http://xardas-udesktop/db/conferences/"));
  //alert('123');
  //$('#myModal').modal({keyboard:false, backdrop: "static"});
  if ($('#mainnav > li > a').first().text() != '..') mainnav(res);
  //newusers();
  //contextmenu();
  //$('#breadcrumb').slideUp();
  
}
);