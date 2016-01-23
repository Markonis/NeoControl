class Group 
  include Neo4j::ActiveNode
  include Neo4j::Timestamps
  
  property :name, type: String
  property :description, type: String

  has_many :out, :children, type: :group, model_class: Group
  has_many :out, :resources, type: :resource

  def users(deep = false)
    session = Neo4j::Session.current
    result = session.query.match("(u:User)-[#{deep ? '*' : ''}]-({uuid: \"#{id}\"}) return u").to_a.uniq
    result.map{|item| item.u}
  end
  
  def all_resources(depth = nil)
    depth_str = depth ? "*1..#{depth}" : '*'
    session = Neo4j::Session.current
    result = session.query.match("({uuid: \"#{id}\"})-[#{depth_str}]-(r:Resource) return r").to_a.uniq
    result.map{|item| item.r}
  end
  
  def all_children(depth = nil)
    depth_str = depth ? "*1..#{depth}" : '*'
    session = Neo4j::Session.current
    result = session.query.match("({uuid: \"#{id}\"})-[#{depth_str}]->(g:Group) return g").to_a.uniq
    result.map{|item| item.g}
  end
  
  def connect_to(target)
    if target.class == Resource
      resources << target
    elsif target.class == Group
      children << target
    elsif target.class == User
      target.groups << self
    end
    true
  end
end
