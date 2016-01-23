class Resource 
  include Neo4j::ActiveNode
  include Neo4j::Timestamps
  
  property :name, type: String
  property :full_path, type: String
  property :description, type: String

  def all_users(depth = nil)
    depth_str = depth ? "*1..#{depth}" : '*'
    session = Neo4j::Session.current
    result = session.query.match("(u:User)-[#{depth_str}]-({uuid: \"#{id}\"}) return u").to_a.uniq
    result.map{|item| item.u}
  end
  
  def all_groups(depth = nil)
    depth_str = depth ? "*1..#{depth}" : '*'
    session = Neo4j::Session.current
    result = session.query.match("(g:Group)-[#{depth_str}]-({uuid: \"#{id}\"}) return g").to_a.uniq
    result.map{|item| item.g}
  end
  
  def connect_to(target)
    if target.class == Group
      target.resources << self
      true
    elsif target.class == User
      target.resources << self
      true
    else
      false
    end
  end
end
