json.nodes @graph.nodes do |node|
  if node.class == User
    json.nType 0
    json.lbl node.username
  elsif node.class == Resource
    json.nType 1
    json.lbl node.name
  elsif node.class == Group
    json.nType 2
    json.lbl node.name
  end
  json.id node.id
end

json.links @graph.links