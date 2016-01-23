class GraphsController < ApplicationController
  before_action :set_graph
  
  def show
  end
  
  def create_link
    if @graph.create_link(params[:source], params[:target])
      head status: 200
    else
      head status: 400
    end
  end
  
  def destroy_link
    if @graph.destroy_link(params[:source], params[:target])
      head status: 200
    else
      head status: 400
    end
  end
  
  def api
    respond_to do |format|
      format.html
      format.json do
        result = []
        case params[:type]
        when 'user-resources'
          user = User.where(username: params[:identifier]).first
          result = user.all_resources.to_a if user
        when 'group-resources'
          group = Group.where(name: params[:identifier]).first
          result = group.all_resources if  group
        when 'resource-users'
          resource = Resource.where(name: params[:identifier]).first
          result = resource.all_users if resource
        when 'resource-groups'
          resource = Resource.where(name: params[:identifier]).first
          result = resource.all_groups if resource
        end
        render json: result
      end
    end
  end
  
  protected
  
  def set_graph
    @graph = Graph.new
  end
end
