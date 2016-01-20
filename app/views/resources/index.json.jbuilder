json.array!(@resources) do |resource|
  json.extract! resource, :id, :full_path, :description
  json.url resource_url(resource, format: :json)
end
