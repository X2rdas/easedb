easeDB
-----

Small database, which you may to use in projects with hierarchical data.
Very fast and easy to use, it offers REST-interface and possibility to create your data directly in folder ./db.

Usage:
======
All folders and files in ./db folder will be represented as JSON on https://your.address:4567/db/ and http://your.address:4568/db/. Each folder in this case will be a hash, each file without extention will be a "filename" => "filecontents", each file with extention will be a "filename" => "attachment", which can be accessed directly in example as http://your.address:4568/db/folder/folder/folder/filename.jpg
You can use GET requests to get data, PUT requests with HTTP-JSON-body for create data on server, POST requests with HTTP-JSON-body for modify your data and DELETE (you can add in body array of items that must be removed or empty body will remove current folder) for removing your data.

To setup server need to install packages:
rubygems libruby-devel gcc4.5 gcc4.5-c++ make openssl openssl-devel 
and gems:
sinatra sinatra-contrib rb-inotify rack-ssl thin

Modify config.yml and config_ssl.yml to change options of Thin for http and https instances and change your root folder for server, also setup config2.yml for users that can modify data (PUT, POST and DELETE requests will be available only after basic http authentication). For https intstance you must have ssl certificate.

To start db in this folder:

$ thin start -C config_ssl.yml -R config.ru start --ssl --ssl-verify --ssl-key-file your-key --ssl-cert-file your-certificate

$ thin start -C config.yml

To stop db:

$ thin stop -C config_ssl.yml

$ thin stop -C config.yml 

Also, you can use example of init.d script from init.d folder to manage your server.