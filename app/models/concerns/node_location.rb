module NodeLocation
  def self.included(c)
    c.property :location_x, type: Float
    c.property :location_y, type: Float
  end
end