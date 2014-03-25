require "json/ext"
  RIGHTS_FILE = ".rights.json"
  ROOT = '/var/db'
  def calc_rights(rel_path,user)
    Dir.chdir(ROOT)
    # p rel_path[ROOT.length+1..-1]
    calc = {}
    calc.merge!(JSON.parse(IO.read(RIGHTS_FILE))) if (File.exists?(RIGHTS_FILE) && !(File.zero?(RIGHTS_FILE)))

    return "S" if ((calc.has_key? user) && (calc[user].include? "S"))
    rel_path[ROOT.length+1..-1].split(File::SEPARATOR).each do |dir|
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
      return "CRUD"
    end
  end

  def directory_hash(path, user)
    data = {}
    rights = calc_rights(path,user)
    if !rights.include?("S") && !rights.include?("R")
      return data
    end
    #p path
    #data = GoogleHashSparseRubyToRuby.new
    Dir.glob(path+'/*').sort.each do |entry|
      #p entry
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

path = "/var/db/conferences/institute/Potentsial_vzaimodeistviya_obra"
p directory_hash(path, 'slinkina').to_json
