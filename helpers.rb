  def calc_rights(rel_path,user)
    # p settings.root_db
    Dir.chdir(settings.root_db)
    # p rel_path
    calc = {}
    calc.merge!(JSON.parse(IO.read(RIGHTS_FILE))) if (File.exists?(RIGHTS_FILE) && !(File.zero?(RIGHTS_FILE)))

    return "S" if ((calc.has_key? user) && (calc[user].include? "S"))
    rel_path[settings.root_db.length+1..-1].split(File::SEPARATOR).each do |dir|
      # p dir
      Dir.chdir(dir)
      # current
      calc.merge!(JSON.parse(IO.read(RIGHTS_FILE))) if (File.exists?(RIGHTS_FILE) && !(File.zero?(RIGHTS_FILE)))

      return "S" if ((calc.has_key? user) && (calc[user].include? "S"))
      # p "dir: #{Dir.pwd}, rights: #{calc}"

    end
    if calc.has_key? user
      return calc[user]
    elsif calc.has_key? "default"
      return calc["default"]
    else
      return settings.default_right
    end
  end
=begin
def directory_hash(path, name=nil)
    data = {}
    #p path
    #data = GoogleHashSparseRubyToRuby.new
    Dir.glob(path+'/*').sort.each do |entry|
      #p entry
      #next if (entry == '..' || entry == '.')
      #full_path = File.join(path, entry)
      filename = File.basename(entry)
      if File.directory?(entry)
        data[filename] = directory_hash(entry)
      else
        data[filename] = 
          if File.extname(entry) == ""
            # puts File.extname(full_path)
            IO.read(entry)
          else
            "attachment"
          end
        
      end
    end
    return data
  end
=end
  def directory_hash(path, user)
    data = {}

    rights = calc_rights(path,user)
    if !rights.include?("S") && !rights.include?("R")
      return data
    end
    #p path
    #data = GoogleHashSparseRubyToRuby.new
    if path[-1] == "/"
      local_glob = path+'*'
    else
      local_glob = path+'/*'
    end
    Dir.glob(local_glob).sort.each do |entry|
      # p entry
      #next if (entry == '..' || entry == '.')
      #full_path = File.join(path, entry)
      filename = File.basename(entry)
      if File.directory?(entry)
        data[filename] = directory_hash(entry,user)
      else
        data[filename] = 
          if File.extname(entry) == ""
            # puts File.extname(full_path)
            IO.read(entry)
          else
            "attachment"
          end
        
      end
    end
    return data
  end


  def directory_hash_no_r(path,top)
    data = {}
    #data = GoogleHashSparseRubyToRuby.new
    # Dir.foreach(path) do |entry|
    Dir.glob(path+'/*').sort.each do |entry|
      next if (entry == '..' || entry == '.')
      full_path = File.join(path, entry)
      filename = File.basename(entry)
      if !File.directory?(entry)
        data[filename] = if File.zero?(entry)
        then filename
        else
          if File.extname(entry) == ""
            # puts File.extname(entry)
            IO.read(entry)
          else
            "attachment"
          end
        end
      else

        data[filename] = if top
          directory_hash_no_r(full_path,false)
        else
          {}
        end

      end
    end
    return data
  end

  def reload_users
    begin
      return $userlist = JSON.parse(IO.read(USERS_FILE))
      # p $userlist
    rescue JSON::ParserError
      puts "Not valid users file"
      return {}
    end

  end

  def protected!
    unless authorized?
      response['WWW-Authenticate'] = %(Basic realm="restricted area")
      throw(:halt, [401, "Not authorized\n"])
    end
  end

  def authorized?
    @auth ||= Rack::Auth::Basic::Request.new(request.env)
    @auth.provided? && @auth.basic? && @auth.username && $userlist[@auth.credentials[0]] == @auth.credentials[1]
  end

  def auth_credentials
    @auth ||= Rack::Auth::Basic::Request.new(request.env)
    if @auth.provided? && @auth.basic? && @auth.username
      @auth.credentials
    else
      nil
    end
  end