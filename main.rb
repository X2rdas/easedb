#encoding: utf-8
require 'rubygems'
require './OS.rb'
require 'sinatra'
require 'json/ext'
#require 'yajl/json_gem'
require './hashext.rb'
require 'fileutils'
require 'sinatra/config_file'
if OS.linux?
  require 'rb-inotify'
end
require 'uri'
require 'vine'
# require 'sinatra/reloader'
require './helpers.rb'

Encoding.default_external = "utf-8"
#require 'google_hash'
# require 'rack/ssl'

#set settings.root_db, '/home/admin/server'
#set :public_folder, '/home/admin/server/public'
set :static, true
set :server, ['thin', 'webrick']
config_file 'config2.yml'

  USERS_FILE = 'users.json'
  RIGHTS_FILE = ".rights.json"

  $userlist = reload_users
  exit "root_db must exist" if !Dir.exist? settings.root_db

# use Rack::SSL
  # helper for creation Hash object from a directory, where folders is a Hash objects, files is a key => value pair
 

  # data = directory_hash(settings.root_db+'/db/')
helpers do
  

  def admin_protected!
    unless admin_authorized?
      response['WWW-Authenticate'] = %(Basic realm="restricted area")
      throw(:halt, [401, "Not authorized\n"])
    end
  end

  def admin_authorized?
    @auth ||= Rack::Auth::Basic::Request.new(request.env)
    @auth.provided? && @auth.basic? && @auth.username && @auth.credentials[0] == $userlist.keys.first && @auth.credentials[1] == $userlist[$userlist.keys.first]
  end


  




  def local_last_modified
    return File.ctime(settings.root_db)
  end

  def url_decode(s)
    s.gsub(/((?:%[0-9a-fA-F]{2})+)/n) do
      [$1.delete('%')].pack('H*')
    end
  end

end


get '/auth_control' do
  erb :auth_control, :layout => true, :locals => {:userlist => $userlist}
end

post '/auth_control' do
  # params['$userlist'].to_json

  @userlist = {}
  params['$userlist'].each do |key,user|
    # user['login']
    @userlist[user['login']] = user['password']
  end
  if $userlist == @userlist 
    return erb :auth_control, :layout => true, :locals => {:userlist => $userlist}
  end
  # $userlist = @$userlist
  IO.write(File.join(settings.root,USERS_FILE),$userlist.to_json)
    
  erb :auth_control, :layout => true, :locals => {:userlist => $userlist}
end

before '/admin' do
  protected!
end

before '/user' do
  protected!
end

get '/evented/*' do
  stream(:keep_open) do |out|
    
  end
end


get '/' do
  # redirect to ('/admin')
  erb "<a href='#{request.scheme}://#{request.host}:#{request.port}/user'>Пользовательская часть</a><br>\
  <a href='#{request.scheme}://#{request.host}:#{request.port}/admin'>Административная часть</a><br>
  <a href='http://shgpi.edu.ru/meet/innovation_offline_registration/?url=https://meet.shgpi:4567'>Регистрация на инвестиционный форум</a>"
end


get '/user' do
  # return "Need to use HTTPS" unless request.secure?
  erb :user, :layout => true
end

get '/admin' do
  # return "Need to use HTTPS" unless request.secure?
  erb :admin
end

get '/registration' do
  return "Need to use HTTPS" unless request.secure?
  erb :registration
end

get '/backbone' do
  protected!
  File.read(File.join('public', 'backbone.html'))
end

get '/methods/:method' do
  if params['method'] == "new-auth"
    FileUtils.touch(settings.root_db+'/db/')
    redirect to ("#{request.scheme}://logout@#{request.host}:#{request.port}/")

  end
end

# some browsers don't support DELETE and PUT requests, and sends OPTIONS method instead
before do
  response.headers["Access-Control-Allow-Origin"] = '*'
  response.headers["Access-Control-Allow-Credentials"] = "true"
  response.headers["Access-Control-Allow-Headers"] = "accept, origin, content-type, authorization"

  if request.request_method == 'OPTIONS'




    response.headers["Access-Control-Allow-Methods"] = "GET, DELETE, PUT, POST"



    halt 200
  end
end

# main GET method
get '/db/*' do
  # return params[:splat]
  response.headers["Content-Type"] = 'application/json; charset=utf-8'
  clear_params = params.reject {|key,value| key == "splat" || key == "captures" || key == "non_recursive"}
  
  @path = (File.join(settings.root_db,*params[:splat])).force_encoding('utf-8')
  # return @path
  halt 404, {"ok" => false, "error" => "Not found"}.to_json unless File.exist?(@path)
  last_modified local_last_modified
  response['Cache-control'] = 'private, max-age=0, must-revalidate'
  response['Access-Control-Allow-Origin'] = '*'

  if !File.directory?(@path)
    ext = File.extname(@path)
    if ext != ""
      send_file(@path)
    end
  end
  data = {}
  data["response"] = if File.directory?(@path) then
    if params['non_recursive'] == "true"
      directory_hash_no_r(@path,true)
    else
      
      directory_hash(@path,auth_credentials[0])      
    end
  elsif !File.zero?(@path) then
    {File.basename(@path) => IO.read(@path)}
  end
  data["ok"] = true
  data["id"] = File.basename(@path)
  if auth_credentials
    data["auth"] = true
  else
    data["auth"] = false
  end

  # return "hyi"
  # return data.access(params[:splat][0].split("/").join(".")).to_json
  return data.to_json
