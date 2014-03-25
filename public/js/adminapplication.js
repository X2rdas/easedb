  var res = "/db/conferences/";
  var username = "";
  var printer = "http://shgpi.edu.ru/meet/print/index.php";

  function back(url){
    return url.slice(0, url.substring(0,url.lastIndexOf('/')).lastIndexOf('/')+1);
  }

  function str_replace(search, replace, subject) {
    return subject.split(search).join(replace);
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
    A["Я"]="YA";A["Ч"]="CH";A["С"]="S";A["М"]="M";A["И"]="I";A["Т"]="T";A["Ь"]="";A["Б"]="B";A["Ю"]="YU";
    A["я"]="ya";A["ч"]="ch";A["с"]="s";A["м"]="m";A["и"]="i";A["т"]="t";A["ь"]="";A["б"]="b";A["ю"]="yu";A[" "] = "_";A["'"] = ""; A['"'] = "";A['ё'] = "e";
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
      if ((typeof object[key] == "object") && (object[key]['type'] != 'user')) 
      {
        arrayfromfloor2 = getusersfromjson(object[key], url+key+'/');
        arrayfromfloor = $.merge(arrayfromfloor,arrayfromfloor2);

      }
      else if (object[key]['type'] == 'user') {
        var obj = {};
        obj[url+key+'/'] = object[key];
        users.push(obj);
      }
    }

    allusers = $.merge(users,arrayfromfloor);
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
        for (var key in users[index])
        {
          if (!users[index][key]['activated'] || users[index][key]['activated'] == 'false')
          {
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
    $('div#modify').append('<button class="btn" type="button" id="show-url">Показать URLs</button>');
    $('div#modify').append('<div id="urls"><p id="external-url" style="width: 700px; word-wrap: break-word; " >Внешний URL: '+source+'</p><p id="internal-url" style="width: 700px;word-wrap: break-word;">Внутренний URL: '+str_replace('shgpi.edu.ru','meet.shgpi',source)+'</p></div><br><br>');
    $('#urls').hide();
    $('#show-url').click(function(){
      if ($('#urls').css('display') == 'none') $('#urls').show();
      else $('#urls').hide();
    });
    switch (data.response.type){
      case 'top':
      $('div#modify').append('<label class="control-label" for="owner">Пользователи, имеющие доступ:</label>\
        <input class="span8" id="owner" type="text" placeholder="Введите пользователей">')
      .append('<button class="btn" type="button" id="apply">Применить изменения</button>');
      $('div#modify #owner').val((typeof data.response.owner == 'undefined') ? '' : data.response.owner);
      break;
      case 'faculty':
      $('div#modify').append('<label class="control-label" for="name">Название</label>\
        <input class="span8" id="name" type="text" placeholder="Введите название">')
      .append('<label class="control-label" for="ID">ID</label>\
        <input name="ID" type="text" disabled class="span8" id="ID">')
      .append('<label class="control-label" for="owner">Пользователи, имеющие доступ:</label>\
        <input class="span8" id="owner" type="textarea" placeholder="Введите пользователей">')
      .append('<button class="btn" type="button" id="apply">Применить изменения</button>');
      $('div#modify #name').val((typeof data.response.name == 'undefined') ? '' : data.response.name);
      $('div#modify #ID').val((typeof data.id == 'undefined') ? '' : data.id);
      $('div#modify #owner').val((typeof data.response.owner == 'undefined') ? '' : data.response.owner);
      break;
      case 'user':

      $('div#modify').append('<label class="control-label" for="name">ФИО</label>\
        <input class="span8" id="name" type="text" placeholder="Введите ФИО">')
      .append('<label class="control-label" for="ID">ID</label>\
        <input name="ID" type="text" disabled class="span8" id="ID">')
      .append('<label class="control-label" for="place">Населенный пункт</label>\
        <input class="span8" id="place" type="text" placeholder="Введите населенный пункт">')
      .append('<label class="control-label" for="facility">Организация</label>\
        <input class="span8" id="facility" type="text" placeholder="Введите организацию">')
      .append('<label class="control-label" for="post">Должность</label>\
        <input class="span8" id="post" type="text" placeholder="Введите должность">')
      .append('<label class="control-label" for="team">Команда</label>\
        <input class="span8" id="team" type="text" placeholder="Введите команду">')
      .append('<label class="control-label" for="phone">Контактный телефон</label>\
        <input class="span8" id="phone" type="text" placeholder="Введите телефон">')
      .append('<label class="control-label" for="email">E-mail</label>\
        <input class="span8" id="email" type="text" placeholder="Введите e-mail">')
      .append('<label class="control-label" for="degree">Степень участия</label>\
        <select name="degree" id="degree">\
        <option value="участник"'+((data.response.degree == 'участник') ? 'selected' : '')+'>участник</option>\
        <option value="выступающий"'+((data.response.degree == 'выступающий') ? 'selected' : '')+'>выступающий</option>\
        <option value="организатор"'+((data.response.degree == 'организатор') ? 'selected' : '')+'>организатор</option>\
        </select><br>')
      .append('<label class="control-label" for="number">Справка</label>\
        <input class="span8" id="number" type="text" placeholder="Справка не выдана">')
      .append('<label class="control-label" for="certificate_date">Выдана</label>\
        <input class="span8" id="certificate_date" type="text" placeholder="Справка не выдана">')
      .append('<label class="control-label" for="owner">Пользователи, имеющие доступ:</label>\
        <input class="span8" id="owner" type="textarea" placeholder="Введите пользователей">')
      .append('<form method=POST action='+source+' enctype="multipart/form-data" id="fileupload">\
        <label class="control-label" for="file">Загрузка пользовательских данных</label>\
        <input type=file name=file>\
        <input type=submit value="Загрузить файл" class="btn">\
        </form>');
      $('#fileupload').ajaxForm({clearForm:true, dataType: "json", success: function(datas){ 
        if (datas.ok == true) 
        {
          alert("Данные успешно загружены!");
          setTimeout('mainnav("'+source+'")', 3000);
        }
        else if (datas.error == "Item already exist") alert("Такой файл уже существует!");
        $(this).resetForm();
      }});

      $('div#modify #name').val((typeof data.response.name == 'undefined') ? '' : data.response.name);
      $('div#modify #ID').val((typeof data.id == 'undefined') ? '' : data.id);
      $('div#modify #place').val((typeof data.response.place == 'undefined') ? '' : data.response.place);
      $('div#modify #facility').val((typeof data.response.facility == 'undefined') ? '' : data.response.facility);
      $('div#modify #post').val((typeof data.response.post == 'undefined') ? '' : data.response.post);
      $('div#modify #team').val((typeof data.response.team == 'undefined') ? '' : data.response.team);
      $('div#modify #email').val((typeof data.response.email == 'undefined') ? '' : data.response.email);
      $('div#modify #phone').val((typeof data.response.phone == 'undefined') ? '' : data.response.phone);
      $('div#modify #number').val((typeof data.response.number == 'undefined') ? '' : data.response.number);
      $('div#modify #certificate_date').val((typeof data.response.certificate_date == 'undefined') ? '' : data.response.certificate_date);
      $('div#modify #owner').val((typeof data.response.owner == 'undefined') ? '' : data.response.owner);
      var checked = (data.response.activated && data.response.activated != 'false') ? 'checked' : '';
      
      $('div#modify').append('<label class="checkbox" id="activated">\
        <input type="checkbox" '+checked+' value="" >Подтвержденный участник\
        </label>');
     
      $('div#modify').append('<button class="btn" type="button" id="apply">Применить изменения</button>') 
      .append('<button class="btn primary-btn" type="button" id="print">Печать</button>');
      $('div#modify').append('<h2>Вложения</h2><br>\
        <ul class="nav nav-tabs nav-stacked" id="attachments">');
      $.each(data.response, function(index,value){
        if (value == "attachment") $('#attachments').append('<li class><a id="'+source+index+'" class="attelem">'+ index +'<button type="button" class="close">×</button></a></li>');
      });
      $('div#modify').append('</ul>');
      $('.attelem').click(function(){
        window.location.href = $(this).attr('id');
      });
      $('#print').click(function(){
        // window.location.href = printer+'?url='+str_replace("shgpi.edu.ru","meet.shgpi",source);
        window.open( printer+'?url='+str_replace("shgpi.edu.ru","meet.shgpi",source), "_blank" )
        setTimeout('mainnav("'+source+'")', 5000);
      });

      break;
      case 'section': case 'master class': case 'round table': case 'training': case 'olympiad':
      $('div#modify').append('<label class="control-label" for="name">Название секции</label>\
        <input class="span8" id="name" type="text" placeholder="Введите название">')
      .append('<label class="control-label" for="ID">ID</label>\
        <input name="ID" type="text" disabled class="span8" id="ID">')
      .append('<label class="control-label" for="form">Форма проведения</label>\
        <input class="span8" id="form" type="text" placeholder="Введите форму проведения">')
      .append('<label class="control-label" for="place">Место проведения</label>\
        <input class="span8" id="place" type="text" placeholder="Введите место проведения">')
      .append('<label class="control-label" for="target">Целевая аудитория</label>\
        <input class="span8" id="target" type="text" placeholder="Введите целевую аудиторию">')
      .append('<label class="control-label" for="moderator">Модераторы</label>\
        <input class="span8" id="moderator" type="text" placeholder="Введите модераторов">')
      .append('<label class="control-label" for="hours">Количество часов</label>\
        <input class="span8" id="hours" type="text" placeholder="Введите количество часов">')
      .append('<label class="control-label" for="type">Тип</label>\
        <select name="type" id="type">\
        <option value="section"'+((data.response.type == 'section') ? 'selected' : '')+'>Секция</option>\
        <option value="master class"'+((data.response.type == 'master class') ? 'selected' : '')+'>Мастер-класс</option>\
        <option value="round table" '+((data.response.type == 'round table') ? 'selected' : '')+'>Круглый стол</option>\
        <option value="training"'+((data.response.type == 'training') ? 'selected' : '')+'>Тренинг</option>\
        <option value="olympiad"'+((data.response.type == 'olympiad') ? 'selected' : '')+'>Олимпиада</option>\
        </select><br>')
      .append('<label class="control-label" for="owner">Пользователи, имеющие доступ:</label>\
        <input class="span8" id="owner" type="textarea" placeholder="Введите пользователей">')
      .append('<form method=POST action='+source+' enctype="multipart/form-data" id="fileupload">\
        <label class="control-label" for="file">Загрузка пользовательских данных</label>\
        <input type=file name=file>\
        <input type=submit value="Загрузить файл" class="btn">\
        </form>').append('<button class="btn" type="button" id="apply">Применить изменения</button>');
      $('#fileupload').ajaxForm({clearForm:true, dataType: "json", success: function(datas){ 
        if (datas.ok == true) 
        {
          alert("Данные успешно загружены!");
          setTimeout('mainnav("'+source+'")', 3000);
        }
        else if (datas.error == "Item already exist") alert("Такой файл уже существует!");
        $(this).resetForm();
      }});

      
      $('div#modify #name').val((typeof data.response.name == 'undefined') ? '' : data.response.name);
      $('div#modify #ID').val((typeof data.id == 'undefined') ? '' : data.id);
      $('div#modify #moderator').val((typeof data.response.moderator == 'undefined') ? '' : data.response.moderator);
      $('div#modify #hours').val((typeof data.response.hours == 'undefined') ? '' : data.response.hours);
      $('div#modify #owner').val((typeof data.response.owner == 'undefined') ? '' : data.response.owner);
      $('div#modify #form').val((typeof data.response.form == 'undefined') ? '' : data.response.form);
      $('div#modify #place').val((typeof data.response.place == 'undefined') ? '' : data.response.place);
      $('div#modify #target').val((typeof data.response.target == 'undefined') ? '' : data.response.target);

      var checked = (data.response.open && data.response.open != 'false') ? 'checked' : '';
      
      $('div#modify').append('<label class="checkbox" id="open">\
        <input type="checkbox" '+checked+' value="" >Регистрация открыта\
        </label>');

      $('div#modify').append('<h2>Вложения</h2><br>\
        <ul class="nav nav-tabs nav-stacked" id="attachments">');
      $.each(data.response, function(index,value){
        if (value == "attachment") $('#attachments').append('<li class><a id="'+source+index+'" class="attelem">'+ index +'<button type="button" class="close">×</button></a></li>');
      });
      $('div#modify').append('</ul>');
      $('.attelem').click(function(){
        window.location.href = $(this).attr('id');
      });
      $('#print').click(function(){
        // window.location.href = printer+'?url='+str_replace("shgpi.edu.ru","meet.shgpi",source);
        window.open( printer+'?url='+str_replace("shgpi.edu.ru","meet.shgpi",source), "_blank" )
        setTimeout('mainnav("'+source+'")', 5000);
      });
      break;
      case 'conference':
      $('div#modify').append('<label class="control-label" for="name">Название конференции</label>\
        <input class="span8" id="name" type="text" placeholder="Введите название">')
      .append('<label class="control-label" for="date">Дата проведения</label>\
        <input class="span8" id="date" type="text" placeholder="Введите дату проведения">')
      .append('<label class="control-label" for="lastnumber">Последний номер выданной справки</label>\
        <input class="span8" id="lastnumber" type="text" placeholder="Введите номер">')
      .append('<label class="control-label" for="moderator">Организаторы</label>\
        <input class="span8" id="moderator" type="text" placeholder="Введите организаторов">')
      .append('<label class="control-label" for="form">Форма проведения</label>\
        <input class="span8" id="form" type="text" placeholder="Введите форму">')
      .append('<label class="control-label" for="owner">Пользователи, имеющие доступ:</label>\
        <input class="span8" id="owner" type="textarea" placeholder="Введите пользователей">')
      .append('<button class="btn" type="button" id="apply">Применить изменения</button>')
      .append('<form method=POST action='+source+' enctype="multipart/form-data" id="fileupload">\
        <label class="control-label" for="file">Загрузка шаблона справки</label>\
        <input type=file name=file>\
        <input type=submit value="Загрузить файл" class="btn">\
        </form>');
      $('#fileupload').ajaxForm({clearForm:true, dataType: "json", success: function(datas){ 
        if (datas.ok == true) 
        {
          alert("Данные успешно загружены!");
          setTimeout('mainnav("'+source+'")', 3000);
        }
        else if (datas.error == "Item already exist") alert("Такой файл уже существует!");
        $(this).resetForm();
      }}); 
      $('div#modify #name').val((typeof data.response.name == 'undefined') ? '' : data.response.name);
      $('div#modify #date').val((typeof data.response.date == 'undefined') ? '' : data.response.date);
      $('div#modify #lastnumber').val((typeof data.response.lastnumber == 'undefined') ? '' : data.response.lastnumber);
      $('div#modify #form').val((typeof data.response.form == 'undefined') ? '' : data.response.form);
      $('div#modify #moderator').val((typeof data.response.moderator == 'undefined') ? '' : data.response.moderator);
      $('div#modify #owner').val((typeof data.response.owner == 'undefined') ? '' : data.response.owner);
      $('div#modify').append('<h2>Вложения</h2><br>\
        <ul class="nav nav-tabs nav-stacked" id="attachments">');
      $.each(data.response, function(index,value){
        if (value == "attachment") $('#attachments').append('<li class><a id="'+source+index+'" class="attelem">'+ index +'<button type="button" class="close">×</button></a></li>');
      });
      $('div#modify').append('</ul>');
      $('.attelem').click(function(){
        window.location.href = $(this).attr('id');
      });
      break;
    }

    $('#apply').click( function(){
      var postrequest = {};
      $.each($('div#modify > *'), function(index,value){
        if (value.id == 'name' 
          || value.id == 'place' 
          || value.id == 'facility' 
          || value.id == 'form' 
          || value.id == 'lastnumber' 
          || value.id == 'post' 
          || value.id == 'hours' 
          || value.id == 'email' 
          || value.id == 'degree'
          || value.id == 'team'
          || value.id == 'moderator'
          || value.id == 'target'
          || value.id == 'phone'
          || value.id == 'type' 
          || value.id == 'date' 
          || value.id == 'number' 
          || value.id == 'certificate_date' 
          || value.id == 'owner') {
          postrequest[value.id] = value.value;
        }
        if (value.id == 'activated') {postrequest['activated'] = ($('label#activated > input').attr('checked')) ? true : false}
        if (value.id == 'open') {postrequest['open'] = ($('label#open > input').attr('checked')) ? true : false}
      })
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
      case 'top':
      $('div#create').append('<h2>Создание нового подразделения</h2><br><label class="control-label" for="name">Название*</label>\
        <input class="span8" id="name" type="text" placeholder="Введите название" oninput="CreateEventInput()">')
      .append('<label class="control-label" for="ID">ID</label>\
        <input name="ID" type="text" disabled class="span8" id="ID">')
      .append('<input type=hidden id="type" value="faculty">')
      .append('<button class="btn" type="button" id="create">Создать</button>');
      break;
      case 'faculty':
      $('div#create').append('<h2>Создание нового мероприятия</h2><br><label class="control-label" for="name">Название*</label>\
        <input class="span8" id="name" type="text" placeholder="Введите название" oninput="CreateEventInput()">')
      .append('<label class="control-label" for="ID">ID</label>\
        <input name="ID" type="text" disabled class="span8" id="ID">')
      .append('<label class="control-label" for="date">Дата проведения</label>\
        <input class="span8" id="date" type="text" placeholder="Введите дату проведения">')
      .append('<label class="control-label" for="moderator">Организаторы</label>\
        <input class="span8" id="moderator" type="text" placeholder="Введите организаторов">')
      .append('<label class="control-label" for="form">Форма проведения</label>\
        <input class="span8" id="form" type="text" placeholder="Введите форму">')
      .append('<input type=hidden id="type" value="conference">')
      .append('<input type=hidden id="lastnumber" value="0">')
      .append('<button class="btn" type="button" id="create">Создать</button>');

      break;
      case 'conference':
      $('div#create').append('<h2>Создание новой секции</h2><br><label class="control-label" for="name">Название*</label>\
        <input class="span8" id="name" type="text" placeholder="Введите название" oninput="CreateEventInput()">')
      .append('<label class="control-label" for="ID">ID</label>\
        <input name="ID" type="text" disabled class="span8" id="ID">')
      .append('<label class="control-label" for="hours">Количество часов</label>\
        <input class="span8" id="hours" type="text" placeholder="Введите количество часов">')
      .append('<label class="control-label" for="form">Форма проведения</label>\
        <input class="span8" id="form" type="text" placeholder="Введите форму проведения">')
      .append('<label class="control-label" for="place">Место проведения</label>\
        <input class="span8" id="place" type="text" placeholder="Введите место проведения">')
      .append('<label class="control-label" for="target">Целевая аудитория</label>\
        <input class="span8" id="target" type="text" placeholder="Введите целевую аудиторию">')
      .append('<label class="control-label" for="hours">Модераторы</label>\
        <input class="span8" id="moderator" type="text" placeholder="Введите модераторов">')
      .append('<label class="control-label" for="type">Тип</label>\
        <select name="type" id="type">\
        <option value="section">Секция</option>\
        <option value="master class">Мастер-класс</option>\
        <option value="round table">Круглый стол</option>\
        <option value="training">Тренинг</option>\
        <option value="olympiad">Олимпиада</option>\
        </select><br>')
      .append('<label class="checkbox" id="open">\
        <input type="checkbox" checked value="" >Регистрация открыта\
        </label>')
      .append('<button class="btn" type="button" id="create">Создать</button>'); 
      break;
      case 'section': case 'master class': case 'round table': case 'training': case 'olympiad':

      $('div#create').append('<h2>Регистрация нового участника</h2><br><label class="control-label" for="name">ФИО</label>\
        <input class="span8" id="name" type="text" placeholder="Введите ФИО" oninput="CreateEventInput()">')
      .append('<label class="control-label" for="ID">ID</label>\
        <input name="ID" type="text" disabled class="span8" id="ID">')
      .append('<label class="control-label" for="place">Населенный пункт</label>\
        <input class="span8" id="place" type="text" placeholder="Введите населенный пункт">')
      .append('<label class="control-label" for="facility">Организация</label>\
        <input class="span8" id="facility" type="text" placeholder="Введите организацию">')
      .append('<label class="control-label" for="post">Должность</label>\
        <input class="span8" id="post" type="text" placeholder="Введите должность">')
      .append('<label class="control-label" for="email">E-mail</label>\
        <input class="span8" id="email" type="text" placeholder="Введите e-mail">')
      .append('<label class="control-label" for="phone">Контактный телефон</label>\
        <input class="span8" id="phone" type="text" placeholder="Введите телефон">')
      .append('<label class="control-label" for="degree">Степень участия</label>\
        <select name="degree" id="degree">\
        <option value="участник">участник</option>\
        <option value="выступающий">выступающий</option>\
        <option value="организатор">организатор</option>\
        </select><br>')            
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
        if (value.id == 'name' 
          || value.id == 'place' 
          || value.id == 'facility'
          || value.id == 'post' 
          || value.id == 'email'
          || value.id == 'degree'
          || value.id == 'team' 
          || value.id == 'moderator'
          || value.id == 'phone'
          || value.id == 'hours' 
          || value.id == 'date' 
          || value.id == 'lastnumber'
          || value.id == 'target'
          || value.id == 'form') {
          putrequest[value.id] = value.value;
      }
      if (value.id == 'activated') {putrequest['activated'] = ($('label#activated > input').attr('checked')) ? true : false}
        if (value.id == 'open') {putrequest['open'] = ($('label#open > input').attr('checked')) ? true : false}
        if (value.id == 'type') { putrequest['type'] = value.value}
      });
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
        $('#breadcrumb').prepend('<li id="active">'+((data.response.name.length>90) ? data.response.name.slice(0,86)+'...' : data.response.name)+'<span class="divider">/</span></li>');
        $('#active').addClass('active');  }
        else $('#breadcrumb').prepend('<li><a id="'+source+'" class="breadelem" href="#">'+((data.response.name.length>90) ? data.response.name.slice(0,86)+'...' : data.response.name)+'</a><span class="divider">/</span></li>');
        if (source != res) breadcrumb(back(source),false);


      }
    });
}

