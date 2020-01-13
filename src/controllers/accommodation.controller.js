import AccommodationService from '../services/accommodation.service';
import ResponseService from '../services/response.service';

/**
 *
 *
 * @class AccommodationController
 */
class AccommodationController {
  /**
           *
           *
           * @static
           * @param {req} req
           * @param {res} res
           * @returns {response} @memberof AccommodationController
           */
  static async createBooking(req, res) {
    const { dataValues } = await AccommodationService.createBooking({
      ...req.body,
      userId: req.userData.id,
      accommodationId: req.params.accommodationId
    });
    ResponseService.setSuccess(201, 'Accommodation is successfully booked', dataValues);
    return ResponseService.send(res);
  }

  /**
           *
           *
           * @static
           * @param {req} req
           * @param {res} res
           * @returns {response} @memberof AccommodationController
           */
  static async getAccommodations(req, res) {
    const accommodations = await AccommodationService.findAllAccommodations();
    const availableAccommodations = accommodations.map((accommodation) => {
      const { dataValues } = accommodation;
      return dataValues;
    });
    ResponseService.setSuccess(200, 'list of available accommodations', availableAccommodations);
    return ResponseService.send(res);
  }
}

export default AccommodationController;