end

# main PUT method
put '/db/*' do

  # halt 403, {"ok" => false, "error" => "Need to use HTTPS"} unless request.secure?

  protected!
  @path = (settings.root_db+url_decode(request.path)).force_encoding('utf-8')
  response['Access-Control-Allow-Origin'] = '*'
  if params['symlink']
    if !File.exist?(@path)
      if File.exist?(settings.root_db+params['symlink'])
        File.symlink(settings.root_db+params['symlink'],@path)
        return {"ok" => true}.to_json
      else
        halt 404, {"ok" => false, "error" => "No such file or directory"}.to_json
      end
    else
      halt 409, {"ok" => false, "error" => "Item already exist"}.to_json
    end
  else
    halt 409, {"ok" => false, "error" => "Item already exist"}.to_json unless !File.exist?(@path)
    begin
      data = request.body.read
      if data.length == 0
        Dir.mkdir(@path)
        return {"ok" => true}.to_json
      end
      json = JSON.parse(data)

      Dir.mkdir(@path)
      # json.set_owner!(auth_credentials[0])
      json.to_dir(@path)
      return {"ok" => true}.to_json
    rescue JSON::ParserError
      halt 400, {"ok" => false, "error" => "Not valid JSON"}.to_json
    rescue Errno::ENOENT
      halt 404, {"ok" => false, "error" => "No such file or directory"}.to_json
    end
  end
end

# main POST method
post '/db/*' do

  # halt 403, {"ok" => false, "error" => "Need to use HTTPS"} unless request.secure?
  protected!
  @path = (settings.root_db+url_decode(request.path)).force_encoding('utf-8')
  response['Access-Control-Allow-Origin'] = '*'


  if params[:file]
    # return params[:file].to_json
    Dir.mkdir(@path) unless File.exist?(@path)
    # return params[:file][:filename]
    # return {"ok" => false, "error" => "Item already exist"}.to_json unless !File.exist?(@path + params[:file][:filename])
    File.open(@path + params[:file][:filename], "w") do |f|
      f.write(params[:file][:tempfile].read)
      return {"ok" => true}.to_json
    end

  else
    begin
      halt 404, {"ok" => false, "error" => "No such file or directory"}.to_json unless File.exist?(@path)
      JSON.parse(request.body.read).to_dir(@path)
      return {"ok" => true}.to_json
    rescue JSON::ParserError
      halt 400, {"ok" => false, "error" => "Not valid JSON"}.to_json
    end
  end
end

# main DELETE method
delete '/db/*' do

  # halt 403, {"ok" => false, "error" => "Need to use HTTPS"} unless request.secure?
  protected!
  @path = (settings.root_db+url_decode(request.path)).force_encoding('utf-8')

  response['Access-Control-Allow-Origin'] = '*'

  return {"ok" => false, "error" => "No such file or directory"}.to_json unless File.exist?(@path)
  begin
    unless request.form_data?
      #FileUtils.rm_r @path, :force => true, :secure => true
      FileUtils.mv(@path, '/tmp/easedb_deleted/', :force => true, :secure => true)
      return {"ok" => true}.to_json
    end
    data = JSON.parse(request.body.read.gsub("'",""))
    halt 400, {"ok" => false, "error" => "Not array"}.to_json unless data.kind_of? Array
    data.each do |item|
      #FileUtils.rm_rf(File.join(@path,item))
      FileUtils.mv(File.join(@path,item), '/tmp/easedb_deleted/', :force => true)
    end
    return {"ok" => true}.to_json

  rescue JSON::ParserError
    halt 400, {"ok" => false, "error" => "Not valid JSON"}.to_json
  rescue Errno::ENOENT
    halt 404, {"ok" => false, "error" => "No such file or directory"}.to_json
  end
end

not_found do
  status 404
  "Something wrong! Try to type URL correctly."
end
if OS.linux?

# Thin::Logging.debug = true
# thread for rb_inotify, which needed for cache purposes
  Thread.new do

    cache_notifier = INotify::Notifier.new
    cache_notifier.watch(settings.root_db, :modify, :create, :delete, :move, :delete_self, :move_self, :recursive) do |event|
      
      FileUtils.touch(settings.root_db)
    end
    cache_notifier.run
    
    # p "hyi"
    # p File.join(settings.root,USERS_FILE)


  end

  Thread.new do
    # p File.exist? File.join(settings.root,USERS_FILE)
    users_notifier = INotify::Notifier.new
    users_notifier.watch(File.join(settings.root,USERS_FILE), :modify, :move) do |event|
      # puts "users file try to reload"
      if File.exist? File.join(settings.root,USERS_FILE)
        $userlist = reload_users
        puts "users file reload successful"
      end
    end
    users_notifier.run
  end
end

