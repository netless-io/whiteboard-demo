require 'json'
require 'open-uri'
require 'fileutils'
include FileUtils

JsDelivrDataURL = 'https://data.jsdelivr.com/v1/package/npm'

changes = []
Dir.glob("packages/*") do |folder|
  cd folder do
    pkg_str = File.read 'package.json'
    pkg = JSON.parse pkg_str
    name = pkg['name']
    data = JSON.parse URI.open File.join(JsDelivrDataURL, name), &:read
    latest = data['tags']['latest']
    next_ = latest.split(?.).tap { |a| a[-1] = a[-1].to_i + 1 }.join(?.)
    i = pkg_str.index(/"\d/, pkg_str.index('"version":'))
    j = pkg_str.index('"', i + 1)
    old = pkg_str[i..j]
    now = next_.inspect
    pkg_str[i..j] = now
    File.write 'package.json', pkg_str
    puts "#{name} #{old} -> #{now}"
    changes << [name, next_]
  end
end

cd 'whiteboard' do
  pkg_str = File.read 'package.json'
  changes.each do |name, next_|
    pkg_str.gsub!(/"#{name}": "\^[^"]*"/, "\"#{name}\": \"^#{next_}\"")
  end
  File.write 'package.json', pkg_str
end
