class User
  include Neo4j::ActiveNode
  include Neo4j::Timestamps

  property :first_name, type: String
  property :last_name, type: String
  property :username, type: String

  has_many :out, :groups, type: :group
  has_many :out, :resources, type: :resource
 
  def all_groups(depth = nil)
    depth_str = depth ? "*1..#{depth}" : '*'
    session = Neo4j::Session.current
	  result = session.query.match("({uuid: \"#{id}\"})-[#{depth_str}]-(g:Group) return g").to_a
    result.map{|item| item.g}
  end

  def all_resources(depth = nil)
    depth_str = depth ? "*1..#{depth}" : '*'
    session = Neo4j::Session.current
    result = session.query.match("({uuid: \"#{id}\"})-[#{depth_str}]-(r:Resource) return r").to_a.uniq
    result.map{|item| item.r}   
  end

  def is_member_of_group(group)
	  session = Neo4j::Session.current
	  session.query.match("({uuid: \"#{id}\"})-[*]-(g {uuid: \"#{group.id}\"}) return g").to_a.size > 0
  end

  def can_access(resource)
    session = Neo4j::Session.current
    session.query.match("({uuid: \"#{id}\"})-[*]-(r {uuid: \"#{resource.id}\"}) return r").to_a.size > 0
  end
  
  def connect_to(target)
    if target.class == Resource
      resources << target
      true
    elsif target.class == Group
      groups << target
      true
    else
      false
    end
  end
end