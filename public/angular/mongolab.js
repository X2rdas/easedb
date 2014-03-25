angular.module('mainStorage', ['ngResource']).
  constant('urls', {
    'apache': 'http://shgpi.edu.ru/meet/db/conferences',
    'system_https_internal' : 'https://meet.shgpi:4567/db/conferences',
    'system_http_internal' : 'http://meet.shgpi:4568/db/conferences',
    'system_https_external' : 'https://shgpi.edu.ru:port/db/conferences',
    'system_http_external' : 'http://shgpi.edu.ru:port/db/conferences',
    'system_https_localhost': 'https://localhost:4567/db/conferences', 
    'system_http_localhost': 'https://localhost:4568/db/conferences'
  }).
  factory('Storage', function($resource, urls) {

    var Storage = $resource(urls.system_https_external+":id",
        {port: ':4567',id: '@id'}, {
          create: { method: 'PUT' },
          // update: { method: 'POST' },
        }
    );

    return Storage;
  }).
  factory('Storage2', function($resource, urls) {

    var Storage = $resource(urls.system_https_external+":id",
        {port: ':9999',id: '@id'}, {
          create: { method: 'PUT' },
          // update: { method: 'POST' },
        }
    );

    return Storage;
  });
    
