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
        case params[:type]
        when 'user-resources'
          user = User.where(username: params[:identifier]).first
          render json: user.resources.to_a
        when 'group-resources'
          group = Group.where(name: params[:identifier]).first
          render json: user.resources if user
        when 'resource-users'
          resource = Resource.where(name: params[:identifier]).first
          render json: resource.all_users if resource
        when 'resource-groups'
          resource = Resource.where(name: params[:identifier]).first
          render json: resource.all_groups if resource
        end
      end
    end
  end
  
  protected
  
  def set_graph
    @graph = Graph.new
  end
end
