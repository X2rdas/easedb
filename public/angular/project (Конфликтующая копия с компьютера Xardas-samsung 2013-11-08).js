var mainApp = angular.module('mainApp', ['ngGrid','ngRoute','mainStorage']).
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:'BrowseCtrl', templateUrl:'browse.html'}).
      when('/:projectId*/print', {controller:'PrintCtrl', templateUrl:'print.html'}).
      when('/:projectId*/list', {controller:'ListCtrl', templateUrl:'list.html'}).
      when('/:projectId*', {controller:'BrowseCtrl', templateUrl:'browse.html'}).
      
      // when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
      otherwise({redirectTo:'/'});
  }).
  config(['$httpProvider', function($httpProvider) {
            // $httpProvider.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode('admin:password');
        // $httpProvider.defaults.useXDomain = true;
        // delete $httpProvider.defaults.headers.common['X-Requested-With'];
        
    }
  ]).
  // directive('ngBlur', function () {
  //     return function (scope, elem, attrs) {
  //         elem.bind('blur', function () {
  //             scope.$apply(attrs.ngBlur);
  //         });
  //     };
  // }).
  filter('is', function() {
    return function(items, type) {
        var result = {};
        angular.forEach(items, function(value, key) {
            if (typeof value == type) {
                result[key] = value;
            }
        });
        return result;
    };
  }).
  filter('contains', function() {
    return function(items, str, match) {
        var result = {};
        try{
          var regexp = new RegExp(str,'i');
        } catch(e) {
          return result;
        }
        
        angular.forEach(items, function(value, key) {
            // alert(JSON.stringify(value));
            

            // if (JSON.stringify(value).indexOf(str) > -1) {
            var matched = false;
            if (JSON.stringify(value).match(regexp)) {
                matched = true;
            }
            if (match && matched || !match && !matched) result[key] = value;

        });
        return result;
    };
  }).
  filter('extension', function() {
    return function(items, ext, match) {
        var result = {};
        angular.forEach(items, function(value, key) {
            // alert(JSON.stringify(value));
            // var regexp = new RegExp(str,'i');

            var file_ext = (/[.]/.exec(value)) ? /[^.]+$/.exec(value) : 'undefined';
            // alert(file_ext);
            if (match) {           
              if (file_ext == ext) { 
                result[value] = value;
              }
            }
            else {
              if (file_ext != ext) { 
                result[value] = value;
              }
            }
        });
        return result;
    };
  }).
  factory('Base64',function(){
        var keyStr = 'ABCDEFGHIJKLMNOP' +
                'QRSTUVWXYZabcdef' +
                'ghijklmnopqrstuv' +
                'wxyz0123456789+/' +
                '=';
        return {
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                do {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output +
                            keyStr.charAt(enc1) +
                            keyStr.charAt(enc2) +
                            keyStr.charAt(enc3) +
                            keyStr.charAt(enc4);
                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";
                } while (i < input.length);

                return output;
            },

            decode: function (input) {
                var output = "";
                var chr1, chr2, chr3 = "";
                var enc1, enc2, enc3, enc4 = "";
                var i = 0;

                // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
                var base64test = /[^A-Za-z0-9\+\/\=]/g;
                if (base64test.exec(input)) {
                    alert("There were invalid base64 characters in the input text.\n" +
                            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                            "Expect errors in decoding.");
                }
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                do {
                    enc1 = keyStr.indexOf(input.charAt(i++));
                    enc2 = keyStr.indexOf(input.charAt(i++));
                    enc3 = keyStr.indexOf(input.charAt(i++));
                    enc4 = keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }

                    chr1 = chr2 = chr3 = "";
                    enc1 = enc2 = enc3 = enc4 = "";

                } while (i < input.length);

                return output;
            }
        };
    }).
    controller('BrowseCtrl', function ListCtrl($scope, $location, $http, $route, Base64, Storage, urls) {
      $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode('admin:password');
      Storage.get({'type': 'user', 'activated': false}, function(data,status) {
        $scope.new_users = getUsersFromJSON(data.response,'/');
        // alert(JSON.stringify($scope.new_users));

        // $scope.current_id = data.id;
      });
      Storage.get({id: $location.path(), 'non_recursive': true}, function(data,status) {
        $scope.projects = {};
        $scope.project = {};
        $scope.multimedia = [];
        for(var key in data.response) {
          if (data.response[key] == 'true') data.response[key] = true;
          else if (data.response[key] == 'false') data.response[key] = false;
          if (typeof(data.response[key]) == 'object') $scope.projects[key] = data.response[key];
          else if (data.response[key] != "attachment") $scope.project[key] = data.response[key];
          else $scope.multimedia.push(key);
        }
        // alert(JSON.stringify($scope.project));
        // $scope.projects = data.response;
        $scope.current_id = data.id;
        $scope.fields = {};
        for(var key in $scope.projects){
          for(var key2 in $scope.projects[key]){
            if ($scope.projects[key][key2] != "attachment" && ($scope.projects[key][key2] == 'true' || $scope.projects[key][key2] == 'false')) $scope.fields[key2] = 'boolean';
            else if ($scope.projects[key][key2] != "attachment" && typeof($scope.projects[key][key2]) == 'string') $scope.fields[key2] = 'string';
          }
        }
        // alert(JSON.stringify($scope.fields));
      });
      if ($location.path() != '/') $scope.location = $location.path();
      else $scope.location = '';
      $scope.location_array = ['Главная'];
      $scope.location_array.push($location.path().split('/').filter(function (value) {
        return value != "";
        }));
      $scope.location_array = flattenArray($scope.location_array);
      // alert($scope.location.array);
      $scope.url_array = ['/'];
      $scope.urls = urls;
      for (var i=1; i < $scope.location_array.length; i++) {
        url = "";
        for (var j=1; j <= i; j++) {
            url += $scope.location_array[j]+'/';
        }
        $scope.url_array.push(url);
        }
      $scope.searchtext = '';
      
      $scope.save = function() {
        // alert(JSON.stringify($scope.projects));
        Storage.save({id: $location.path()}, 
          $scope.project, function(){ 
            alert('Данные успешно обновлены'); 
            $route.reload();
          }, 
          function(){
            alert('Во время обновления данных произошла ошибка'); 
            $route.reload();
          }
        ); 
      };
    }).
    controller('PrintCtrl', function PrintCtrl($scope, $location, $http, $route, Base64, Storage, urls){
      $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode('admin:password');
      $scope.back_url = back($location.path());
      if ($location.path() != '/') $scope.location = $location.path();
      else $scope.location = '';
      $scope.urls = urls;
      $scope.ismatched = true;
      $scope.ismatched2 = true;
      $scope.selected = [];
      $scope.selectedSelected = [];
      $scope.selectedValues = [];
      $scope.selectedKeys = [];
      Storage.get({id: $scope.back_url, 'type': 'user', 'activated': 'true'}, function(data,status) {
        $scope.data = getUsersFromJSON(data.response,'/');
        // alert(JSON.stringify(getUsersFromJSON($scope.data,'/')));
      });
      $scope.searchtext = '';
      $scope.searchtext2 = '';

      $scope.getKeys = function(obj){
         var keys = [];
         for(var key in obj){
            keys.push(key);
         }
         return keys;
      }
      $scope.back = back;
      $scope.copy = function(){

      }

       $scope.select = function(){
          // alert(JSON.stringify($scope.selected));
          var key = 0;
          while (key<$scope.data.length) {
            // alert(JSON.stringify($scope.data[key]));
            var user_key = $scope.getKeys($scope.data[key])[0];
            if (inArray('\n        '+$scope.data[key][user_key].name+' ('+$scope.data[key][user_key].facility+')\n      ', $scope.selected)) {
              $scope.selectedValues = $scope.selectedValues.concat($scope.data[key]).unique();
              $scope.selectedKeys = $scope.selectedKeys.concat(getLastEntry(user_key)).unique();
              $scope.data.remove($scope.data[key]);
            }
            else key++;

          }
          // alert($scope.selectedValues);

        };

      $scope.deselect = function(){
         // alert(JSON.stringify($scope.selected));
         var key = 0;
         while (key<$scope.selectedValues.length) {
           // alert(JSON.stringify($scope.selectedValues[key]));
           if (inArray('\n        '+$scope.selectedValues[key][$scope.getKeys($scope.selectedValues[key])[0]].name+' ('+$scope.selectedValues[key][$scope.getKeys($scope.selectedValues[key])[0]].facility+')\n      ', $scope.selectedSelected)) {
             // alert($scope.selectedValues[key],getLastEntry($scope.getKeys($scope.selectedValues[key])[0]) )
             $scope.data = $scope.data.concat($scope.selectedValues[key]).unique();
             $scope.selectedKeys.remove(getLastEntry($scope.getKeys($scope.selectedValues[key])[0]));
             $scope.selectedValues.remove($scope.selectedValues[key]);
             
           }
           else key++;

         }
         // alert($scope.selectedValues);

       };

       $scope.deselectSelect = function(id){
          $("#"+id+" > option:selected").removeAttr("selected");
          // alert($("#"+id).attr('size'));
        }

    }).
    controller('ListCtrl', function ListCtrl($scope, $location, $http, $route, Base64, Storage, Storage2, urls){
      $http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode('admin:password');
      $scope.cbVal = function (row) {
        return ((row.activated) == 'true') ? 1 : 0;             
        //console.log('r item resolved here ',row);
        //    if ((row.age)>30)   { return 1}   else  { return 0}
          };
      $scope.filterOptions = {
        filterText: ''
      };
      $scope.backUrl = back($location.path())+'/';
      $scope.selectedItemsForMove = '';
      // var checkboxCellTemplate='<div class="ngSelectionCell"><input tabindex="-1" class="ngSelectionCheckbox" type="checkbox" ng-checked="cbVal(row.entity)" /></div>';  // wrks best 
      var cellEditableTemplate = "<input style=\"width: 90%\" ng-class=\"'colt' + col.index\" ng-model=\"COL_FIELD\" ng-input=\"COL_FIELD\" ng-blur=\"updateEntity(col, row)\"/>";
      // var selectCellTemplate=
      // alert($scope.backUrl);
      
      $scope.gridOptions = { data: 'myData',         
        enableCellSelection: true,
        enableRowSelection: true,
        enableCellEdit: true, // enablePinning: true,
            // enableCellSelection: true,
        multiSelect: true,
        enableColumnResize: true,
        filterOptions: $scope.filterOptions,
        // plugins: [new ngGridFlexibleHeightPlugin()],
        columnDefs: [
                    { field: "number", displayName: 'Номер справки', width: "8%" ,enableCellEdit: false },
                    { field: "name", displayName: 'ФИО', width: " 23%" ,enableCellEdit: true,editableCellTemplate: cellEditableTemplate },
                    { field: "facility", displayName: 'Место работы', width: " 30%" ,enableCellEdit: true,editableCellTemplate: cellEditableTemplate },
                    { field: "post", displayName: 'Должность', width: " 15%" ,enableCellEdit: true,editableCellTemplate: cellEditableTemplate },
                    { field: "parent_name", displayName: 'Секция', width: " 10%" ,enableCellEdit: false },
                    // { field: 'activated', displayName: 'Активирован', width: 60 , cellTemplate:checkboxCellTemplate, pinned: false,sortable:false }
                    { field: '', cellTemplate: '<button class="btn" data-toggle="modal" data-target="#moveModal" ng-click="setMove(row)">Перенести</button>', width: " 10%" },
                    { field: '', cellTemplate: '<button class="btn" ng-click="delete(row)">X</button>', width: " 5%" }

                    // { field: 'activated', displayName: 'Активирован', width: 60 , cellTemplate:checkboxCellTemplate, pinned: false,sortable:false }
                    ]
      };

      $scope.height = 400;
      $scope.newUser = {name:"", facility:"", post:"", activated: "true"};

      $scope.reload = function() {
        Storage.get({id: $scope.backUrl}, function(data,status) {
          $scope.myData = getUsersFromJSONForList(data.response,$scope.backUrl);
          $scope.sectionList = getSectionsFromJSONForList(data.response,$scope.backUrl);
          // $scope.height = $scope.myData.length * 30 + 32; // 30 - default row height in ngGrid, 32 - header height
        });
      }

      $scope.delete = function(row){
        console.log('DELETE to: '+row.entity.id);
        if (row.entity.id[0] != '/') return;
        Storage.delete({id: row.entity.id}, function(data,status) {
          $scope.myData.remove(row.entity);
          alert('Данные успешно удалены');

          // $scope.height = $scope.myData.length * 30 + 32; // 30 - default row height in ngGrid, 32 - header height
        }, function(){alert('Во время удаления возникла ошибка');});
      }


      $scope.move = function(){
        console.log('PUT: '+$scope.moveTarget+'?move='+$scope.selectedItemsForMove);
        // $scope.moveTarget = row.entity.id;
        Storage.create({id: $scope.moveTarget, 'move': '/db/conferences'+$scope.selectedItemsForMove}, {}, function(data,status) {

          alert('Данные успешно перенесены!');
          $scope.reload();
        //   // $scope.height = $scope.myData.length * 30 + 32; // 30 - default row height in ngGrid, 32 - header height
        }),
        function() {
          alert('При переносе возникла ошибка');
        }
      }

      $scope.setMove = function(row){
        // console.log('PUT?move to: '+row.entity.id);
        $scope.moveTarget = row.entity.id;
        // Storage.delete({id: row.entity.id}, function(data,status) {
        //   alert('Данные успешно удалены');

        //   // $scope.height = $scope.myData.length * 30 + 32; // 30 - default row height in ngGrid, 32 - header height
        // });
      }


      $scope.newUser = function(){

        $scope.newUser = {name:"", facility:"", post:"", activated: "true", type: "user"};
      }

      $scope.sendNewUser = function(){
        $scope.newUser.id = $scope.selectedItemsForMove+'/'+translateIt($scope.newUser.name)
        Storage.create({id: $scope.newUser.id},$scope.newUser,function(){
          $scope.myData.push($scope.newUser);
          alert('Участник успешно зарегистрирован!');
        });
      }



      $scope.updateEntity = function(column, row) {
        console.log('POST to: '+row.entity.id+'/'+' {"'+column.field+'": "'+row.entity[column.field]+'"}');
        obj = {}
        obj[column.field] = row.entity[column.field];
        // Storage.save({id: row.entity.id}, 
        //   obj, function(){ 
        //   }, 
        //   function(error){
        //     alert('Во время обновления данных произошла ошибка: '+error.data.error); 
        //     $scope.reload();
        //   }
        // ); 
      }

      $scope.reload();


    });
