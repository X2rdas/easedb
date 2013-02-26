require 'fileutils'

  class Hash
    def to_dir(path)
      self.each_pair do |key,value|
        if value.kind_of? Hash
          Dir.mkdir(File.join(path,key.to_s[0..127]))
          value.to_dir(File.join(path,key.to_s[0..127]))
        else
          File.open(File.join(path,key.to_s[0..127]),'w') {|file| file.write(value)} if File.extname(key) == ""
        end
      end
    end

    def to_dir_no_r(path)
      self.each_pair do |key,value|
        if value.kind_of?(Hash)
          Dir.mkdir(File.join(path,key.to_s))
          value.to_dir(File.join(path,key.to_s))
        else
          File.open(File.join(path,key.to_s),'w') {|file| file.write(value)}
        end
      end
    end

    def full_select(&block)
      return self unless block_given?
      selected = Hash.new
      each_pair do |key,value|
        if value.kind_of? Hash
          selected[key] = value.full_select &block
          if selected[key] == nil
            selected.delete(key)
          end
        end
      end
      if block.call(self) 
        each_pair do |key,value|
          unless value.kind_of? Hash
            selected[key] = value
          end
        end
      else
        if selected.empty?
          return nil
        else
          return selected
        end
      end
    end

    def non_full_select(&block)
      return self unless block_given?
      puts &block
      if block.call(self)
        selected = Hash.new
        self.each_pair do |key,value|
          unless value.kind_of? Hash
            selected[key] = value
          else
            selected[key] = value.non_full_select(&block)
            if selected[key] == {}
              selected.delete(key)
            end
          end
        end
        return selected
      else
        return {}
      end
    end

    def set_owner!(user)
      self['owner'] = user
      each_pair do |key,value|
        if value.kind_of? Hash
          value.set_owner!(user)
        end
      end
    end

  end

  class NilClass

    def full_select
      return {}
    end
    
    def empty?
      return true
    end
  end
