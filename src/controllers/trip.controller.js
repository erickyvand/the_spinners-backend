/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable function-paren-newline */
import TripService from '../services/trip.service';
import ResponseService from '../services/response.service';
import RequestService from '../services/request.service';
import UserService from '../services/user.service';
import { paginationHelper } from '../helpers';
import emitter from '../helpers/eventEmmiters/emitter';
/**
 *
 *
 * @class TripController
 */
class TripController {
  /**
   *
   *
   * @static
   * @param {req} req
   * @param {res} res
   * @returns {response} @memberof Trips
   */
  static async requestOneWayTrip(req, res) {
    const {
      id,
      lineManagerId,
      firstName: requesterFname,
      lastName: requesterLname,
      profilePicture: requesterPicture
    } = await UserService.findUserByProperty(req.userData.id);
    const newRequest = await RequestService.createRequest({
      requesterId: id,
      requesterFname,
      requesterLname,
      requesterPicture,
      status: 'pending',
      tripType: 'One Way',
      lineManagerId
    });
    const newTrip = await TripService.createTrip({
      ...req.body, requestId: newRequest.get().id, userId: req.userData.id, tripType: 'one-way', status: 'pending'
    });
    ResponseService.setSuccess(201, 'Trip is successfully created', { newTrip, newRequest });
    return ResponseService.send(res);
  }

  /**
   *
   * @static
   * @param {req} req
   * @param {res} res
   * @returns {response} @memberof Trips
   */
  static async requestReturnTrip(req, res) {
    const {
      id,
      lineManagerId,
      firstName: requesterFname,
      lastName: requesterLname,
      profilePicture: requesterPicture
    } = await UserService.findUserByProperty(req.userData.id);
    const newRequest = await RequestService.createRequest({
      requesterId: id,
      status: 'pending',
      lineManagerId,
      requesterFname,
      requesterLname,
      requesterPicture,
      tripType: 'Return Trip',
    });
    const returnTrip = await TripService.createTrip({
      ...req.body, requestId: newRequest.get().id, userId: req.userData.id, tripType: 'return-trip', status: 'pending'
    });
    ResponseService.setSuccess(201, 'Trip created successfully', { newTrip: returnTrip, newRequest });
    return ResponseService.send(res);
  }

  /**
   * @param {req} req
   * @param {res} res
   * @returns {requestLists} this function returns user request Lists
  */
  static async userTripRequestList(req, res) {
    const userId = req.userData.id;
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;
    const results = await TripService.findByPropertyAndCountAll({ userId }, { offset, limit });
    ResponseService.setSuccess(200, 'List of requested trips', {
      pageMeta: paginationHelper({
        count: results.count, rows: results.rows, offset, limit
      }),
      rows: results.rows
    });
    return ResponseService.send(res);
  }

  /**
  * @static
  * @param {req} req
  * @param {res} res
  * @returns {response} @memberof Trips
  */
  static async requestMultiCityTrip(req, res) {
    const {
      id,
      lineManagerId,
      firstName: requesterFname,
      lastName: requesterLname,
      profilePicture: requesterPicture
    } = await UserService.findUserByProperty(req.userData.id);
    const newRequest = await RequestService.createRequest({
      requesterId: id,
      requesterFname,
      requesterLname,
      requesterPicture,
      status: 'pending',
      tripType: 'Multi City',
      lineManagerId
    });
    const newMultiCityTrip = req.body.map((trip) => ({ ...trip, userId: req.userData.id, requestId: newRequest.get().id, tripType: 'multi-city' }));
    const newTrips = await TripService.createMultiCityTrip(newMultiCityTrip);
    const newTripArray = newTrips.map((trip) => {
      const { dataValues } = trip;
      const { updatedAt, createdAt, ...newTrip } = dataValues;
      return newTrip;
    });
    ResponseService.setSuccess(201, 'Trip request is successfully created', { newTrip: newTripArray, newRequest });
    return ResponseService.send(res);
  }

  /**
   *
   *
   * @static
   * @param {req} req
   * @param {res} res
   * @returns {response} @memberof Trips
   */
  static async viewAvailableLocations(req, res) {
    const locations = await TripService.findAllLocations();
    const availableLocations = locations.map(loc => {
      const { dataValues } = loc;
      const { updatedAt, createdAt, ...location } = dataValues;
      return location;
    });
    ResponseService.setSuccess(200, 'List of all available locations', availableLocations);
    return ResponseService.send(res);
  }

  /**
*
*
* @static
* @param {currentTrip} currentTrip
* @param {id} id
* @param {origin} origin
* @param {destination} destination
* @returns {object} This function updates origin(s) and destination(s)
* @memberof TripController
*/
  static async updateOriginOrDestination(currentTrip, id, origin, destination) {
    const sameTripRequestMulticityTrips = await TripService.findAllByProperty({
      requestId: currentTrip.requestId
    });
    const previousTrip = sameTripRequestMulticityTrips.find(prevTrip => prevTrip.id === currentTrip.id - 1);
    if (previousTrip && origin && previousTrip.originId !== origin) {
      await TripService.updateTrip(
        { id: currentTrip.id - 1 },
        { destinationId: origin }
      );
    }
    const nextTrip = sameTripRequestMulticityTrips.find(nexTrip => nexTrip.id === currentTrip.id + 1);
    if (nextTrip && destination && nextTrip.destinationId !== destination) {
      await TripService.updateTrip(
        { id: currentTrip.id + 1 },
        { originId: destination }
      );
    }
  }

  /**
 *
 *
 * @static
 * @param {req} req
 * @param {res} res
 * @returns {response} @memberof TripController
 */
  static async updateOpenTripRequest(req, res) {
    const tripId = parseInt(req.params.tripId, 10);
    const currentTrip = req.currentTrip;
    if (currentTrip.tripType === 'multi-city') {
      await TripController.updateOriginOrDestination(
        req.currentTrip,
        tripId,
        req.body.originId,
        req.body.destinationId
      );
    }
    await Promise.all(Object.keys(req.body).map(async (key, index) => {
      await TripService.updateTrip(
        { id: tripId },
        { [key]: (Object.values(req.body)[index]) }
      );
    }));
    const updatedTrip = await TripService.findTripByProperty({ id: tripId });
    emitter.emit('request-updated', updatedTrip);
    ResponseService.setSuccess(200, 'Trip Updated successfully', updatedTrip);
    ResponseService.send(res);
  }

  /**
   *
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @memberof TripController
   * @returns {object} this function returns the statics of the trip
   */
  static async getStats(req, res) {
    const stats = await TripService.findAndCountAllTrips({ userId: req.userData.id });
    ResponseService.setSuccess(200, 'Your created trip stats', stats);
    ResponseService.send(res);
  }
}

export default TripController;
