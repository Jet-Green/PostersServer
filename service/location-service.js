const LocationModel = require('../models/location-model.js')
const UserModel = require('../models/user-model.js')

module.exports = {
  findMany() {
    return LocationModel.find({}).exec()
  },

  searchLocation(name) {
    return LocationModel.find(
      { name: { $regex: name, $options: 'i' } },
    )
  },

  async createLocation(loc) {
    loc.coordinates = [Number(loc.coordinates[0]), Number(loc.coordinates[1])]

    let candidate = await LocationModel.findOne({
      $and: [
        { 'coordinates.0': { $eq: loc.coordinates[0] } },
        { 'coordinates.1': { $eq: loc.coordinates[1] } },
      ]
    })

    if (!candidate) {
      return await LocationModel.create(loc)
    }
    return candidate
  },

  isNearPlace(userPlaceGeo, placeGeo) {
    // if (!userPlaceGeo.geo_lat || !userPlaceGeo.geo_lon) {
    //   return true
    // }

    // CONFIG в км
       let earth_radius = 6370
       let pass_radius = 120

    let PI = Math.PI
    let meridian_length = 2*PI*earth_radius

    function lenghtOfParallel(angle) {
      return Math.cos(angle) * earth_radius
    }

    let place_X = placeGeo.geo_lon
    let place_Y = placeGeo.geo_lat

    let user_X = userPlaceGeo.geo_lon
    let user_Y = userPlaceGeo.geo_lat

    let meridian_delta_angle = Math.abs(place_Y - user_Y) / 360 * earth_radius 
    let meridian_delta

    // средняя широта между местом и пользователем
    let average_latitude = (Math.abs(place_Y) + Math.abs(user_Y)) / 2

    let parallel_delta_angle = Math.abs(place_X - user_X)
    let parallel_delta = parallel_delta_angle / 360 * lenghtOfParallel(average_latitude)

    if (Math.sqrt(Math.pow(meridian_delta) + Math.pow(parallel_delta)) > pass_radius)
      return false

    return true

    // в градусах в нашей полосе примерно 120 км
    // let radius = 2
    // if (((place_X - user_X) * (place_X - user_X)) + ((place_Y - user_Y) * (place_Y - user_Y)) <= (radius * radius)) {
    //   return true
    // }
    // return false
  },

  selectUserLocation(userId, location) {
    return UserModel.findByIdAndUpdate(userId, { userLocation: location })
  }
}