function mainnav(source)
{
  $('#breadcrumb').hide();
  window.console && console.log("i'm here");
  $('#search').unbind("click");
  $('#search').click(function(event){
    event.stopPropagation();
    event.preventDefault();
    var text = $(this).prev().val();
        // alert(text);
        
        $.getJSON(source, function(datas){
          var users = getusersfromjson(datas.response,source);

          users = search(text,users);
          //alert(JSON.stringify(users));
          $('#mainnav').html('<li><a id="'+source+'" class="navelem back" href="#">..</a></li>');
          for (index in users){
            for (index2 in users[index]){
              $('#mainnav').append('<li class><a id="'+index2+'" class="navelem" href="#">'+ users[index][index2]['name'] +'<button type="button" class="close">×</button></a></li>');
            }
          }
          navelemclick();
          closeclick(source);

        });
      });
  $.getJSON(source, function(data){
    $('#breadcrumb').html('');
    breadcrumb(source,true);
    $('#mainnav').html('');
    $('div#modify').html('');
    if (source != res) $('#mainnav').html('<li><a id="'+back(source)+'" class="navelem back" href="#">..</a></li>');
    $.each(data.response, function(index,value){
      if (typeof value == "object" && (value.type != "template")) {
        var text = '';
        if (value.type == 'user') text += (value.number)? value.number+' ' : '';
        text += (!value.name)? String(index) : value.name
        if (text.length > 85) text = text.slice(0,85)+'...';
        $('#mainnav').append('<li class><a id="'+source+index+'/'+'" class="navelem" href="#">'+ text +'<button type="button" class="close">×</button></a></li>')
      }
      else
      {

      }
    });
    if ($('#mainnav').text() == '') $('#modify').html('<h4 style="text-align: center">Пока что для вас не доступна ни одна из конференций</h4>');
    
    
    modifyprop(data, source);
    create(data, source);
    newusers();
    navelemclick();
    closeclick(source);
  });
}

function navelemclick(){
  $('.navelem').click( function(){
    mainnav($(this).attr('id'));
    $.contextMenu( 'destroy', '.navelem:not(.back)' );
    if ($(this).text() != '..') contextmenu(back($(this).attr('id')));

  }
  );
}

function closeclick(source){
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

function search(text, users){
  var searched = [];
  for (var index in users)
  {
    // alert(JSON.stringify(users[index]));
    if (JSON.stringify(users[index]).indexOf(text) != -1)
    {
      // alert("i've got it!");
      searched.push(users[index]);
    }    
  }
  return searched;
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