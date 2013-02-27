easeDB
-----

Small database, which you may to use in projects with hierarchical data.
Very fast and easy to use, it offers REST-interface and possibility to create your data directly in folder ./db.

Usage:
======
All folders and files in ./db folder will be represented as JSON on https://your.address:4567/db/ and http://your.address:4568/db/.Each folder in this case will be a hash, each file without extention will be a "file name" => "file contents", each file with extention will be a "file name" => "attachment", which can be accessed directly in example as http://your.address:4568/db/folder/folder/folder/filename
You can use GET requests to get data, PUT requests with HTTP-JSON-body for create data on server, POST requests with HTTP-JSON-body for modify your data and DELETE (you can add in body array of items that must be removed or empty body will remove current folder) for removing your data.