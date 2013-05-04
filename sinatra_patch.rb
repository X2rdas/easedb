if Sinatra::VERSION < '1.3.0' && Rack.release >= '1.3'
  # Monkey patch old Sinatra to use Rack::File to serve files.

  Sinatra::Helpers.class_eval do
    # Got from Sinatra 1.3.0 sources
    def send_file(path, opts={})
      if opts[:type] or not response['Content-Type']
        content_type opts[:type] || File.extname(path), :default => 'application/octet-stream'
      end

      if opts[:disposition] == 'attachment' || opts[:filename]
        attachment opts[:filename] || path
      elsif opts[:disposition] == 'inline'
        response['Content-Disposition'] = 'inline'
      end

      last_modified opts[:last_modified] if opts[:last_modified]

      file      = Rack::File.new nil
      file.path = path
      result    = file.serving env
      result[1].each { |k,v| headers[k] ||= v }
      halt result[0], result[2]
    rescue Errno::ENOENT
      not_found
    end
  end
end