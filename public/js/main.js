function mainnavSort() {
  var elems = $('#mainnav').children('li').remove();
  elems.sort(function(a, b) {
    if(typeof(a.innerText) != 'undefined') {
      return a.innerText.localeCompare(b.innerText);
    } else {
      return a.textContent.localeCompare(b.text);
    }
  });
  $('#mainnav').append(elems);
}


$(function() {

  var db = "http://shgpi.edu.ru:4568/db/"
  var confdb = "http://shgpi.edu.ru:4568/db/conferences/"

  var methodMap = {
    'create': 'PUT',
    'update': 'POST',
    'patch': 'PATCH',
    'delete': 'DELETE',
    'read': 'GET'
  };

  var MainMenuModel = Backbone.Model.extend({

    parse: function(resp) {
      return resp.response
    },

    initialize: function() {

      this.fetch({

        success: function(model, response) {

          model.id = getlastentry(model.urldelete)
          var nodes = [];

          _.each(response.response, function(value, key) {

            if(typeof value == "object") {
              var MainMenuNodeModel = Backbone.Model.extend({
                url: model.urldelete + key,
                urlRoot: model.urlRoot + key,
                name: value.name,
                id: response.id
              });
              nodes.push(new MainMenuNodeModel());

            }
          });

          var menu = new MainMenuView({
            url: model.urlRoot,
            nodes: nodes,
            model: model
          });
          model.trigger('change');
          switch(model.get('type')) {
          case 'top':
            var attributes = new ClearView();
            break;
          case 'faculty':
            var attributes = new FacultyView({
              model: model
            });
            break;
          case 'conference':
            var attributes = new ConferenceView({
              model: model
            });
            break;
          case 'section':
          case 'master class':
          case 'round table':
          case 'training':
            var attributes = new SectionView({
              model: model
            });
            break;
          case 'user':
            var attributes = new UserView({
              model: model
            });
            break;
          }
          return model.get('response');
        }
      });
    }
  });

  //ROUTER
  var Router = Backbone.Router.extend({
    routes: {

      "db/*path": "getNode",
      "": "index"
    },

    index: function() {

      var IndexMainMenuModel = MainMenuModel.extend({
        url: confdb + '?non_recursive=true',
        urlRoot: 'db/',
        urldelete: confdb
      });
      var tree = new IndexMainMenuModel();
    },
    getNode: function(path) {
      var NonIndexMainMenuModel = MainMenuModel.extend({
        url: confdb + path + '?non_recursive=true',
        urlRoot: 'db/' + path,
        urldelete: confdb + path
      });
      var tree = new NonIndexMainMenuModel();
    }
  });
  var router = new Router();

  //VIEWS
  var MainMenuNodeView = Backbone.View.extend({
    el: $('#mainnav'),


    initialize: function() {
      // alert('init');
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
      var str = 'click a[href="#' + this.model.urlRoot + '/"]>.close';
      var obj = {};
      obj[str] = 'close';
      this.delegateEvents(obj);
      // alert($(this).children().attr('href'));
      // this.$el.on('click',this.close);
    },

    render: function() {
      var maintemplate = _.template($("#navnode").html(), {
        url: this.model.urlRoot,
        name: this.model.name
      });
      this.$el.append(maintemplate);
      // $('.close').mousedown(this.close());
      return maintemplate;
    },

    close: function() {
      // alert(this);
      if(confirm("Вы уверены?")) {
        this.model.destroy({
          wait: true,
          xhrFields: {
            withCredentials: true
          },
          error: function(xhr, text) {
            alert(JSON.stringify(text));
          }
        });
        return false;
      }
    },

    remove: function() {
      // alert(this.model.urlRoot);
      $('li > a[href="#' + this.model.urlRoot + '/"]').fadeOut('slow', function() {
        $(this).remove();
      });
    }
  });

  var MainMenuView = Backbone.View.extend({
    el: $("#mainnav"),

    initialize: function() {

      this.model.bind('change', this.render, this);
      // this.render();
    },

    render: function() {

      var maintemplate = _.template($("#navigation").html(), {
        url: this.options.url
      });
      this.$el.html(maintemplate);
      var nodeviews = [];
      el = this.$el;

      _.each(this.options.nodes, function(value) {
        nodeviews.push(new MainMenuNodeView({
          model: value
        }));
        value.trigger('change');

      });
      mainnavSort();

      return this;
    }
  });

  var FacultyView = Backbone.View.extend({
    el: 'div#modify',
    events: {
      'click #apply': 'apply'
    },
    initialize: function() {
      $(this.el).undelegate('#apply', 'click');
      this.model.bind('change', this.render, this);
      this.render();
    },
    render: function() {
      $('div#modify').html('<label class="control-label" for="name">Название</label>\
        <input class="span8" id="name" type="text" placeholder="Введите название">').append('<label class="control-label" for="ID">ID</label>\
        <input name="ID" type="text" disabled class="span8" id="ID">').append('<label class="control-label" for="owner">Пользователи, имеющие доступ:</label>\
        <input class="span8" id="owner" type="textarea" placeholder="Введите пользователей">').append('<button class="btn" type="button" id="apply">Применить изменения</button>');
      $('div#modify #name').val((typeof this.model.get('name') == 'undefined') ? '' : this.model.get('name'));
      $('div#modify #ID').val((typeof this.model.get('id') == 'undefined') ? '' : this.model.get('id'));
      $('div#modify #owner').val((typeof this.model.get('owner') == 'undefined') ? '' : this.model.get('owner'));

    },
    clear: function() {
      $('div#modify').html('');
    },
    apply: function() {
      this.model.save({
        name: $('div#modify #name').val(),
        owner: $('div#modify #owner').val()
      });
    }
  });

  var ClearView = Backbone.View.extend({
    el: 'div#modify',
    initialize: function() {
      $(this.el).undelegate('#apply', 'click');
      this.render();
    },
    render: function() {
      $('div#modify').html('');
    }

  });

  var SectionView = Backbone.View.extend({
    el: 'div#modify',
    initialize: function() {
      $(this.el).undelegate('#apply', 'click');
      this.model.bind('change', this.render, this);
      this.render();
    },
    render: function() {
      $('div#modify').html('<label class="control-label" for="name">Название секции</label>\
        <input class="span8" id="name" type="text" placeholder="Введите название">').append('<label class="control-label" for="moderator">Модераторы</label>\
        <input class="span8" id="moderator" type="text" placeholder="Введите модераторов">').append('<label class="control-label" for="hours">Количество часов</label>\
        <input class="span8" id="hours" type="text" placeholder="Введите количество часов">').append('<label class="control-label" for="type">Тип</label>\
        <select name="type" id="type">\
        <option value="section"' + ((this.model.get('type') == 'section') ? 'selected' : '') + '>Секция</option>\
        <option value="master class"' + ((this.model.get('type') == 'master class') ? 'selected' : '') + '>Мастер-класс</option>\
        <option value="round table" ' + ((this.model.get('type') == 'round table') ? 'selected' : '') + '>Круглый стол</option>\
        <option value="training"' + ((this.model.get('type') == 'training') ? 'selected' : '') + '>Тренинг</option>\
        </select><br>').append('<label class="control-label" for="owner">Пользователи, имеющие доступ:</label>\
        <input class="span8" id="owner" type="textarea" placeholder="Введите пользователей">')

      .append('<button class="btn" type="button" id="apply">Применить изменения</button>');
      $('div#modify #name').val((typeof this.model.get('name') == 'undefined') ? '' : this.model.get('name'));
      $('div#modify #moderator').val((typeof this.model.get('moderator') == 'undefined') ? '' : this.model.get('moderator'));
      $('div#modify #hours').val((typeof this.model.get('hours') == 'undefined') ? '' : this.model.get('hours'));
      $('div#modify #owner').val((typeof this.model.get('owner') == 'undefined') ? '' : this.model.get('owner'));

    },
    clear: function() {
      $('div#modify').html('');
    }
  });

  var ConferenceView = Backbone.View.extend({
    el: 'div#modify',
    events: {
      'click #apply': 'apply'
    },
    initialize: function() {
      $(this.el).undelegate('#apply', 'click');
      this.model.bind('change', this.render, this);
      this.render();
    },
    render: function() {
      $('div#modify').html('<label class="control-label" for="name">Название конференции</label>\
                <input class="span8" id="name" type="text" placeholder="Введите название">').append('<label class="control-label" for="date">Дата проведения</label>\
                <input class="span8" id="date" type="text" placeholder="Введите дату проведения">').append('<label class="control-label" for="lastnumber">Последний номер выданной справки</label>\
                <input class="span8" id="lastnumber" type="text" placeholder="Введите номер">').append('<label class="control-label" for="moderator">Организаторы</label>\
                <input class="span8" id="moderator" type="text" placeholder="Введите организаторов">').append('<label class="control-label" for="form">Форма проведения</label>\
                <input class="span8" id="form" type="text" placeholder="Введите форму">').append('<label class="control-label" for="owner">Пользователи, имеющие доступ:</label>\
                <input class="span8" id="owner" type="textarea" placeholder="Введите пользователей">').append('<button class="btn" type="button" id="apply">Применить изменения</button>');

      $('div#modify #name').val((typeof this.model.get('name') == 'undefined') ? '' : this.model.get('name'));
      $('div#modify #date').val((typeof this.model.get('date') == 'undefined') ? '' : this.model.get('date'));
      $('div#modify #lastnumber').val((typeof this.model.get('lastnumber') == 'undefined') ? '' : this.model.get('lastnumber'));
      $('div#modify #form').val((typeof this.model.get('form') == 'undefined') ? '' : this.model.get('form'));
      $('div#modify #moderator').val((typeof this.model.get('moderator') == 'undefined') ? '' : this.model.get('moderator'));
      $('div#modify #owner').val((typeof this.model.get('owner') == 'undefined') ? '' : this.model.get('owner'));
      $('div#modify').append('<h2>Вложения</h2><br>\
                <ul class="nav nav-tabs nav-stacked" id="attachments">');
      var model = this.model;
      $.each(this.model.toJSON, function(index, value) {
        if(value == "attachment") $('#attachments').append('<li class><a href="' + model.urldelete + index + '" class="attelem">' + index + '<button type="button" class="close">×</button></a></li>');
      });
      $('div#modify').append('</ul>');


    },
    clear: function() {
      $('div#modify').html('');
    },
    apply: function() {
      this.model.save({
        name: $('div#modify #name').val(),
        owner: $('div#modify #owner').val(),
        date: $('div#modify #date').val(),
        lastnumber: $('div#modify #lastnumber').val(),
        form: $('div#modify #form').val(),
        moderator: $('div#modify #moderator').val(),
      });
    }
  });

  var UserView = Backbone.View.extend({
    el: 'div#modify',
    events: {
      'click #apply': 'apply'
    },

    initialize: function() {

      // this.model.bind('change', this.clear, this);
      $(this.el).undelegate('#apply', 'click');
      this.render();
    },
    render: function() {
      $('div#modify').html('<label class="control-label" for="name">ФИО</label>\
        <input class="span8" id="name" type="text" placeholder="Введите ФИО">').append('<label class="control-label" for="ID">ID</label>\
        <input name="ID" type="text" disabled class="span8" id="ID">').append('<label class="control-label" for="place">Населенный пункт</label>\
        <input class="span8" id="place" type="text" placeholder="Введите населенный пункт">').append('<label class="control-label" for="facility">Организация</label>\
        <input class="span8" id="facility" type="text" placeholder="Введите организацию">').append('<label class="control-label" for="post">Должность</label>\
        <input class="span8" id="post" type="text" placeholder="Введите должность">').append('<label class="control-label" for="email">E-mail</label>\
        <input class="span8" id="email" type="text" placeholder="Введите e-mail">').append('<label class="control-label" for="degree">Степень участия</label>\
        <select name="degree" id="degree">\
        <option value="участник"' + ((this.model.get('degree') == 'участник') ? 'selected' : '') + '>участник</option>\
        <option value="выступающий"' + ((this.model.get('degree') == 'выступающий') ? 'selected' : '') + '>выступающий</option>\
        <option value="организатор"' + ((this.model.get('degree') == 'организатор') ? 'selected' : '') + '>организатор</option>\
        </select><br>').append('<label class="control-label" for="number">Справка</label>\
        <input class="span8" id="number" type="text" placeholder="Справка не выдана">').append('<label class="control-label" for="certificate_date">Выдана</label>\
        <input class="span8" id="certificate_date" type="text" placeholder="Справка не выдана">').append('<label class="control-label" for="owner">Пользователи, имеющие доступ:</label>\
        <input class="span8" id="owner" type="textarea" placeholder="Введите пользователей">');
      $('div#modify #name').val((typeof this.model.get('name') == 'undefined') ? '' : this.model.get('name'));
      $('div#modify #ID').val((typeof this.model.id == 'undefined') ? '' : this.model.id);
      $('div#modify #place').val((typeof this.model.get('place') == 'undefined') ? '' : this.model.get('place'));
      $('div#modify #facility').val((typeof this.model.get('facility') == 'undefined') ? '' : this.model.get('facility'));
      $('div#modify #post').val((typeof this.model.get('post') == 'undefined') ? '' : this.model.get('post'));
      $('div#modify #email').val((typeof this.model.get('email') == 'undefined') ? '' : this.model.get('email'));
      $('div#modify #number').val((typeof this.model.get('number') == 'undefined') ? '' : this.model.get('number'));
      $('div#modify #certificate_date').val((typeof this.model.get('certificate_date') == 'undefined') ? '' : this.model.get('certificate_date'));
      $('div#modify #owner').val((typeof this.model.get('owner') == 'undefined') ? '' : this.model.get('owner'));
      var checked = (this.model.get('activated') && this.model.get('activated') != 'false') ? 'checked' : '';
      $('div#modify').append('<label class="checkbox">\
        <input type="checkbox" ' + checked + ' value="" id="activated" >Подтвержденный участник\
        </label>').append('<button class="btn" type="button" id="apply">Применить изменения</button>').append('<button class="btn primary-btn" type="button" id="print">Печать</button>');

    },

    apply: function() {
      
      this.model.save({
        name: $('div#modify #name').val(),
        place: $('div#modify #place').val(),
        facility: $('div#modify #facility').val(),
        post: $('div#modify #post').val(),
        email: $('div#modify #email').val(),
        number: $('div#modify #number').val(),
        certificate_date: $('div#modify #certificate_date').val(),
        owner: $('div#modify #owner').val(),
        activated: $('div#modify #activated').prop("checked")


      });
      // this.model.save(this.model.get('response'), {username: 'admin', password: 'password'});
      // Backbone.sync('update',this.model,{data: this.model.get.('response'), username: admin, password: password});
    }
  });

  Backbone.history.start();

});