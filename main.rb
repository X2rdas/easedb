# This code is MIT licensed, see http://www.opensource.org/licenses/mit-license.php
# (C) 2012 - 2013 Shakhmatov Alexander

require 'rubygems'
require 'sinatra'
require 'json/ext'
require './hashext.rb'
require 'fileutils'
require 'sinatra/config_file'
require 'rb-inotify'
require 'sinatra_patch'
# require 'rack/ssl'

#set settings.root, '/home/admin/server'
#set :public_folder, '/home/admin/server/public'
set :static, true
set :server, ['thin', 'webrick']
# config_file 'config2.yml'

# use Rack::SSL

helpers do

  def admin_protected!
    unless admin_authorized?
      response['WWW-Authenticate'] = %(Basic realm="restricted area")
      throw(:halt, [401, "Not authorized\n"])
    end
  end

  def admin_authorized?
    @auth ||= Rack::Auth::Basic::Request.new(request.env)
    @auth.provided? && @auth.basic? && @auth.username && @auth.credentials[0] == settings.userlist.keys.first && @auth.credentials[1] == settings.userlist[settings.userlist.keys.first]
  end


  def protected!
    unless authorized?
      response['WWW-Authenticate'] = %(Basic realm="restricted area")
      throw(:halt, [401, "Not authorized\n"])
    end
  end

  def authorized?
    @auth ||= Rack::Auth::Basic::Request.new(request.env)
    @auth.provided? && @auth.basic? && @auth.username && settings.userlist[@auth.credentials[0]] == @auth.credentials[1]
  end

  def auth_credentials
    @auth ||= Rack::Auth::Basic::Request.new(request.env)
    if @auth.provided? && @auth.basic? && @auth.username
      @auth.credentials
    else
      nil
    end
  end
  # helper for creation Hash object from a directory, where folders is a Hash objects, files is a key => value pair
  def directory_hash(path, name=nil)
    data = {}
    Dir.foreach(path) do |entry|
      next if (entry == '..' || entry == '.')
      full_path = File.join(path, entry)
      if File.directory?(full_path)
        data[File.basename(full_path)] = directory_hash(full_path, entry)
      else
        data[File.basename(full_path)] = if File.zero?(entry)
        then File.basename(full_path)
        else
          if File.extname(full_path) == ""
            # puts File.extname(full_path)
            IO.read(full_path)
          else
            "attachment"
          end
        end
      end
    end
    return data
  end

  def directory_hash_no_r(path,top)
    data = {}
    Dir.foreach(path) do |entry|
      next if (entry == '..' || entry == '.')
      full_path = File.join(path, entry)
      if !File.directory?(full_path)
        data[File.basename(full_path)] = if File.zero?(entry)
        then File.basename(full_path)
        else
          if File.extname(full_path) == ""
            # puts File.extname(full_path)
            IO.read(full_path)
          else
            "attachment"
          end
        end
      else

        data[File.basename(full_path)] = if top
          directory_hash_no_r(full_path,false)
        else
          {}
        end

      end
    end
    return data
  end

  def local_last_modified
    return File.ctime(settings.root+'/db')
  end

  def url_decode(s)
    s.gsub(/((?:%[0-9a-fA-F]{2})+)/n) do
      [$1.delete('%')].pack('H*')
    end
  end

end

# some browsers don't support DELETE and PUT requests, and sends OPTIONS method instead
before do
  response.headers["Access-Control-Allow-Origin"] = '*'
  response.headers["Access-Control-Allow-Credentials"] = "true"
  response.headers["Access-Control-Request-Headers"] = "accept, origin, content-type, Content-Type"
  if request.request_method == 'OPTIONS'

    response.headers["Access-Control-Allow-Methods"] = "DELETE, PUT, POST"
    halt 200
  end
end

# main GET method
get '/db/*' do

  clear_params = params.reject {|key,value| key == "splat" || key == "captures" || key == "non_recursive"}
  @path = settings.root+url_decode(request.path)
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
    unless params['non_recursive']
      if auth_credentials
        if settings.userlist.keys.first == auth_credentials[0]
          # return "i'm the first"
          directory_hash(@path).full_select {|item| item.merge(clear_params) == item}
        else
          puts auth_credentials[0]
          directory_hash(@path).non_full_select {|item| if item["owner"] then if item["owner"].size==0 then true else item["owner"].split(",").include?(auth_credentials[0]) end else true end}.full_select {|item| item.merge(clear_params) == item}
        end
      else
        directory_hash(@path).full_select {|item| item.merge(clear_params) == item}
      end
    else
      # return "hello"
      if auth_credentials
        if settings.userlist.keys.first == auth_credentials[0]
          directory_hash_no_r(@path,true).full_select {|item| item.merge(clear_params) == item}
        else
          directory_hash(@path).non_full_select {|item| if item["owner"] then if item["owner"].size==0 then true else item["owner"].split(",").include?(auth_credentials[0]) end else true end}.full_select {|item| item.merge(clear_params) == item}
        end
      else
        directory_hash_no_r(@path,true).full_select {|item| item.merge(clear_params) == item}
      end
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
  return data.to_json
end

# main PUT method
put '/db/*' do

  # halt 403, {"ok" => false, "error" => "Need to use HTTPS"} unless request.secure?
  protected!
  @path = settings.root+url_decode(request.path)
  response['Access-Control-Allow-Origin'] = '*'
  if params['symlink']
    if !File.exist?(@path)
      if File.exist?(settings.root+params['symlink'])
        File.symlink(settings.root+params['symlink'],@path)
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
  @path = settings.root+url_decode(request.path)
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
  @path = settings.root+url_decode(request.path)

  response['Access-Control-Allow-Origin'] = '*'

  return {"ok" => false, "error" => "No such file or directory"}.to_json unless File.exist?(@path)
  begin
    unless request.form_data?
      FileUtils.rm_r @path, :force => true, :secure => true
      return {"ok" => true}.to_json
    end
    data = JSON.parse(request.body.read.gsub("'",""))
    halt 400, {"ok" => false, "error" => "Not array"}.to_json unless data.kind_of? Array
    data.each do |item|
      FileUtils.rm_rf(File.join(@path,item))
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

# thread for rb_inotify, which needed for cache purposes
Thread.new do
  notifier = INotify::Notifier.new
  notifier.watch(settings.root+'/db/', :modify, :create, :delete, :move, :delete_self, :move_self, :recursive) do |event|
    puts event.absolute_name+Time.now.to_s
    FileUtils.touch(settings.root+'/db/')
  end
  notifier.run
end
