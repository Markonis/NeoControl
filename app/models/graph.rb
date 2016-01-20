class Graph
  
  def nodes
    @nodes ||= user_nodes + group_nodes + resource_nodes
  end
  
  def user_nodes
    @user_nodes ||= User.all.to_a
  end
  
  def group_nodes
    @group_nodes ||= Group.all.to_a
  end
  
  def resource_nodes
    @resource_nodes ||= Resource.all.to_a
  end
  
  def links
    session = Neo4j::Session.current
    session.query.match('(source)-[]->(target) return source, target').to_a.map do |link|
      {source_id: link.source.id, target_id: link.target.id}
    end
  end
  
  def create_link(source, target)
    source_node = nodes.select {|n| n.id == source['id']}.first
    target_node = nodes.select {|n| n.id == target['id']}.first
    source_node.connect_to target_node
  end
  
  def destroy_link(source, target)
    session = Neo4j::Session.current
    session.query.match("({uuid: \"#{source['id']}\"})-[rel]-({uuid: \"#{target['id']}\"})").delete(:rel).exec
  end
end
