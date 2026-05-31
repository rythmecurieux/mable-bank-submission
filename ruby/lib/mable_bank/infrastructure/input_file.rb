# frozen_string_literal: true

module MableBank
  module Infrastructure
    class InputFile
      class ValidationError < StandardError; end

      MAX_BYTES = 10 * 1024 * 1024

      def self.validate!(path)
        raise ValidationError, 'Path is required' if path.nil? || path.to_s.strip.empty?

        expanded = File.expand_path(path)
        raise ValidationError, "File not found: #{path}" unless File.file?(expanded)
        raise ValidationError, "Not a regular file: #{path}" if File.symlink?(expanded)
        raise ValidationError, "File too large (max #{MAX_BYTES} bytes): #{path}" if File.size(expanded) > MAX_BYTES

        expanded
      end
    end
  end
end
